'use strict';

const fs = require('fs-extra');
const path = require('path');
const config = require('./config');
const remote = require('./remote');
const platform = require('./platform');
const index = require('./index');

const CACHE_FOLDER = path.join(config.get().cache, 'cache');

exports.lastUpdated = function(done) {
  fs.stat(CACHE_FOLDER, done);
};

exports.getPage = function(page, done) {
  let preferredPlatform = platform.getPreferredPlatformFolder();
  let folder = index.findPlatform(page, preferredPlatform);
  if (folder) {
    let filePath = path.join(CACHE_FOLDER, 'pages', folder, page + '.md');
    fs.readFile(filePath, 'utf8', done);
  } else {
    done(null, null);
  }
};

exports.clear = function(done) {
  fs.remove(CACHE_FOLDER, done);
};

exports.update = function(done) {
  // Downloading fresh copy
  remote.download((err, tempFolder) => {
    if (err) {
      return done(err);
    }
    // Creating cache folder
    fs.mkdirs(CACHE_FOLDER, (err) => {
      if (err) {
        return done(err);
      }
      // Copying from tmp to cache folder
      fs.copy(tempFolder, CACHE_FOLDER, {clobber: true}, (err) => {
        if (err) {
          return done(err);
        }
        index.rebuildPagesIndex();
        return done();
      });
    });
  });
};
