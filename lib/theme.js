var _ = require('lodash');
var config = require('./config');

var theme = null;

function getTheme() {
  if (!theme) {
    theme = loadTheme();
  }
  return theme;
}

function loadTheme() {
  var themes = config.get().themes;
  var currentTheme = config.get().theme;
  return themes[currentTheme];
}

function buildStylingFunction(styles) {
  if (_.isEmpty(styles)) {
    return _.identity;
  }
  var stylingFunction = require('chalk');
  var stylesPath = styles.replace(/,\s*/, '.');
  return _.get(stylingFunction, stylesPath);
}

function renderPart(partName, text) {
  // var theme = theme;
  var styles = getTheme()[partName];
  var stylingFunction = buildStylingFunction(styles);
  return stylingFunction(text);
}

module.exports = {
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
