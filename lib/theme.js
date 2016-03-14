var get = require('lodash.get');
var isEmpty = require('lodash.isempty');
var identity = require('lodash.identity');
var chalk = require('chalk');

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

  function renderPart(partName, text) {
    var styles = theme[partName];
    var stylingFunction = buildStylingFunction(styles);
    return stylingFunction(text);
  }

  return {
    renderName: function(text) {
      return renderPart('name', text);
    },

    renderDescription: function(text) {
      return renderPart('description', text);
    },

    renderExampleDescription: function(text) {
      return renderPart('exampleDescription', text);
    },

    renderExampleCode: function(text) {
      return renderPart('exampleCode', text);
    },

    renderExampleArgument: function(text) {
      return renderPart('exampleArgument', text);
    }
  };
};

module.exports = Theme;
