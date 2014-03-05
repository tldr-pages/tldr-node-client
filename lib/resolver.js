var request = require('./request');
var cache   = require('./cache');
var os      = require('os');
var async   = require('async');
var fs      = require('fs');
var config  = require('./config');
var path    = require('path');

var osDirectories = {
    darwin: 'osx',
    linux : 'linux',
    sunos : 'sunos'
};

function commandPath(command, platform) {
  return command + '.' + (platform || osDirectories[os.platform()]) + '.md';
}

function getForPlatform(repository, command, options, done) {
  var pathCommon = commandPath(command, "common");
  var pathPlatform = commandPath(command, options.os);

  async.parallel([
    function(callback) {
      repository.get(pathCommon, function() { callback(null, arguments); });
    },
    function(callback) {
      repository.get(pathPlatform, function() { callback(null, arguments); });
    }
  ], function(err, results){
    var errCommon = results[0][0];
    var errPlatform = results[1][0];
    var contentsCommon = results[0][1];
    var contentsPlatform = results[1][1];
    if(errCommon && errPlatform) {
      done(errCommon);
    } else {
      var body = contentsPlatform || contentsCommon;
      if (options.index === 'random') {
        options.index = Math.floor(Math.random()*(body.match(/- /g).length));
      }
      done(null, body);
    }
  });

}

exports.get = function(command, options, done) {
  options = options || {};
  var resolver = this;
  resolver.getLocal(command, options, done);
};

exports.getLocal = function(command, options, done) {
  getForPlatform(cache, command, options, done);
};

exports.getRemote = function(command, options, done) {
  getForPlatform(request, command, options, done);
};

exports.list = function() {
  var fileList = getFileList();
  fileList.forEach(function(file) {
    console.log(file);
  });
};

exports.getRandom = function() {
  var fileList = getFileList(),
      rFile = fileList[Math.floor(Math.random()*fileList.length)];
  return {
    file : rFile.replace(/\..*\.md$/, ""),
    os : rFile.replace(/.*\.(.*)\.md/,"$1")
  };
};

function applicableDir(dir) {
  return dir === 'common' || dir === osDirectories[os.platform()];
};

function getFileList() {
  var retval = [];
  var files = fs.readdirSync(config.local.cacheFolder);
  files.forEach(function(file) {
    if (path.extname(file) === '.md') {
      retval.push(file);
    }
  });
  return retval;
};
