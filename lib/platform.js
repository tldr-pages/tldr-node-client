var os      = require('os');
var config  = require('./config');

var folders = {
  'osx': 'osx',
  'darwin': 'osx',
  'linux': 'linux',
  'sunos': 'sunos',
  'win32': 'win32'
};

function isSupported(platform) {
  return folders.hasOwnProperty(platform);
}

function getPreferredPlatform() {
  var platform = config.get().platform;
  if (isSupported(platform)) {
    return platform;
  }
  return os.platform();
}

function specific(command, os) {
  return os + '/' + command + '.md';
}

function resolve(command) {
  return [
    specific(command, getPreferredPlatformFolder()),
    specific(command, 'common')
  ];
}

function getPreferredPlatformFolder() {
  var platform = getPreferredPlatform();
  return folders[platform];
}

module.exports = {
  isSupported: isSupported,
  getPreferredPlatform: getPreferredPlatform,
  getPreferredPlatformFolder: getPreferredPlatformFolder,
  resolve: resolve
};
