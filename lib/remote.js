'use strict';

const path = require('path');
const fs = require('fs-extra');
const unzip = require('adm-zip');
const config = require('./config');
const axios = require('axios');

/**
 * Download the zip file from GitHub and extract it to folder.
 * @param {string} loc Path to a directory on disk.
 * @param {string} lang Language/locale code.
 * @returns {Promise<void>} A promise when the operation is completed.
 */
exports.download = (loc, lang) => {
  // If the lang is english then keep the url simple, otherwise add language.
  const suffix = (lang === 'en' ? '' : '.' + lang);
  const url = config.get().repositoryBase + suffix + '.zip';
  const folderName = path.join(loc, 'pages' + suffix);
  const REQUEST_TIMEOUT = 10000;

  return axios({
    method: 'get',
    url: url,
    responseType: 'stream',
    headers: { 'User-Agent' : 'tldr-node-client' },
    timeout: REQUEST_TIMEOUT,
  }).then((response) => {
    return new Promise((/** @type {(v?: never) => void} */ resolve, reject) => {
      let fileName = path.join(loc, 'download_' + lang + '.zip');

      const writer = fs.createWriteStream(fileName);
      response.data.pipe(writer);

      writer.on('finish', () => {
        writer.end();
        const zip = new unzip(fileName);

        zip.extractAllTo(folderName, true);
        fs.unlinkSync(fileName);
        resolve();
      }).on('error', (err) => {
        reject(err);
      });
    });
  }).catch((err) => {
    return Promise.reject(err);
  });
};
