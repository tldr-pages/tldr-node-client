'use strict';

const unescape = require('lodash/unescape');
const marked = require('marked');
const chalk = require('chalk');
const index = require('./index');
const sanitizeHtml = require('sanitize-html');

const allElements = [
  'blockquote', 'html', 'strong', 'em', 'br', 'del',
  'heading', 'hr', 'image', 'link', 'list', 'listitem',
  'paragraph', 'strikethrough', 'table', 'tablecell', 'tablerow'
];

function unhtml(text){
  return unescape(text);
}

exports.parse = (markdown) => {
  // Creating the page structure
  let page = {
    name: '',
    description: '',
    examples: [],
    seeAlso: []
  };
  // Initializing the markdown renderer
  let r = new marked.Renderer();

  // ignore all syntax by default
  allElements.forEach((e) => {
    r[e] = () => { return ''; };
  });

  // Overriding the different elements to incorporate the custom tldr format

  r.codespan = (text) => {
    text = sanitizeHtml(text);
    if (index.hasPage(text) && text !== page.name) {
      if (page.seeAlso.indexOf(text) < 0) {
        page.seeAlso.push(text);
      }
    }
    let example = page.examples[page.examples.length-1];
    // If example exists and a code is already not added
    if (example && !example.code) {
      example.code = unhtml(text);
    }
    return text;
  };

  // underline links
  r.link = (uri) => {
    return sanitizeHtml(uri);
  };

  // paragraphs just pass through (automatically created by new lines)
  r.paragraph = (text) => {
    return sanitizeHtml(text);
  };

  r.heading = (text, level) => {
    text = sanitizeHtml(text);
    if (level === 1) {
      page.name = text.trim();
    }
    return text;
  };

  r.blockquote = (text) => {
    text = sanitizeHtml(text);
    page.description += unhtml(text);
    return text;
  };

  r.strong = (text) => {
    text = sanitizeHtml(text);
    return chalk.bold(text);
  };

  r.em = (text) => {
    text = sanitizeHtml(text);
    return chalk.italic(text);
  };

  r.listitem = (text) => {
    text = sanitizeHtml(text);
    page.examples.push({
      description: unhtml(text)
    });
    return text;
  };

  marked(markdown, {
    renderer: r
  });

  page.examples = page.examples.filter((example) => {
    return example.description && example.code;
  });

  return page;
};
