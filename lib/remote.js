'use strict';

const unzip = require('node-unzip-2');

let request = require('request');

// Downloads the zip file from github and extracts it to folder
exports.download = (config, path) => {
  let url = config.repository;

  // Creating the extractor
  let extractor = unzip.Extract({ path });

  // Setting the proxy if set by config
  if (config.proxy) {
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
      resolve();
    });
  });
};
