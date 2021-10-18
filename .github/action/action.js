const fs = require("fs");

// A user had sumbitted a widget PR and it has been accepted.


// Required
// Extract front matter
// Expected output:
// {
//   name: The name of the widget
//   summary: Brief description of the widget
// }
// function getFrontMatter(file) {}


// Required
// Extracts the <body>...</body> of the new widget.
// function getBody(file) {}


// Extracts the <style>...</style> of the new widget.
// function getStyle(fale) {}


// Extracts the <script>...</script> of the new widget.
// function getScript(file) {}


// function loadTemplate(name) {}

(async function(){
  try {
    // 1. load templates.
    // 2. populate submitted widget content into widget template.
    // 3. save new widget to docs directory
    // 4. populate item template with widget data
    // 5. append item template to widget list on home page.
    // 5. update user to contributors list on README.md, if not already listed.
  } catch(error) {
    core.setFailed(error);
  }
})()
