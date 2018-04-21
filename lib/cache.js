'use strict';

const fs = require('fs-extra');
const path = require('path');
const config = require('./config');
const remote = require('./remote');
const platform = require('./platform');
const index = require('./index');

const CACHE_FOLDER = path.join(config.get().cache, 'cache');

exports.lastUpdated = () => {
  return fs.stat(CACHE_FOLDER);
};

exports.getPage = (page) => {
  let preferredPlatform = platform.getPreferredPlatformFolder();
  return index.findPlatform(page, preferredPlatform)
    .then((folder) => {
      if (!folder) {
        return;
      }
      let filePath = path.join(CACHE_FOLDER, 'pages', folder, page + '.md');
      return fs.readFile(filePath, 'utf8');
    })
    .catch((err) => {
      console.error(err);
    });
};

exports.clear = () => {
  return fs.remove(CACHE_FOLDER);
};

exports.update = () => {
  // Downloading fresh copy
  return fs.ensureDir(CACHE_FOLDER)
    .then(() => {
      return remote.download();
    })
    .then((tempFolder) => {
      return fs.copy(tempFolder.path, CACHE_FOLDER).then(() => {
        return tempFolder;
      });
    })
    .then((tempFolder) => {
      return Promise.all([
        index.rebuildPagesIndex(),
        tempFolder.remove()
      ]).then(([shortIndex]) => {
        return shortIndex;
      });
    });
};
