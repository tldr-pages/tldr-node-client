var resolver = require('./resolver');
var output   = require('./output');
var cache    = require('./cache');
var fs       = require('fs');

exports.get = function(command, options) {
  resolver.get(command, options, function(err, body) {
    if (err) {
      console.error(err);
      process.exit(1);
    } else {
      console.log(output.fromMarkdown(body, options.index));
    }
  });
};

exports.render = function(file) {
  if (fs.existsSync(file)) {
    console.log(output.fromMarkdown(fs.readFileSync(file) + ''));
  } else {
    process.exit(1);
  }
};

exports.clearCache = function() {
  cache.clear();
};

exports.updateCache = function(opts) {
  cache.update(opts);
};

exports.listCache = function() {
  resolver.list();
};

exports.getRandom = function() {
  return resolver.getRandom();
};