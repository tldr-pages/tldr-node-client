'use strict';

const path = require('path');
const os = require('os');
const fs = require('fs-extra');
const config  = require('./config');

function source() {
  let repository = config.get().repository;
  if (repository) {
    let parts  = repository.split('#');
    let github = parts[0].match(/^(.*)\/(.*)$/);
    return {
      user: github[1],
      repo: github[2],
      branch: parts[1] || 'master'
    };
  }
  return null;
}

// Downloads the zip file from github and extracts it to /tmp/tldr
exports.download = (done) => {
  let request = require('request');
  let unzip   = require('unzip2');
  let src = source();
  let url = config.get().url;
  let target = path.join(os.tmpdir(), 'tldr');
  let inside = target;
  if (src) {
    url = 'https://github.com/' + src.user + '/' + src.repo + '/archive/' + src.branch + '.zip';
    inside = path.join(target, src.repo + '-' + src.branch);
  }

  // Empty the tmp dir
  fs.emptyDir(target, (err) => {
    if (err) {
      return done(err, inside);
    }

    // Creating the extractor
    let extractor = unzip.Extract({path: target});
    extractor.on('error', () => {
      done(new Error('Cannot update from ' + url), inside);
    });
    extractor.on('close', () => {
      done(null, inside);
    });

    // Setting the proxy if set by config
    if (config.get().proxy) {
      request = request.defaults({
        'proxy':config.proxy
      });
    }

    // Creating the request and passing the extractor
    let req = request.get({
      url: url,
      headers: {'User-Agent' : 'tldr-node-client'}
    });

    req.on('error', done);
    req.pipe(extractor);
  });
};
