var _      = require('lodash');
var marked = require('marked');
var unhtml = require('unhtml');

var allElements = [
  'blockquote', 'html', 'strong', 'em', 'br', 'del',
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
    if (/^<code>.*<\/code>$/.test(text)) {
      var example = _.last(page.examples);
      if (example) {
        example.code = unhtml(text);
      }
    } else {
      return text;
    }
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

  marked(markdown, {renderer: r, sanitize: true});

  page.examples = page.examples.filter(function(example) {
    return example.description && example.code;
  });

  return page;

};
