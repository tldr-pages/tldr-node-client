'use strict';

const { styleText } = require('node:util');
const unescape = require('lodash/unescape');
const marked = require('marked');
const index = require('./index');

const allElements = [
  'blockquote', 'html', 'strong', 'em', 'br', 'del',
  'heading', 'hr', 'image', 'link', 'listitem',
  'paragraph', 'strikethrough', 'table', 'tablecell', 'tablerow'
];

function unhtml(text){
  return unescape(text);
}

exports.parse = (markdown) => {
  // Creating the page structure
  /** @type {Required<import('./tldr').TldrPage> & { examples: any[] }} */
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

  r.codespan = ({ text }) => {
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
  r.link = ({ href }) => {
    return href;
  };

  // paragraphs just pass through (automatically created by new lines)
  r.paragraph = ({ tokens }) => {
    return r.parser.parseInline(tokens);
  };

  r.heading = ({ tokens, depth }) => {
    let text = r.parser.parseInline(tokens);
    if (depth === 1) {
      page.name = text.trim();
    }
    return text;
  };

  r.blockquote = ({ tokens }) => {
    let text = r.parser.parse(tokens);
    page.description += unhtml(text);
    return text;
  };

  r.strong = ({ tokens }) => {
    return styleText('bold', r.parser.parseInline(tokens));
  };

  r.em = ({ tokens }) => {
    return styleText('italic', r.parser.parseInline(tokens));
  };

  r.listitem = (item) => {
    let text = r.parser.parse(item.tokens);
    page.examples.push({
      description: unhtml(text)
    });
    return text;
  };

  marked.parse(markdown, {
    renderer: r
  });

  page.examples = page.examples.filter((example) => {
    return example.description && example.code;
  });

  return page;
};
