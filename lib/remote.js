'use strict';

const path = require('path');
const fs = require('fs-extra');
const unzip = require('adm-zip');
const config = require('./config');
const fetch = require('node-fetch');
const { HttpsProxyAgent }  = require('https-proxy-agent');
const { getProxyForUrl } = require('proxy-from-env');

// Downloads the zip file from github and extracts it to folder
exports.download = (loc, lang) => {
  // If the lang is english then keep the url simple, otherwise add language.
  const suffix = (lang === 'en' ? '' : '.' + lang);
  const url = config.get().repositoryBase + suffix + '.zip';
  const folderName = path.join(loc, 'pages' + suffix);

  const headers = { 'User-Agent' : 'tldr-node-client' };
  const fetchOptions = { headers };

  const proxy = getProxyForUrl(url);
  if (proxy) {
    fetchOptions.agent = new HttpsProxyAgent(proxy, { headers });
  }

  return fetch(url, fetchOptions).then((response) => {
    return new Promise((resolve, reject) => {
      if (!response.ok) {
        reject(new Error(
          `Fetch \`${url}\` failed, status = ${response.status}`
        ));
        return;
      }

      const fileName = path.join(loc, 'download_' + lang + '.zip');

      const writer = fs.createWriteStream(fileName);
      response.body.pipe(writer);

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
