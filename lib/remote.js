var path = require('path');
var os = require('os');
var wrench = require('wrench');
var rimraf = require('rimraf');
var config  = require('./config');


exports.download = function(done) {
  var request = require('request');
  var unzip   = require('unzip2');
  var src = source();
  var url = config.get().url;
  var target = path.join(os.tmpdir(), 'tldr');
  var inside = target;
  if (src) {
    url = 'https://github.com/' + src.user + '/' + src.repo + '/archive/' + src.branch + '.zip';
    inside = path.join(target, src.repo + '-' + src.branch);
  }

  rimraf.sync(target);
  wrench.mkdirSyncRecursive(target);

  var extractor = unzip.Extract({path: target});
  extractor.on('error', function () {
    done(new Error('Cannot update from ' + url), inside);
  });
  extractor.on('close', function() {
    done(null, inside);
  });

  if (config.get().proxy) {
    request = request.defaults({
      'proxy':config.proxy
    });
  }

  var req = request.get({
    url: url,
    headers: {'User-Agent' : 'tldr-node-client'}
  });

  req.on('error', done);
  req.pipe(extractor);
};

function source() {
  var repository = config.get().repository;
  if (repository) {
    var parts  = repository.split('#');
    var github = parts[0].match(/^(.*)\/(.*)$/);
    return {
      user: github[1],
      repo: github[2],
      branch: parts[1] || 'master'
    };
  }
}
