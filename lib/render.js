var colors = require('colors');
var config = require('./config');

var TEXT    = config.get().colors['text'];
var CMD_BG  = config.get().colors['command-background'] + 'BG';
var CMD_FG  = config.get().colors['command-foreground'];
var CMD_TOK = config.get().colors['command-token'];

exports.toANSI = function(page) {
  var output = [];

  output.push('  ' + page.name);
  output.push('  ' + page.description.replace(/\n/g, '\n  '));
  output.push('');

  page.examples.forEach(function(example) {
    output.push('  - ' + example.description[TEXT]);
    example.code.forEach(function(codeLine) {
      output.push('  ' + highlight(codeLine));
    });
    output.push('');
  });

  return '\n' + output.join('\n') + '\n';
};

function highlight(code) {
  var parts = code.split(/\{\{(.*?)\}\}/);
  // every second part is a token
  return '  ' + parts.reduce(function(memo, item, i) {
    if (i % 2) return memo + item[CMD_BG][CMD_TOK];
    else       return memo + item[CMD_BG][CMD_FG];
  }, '');
}
