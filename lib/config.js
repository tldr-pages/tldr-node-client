'use strict';

const defaults = require('lodash/defaults');
const fs = require('fs');
const path = require('path');
const utils = require('./utils');
const osHomedir = require('os').homedir;
const platforms = require('./platforms');

exports.get = () => {
  const DEFAULT = path.join(__dirname, '..', 'config.json');
  const CUSTOM = path.join(osHomedir(), '.tldrrc');

  let defaultConfig = JSON.parse(fs.readFileSync(DEFAULT));
  defaultConfig.cache = path.join(osHomedir(), '.tldr');

  let customConfig = {};
  try {
    customConfig = JSON.parse(fs.readFileSync(CUSTOM));
  } catch (ex) {
    if (ex instanceof SyntaxError) {
      throw new Error('The content of .tldrrc is not a valid JSON object:\n' + ex);
    }
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

  // Setting correct languages
  merged.languages = ['en'];
  // Get the primary & secondary language.
  let langs = utils.localeToLang(process.env.LANG);
  merged.languages = merged.languages.concat(langs);
  
  if(process.env.LANGUAGE !== undefined) {
    let langs = process.env.LANGUAGE.split(':');
    
    merged.languages.push(...langs.map((lang) => {
      return utils.localeToLang(lang);
    }));
  }
  merged.languages = [...new Set(merged.languages)];
  
  return merged;
};

function validatePlatform(platform) {
  if (platform && !platforms.isSupported(platform)) {
    return 'Unsupported platform : ' + platform;
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
