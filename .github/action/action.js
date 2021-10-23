const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");
const liquid = require("liquid");
const cheerio = require("cheerio");
const core = require("@actions/core");
const github = require("@actions/github");
const octo = require("@octokit/core");

const fs_options = { encoding: "utf-8" };

const octokit = github.getOctokit(core.getInput("token"));

// A user had sumbitted a widget PR and it has been accepted.

// Request widget file from commit and return its contents as a cheerio instance.
async function getNewWidgetFile() {
  const commits = github.context.payload.commits;
  const commit = await octokit.request({
          method: "GET",
          url: `https://api.github.com/repos/mudlabs/web-widgets/commits/${commits[0].id}`
        });
  const commit_file = commit.data.files[0];
  const path = commit_file.filename;
  const file = await fs.promises.readFile(path, fs_options);
  const context = cheerio.load(file);
  return { path, context };
}


// Required
function getRenderData(cheerio_instance) {
  const validate = item => typeof item == "string" && name !== "";
  const date = new Date().toDateString();
  const name = cheerio_instance("body").data("widget-name");
  const summary = cheerio_instance("body").data("widget-summary");
  const author = github.context.payload.sender.login;
  const profile = github.context.payload.sender.html_url;
  const avatar = github.context.payload.sender.avatar_url;
  const invalid = !(validate(name) && validate(summary));
  
  return { name, summary, author, avatar, profile, date, invalid };
}


// Required
// Extracts the <body>...</body> of the new widget.
function getWidget(cheerio_instance) {
  cheerio_instance("body").removeAttr("data-widget-name");
  cheerio_instance("body").removeAttr("data-widget-summary");
  return cheerio_instance.html("body");
}

async function loadTemplates() {
  const item = await fs.promises.readFile("./.github/action/templates/item.html", fs_options);
  const widget = await fs.promises.readFile("./.github/action/templates/widget.html", fs_options);
  
  return { item, widget };
}

async function prependItemToList(item) {
  const file = await fs.promises.readFile("./docs/index.html", fs_options);
  const context = cheerio.load(file);
  context(".widgets").prepend(item);
  return context.html();
}

async function writeHomePage(page) {
  const result = await fs.promises.writeFile("./docs/index.html", page, fs_options);
  return result;
}

async function writeWidget(path, widget) {
  const result = await fs.promises.writeFile(`./docs/${path}`, widget, fs_options);
  return result;
}


(async function(){
  try {
    //1. load submitted file. If it does not have the required components error out.
    const file = await getNewWidgetFile();
    const data = getRenderData(file.context);
    
    if (data.invalid) throw `The document does not contain valid data-widget-name or data-widget-summary fields. These should be attributes of the <body> tag.`;
    data["widget"] = getWidget(file.context);
    
    // 1. load templates.
    const templates = await loadTemplates();
    const engine = new liquid.Engine();
    // 2. populate submitted widget content into widget template.
    const widget_engine = await engine.parse(templates.widget);
    const widget = widget_engine.reder(data);
    // 3. save new widget to docs directory
    const widget_written = await writeWidget(file.path, widget)
    // 4. populate item template with widget data
    const item_engine = await engine.parse(templates.item)
    const item = item_enige.render(data);
    // 5. append item template to widget list on home page.
    const page = await prependItemToList(item);
    const writePage = await wrightHomePage(page);
    // 5. update user to contributors list on README.md, if not already listed.
    return;
    const readme = await manageReadme();
    const writeReadme = await writeReadme(readme);
    return "Success";
  } catch(error) {
    core.setFailed(error);
  }
})()
