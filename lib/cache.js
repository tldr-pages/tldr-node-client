var fs = require('fs-extra');
var path = require('path');
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
  fs.remove(CACHE_FOLDER, done);
};

exports.update = function(done) {
  remote.download(function(err, tempFolder) {
    if (err) {
      return done(err);
    }
    fs.mkdirsSync(CACHE_FOLDER);
    fs.copySync(tempFolder, CACHE_FOLDER, {
      clobber: true
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
