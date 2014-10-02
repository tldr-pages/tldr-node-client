var _      = require('lodash');
var marked = require('marked');
var unhtml = require('unhtml');

var allElements = [
  'code', 'blockquote', 'html', 'codespan', 'strong', 'em', 'br', 'del',
  'heading', 'hr', 'image', 'link', 'list', 'listitem',
  'paragraph', 'strikethrough', 'table', 'tablecell', 'tablerow'
];

exports.parse = function(markdown) {

  var page = {
    name: '',
    description: '',
    examples: []
  };

  var r = new marked.Renderer();

  // ignore all syntax by default
  allElements.forEach(function(e) {
    r[e] = function() { return ''; };
  });

  // paragraphs just pass through (automatically created by new lines)
  r.paragraph = function(text) {
    return text;
  };

  r.heading = function(text, level) {
    if (level === 1) {
      page.name = text.trim();
    }
  }

  r.blockquote = function(text) {
    page.description += unhtml(text);
  };

  r.listitem = function(text) {
    page.examples.push({});
    _.last(page.examples).description = unhtml(text);
  };

  r.codespan = function(code, lang) {
    _.last(page.examples).code = unhtml(code);
  };

  marked(markdown, {renderer: r});

  return page;

};
