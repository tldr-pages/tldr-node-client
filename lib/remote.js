'use strict';

const path = require('path');
const os = require('os');
const fs = require('fs-extra');
const config  = require('./config');

// Downloads the zip file from github and extracts it to /tmp/tldr
exports.download = () => {
  let request = require('request');
  let unzip = require('unzip2');
  let url = config.get().repository;
  let target = path.join(os.tmpdir(), 'tldr');

  // Empty the tmp dir
  return fs.emptyDir(target)
    .then(() => {
      // Creating the extractor
      let extractor = unzip.Extract({ path: target });

      // Setting the proxy if set by config
      if (config.get().proxy) {
        request = request.defaults({ proxy: config.proxy });
      }

      // Creating the request and passing the extractor
      let req = request.get({
        url: url,
        headers: { 'User-Agent' : 'tldr-node-client' }
      });

      req.pipe(extractor);

      return new Promise((resolve, reject) => {
        req.on('error', (err) => {
          reject(err);
        });
        extractor.on('error', () => {
          reject(new Error('Cannot update from ' + url));
        });
        extractor.on('close', () => {
          resolve(target);
        });
      });
    });
};
