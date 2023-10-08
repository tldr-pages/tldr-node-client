const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const crypto = require('crypto');
const flatten = require('lodash/flatten');

module.exports = {
  parsePlatform(pagefile) {
    const components = pagefile.split(path.sep);
    return components[components.length-2];
  },

  parsePagename(pagefile) {
    return path.basename(pagefile, '.md');
  },

  parseLanguage(pagefile) {
    const components = pagefile.split(path.sep);
    const langPathIndex = 3;
    const langParts = components[components.length-langPathIndex].split('.');
    if (langParts.length === 1) {
      return 'en';
    }
    return langParts[1];
  },

  localeToLang(locale) {
    if(locale === undefined || locale.startsWith('en')) return [];

    const withDialect = ['pt', 'zh'];
    
    let lang = locale;
    if(lang.includes('.')) {
      lang = lang.substring(0, lang.indexOf('.'));
    }
    
    // Check for language code & country code.
    let ll = lang, cc = '';
    if(lang.includes('_')) {
      cc = lang.substring(lang.indexOf('_') + 1);
      ll = lang.substring(0, lang.indexOf('_'));
    }

    // If we have dialect for this language take dialect as well.
    if(withDialect.indexOf(ll) !== -1 && cc !== '') {
      return [ll, ll + '_' + cc];
    }

    return [ll];
  },

  isPage(file) {
    return path.extname(file) === '.md';
  },

  // TODO: remove this
  commandSupportedOn(platform) {
    return (command) => {
      return command.platform.indexOf(platform) >= 0
        || command.platform.indexOf('common') >= 0;
    };
  },

  walk: function walk(dir) {
    return fs.readdir(dir)
      .then((items) => {
        return Promise.all(items.map((item) => {
          const itemPath = path.join(dir, item);
          return fs.stat(itemPath).then((stat) => {
            if (stat.isDirectory()) {
              return walk(itemPath);
            }
            return path.join(dir, item);
          });
        }));
      })
      .then((paths) => {
        return flatten(paths);
      });
  },

  glob(string,options) {
    return new Promise((resolve, reject) => {
      glob(string, options, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  },

  // eslint-disable-next-line no-magic-numbers
  uniqueId(length = 32) {
    const size = Math.ceil(length / 2);
    return crypto.randomBytes(size).toString('hex').slice(0, length);
  }
};
