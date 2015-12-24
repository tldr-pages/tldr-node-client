var os      = require('os');
var config  = require('./config');

var folders = {
  'osx': 'osx',
  'darwin': 'osx',
  'linux': 'linux',
  'sunos': 'sunos'
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
  return 'pages/' + os + '/' + command + '.md';
}

function resolve(command) {
  var platform = getPreferredPlatform();
  return [
    specific(command, folders[platform]),
    specific(command, 'common')
  ];
}

module.exports = {
  isSupported: isSupported,
  getPreferredPlatform: getPreferredPlatform,
  resolve: resolve
};
