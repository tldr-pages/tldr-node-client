'use strict';

const fs = require('fs-extra');
const os = require('os');
const path = require('path');
const remote = require('./remote');
const platforms = require('./platforms');
const index = require('./index');
const utils = require('./utils');

class Cache {
  constructor(config) {
    this.config = config;
    this.cacheFolder = path.join(config.cache, 'cache');
  }

  /**
   * Fetch stats from the cache folder for getting its last modified time
   * (mtime).
   *
   * @returns {Promise<any>} A promise with the stats of the cache folder.
   */
  lastUpdated() {
    return fs.stat(this.cacheFolder);
  }

  /**
   * Fetch a page from cache using preferred language and preferred platform.
   * @param {string} page
   * @returns {Promise<string>}
   */
  getPage(page) {
    let preferredPlatform = platforms.getPreferredPlatformFolder(this.config);
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

  /**
   * Clean the cache folder.
   * @returns {Promise<any>} A promise when the remove is completed.
   */
  clear() {
    return fs.remove(this.cacheFolder);
  }

  /**
   * Update the cache folder using a temporary directory, update the index and
   * return it.
   *
   * @returns {Promise<any>} The index.
   */
  update() {
    // Temporary folder path: /tmp/tldr/{randomName}
    const tempFolder = path.join(os.tmpdir(), 'tldr', utils.uniqueId());

    // Downloading fresh copy
    return Promise.all([
      // Create new temporary folder
      fs.ensureDir(tempFolder),
      fs.ensureDir(this.cacheFolder),
    ])
      .then(() => {
        // Download and extract cache data to temporary folder
        return Promise.allSettled(this.config.languages.map((lang) => {
          return remote.download(tempFolder, lang);
        }));
      })
      .then(() => {
        // Copy data to cache folder
        return fs.copy(tempFolder, this.cacheFolder);
      })
      .then(() => {
        return Promise.all([
          // Remove temporary folder
          fs.remove(tempFolder),
          index.rebuildPagesIndex(),
        ]);
      })
      .then(([_, shortIndex]) => {
        return shortIndex;
      });
  }
}

module.exports = Cache;
