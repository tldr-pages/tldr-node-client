'use strict';

const fs = require('fs-extra');
const path = require('path');
const config = require('./config');
const utils = require('./utils');

let shortIndex = null;

const pagesPath = path.join(config.get().cache, 'cache/pages');
const shortIndexFile = path.join(pagesPath, 'shortIndex.json');

function findPlatform(page, preferredPlatform) {
  // Load the index
  return getShortIndex()
    .then((idx) => {
      // First, check whether page is in the index
      if (! (page in idx)) {
        return null;
      }
      // Get the platforms
      let platforms = idx[page];
      if (platforms.indexOf(preferredPlatform) >= 0) {
        return preferredPlatform;
      } else if (platforms.indexOf('common') >= 0) {
        return 'common';
      }
      return null;
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
          return idx[cmd].indexOf(platform) !== -1 || idx[cmd].indexOf('common') !== -1;
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
      let idx = buildShortPagesIndex();
      if (Object.keys(idx).length <= 0) {
        return idx;
      }
      return fs.writeJson(shortIndexFile, idx).then(() => {
        shortIndex = idx;
        return shortIndex;
      });
    });
}

function buildShortPagesIndex() {
  try {
    let files = utils.walkSync(pagesPath);
    files = files.filter(utils.isPage);
    let reducer = (index, file) => {
      let os = utils.parsePlatform(file);
      let page = utils.parsePagename(file);
      if (index[page]) {
        index[page].push(os);
      } else {
        index[page] = [os];
      }
      return index;
    };
    return files.reduce(reducer, {});
  } catch (e) {
    return {};
  }
}

module.exports = {
  getShortIndex,
  hasPage,
  findPlatform,
  commands,
  commandsFor,
  clearPagesIndex,
  clearRuntimeIndex,
  rebuildPagesIndex
};
