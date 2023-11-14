'use strict';

const Theme = require('./theme');
const he = require('he'); // Import the 'he' library

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

  function decodeEntities(text) {
    return he.decode(text); // Decode HTML entities
  }

  // Creating an array where each line is an element in it
  let output = [];

  // Pushing each line by extracting the page parts and applying the theme to it
  output.push('  ' + theme.renderCommandName(page.name));
  output.push('');
  output.push('  ' + theme.renderMainDescription(decodeEntities(page.description.replace(/mailto:/g, '')).replace(/\n/g, '\n  '))); // Decode entities and remove "mailto:" prefix in the description
  output.push('');

  page.examples.forEach((example) => {
    // Decode entities and remove "mailto:" prefix in the description and code
    output.push(theme.renderExampleDescription('  - ' + decodeEntities(example.description.replace(/mailto:/g, ''))));
    output.push(highlight(decodeEntities(example.code.replace(/mailto:/g, ''))));
    output.push('');
  });

  if (page.seeAlso && page.seeAlso.length > 0) {
    output.push('');
    output.push('See also: ' + page.seeAlso.join(', '));
    output.push('');
  }

  return '\n' + output.join('\n') + '\n';
};
