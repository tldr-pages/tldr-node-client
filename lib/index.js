'use strict';

const fs = require('fs-extra');
const path = require('path');
const config = require('./config');
const utils = require('./utils');

let shortIndex = null;

const pagesPath = path.join(config.get().cache, 'cache');
const shortIndexFile = path.join(pagesPath, 'shortIndex.json');

function findPage(page, preferredPlatform, preferredLanguage) {
  // Load the index
  return getShortIndex()
    .then((idx) => {
      // First, check whether page is in the index
      if (! (page in idx)) {
        return null;
      }
      const targets = idx[page].targets;

      // Remove unwanted stuff from lang code.
      if (preferredLanguage.includes('.')) {
        preferredLanguage = preferredLanguage.substring(0, preferredLanguage.indexOf('.'));
      }
      if (preferredLanguage.includes('@')) {
        preferredLanguage = preferredLanguage.substring(0, preferredLanguage.indexOf('@'));
      }

      let ll;
      if (preferredLanguage.includes('_')) {
        ll = preferredLanguage.substring(0, preferredLanguage.indexOf('_'));
      }
      if (!hasLang(targets, preferredLanguage)) {
        preferredLanguage = ll;
      }

      // Page resolution logic:
      // 1. Look into the target platform, target lang
      // 2. If not found, look into target platform, en lang.
      // 3. If not found, look into common, target lang.
      // 4. If not found, look into common, en lang.
      // 5. If not found, look into any platform, target lang.
      // 6. If not found, look into any platform, en lang.
      let targetPlatform;
      let targetLanguage;
      if (hasPlatformLang(targets, preferredPlatform, preferredLanguage)) {
        targetLanguage = preferredLanguage;
        targetPlatform = preferredPlatform;
      } else if (hasPlatformLang(targets, preferredPlatform, 'en')) {
        targetLanguage = 'en';
        targetPlatform = preferredPlatform;
      } else if (hasPlatformLang(targets, 'common', preferredLanguage)) {
        targetLanguage = preferredLanguage;
        targetPlatform = 'common';
      } else if (hasPlatformLang(targets, 'common', 'en')) {
        targetLanguage = 'en';
        targetPlatform = 'common';
      } else if (targets.length > 0 && hasLang(targets, preferredLanguage)) {
        targetLanguage = preferredLanguage;
        targetPlatform = targets[0].platform;
        console.log(`Command ${page} does not exist for the host platform. Displaying the page from ${targetPlatform} platform`);
      } else if (targets.length > 0 && hasLang(targets, 'en')) {
        targetLanguage = 'en';
        targetPlatform = targets[0].platform;
        console.log(`Command ${page} does not exist for the host platform. Displaying the page from ${targetPlatform} platform`);
      }

      if (!targetLanguage && !targetPlatform) {
        return null;
      }

      let targetPath = 'pages';
      if (targetLanguage !== 'en') {
        targetPath += '.' + targetLanguage;
      }
      return path.join(targetPath, targetPlatform);
    });
}

function hasPlatformLang(targets, preferredPlatform, preferredLanguage) {
  return targets.some((t) => {
    return t.platform === preferredPlatform && t.language === preferredLanguage;
  });
}

function hasLang(targets, preferredLanguage) {
  return targets.some((t) => {
    return t.language === preferredLanguage;
  });
}

// hasPage is always called after the index is created,
// hence just return the variable in memory.
// There is no need to re-read the index file again.
function hasPage(page) {
  if (!shortIndex) {
    return false;
  }
  return page in shortIndex;
}

// Return all commands available in the local cache.
function commands() {
  return getShortIndex().then((idx) => {
    return Object.keys(idx).sort();
  });
}

// Return all commands for a given platform.
// P.S. - The platform 'common' is always included.
function commandsFor(platform) {
  return getShortIndex()
    .then((idx) => {
      let commands = Object.keys(idx)
        .filter((cmd) => {
          let targets = idx[cmd].targets;
          let platforms = targets.map((t) => {return t.platform;});
          return platforms.indexOf(platform) !== -1 || platforms.indexOf('common') !== -1;
        })
        .sort();
      return commands;
    });
}

// Delete the index file.
function clearPagesIndex() {
  return fs.unlink(shortIndexFile)
    .then(() => {
      return clearRuntimeIndex();
    })
    .catch((err) => {
      // If the file is not present, then it is already unlinked and our job is done.
      // So raise an error only if it is some other scenario.
      if (err.code !== 'ENOENT') {
        console.error(err);
      }
    });
}

// Set the shortIndex variable to null.
function clearRuntimeIndex() {
  shortIndex = null;
}

function rebuildPagesIndex() {
  return clearPagesIndex().then(() => {
    return getShortIndex();
  });
}

// If the variable is not set, read the file and set it.
// Else, just return the variable.
function getShortIndex() {
  if (shortIndex) {
    return Promise.resolve(shortIndex);
  }
  return readShortPagesIndex();
}

// Read the index file, and load it into memory.
// If the file does not exist, create the data structure, write the file,
// and load it into memory.
function readShortPagesIndex() {
  return fs.readJson(shortIndexFile)
    .then((idx) => {
      shortIndex = idx;
      return shortIndex;
    })
    .catch(() => {
      // File is not present; we need to create the index.
      return buildShortPagesIndex().then((idx) => {
        if (Object.keys(idx).length <= 0) {
          return idx;
        }
        shortIndex = idx;
        return fs.writeJson(shortIndexFile, shortIndex).then(() => {
          return shortIndex;
        });
      });
    });
}

function buildShortPagesIndex() {
  return utils.walk(pagesPath)
    .then((files) => {
      files = files.filter(utils.isPage);
      let reducer = (index, file) => {
        let platform = utils.parsePlatform(file);
        let page = utils.parsePagename(file);
        let language = utils.parseLanguage(file);
        if (index[page]) {
          let targets = index[page].targets;
          let needsPush = true;
          for (const target of targets) {
            if (target.platform === platform && target.language === language) {
              needsPush = false;
              continue;
            }
          }
          if (needsPush) {
            targets.push({ platform, language });
            index[page].targets = targets;
          }
        } else {
          index[page] = {targets: [{ platform, language }]};
        }

        return index;
      };
      return files.reduce(reducer, {});
    })
    .catch(() => {
      return {};
    });
}

module.exports = {
  getShortIndex,
  hasPage,
  findPage,
  commands,
  commandsFor,
  clearPagesIndex,
  clearRuntimeIndex,
  rebuildPagesIndex
};
