'use strict';

const fs = require('fs-extra');
const path = require('path');
const config = require('./config');
const utils = require('./utils');

let shortIndex = null;

const pagesPath = path.join(config.get().cache, 'cache/pages');
const shortIndexFile = path.join(pagesPath, 'shortIndex.json');

function findPlatform(page, preferredPlatform, done) {
  // Load the index
  getShortIndex()
    .then((idx) => {
      // First, check whether page is in the index
      if (! (page in idx)) {
        return done(null);
      }
      // Get the platforms
      let platforms = idx[page];
      if (platforms.indexOf(preferredPlatform) >= 0) {
        return done(preferredPlatform);
      } else if (platforms.indexOf('common') >= 0) {
        return done('common');
      }
      return done(null);
    })
    .catch((err) => {
      console.error(err);
      return done(null);
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
function commands(done) {
  getShortIndex()
    .then((idx) => {
      return done(Object.keys(idx).sort());
    })
    .catch((err) => {
      console.error(err);
      return done(null);
    });
}

// Return all commands for a given platform.
// P.S. - The platform 'common' is always included.
function commandsFor(platform, done) {
  getShortIndex()
    .then((idx) => {
      let commands = Object.keys(idx)
        .filter((cmd) => {
          return idx[cmd].indexOf(platform) !== -1 || idx[cmd].indexOf('common') !== -1;
        })
        .sort();
      done(commands);
    })
    .catch((err) => {
      console.error(err);
      return done(null);
    });
}

// Delete the index file.
function clearPagesIndex() {
  return fs.unlink(shortIndexFile)
    .then(() => {
      clearRuntimeIndex();
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
  return new Promise((resolve, reject) => {
    clearPagesIndex()
      .then(() => {
        return getShortIndex();
      })
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject(err);
      });
  });
}

// If the variable is not set, read the file and set it.
// Else, just return the variable.
function getShortIndex() {
  return new Promise((resolve, reject) => {
    if (shortIndex) {
      resolve(shortIndex);
    } else {
      readShortPagesIndex()
        .then((idx) => {
          resolve(idx);
        })
        .catch((err) => {
          reject(err);
        });
    }
  });
}

// Read the index file, and load it into memory.
// If the file does not exist, create the data structure, write the file,
// and load it into memory.
function readShortPagesIndex() {
  return new Promise((resolve, reject) => {
    fs.readFile(shortIndexFile, 'utf8')
      .then((idx) => {
        // File is present, so just parse
        // and set the shortIndex variable,
        // then resolve the value.
        idx = JSON.parse(idx);
        shortIndex = idx;
        return resolve(idx);
      })
      .catch(() => {
        // File is not present; we need to create the index.
        let idx = buildShortPagesIndex();
        if (Object.keys(idx).length > 0) {
          fs.writeFile(shortIndexFile, JSON.stringify(idx))
            .then(() => {
              shortIndex = idx;
              return resolve(idx);
            })
            .catch((err) => {
              reject(err);
            });
        } else {
          return resolve(idx);
        }
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
