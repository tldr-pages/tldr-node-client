var config = require('./config');

exports.emptyCache = function() {
  return 'Local cache is empty\n' +
  'Please run tldr --update';
};

exports.notFound = function(command) {
  return 'No pages for <' + command + '>\n' +
  'Try updating with --update, or submit a pull request to \n' +
  'http://github.com/' + config.get().repository;
};
