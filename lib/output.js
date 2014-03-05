var marked = require('marked');
var unhtml = require('unhtml');
var colors = require('colors');
var config = require('./config');

var TEXT    = config.colors['text'];
var CMD_BG  = config.colors['command-background'] + 'BG';
var CMD_FG  = config.colors['command-foreground'];
var CMD_TOK = config.colors['command-token'];

var allElements = [
  'code', 'blockquote', 'html', 'codespan', 'strong', 'em', 'br', 'del',
  'heading', 'hr', 'image', 'link', 'list', 'listitem',
  'paragraph', 'strikethrough', 'table', 'tablecell', 'tablerow'
];

exports.fromMarkdown = function(markdown, index) {

  var r = new marked.Renderer();

  if (index === undefined || index === null) {
    index = -1;
  }

  // ignore all syntax by default
  allElements.forEach(function(e) {
    r[e] = function() { return ''; }
  });

  if (index == -1) {
    // paragraphs just pass through (automatically created by new lines)
    r.paragraph = function(text) {
      return text;
    };

    //
    // High-level description
    //

    r.blockquote = function(text) {
      text = text.replace('\n', '\n  ');
      return '  ' + text[TEXT];
    };

    //
    // Examples
    //

    r.list = function(body, ordered) {
      return '\n\n' + body[TEXT] + '\n';
    }

    r.listitem = function(text) {
      return '  - ' + text[TEXT] + '\n';
    };

    r.codespan = function(code, lang) {
      // split the command on tokens
      var parts = code.split(/\{\{(.*?)\}\}/);
      // every second part is a token
      return '  ' + parts.reduce(function(memo, item, i) {
        if (i % 2) return memo + item[CMD_BG][CMD_TOK];
        else       return memo + item[CMD_BG][CMD_FG];
      }, '');
    };

  } else {
    // paragraphs just pass through (automatically created by new lines)
    r.paragraph = function(text) {
      return text[TEXT];
    };

    //
    // High-level description
    //

    r.blockquote = function(text) {
      return '';
    };

    //
    // Examples
    //

    r.list = function(body, ordered) {
      return body[TEXT];
    }

    var ind = 0;
    r.listitem = function(text) {
      if (ind == index) {
        return '  - ' + text[TEXT] + '\n';
      } else {
        return '';
      }
    };

    r.codespan = function(code, lang) {
      if (ind == index) {
        ind++;
        // split the command on tokens
        var parts = code.split(/\{\{(.*?)\}\}/);
        // every second part is a token
        return '  ' + parts.reduce(function(memo, item, i) {
          if (i % 2) return memo + item[CMD_BG][CMD_TOK];
          else       return memo + item[CMD_BG][CMD_FG];
        }, '');
      } else {
        ind++;
        return '';
      }
    };
  }


  var rendered = unhtml(marked(markdown, {renderer: r}));
  return '\n' + rendered + '\n';

};
