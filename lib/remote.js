'use strict';

const path = require('path');
const os = require('os');
const fs = require('fs-extra');
const config  = require('./config');

// Downloads the zip file from github and extracts it to /tmp/tldr
exports.download = (done) => {
  let request = require('request');
  let unzip   = require('unzip2');
  let url = config.get().repository;
  let target = path.join(os.tmpdir(), 'tldr');

  // Empty the tmp dir
  fs.emptyDir(target, (err) => {
    if (err) {
      return done(err, null);
    }

    // Creating the extractor
    let extractor = unzip.Extract({path: target});
    extractor.on('error', () => {
      done(new Error('Cannot update from ' + url), null);
    });
    extractor.on('close', () => {
      done(null, target);
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
