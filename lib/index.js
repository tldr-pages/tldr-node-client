'use strict';

var fs = require('fs');
var wrench = require('wrench');
var path = require('path');
var config = require('./config');

var shortIndex = null;
var classicIndex = null;

var pagesPath = path.join(config.get().cache, 'cache/pages');
var shortIndexFile = path.join(pagesPath, 'shortIndex.json');
var classicIndexFile = path.join(pagesPath, 'index.json');

function hasPage(page) {
  return page in getShortIndex();
}

function commands() {
  return Object.keys(getShortIndex())
    .sort();
}

function commandsFor(platform) {
  var index = getClassicIndex();
  return index.commands
    .filter(commandSupportedOn(platform))
    .map(function(command) {
      return command.name;
    });
}

function clearPagesIndex() {
  try {
    fs.unlinkSync(shortIndexFile);
  }
  catch (e) {
    /*eslint-disable */
    /*eslint-enable */
  }
  try {
    fs.unlinkSync(classicIndexFile);
  } catch (e) {
    /*eslint-disable */
    /*eslint-enable */
  }
}

function rebuildPagesIndex() {
  clearPagesIndex();
  getShortIndex();
  getClassicIndex();
}

function getShortIndex() {
  if (!shortIndex) {
    shortIndex = readShortPagesIndex();
  }
  return shortIndex;
}

function getClassicIndex() {
  if (!classicIndex) {
    classicIndex = readClassicPagesIndex();
  }
  return classicIndex;
}

function readShortPagesIndex() {
  var idx = {};
  try {
    idx = JSON.parse(fs.readFileSync(shortIndexFile));
  } catch (err) {
    idx = buildShortPagesIndex();
    if (Object.keys(idx).length > 0) {
      fs.writeFileSync(shortIndexFile, JSON.stringify(idx));
    }
  }
  return idx;
}

function readClassicPagesIndex() {
  var idx = {};
  try {
    idx = JSON.parse(fs.readFileSync(classicIndexFile));
  } catch (err) {
    idx = buildClassicPagesIndex();
    if (idx.commands.length > 0) {
      fs.writeFileSync(classicIndexFile, JSON.stringify(idx));
    }
  }
  return idx;
}

function buildShortPagesIndex() {
  try {
    var files = wrench.readdirSyncRecursive(pagesPath);
    files = files.filter(isPage);
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
  } catch (e) {
    return {};
  }
}

function buildClassicPagesIndex() {
  var shortIdx = getShortIndex();
  var index = Object.keys(shortIdx)
    .sort()
    .map(function(page) {
      return {
        name: page,
        platform: shortIdx[page]
      };
    });
  return {
    commands: index
  };
}

function parsePlatform(pagefile) {
  return path.dirname(pagefile);
}

function parsePagename(pagefile) {
  return path.basename(pagefile, '.md');
}

function isPage(file) {
  return path.extname(file) === '.md';
}

function commandSupportedOn(platform) {
  return function(command) {
    return command.platform.indexOf(platform) >= 0
      || command.platform.indexOf('common') >= 0;
  };
}

module.exports = {
  getShortIndex: getShortIndex,
  getClassicIndex: getClassicIndex,
  hasPage: hasPage,
  commands: commands,
  commandsFor: commandsFor,
  clearPagesIndex: clearPagesIndex,
  rebuildPagesIndex: rebuildPagesIndex
};
