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
  getShortIndex((idx) => {
    // First checking whether page is there or not
    if (! (page in idx)) {
      return done(null);
    }
    // Getting the platforms
    let platforms = idx[page];
    if (platforms.indexOf(preferredPlatform) >= 0) {
      return done(preferredPlatform);
    } else if (platforms.indexOf('common') >= 0) {
      return done('common');
    }
    return done(null);
  });
}

// hasPage is always called after index is created, hence just return the variable
// in memory. There is no need to re-read the index file again.
function hasPage(page) {
  if (!shortIndex) {
    return false;
  }
  return page in shortIndex;
}

// This returns all commands available in the local cache
function commands(done) {
  getShortIndex((idx) => {
    return done(Object.keys(idx).sort());
  });
}

// This returns all commands for a given platform.
// P.S. - The platform 'common' is always included.
function commandsFor(platform, done) {
  getShortIndex((idx) => {
    let commands = Object.keys(idx)
                    .filter((cmd) => {
                      /* eslint-disable */ // To allow using -1 to check if it contains in the array
                      return idx[cmd].indexOf(platform) !== -1
                        || idx[cmd].indexOf('common') !== -1 ;
                      /* eslint-enable */
                    })
                    .sort();
    done(commands);
  });
}

// Delete the index file
function clearPagesIndex(done) {
  fs.unlink(shortIndexFile, () => {
    clearRuntimeIndex();
    done();
  });
}

// Set the variable to null
function clearRuntimeIndex() {
  shortIndex = null;
}

function rebuildPagesIndex(done) {
  clearPagesIndex(() => {
    getShortIndex(()=>{
      return done();
    });
  });
}

// If the variable is not set, read the file and set it.
// Else, just return the variable
function getShortIndex(done) {
  if (!shortIndex) {
    return readShortPagesIndex(done);
  }
  return done(shortIndex);
}

// Reads the index file, and loads it into memory.
// If the file is not created, create the data structure, write the file, and load
// it into memory
function readShortPagesIndex(done) {
  fs.readFile(shortIndexFile, 'utf8', (err, idx) => {
    // file is not present, need to create the index
    if (err) {
      idx = buildShortPagesIndex();
      if (Object.keys(idx).length > 0) {
        fs.writeFile(shortIndexFile, JSON.stringify(idx), (err) => {
          if (err) {
            console.error(err);
          }
          shortIndex = idx;
          return done(idx);
        });
      }
    } else { // Just parse and set shortIndex variable, then return the value
      idx = JSON.parse(idx);
      shortIndex = idx;
      return done(idx);
    }
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
