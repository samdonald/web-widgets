const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");
const liquid = require("liquid");
const cheerio = require("cheerio");
const core = require("@actions/core");
const github = require("@actions/github");
const octo = require("@octokit/core");

const fs_options = { encoding: "utf-8" };
const owner = "mudlabs";
const repo = "web-widgets";

const octokit = github.getOctokit(core.getInput("token"));

// A user had sumbitted a widget PR and it has been accepted.
// const async hasUniqueName = () => {
//   const file = await fs.promises.readFile("./docs/index.html", fs_options);
//   const cheerio_instance = cheerio.load(file);
//   const widgets = cheerio_instance("#widgets");
//   return widgets.has(``).length === 1;
// }

// Request widget file from commit and return its contents as a cheerio instance.
async function getWidgetFile(file_name) {
  const commits = github.context.payload.commits;
  const commit = await octokit.request({
          method: "GET",
          url: `https://api.github.com/repos/mudlabs/web-widgets/commits/${commits[0].id}`
        });
  const commit_file = commit.data.files[0];
  const f = await octokit.request("GET /repos/{owner}/{repo}/commits", {owner:"mudlabs",repo: "web-widgets", path: file_name, sha: "dev"});
  f.data.forEach(i => console.log(i.author, i.committer));
  const path = file_name.replace(/^widgets\//, "");
  const file = await fs.promises.readFile(file_name, fs_options);
  const context = cheerio.load(file);
  return { path, context };
}


// Required
function getRenderData(cheerio_instance) {
  const validate = item => typeof item == "string" && item !== "";
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
  const contributor = await fs.promises.readFile("./.github/action/templates/contributor.html", fs_options);
  
  return { item, widget, contributor };
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

async function addContributor(template, engine, data) {
  let changed = false;
  const readme = await fs.promises.readFile("./README.md", fs_options);
  const cheerio_instance = cheerio.load(readme);
  const contributors = cheerio_instance("#contributors");
  if (contributors.has(`#${data.author}`).length === 0) {
    const _engine = await engine.parse(template);
    const td = await _engine.render(data);
    const last_tr = contributors.children("tr").last();
    last_tr.children("td").length > 6
      ? contributors.append(`<tr>${td}</tr>`)
      : last_tr.append(td);
    changed = true;
  }
  
  return { changed, contents: cheerio_instance.html() };
}

async function writeReadme(file) {
  if (file.changed) {
    const result = await fs.promises.writeFile("./README.md", file.contents, fs_options);
    return result;
  } else {
    return;
  }
}


(async function(){
  try {
    console.log(github.context.payload);
    console.log("--------------------------");
    console.log(github.context.payload.commits);
    return;
    const added = core.getInput("added");
    const removed = core.getInput("deleted");
    const modified = core.getInput("modified");
    const renamed = core.getInput("renamed");
    const name = core.getInput("name");
    const previous = core.getInput("previous");
    
    const file = await getWidgetFile(name);
    const data = getRenderData(file.context);
    return
    
    if (removed) {
      // was it removed by its author?
      // delete from list
      // delete from /docs
      // setOutput widget_author
    } else if (added) {
      // add to list
      // add to /docs
      // setOutput widget_author
    }
    return
    
    // if a widget was created
      // add it to the list
      // add it to /docs
      // if the author has no other widgets add them to contributors
    // if a widget was changed 
      // update list
      // update in /docs
    
    if (data.invalid) throw `The document does not contain valid data-widget-name or data-widget-summary fields. These should be attributes of the <body> tag.`;
    data["widget"] = getWidget(file.context);
    data["path"] = file.path;
    const templates = await loadTemplates();
    const engine = new liquid.Engine();
    const widget_engine = await engine.parse(templates.widget);
    const widget = await widget_engine.render(data);
    const widget_written = await writeWidget(file.path, widget)
    const item_engine = await engine.parse(templates.item)
    const item = await item_engine.render(data);
    const page = await prependItemToList(item);
    const writePage = await writeHomePage(page);
    const readme = await addContributor(templates.contributor, engine, data);
    const write_readme = await writeReadme(readme);
    return "Success";
  } catch(error) {
    core.setFailed(error);
  }
})()
