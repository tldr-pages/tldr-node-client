var Theme = require('./theme');
var config = require('./config');


exports.toANSI = function(page) {
  var themeOptions = config.get().themes[config.get().theme];
  var theme = new Theme(themeOptions);

  function highlight(code) {
    var parts = code.split(/\{\{(.*?)\}\}/);
    // every second part is a token
    return '    ' + parts.reduce(function(memo, item, i) {
      if (i % 2) {
        return memo + theme.renderExampleToken(item);
      }
      return memo + theme.renderExampleCode(item);
    }, '');
  }

  var output = [];

  output.push('  ' + theme.renderName(page.name));
  output.push('');
  output.push('  ' + theme.renderDescription(page.description.replace(/\n/g, '\n  ')));
  output.push('');

  page.examples.forEach(function(example) {
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
