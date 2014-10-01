var os      = require('os');

var folders = {
  darwin: 'osx',
  linux : 'linux',
  sunos : 'sunos'
};

exports.resolve = function(command) {
  return [
    specific(command, folders[os.platform()]),
    specific(command, 'common')
  ];
};

function specific(command, os) {
  return 'pages/' + os + '/' + command + '.md';
}
