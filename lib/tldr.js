var _        = require('lodash');
var fs       = require('fs');
var ms       = require('ms');
var cache    = require('./cache');
var platform = require('./platform');
var messages = require('./messages');
var render   = require('./render');
var exit     = process.exit;

exports.list = function() {
  if (cache.lastUpdate) {
    console.log('Cache last updated', cache.lastUpdate);
  }
  cache.list(function(err, pages) {
    if (err) {
      console.error(messages.emptyCache());
      exit(1);
    }
    checkStale();
    console.log('\n' + pages.map(pageName).join(', '));
  });
};

exports.get = function(command, options) {
  var pages = platform.resolve(command);
  printBestPage(pages, options);
};

exports.random = function() {
  cache.list(function(err, pages) {
    if (err) {
      console.error(messages.emptyCache());
      exit(1);
    }
    var page = _.sample(pages);
    console.log(pageName(page));
    printBestPage([page], {});
  });
};

exports.randomExample = function() {
  cache.list(function(err, pages) {
    if (err) {
      console.error(messages.emptyCache());
      exit(1);
    }
    var page = _.sample(pages);
    console.log(pageName(page));
    printBestPage([page], {index: 'random'});
  });
};

exports.render = function(file) {
  if (fs.existsSync(file)) {
    console.log(output.fromMarkdown(fs.readFileSync(file) + ''));
  } else {
    exit(1);
  }
};

exports.clearCache = function() {
  cache.clear(function() {
    console.log('Done');
  });
};

exports.updateCache = function(opts) {
  console.log('Updating...')
  cache.update(function(err) {
    if (err) {
      console.error(err.stack);
      exit(1);
    }
    console.log('Done');
  });
};



function printBestPage(pages, options) {
  cache.get(pages, function(err, body) {
    if (err) {
      console.error(messages.notFound());
      exit(1);
    }
    checkStale();
    if (options.index === 'random') {
      options.index = _.random(body.match(/- /g).length - 1);
    }
    var output = render.fromMarkdown(body, options.index);
    console.log(output);
  });
}

function checkStale() {
  if (cache.lastUpdate < Date.now() - ms('30d')) {
    console.warn('Cache is out of date, you should run --update');
  }
}

function pageName(file) {
  return file.match(/pages\/.*\/(.*)\.md$/)[1];
}
