'use strict';

const os = require('os');
const config = require('./config');

const folders = {
  'osx': 'osx',
  'darwin': 'osx',
  'linux': 'linux',
  'sunos': 'sunos',
  'windows': 'windows'
};

// Check if the platform is there in the list of platforms or not
function isSupported(platform) {
  return folders.hasOwnProperty(platform);
}

// If the platform given in config is present, return that.
// Else, return the system platform
function getPreferredPlatform() {
  let platform = config.get().platform;
  if (isSupported(platform)) {
    return platform;
  }
  return os.platform();
}

function specific(command, platform) {
  return platform + '/' + command + '.md';
}

function resolve(command) {
  return [
    specific(command, getPreferredPlatformFolder()),
    specific(command, 'common')
  ];
}

// Get the folder name for a platform
function getPreferredPlatformFolder() {
  let platform = getPreferredPlatform();
  return folders[platform];
}

module.exports = {
  isSupported,
  getPreferredPlatform,
  getPreferredPlatformFolder,
  resolve
};
