const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const crypto = require('crypto');
const flatten = require('lodash/flatten');

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

  walk: function walk(dir) {
    return fs.readdir(dir)
      .then((items) => {
        return Promise.all(items.map((item) => {
          const itemPath = path.join(dir, item);
          return fs.stat(itemPath).then((stat) => {
            if (stat.isDirectory()) {
              return walk(itemPath);
            }
            return path.join(path.basename(dir), item);
          });
        }));
      })
      .then((paths) => {
        return flatten(paths);
      });
  },

  glob(string, options) {
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
  },

  importSafe(query, cb) {
    const requireNative = require.extensions['.node'];
    require.extensions['.node'] = (module, filename) => {
      try {
        return requireNative(module, filename);
      } catch (err) {
        throw Object.assign(err, {
          code: 'ERR_REQUIRE_NATIVE',
          module,
          filename
        });
      } finally {
        require.extensions['.node'] = requireNative;
      }
    };
    try {
      return require(query);
    } catch (err) {
      return cb(err, query);
    }
  }
};
