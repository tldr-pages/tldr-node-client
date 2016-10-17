var defaults = require('lodash.defaults');
var compact = require('lodash.compact');
var map = require('lodash.map');
var fs        = require('fs');
var path      = require('path');
var osHomedir = require('os-homedir');

var config = null;

exports.reset = function() {
  config = null;
};

exports.get = function() {
  if (!config) {
    config = load();
  }
  return config;
};

function load() {
  var DEFAULT  = path.join(__dirname, '..', 'config.json');
  var CUSTOM = path.join(osHomedir(), '.tldrrc');
  var defaultConfig = JSON.parse(fs.readFileSync(DEFAULT));
  defaultConfig.cache = path.join(osHomedir(), '.tldr');
  /*eslint-disable no-process-env */
  defaultConfig.proxy = process.env.HTTP_PROXY || process.env.http_proxy;
  /*eslint-enable no-process-env */

  var customConfig = {};
  try {
    customConfig = JSON.parse(fs.readFileSync(CUSTOM));
  } catch (ex) {
    /*eslint-disable */
    /*eslint-enable */
  }

  var merged = defaults(customConfig, defaultConfig);
  var errors = map(merged.themes, validateThemeItem);
  errors.push(validatePlatform(merged.platform));
  errors = compact(errors);

  if (errors.length > 0) {
    throw new Error('Error in .tldrrc configuration:\n' + errors.join('\n'));
  }
  return merged;
}

function validatePlatform(os) {
  var platform = require('./platform');
  if (os && !platform.isSupported(os)) {
    return 'Unsupported platform : ' + os;
  }
  return null;
}

function validateThemeItem(field, key) {
  var validValues = ['',
                    'reset',
                    'bold',
                    'dim',
                    'italic',
                    'underline',
                    'inverse',
                    'hidden',
                    'black',
                    'red',
                    'green',
                    'yellow',
                    'blue',
                    'magenta',
                    'cyan',
                    'white',
                    'gray',
                    'bgBlack',
                    'bgRed',
                    'bgGreen',
                    'bgYellow',
                    'bgBlue',
                    'bgMagenta',
                    'bgCyan',
                    'bgWhite'
                    ];
  for (var item in field) {
    if (field.hasOwnProperty(item)) {
      var tokens = field[item].split(',');
      for (var i=0; i < tokens.length; i++) {
        if (validValues.indexOf(tokens[i]) < 0) {
          return 'Invalid ANSI color : ' + tokens[i] + ' in ' + key + ' theme';
        }
      }
    }
  }
  return null;
}
