'use strict';

const path = require('path');
const fs = require('fs-extra');
const unzip = require('adm-zip');
const config = require('./config');
const axios = require('axios');

// Downloads the zip file from github and extracts it to folder
exports.download = (loc, lang) => {
  // If the lang is english then keep the url simple, otherwise add language.
  const url = config.get().repositoryBase + (lang === 'en' ? '' : '.' + lang) + '.zip';
  const folderName = path.join(loc, 'pages' + (lang === 'en' ? '' : '.' + lang));

  return axios({
    method: 'get',
    url: url,
    responseType: 'stream',
    headers: { 'User-Agent' : 'tldr-node-client' }
  }).then(function (response) {
    return new Promise((resolve, reject) => {
      let fileName = path.join(loc, 'download_' + lang + '.zip');

      const writer = fs.createWriteStream(fileName);
      response.data.pipe(writer);
    
      writer.on('finish', () => {
        const zip = new unzip(fileName);

        zip.extractAllTo(folderName, true);
        fs.unlinkSync(fileName);
        resolve();
        
      }).on('error', (err) => {
        reject(err);
      });
      
    });
  });
};