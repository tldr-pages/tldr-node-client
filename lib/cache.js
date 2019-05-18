'use strict';

const fs = require('fs-extra');
const os = require('os');
const path = require('path');
const config = require('./config');
const remote = require('./remote');
const platform = require('./platform');
const index = require('./index');
const utils = require('./utils');

const TEMP_FOLDER = path.join(os.tmpdir(), 'tldr');

let cacheFolder = null;

function getCacheFolder() {
  if (!cacheFolder) {
    cacheFolder = path.join(config.get().cache, 'cache');
  }
  return cacheFolder;
}

function lastUpdated() {
  return fs.stat(getCacheFolder());
}

function getPage(page) {
  let preferredPlatform = platform.getPreferredPlatformFolder();
  return index.findPlatform(page, preferredPlatform)
    .then((folder) => {
      if (!folder) {
        return;
      }
      let filePath = path.join(getCacheFolder(), 'pages', folder, page + '.md');
      return fs.readFile(filePath, 'utf8');
    })
    .catch((err) => {
      console.error(err);
    });
}

function clear() {
  return fs.remove(getCacheFolder());
}

function update() {
  // Temporary folder path: /tmp/tldr/{randomName}
  let tempFolder = path.join(TEMP_FOLDER, utils.uniqueId());

  // Downloading fresh copy
  return Promise.all([
    // Create new temporary folder
    fs.ensureDir(tempFolder),
    fs.ensureDir(getCacheFolder())
  ])
    .then(() => {
      // Download and extract cache data to temporary folder
      return remote.download(tempFolder);
    })
    .then(() => {
      // Copy data to cache folder
      return fs.copy(tempFolder, getCacheFolder());
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
}

module.exports = {
  clear,
  getCacheFolder,
  getPage,
  lastUpdated,
  update,
};
