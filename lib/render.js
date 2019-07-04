'use strict';

const Theme = require('./theme');

// The page structure is passed to this function, and then the theme is applied
// to different parts of the page and rendered to the console
exports.toANSI = (page, config) => {
  // Creating the theme object
  let themeOptions = config.themes[config.theme];
  if (!themeOptions) {
    console.error(`invalid theme: ${config.theme}`);
    return;
  }
  let theme = new Theme(themeOptions);

  function highlight(code) {
    let parts = code.split(/\{\{(.*?)\}\}/);
    // every second part is a token
    return '    ' + parts.reduce(function(memo, item, i) {
      if (i % 2) {
        return memo + theme.renderExampleToken(item);
      }
      return memo + theme.renderExampleCode(item);
    }, '');
  }

  // Creating an array where each line is an element in it
  let output = [];

  // Pushing each line by extracting the page parts and applying the theme to it
  output.push('  ' + theme.renderCommandName(page.name));
  output.push('');
  output.push('  ' + theme.renderMainDescription(page.description.replace(/\n/g, '\n  ')));
  output.push('');

  page.examples.forEach((example) => {
    output.push(theme.renderExampleDescription('  - ' + example.description));
    output.push(highlight(example.code));
    output.push('');
  });

  if (page.seeAlso && page.seeAlso.length > 0) {
    output.push('');
    output.push('See also: ' + page.seeAlso.join(', '));
    output.push('');
  }

  return '\n' + output.join('\n') + '\n';
};
