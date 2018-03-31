const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const promiseMap = require('p-map');

const flatten = (arr) => {
  return arr.reduce((acc, it) => {
    return acc.concat(it);
  }, []);
};

module.exports = {
  parsePlatform(pagefile) {
    return path.dirname(pagefile);
  },

  parsePagename(pagefile) {
    return path.basename(pagefile, '.md');
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

  walk(dir) {
    return fs.readdir(dir)
      .then((items) => {
        return promiseMap(items, (item) => {
          const itemPath = path.join(dir, item);
          return fs.stat(itemPath).then((stat) => {
            if (stat.isDirectory()) {
              return this.walk(itemPath);
            }
            return path.join(path.basename(dir), item);
          });
        });
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
  }
};
