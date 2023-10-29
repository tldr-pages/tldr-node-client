'use strict';

const os = require('os');

const folders = {
  'android': 'android',
  'darwin': 'osx',
  'freebsd': 'freebsd',
  'linux': 'linux',
  'macos': 'osx',
  'netbsd': 'netbsd',
  'openbsd': 'openbsd',
  'osx': 'osx',
  'sunos': 'sunos',
  'win32': 'windows',
  'windows': 'windows'
};

const supportedPlatforms = Object.keys(folders);

// Check if the platform is there in the list of platforms or not
function isSupported(platform) {
  return supportedPlatforms.includes(platform);
}

// If the platform given in config is present, return that.
// Else, return the system platform
function getPreferredPlatform(config) {
  let platform = config.platform;
  if (isSupported(platform)) {
    return platform;
  }
  return os.platform();
}

// Get the folder name for a platform
function getPreferredPlatformFolder(config) {
  let platform = getPreferredPlatform(config);
  return folders[platform];
}

module.exports = {
  isSupported,
  getPreferredPlatform,
  getPreferredPlatformFolder,
  supportedPlatforms
};
