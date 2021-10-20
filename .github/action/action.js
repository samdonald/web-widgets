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
  const result = cheerio.load(file);
  return result;
}

// Required
function getFrontMatter(cheerio_instance) {
  const date = new Date().toDateString();
  const name = cheerio_instance("body").data("widget-name");
  const summary = cheerio_instance("body").data("widget-summary");
  const author = github.context.payload.sender.login;
  const profile = github.context.payload.sender.html_url;
  const avatar = github.context.payload.sender.avatar_url;
  
  return { name, summary, author, avatar, profile, date };
}


// Required
// Extracts the <body>...</body> of the new widget.
function getBody(cheerio_instance) {
  const body = cheerio_instance.html("body");
  return body;
}


// Extracts the <style>...</style> of the new widget.
function getStyle(cheerio_instance) {
  cheerio_instance("body").replaceWith("");
  return cheerio_instance.html("style")
}


// Extracts the <script>...</script> of the new widget.
function getScript(cheerio_instance) {
  cheerio_instance("body").replaceWith("");
  return cheerio_instance.html("script");
}


async function prependItemToList(item) {
  const file = await fs.promises.readFile(path, fs_options);
  const context = cheerio.load(file);
  context(".widgets").prepend(item);
  return context.html();
}

async function writeHomePage(page) {
  const result = await fs.promises.writeFile(path, page, fs_options);
  return result;
}

async function loadTemplates() {
  const item = await fs.promises.readFile("./templates/item.html", fs_options);
  const widget = await fs.promises.readFile("./templates/widget.html", fs_options);
  
  return { item, widget };
}

(async function(){
  try {
    //1. load submitted file. If it does not have the required components error out.
    const context = await getNewWidgetFile();
    const frontmatter = getFrontMatter(context);
    const body = getBody(context);
    const style = getStyle(context);
    const script = getScript(context);
    
    console.log(frontmatter, body, style, script)
    return;
    if (!frontmatter.valid || !body.valid) throw `The file does not contain a valid frontmatter and or body.`;
    
    // 1. load templates.
    const templates = await loadTemplates();
    const engine = new liquid.Engine();
    // 2. populate submitted widget content into widget template.
    const widget_engine = await engine.parse(templates.widget);
    const widget = widget_engine.reder(widget_content);
    // 3. save new widget to docs directory
    // 4. populate item template with widget data
    const item_engine = await engine.parse(templates.item)
    const item = item_enige.render(frontmatter);
    // 5. append item template to widget list on home page.
    const page = await prependItemToList(item);
    const writePage = await wrightHomePage(page);
    // 5. update user to contributors list on README.md, if not already listed.
    const readme = await manageReadme();
    const writeReadme = await writeReadme(readme);
    return "Success";
  } catch(error) {
    core.setFailed(error);
  }
})()
