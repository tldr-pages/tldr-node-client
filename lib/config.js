var _      = require('lodash');
var fs     = require('fs');
var path   = require('path');
var ms     = require('ms');
var extend = require('deep-extend');

var config = null;

exports.reset = function() {
  config = null;
};

exports.get = function() {
  if (!config) config = load();
  return config;
};

function load() {
  var DEFAULT  = path.join(__dirname, '..', 'config.json');
  var CUSTOM = path.join(process.env['HOME'], '.tldrrc');
  var defaultConfig = JSON.parse(fs.readFileSync(DEFAULT));
  defaultConfig.cache = path.join(process.env['HOME'], '.tldr');
  defaultConfig.proxy = process.env.HTTP_PROXY || process.env.http_proxy;

  var customConfig = {};
  try {
    customConfig = JSON.parse(fs.readFileSync(CUSTOM));
  } catch (ex) {
  }

  var merged = extend(defaultConfig, customConfig);
  var errors = _.map(merged.colors, validateColor);
  errors.push(validatePlatform(merged.platform));
  errors = _.compact(errors);

  if (errors.length === 0) {
    return merged;
  } else {
    throw new Error('Error in .tldrrc configuration:\n' + errors.join('\n'));
  }
}

function validatePlatform(os) {
  var platform = require('./platform');
  if (os && !platform.isSupported(os)) {
    return 'Unsupported platform : ' + os;
  }
}

function validateColor(colorName, key) {
  var ansi = ['white','black','blue','cyan','green','magenta','red','yellow'];
  if (ansi.indexOf(colorName) === -1) {
    return 'Invalid ANSI color : ' + key + ' = ' + colorName;
  } else {
    return null;
  }
}
