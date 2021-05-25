'use strict';

const unzip = require('node-unzip-2');
const config = require('./config');
const axios = require('axios');

/**
 * Download the zip file from GitHub and extract it to folder.
 * @param path {string} Path to destination folder.
 * @returns {Promise<void>} A promise when the operation is completed.
 */
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
