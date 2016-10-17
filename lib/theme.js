var get = require('lodash.get');
var isEmpty = require('lodash.isempty');
var identity = require('lodash.identity');
var partial = require('lodash.partial');
var memoize = require('lodash.memoize');
var chalk = require('chalk');

// Translates strings like 'red, underline, bold'
// into function chalk.red.underline.bold(text)
function buildStylingFunction(styles) {
  if (isEmpty(styles)) {
    return identity;
  }
  var stylingFunction = chalk;
  var stylesPath = styles.replace(/,\s*/g, '.');
  return get(stylingFunction, stylesPath);
}

var Theme = function(options) {
  var theme = options;

  var renderPart = function(partName, text) {
    var styles = theme[partName];
    var stylingFunction = buildStylingFunction(styles);
    return stylingFunction(text);
  };

  var renderPartMemoized = function(partName) {
    return memoize(partial(renderPart, partName));
  };

  return {
    renderName: renderPartMemoized('name'),
    renderDescription: renderPartMemoized('description'),
    renderExampleDescription: renderPartMemoized('exampleDescription'),
    renderExampleCode: renderPartMemoized('exampleCode'),
    renderExampleToken: renderPartMemoized('exampleToken')
  };
};

module.exports = Theme;
