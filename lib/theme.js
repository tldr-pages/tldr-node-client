'use strict';

const get = require('lodash/get');
const isEmpty = require('lodash/isEmpty');
const identity = require('lodash/identity');
const chalk = require('chalk');

// Translates strings like 'red, underline, bold'
// into function chalk.red.underline.bold(text)
function buildStylingFunction(styles) {
  if (isEmpty(styles)) {
    return identity;
  }
  let stylingFunction = chalk;
  let stylesPath = styles.replace(/,\s*/g, '.');
  return get(stylingFunction, stylesPath);
}

class Theme {
  constructor(options) {
    this.theme = options;
  }

  hasDistinctStylesForTypes() {
    return (this.theme['exampleBool']
      && this.theme['exampleNumber']
      && this.theme['exampleString']);
  }

  getStylingFunction(partName) {
    let styles = this.theme[partName];
    return buildStylingFunction(styles);
  }

  renderCommandName(text) {
    return this.getStylingFunction('commandName')(text);
  }

  renderMainDescription(text) {
    return this.getStylingFunction('mainDescription')(text);
  }

  renderExampleDescription(text) {
    return this.getStylingFunction('exampleDescription')(text);
  }

  renderExampleCode(text) {
    return this.getStylingFunction('exampleCode')(text);
  }

  renderExampleToken(text) {
    let tokenName = 'exampleToken';
    if (!this.hasDistinctStylesForTypes())
      return this.getStylingFunction(tokenName)(text);

    if (!Number.isNaN(Number(text)))
      tokenName = 'exampleNumber';
    if (Number.isNaN(Number(text)))
      tokenName = 'exampleString';
    if (/true|false/.test(text))
      tokenName = 'exampleBool';

    return this.getStylingFunction(tokenName)(text);
  }
}

module.exports = Theme;
