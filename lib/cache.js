'use strict';

const fs = require('fs-extra');
const os = require('os');
const path = require('path');
const config = require('./config');
const remote = require('./remote');
const platform = require('./platform');
const index = require('./index');
const utils = require('./utils');

const CACHE_FOLDER = path.join(config.get().cache, 'cache');
const TEMP_FOLDER = path.join(os.tmpdir(), 'tldr');

exports.CACHE_FOLDER = CACHE_FOLDER;

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
  // Temporary folder path: /tmp/tldr/{randomName}
  let tempFolder = path.join(TEMP_FOLDER, utils.uniqueId());

  // Downloading fresh copy
  return Promise.all([
    // Create new temporary folder
    fs.ensureDir(tempFolder),
    fs.ensureDir(CACHE_FOLDER)
  ])
    .then(() => {
      // Download and extract cache data to temporary folder
      return remote.download(tempFolder);
    })
    .then(() => {
      // Copy data to cache folder
      return fs.copy(tempFolder, CACHE_FOLDER);
    })
    .then(() => {
      return Promise.all([
        // Remove temporary folder
        fs.remove(tempFolder),
        index.rebuildPagesIndex()
      ]);
    })
    // eslint-disable-next-line no-unused-vars
    .then(([_, shortIndex]) => {
      return shortIndex;
    });
};
