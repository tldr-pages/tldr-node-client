var request = require('request');
var http    = require('http');
var path    = require('path');
var os      = require('os');
var unzip   = require('unzip');
var mkdirp  = require('mkdirp');
var rimraf  = require('rimraf');
var fs      = require('fs');
var crypto  = require('crypto');
var config  = require('./config');

if (config.get().proxy) {
  request = request.defaults({
    'proxy':config.proxy
  });
}

exports.download = function(done) {

  var src = source();
  var url = 'https://github.com/' + src.user + '/' + src.repo + '/archive/' + src.branch + '.zip';
  var target = path.join(os.tmpdir(), 'tldr');
  var inside = path.join(target, src.repo + '-' + src.branch);

  rimraf.sync(target);
  mkdirp.sync(target);

  var extractor = unzip.Extract({path: target});
  extractor.on('error', done);
  extractor.on('finish', function() {
    done(null, inside);
  });

  var req = request.get({
    url: url,
    headers: {'User-Agent' : 'tldr-node-client'}
  });

  req.on('error', done);
  req.pipe(extractor);

}

function source() {
  var parts  = config.get().repository.split('#');
  var github = parts[0].match(/^(.*)\/(.*)$/);
  return {
    user: github[1],
    repo: github[2],
    branch: parts[1] || 'master'
  };

}
