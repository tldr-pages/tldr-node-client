'use strict';

const unzip = require('node-unzip-2');
const config = require('./config');
const axios = require('axios');

// Downloads the zip file from github and extracts it to folder
exports.download = (path) => {
  const url = config.get().repository;

  // Creating the extractor
  const extractor = unzip.Extract({ path });

  let req = axios({
    method: 'get',
    url: url,
    responseType: 'stream',
    headers: { 'User-Agent' : 'tldr-node-client' }
  }).then(function (response) {
    response.data.pipe(extractor);
  });

  return new Promise((resolve, reject) => {
    req.catch((err) => {
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
