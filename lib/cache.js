var fs        = require('fs');
var path      = require('path');
var rmdir     = require('rimraf');
var cpr       = require('cpr');
var wrench    = require('wrench');
var config    = require('./config');
var remote    = require('./remote');

var CACHE_FOLDER = path.join(config.get().cache, 'cache');

// It's OK to read it on startup
exports.lastUpdate = lastUpdate();


exports.get = function(potentialPages, done) {
  tryLoad(potentialPages, 0, function(err, contents) {
    if (err) done(err);
    done(null, contents.toString());
  });
};

exports.list = function(done) {
  var files;
  try {
    files = wrench.readdirSyncRecursive(CACHE_FOLDER);
  } catch (ex) {
    /*eslint-disable */
    /*eslint-enable */
  }
  if (!files) return done(new Error('Cache unavailable'));
  var pages = files.filter(isPage).sort();
  done(null, pages);
};

exports.clear = function(done) {
  rmdir(CACHE_FOLDER, done);
};

exports.update = function(done) {
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
  var filepath = path.join(CACHE_FOLDER, pages[index]);
  fs.readFile(filepath, function(err, contents) {
    if (err) {
      tryLoad(pages, index + 1, done);
    } else {
      done(null, contents);
    }
  });
}

function isPage(file) {
  return file.match(/pages\/.*\.md$/);
}


function lastUpdate() {
  try {
    return fs.statSync(CACHE_FOLDER).mtime;
  } catch (ex) {
    return 0;
  }
}
