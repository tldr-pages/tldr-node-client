'use strict';

var fs = require('fs');
var wrench = require('wrench');
var path = require('path');
var config = require('./config');


var cachePath = path.join(config.get().cache, 'cache/pages');
var shortIndexFile = path.join(cachePath, 'shortIndex.json');

var idx;

function parsePlatform(pagefile) {
  var pathParts = pagefile.split(/\//);
  return pathParts[pathParts.length - 2];
}

function parsePagename(pagefile) {
  var pathParts = pagefile.split(/\//);
  return pathParts[pathParts.length - 1].replace(/\.md$/, '');
}

function buildShortPagesIndex(files) {
  var reducer = function(index, file) {
    var os = parsePlatform(file);
    var page = parsePagename(file);
    if (index[page]) {
      index[page].push(os);
    } else {
      index[page] = [os];
    }
    return index;
  };

  return files.reduce(reducer, {});
}

function rebuildShortPagesIndex() {
  var files = wrench.readdirSyncRecursive(cachePath);
  files = files.filter(isPage);
  var shortIndex = buildShortPagesIndex(files);
  fs.writeFileSync(shortIndexFile, JSON.stringify(shortIndex));
  return shortIndex;
}

function getShortIndex() {
  var shortIndex = {};
  try {
    shortIndex = JSON.parse(fs.readFileSync(shortIndexFile));
  } catch (err) {
    shortIndex = rebuildShortPagesIndex();
  }
  return shortIndex;
}

function getClassicIndex() {
  var shortIndex = getShortIndex();
  var index = Object.keys(shortIndex)
    .sort()
    .map(function(page) {
      return {
        name: page,
        platform: shortIndex[page]
      };
    });
  return {
    commands: index
  };
}

function hasPage(page) {
  if (!idx) {
    idx = getShortIndex();
  }
  return page in idx;
}

function isPage(file) {
  return file.match(/.*\.md$/);
}

module.exports = {
  getShortIndex: getShortIndex,
  getClassicIndex: getClassicIndex,
  rebuildShortPagesIndex: rebuildShortPagesIndex,
  hasPage: hasPage
};
