'use strict';

const isEmpty = require('lodash/isEmpty');
const identity = require('lodash/identity');
const { styleText } = require('node:util');

// Translates strings like 'red, underline, bold'
// into function styleText(['red', 'underline', 'bold'], text)
function buildStylingFunction(styles) {
  if (isEmpty(styles)) {
    return identity;
  }

  let stylesArr = styles.split(/,\s*/g);
  return (text) => styleText(stylesArr, text);
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

    let baseStyle = this.theme[tokenName] || '';
    let typeStyle = '';

    if (!Number.isNaN(Number(text)))
      typeStyle = this.theme['exampleNumber'];
    else if (/true|false/.test(text))
      typeStyle = this.theme['exampleBool'];
    else
      typeStyle = this.theme['exampleString'];

    let combinedStyle = baseStyle ?
      baseStyle + (typeStyle ? ', ' + typeStyle : '') :
      typeStyle;

    return buildStylingFunction(combinedStyle)(text);
  }
}

module.exports = Theme;
