'use strict';

const defaults = require('lodash/defaults');
const fs = require('fs');
const path = require('path');
const osHomedir = require('os').homedir;

exports.get = () => {
  const DEFAULT = path.join(__dirname, '..', 'config.json');
  const CUSTOM = path.join(osHomedir(), '.tldrrc');

  let defaultConfig = JSON.parse(fs.readFileSync(DEFAULT));
  defaultConfig.cache = path.join(osHomedir(), '.tldr');

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
};

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