'use strict';

const fs = require('fs-extra');
const os = require('os');
const path = require('path');
const remote = require('./remote');
const platform = require('./platform');
const index = require('./index');
const utils = require('./utils');

class Cache {
  constructor(config) {
    // TODO: replace this with a private field when it reaches enough maturity
    // https://github.com/tc39/proposal-class-fields#private-fields
    this.config = config;
    this.cacheFolder = path.join(config.cache, 'cache');
  }

  lastUpdated() {
    return fs.stat(this.cacheFolder);
  }

  getPage(page) {
    let preferredPlatform = platform.getPreferredPlatformFolder(this.config);
    const preferredLanguage = process.env.LANG || 'en';
    return index.findPage(page, preferredPlatform, preferredLanguage)
      .then((folder) => {
        if (!folder) {
          return;
        }
        let filePath = path.join(this.cacheFolder, folder, page + '.md');
        return fs.readFile(filePath, 'utf8');
      })
      .catch((err) => {
        console.error(err);
      });
  }

  clear() {
    return fs.remove(this.cacheFolder);
  }

  update() {
    // Temporary folder path: /tmp/tldr/{randomName}
    const tempFolder = path.join(os.tmpdir(), 'tldr', utils.uniqueId());

    // Downloading fresh copy
    return Promise.all([
      // Create new temporary folder
      fs.ensureDir(tempFolder),
      fs.ensureDir(this.cacheFolder)
    ])
      .then(() => {
        // Download and extract cache data to temporary folder
        return remote.download(tempFolder);
      })
      .then(() => {
        // Copy data to cache folder
        return fs.copy(tempFolder, this.cacheFolder);
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
}

module.exports = Cache;
