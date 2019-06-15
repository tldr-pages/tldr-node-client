'use strict';

const defaults = require('lodash/defaults');
const fs = require('fs');
const path = require('path');
const osHomedir = require('os-homedir');

let config = null;
let customCfgPath = null;
const DEFAULT_CONFIG_PATH = path.join(osHomedir(), '.tldrrc');

exports.reset = () => {
  config = null;
};

exports.get = () => {
  if (!config) {
    config = load();
  }
  return config;
};

exports.set = (path) => {
  if (path) {
    try {
      fs.accessSync(path);
      customCfgPath = path;
      config = load();
    } catch (_ex) {
      console.error(`No access to ${path}; sticking with default config file (${DEFAULT_CONFIG_PATH})`);
    }
  }
};

function load() {
  const DEFAULT = path.join(__dirname, '..', 'config.json');
  if (customCfgPath === null) {
    customCfgPath = DEFAULT_CONFIG_PATH;
  }

  let defaultConfig = JSON.parse(fs.readFileSync(DEFAULT));
  defaultConfig.cache = path.join(osHomedir(), '.tldr');
  /*eslint-disable no-process-env */
  defaultConfig.proxy = process.env.HTTP_PROXY || process.env.http_proxy;
  /*eslint-enable no-process-env */

  let customConfig = {};
  try {
    customConfig = JSON.parse(fs.readFileSync(customCfgPath));
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
  const validValues = ['',
    'reset',
    'bold',
    'dim',
    'italic',
    'underline',
    'inverse',
    'hidden',
    'black',
    'red',
    'redBright',
    'green',
    'greenBright',
    'yellow',
    'yellowBright',
    'blue',
    'blueBright',
    'magenta',
    'magentaBright',
    'cyan',
    'cyanBright',
    'white',
    'whiteBright',
    'gray',
    'bgBlack',
    'bgRed',
    'bgGreen',
    'bgYellow',
    'bgBlue',
    'bgMagenta',
    'bgCyan',
    'bgWhite',
    'bgBlackBright',
    'bgRedBright',
    'bgGreenBright',
    'bgYellowBright',
    'bgBlueBright',
    'bgMagentaBright',
    'bgCyanBright',
    'bgWhiteBright'
  ];
  let errMsg = [];
  for (let fieldKey of Object.keys(field)) {
    let tokens = field[fieldKey].replace(/\s+/g, '').split(',');
    tokens.forEach((token) => {
      if (validValues.indexOf(token) < 0) {
        errMsg.push('Invalid theme value : ' + token + ' in ' + key + ' theme');
      }
    });
  }
  if (errMsg.length === 0) {
    return null;
  }
  return errMsg.join('\n');
}