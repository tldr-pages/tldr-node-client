'use strict';

const defaults = require('lodash.defaults');
const fs = require('fs');
const path = require('path');
const osHomedir = require('os-homedir');

let config = null;

exports.reset = () => {
  config = null;
};

exports.get = () => {
  if (!config) {
    config = load();
  }
  return config;
};

function load() {
  const DEFAULT = path.join(__dirname, '..', 'config.json');
  const CUSTOM = path.join(osHomedir(), '.tldrrc');

  let defaultConfig = JSON.parse(fs.readFileSync(DEFAULT));
  defaultConfig.cache = path.join(osHomedir(), '.tldr');
  /*eslint-disable no-process-env */
  defaultConfig.proxy = process.env.HTTP_PROXY || process.env.http_proxy;
  /*eslint-enable no-process-env */

  let customConfig = {};
  try {
    customConfig = JSON.parse(fs.readFileSync(CUSTOM));
  } catch (ex) {
    /*eslint-disable */
    /*eslint-enable */
  }

  let merged = defaults(customConfig, defaultConfig);
  // Validating the theme settings
  let errors = Object.keys(!merged.themes ? {} : merged.themes).map(
    (key) => {
      return validateThemeItem(merged.themes[key], key);
    }
  );
  errors.push(validatePlatform(merged.platform));
  // Filtering out all the null entries
  errors = errors.filter((item) => { return item !== null; });

  if (errors.length > 0) {
    throw new Error('Error in .tldrrc configuration:\n' + errors.join('\n'));
  }
  return merged;
}

function validatePlatform(os) {
  let platform = require('./platform');
  if (os && !platform.isSupported(os)) {
    return 'Unsupported platform : ' + os;
  }
  return null;
}

function validateThemeItem(field, key) {
  let validValues = ['',
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
  // TODO: change this to return all errors in a field
  for (let item in field) {
    if (field.hasOwnProperty(item)) {
      let tokens = field[item].replace(/\s+/g, '').split(',');
      for (let i = 0; i < tokens.length; i++) {
        if (validValues.indexOf(tokens[i]) < 0) {
          return 'Invalid theme value : ' + tokens[i] + ' in ' + key + ' theme';
        }
      }
    }
  }
  return null;
}
