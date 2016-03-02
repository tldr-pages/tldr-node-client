var fs = require('fs');
var path = require('path');
var rmdir = require('rimraf');
var wrench = require('wrench');
var config = require('./config');
var remote = require('./remote');
var platform = require('./platform');
var index = require('./index');

var CACHE_FOLDER = path.join(config.get().cache, 'cache');

// It's OK to read it on startup
exports.lastUpdate = lastUpdate();

exports.getPage = function(page) {
  var preferredPlatform = platform.getPreferredPlatformFolder();
  var folder = index.findPlatform(page, preferredPlatform);
  if (folder) {
    try {
      var filePath = path.join(CACHE_FOLDER, 'pages', folder, page + '.md');
      return fs.readFileSync(filePath, { encoding: 'utf-8' });
    } catch (err) {
      return null;
    }
  }
  return null;
};

exports.clear = function(done) {
  rmdir(CACHE_FOLDER, done);
};

exports.update = function(done) {
  remote.download(function(err, tempFolder) {
    if (err) {
      return done(err);
    }
    wrench.mkdirSyncRecursive(CACHE_FOLDER);
    wrench.copyDirSyncRecursive(tempFolder, CACHE_FOLDER, {
      forceDelete: true
    });
    index.rebuildPagesIndex();
    return done();
  });
};

function lastUpdate() {
  try {
    return fs.statSync(CACHE_FOLDER).mtime;
  } catch (ex) {
    return 0;
  }
}
