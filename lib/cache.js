var fs        = require('fs');
var path      = require('path');
var config    = require('./config');

var CACHE_FOLDER = path.join(config.get().cache, 'cache');

// It's OK to read it on startup
exports.lastUpdate = lastUpdate();

exports.get = function(potentialPages, done) {
  tryLoad(potentialPages, 0, function(err, contents) {
    if (err) done(err);
    done(null, contents.toString());
  });
};

exports.list = function(os, done) {
  var wrench = require('wrench');
  var platform = require('./platform');
  var files;
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
  done(null, pages);
};

exports.clear = function(done) {
  var rmdir = require('rimraf');
  rmdir(CACHE_FOLDER, done);
};

exports.update = function(done) {
  var cpr = require('cpr');
  var remote = require('./remote');
  remote.download(function(err, tempFolder) {
    if (err) return done(err);
    cpr(tempFolder, CACHE_FOLDER, {
      deleteFirst: true,
      overwrite: true,
      confirm: false
    }, done);
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
  return path.extname(file) == '.md';
}

function onPlatform(os) {
  var _ = require('lodash');
  return function(file) {
    return _.startsWith(file, 'common') || _.startsWith(file, os);
  };
}

function lastUpdate() {
  try {
    return fs.statSync(CACHE_FOLDER).mtime;
  } catch (ex) {
    return 0;
  }
}
