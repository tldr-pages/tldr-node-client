'use strict';

const path = require('path');
const os = require('os');
const fs = require('fs-extra');
const unzip = require('unzip2');
const config  = require('./config');
const utils = require('./utils');

let request = require('request');

function createTempFolder(prefix = 'tldr') {
  let tmpdir = path.join(os.tmpdir(), prefix);
  let target = path.join(tmpdir, utils.uniqueId());

  return fs.mkdirp(target).then(() => {
    return {
      get path() {
        return target;
      },
      remove() {
        return fs.remove(tmpdir);
      }
    };
  });
}

// Downloads the zip file from github and extracts it to random folder inside /tmp/tldr
exports.download = () => {
  let url = config.get().repository;

  // Create temp folder
  return createTempFolder().then((tempFolder) => {
    // Creating the extractor
    let extractor = unzip.Extract({ path: tempFolder.path });

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
        resolve(tempFolder);
      });
    });
  });

};
