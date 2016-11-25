var last = require('lodash.last');
var unescape = require('lodash.unescape');
var marked = require('marked');
var chalk = require('chalk');
var index = require('./index');


var allElements = [
  'blockquote', 'html', 'strong', 'em', 'br', 'del',
  'heading', 'hr', 'image', 'link', 'list', 'listitem',
  'paragraph', 'strikethrough', 'table', 'tablecell', 'tablerow'
];

function unhtml(text){
  // text = text.replace(/<code>/, '').replace(/<\/code>/, '');
  return unescape(text);
}

exports.parse = function(markdown) {

  var page = {
    name: '',
    description: '',
    examples: [],
    seeAlso: []
  };

  var r = new marked.Renderer();

  // ignore all syntax by default
  allElements.forEach(function(e) {
    r[e] = function() { return ''; };
  });

  r.code = function(text) {
    var example = last(page.examples);
    if (example) {
      example.code = unhtml(text);
    }
    return text;
  };

  r.codespan = function(text) {
    if (index.hasPage(text) && text !== page.name) {
      if (page.seeAlso.indexOf(text) < 0) {
        page.seeAlso.push(text);
      }
    }
    return text;
  }


  // paragraphs just pass through (automatically created by new lines)
  r.paragraph = function(text) {
    if (page.description == unhtml(text)) {
      return text;
    }
    page.examples.push({
      description: unhtml(text)
    });
    return text;
  };

  r.heading = function(text, level) {
    if (level === 1) {
      page.name = text.trim();
    }
    return text;
  };

  r.blockquote = function(text) {
    page.description += unhtml(text);
    return text;
  };

  r.strong = function(text) {
    return chalk.bold(text);
  };

  r.em = function(text) {
    return chalk.italic(text);
  };

  marked(markdown, {
    renderer: r,
    sanitize: true
  });

  page.examples = page.examples.filter(function(example) {
    return example.description && example.code;
  });

  return page;

};
