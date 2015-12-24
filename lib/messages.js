var config = require('./config');

exports.emptyCache = function() {
  return 'Local cache is empty\n' +
  'Please run tldr --update';
};

exports.notFound = function() {
  return 'Page not found\n' +
  'Try updating with "tldr --update", or submit a pull request to:\n' +
  'https://github.com/' + config.get().pagesRepository;
};
