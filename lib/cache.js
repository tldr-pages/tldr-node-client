var fs        = require('fs');
var path      = require('path');
var rmdir     = require('rimraf');
var wrench    = require('wrench');
var config    = require('./config');
var remote    = require('./remote');
var platform  = require('./platform');

var CACHE_FOLDER = path.join(config.get().cache, 'cache');

// It's OK to read it on startup
exports.lastUpdate = lastUpdate();

exports.get = function(potentialPages, done) {
  tryLoad(potentialPages, 0, function(err, contents) {
    if (err) {
      done(err);
    }
    done(null, contents.toString());
  });
};

exports.list = function(os, done) {
  var files = null;
  if (os && !platform.isSupported(os)) {
    return done(new Error('Platform ' + os + ' is not supported'));
  }
  var pagesPath = path.join(CACHE_FOLDER, 'pages');
  try {
    files = wrench.readdirSyncRecursive(pagesPath);
  } catch (ex) {
    /*eslint-disable */
    /*eslint-enable */
  }
  if (!files) {
    return done(new Error('Cache unavailable'));
  }
  if (os) {
    files = files.filter(onPlatform(os));
  }
  var pages = files.filter(isPage).sort();
  return done(null, pages);
};

exports.clear = function(done) {
  rmdir(CACHE_FOLDER, done);
};

exports.update = function(done) {
  remote.download(function(err, tempFolder) {
    var index = require('./index');
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

function tryLoad(pages, index, done) {
  if (index >= pages.length) {
    done(new Error('Failed to load from cache'));
  }
  var filepath = path.join(CACHE_FOLDER, 'pages', pages[index]);
  fs.readFile(filepath, function(err, contents) {
    if (err) {
      tryLoad(pages, index + 1, done);
    } else {
      done(null, contents);
    }
  });
}

function isPage(file) {
  return path.extname(file) === '.md';
}

function onPlatform(os) {
  return function(file) {
    var dir = path.dirname(file);
    return dir === 'common' || dir === os;
  };
}

function lastUpdate() {
  try {
    return fs.statSync(CACHE_FOLDER).mtime;
  } catch (ex) {
    return 0;
  }
}
