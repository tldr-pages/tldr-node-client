var _        = require('lodash');
var fs       = require('fs');
var ms       = require('ms');
var cache    = require('./cache');
var platform = require('./platform');
var messages = require('./messages');
var parser   = require('./parser');
var render   = require('./render');
var exit     = process.exit;

exports.list = function() {
  cache.list(platform.getPreferredPlatformFolder(), function(err, pages) {
    if (err) {
      console.log(err.message);
      console.error(messages.emptyCache());
      exit(1);
    }
    checkStale();
    console.log('\n' + pages.map(pageName).join(', '));
  });
};

exports.listAll = function() {
  cache.list('', function(err, pages) {
    if (err) {
      console.log(err.message);
      console.error(messages.emptyCache());
      exit(1);
    }
    checkStale();
    console.log('\n' + pages.map(pageName).join(', '));
  });
};

exports.get = function(command) {
  var pages = platform.resolve(command);
  printBestPage(pages);
};

exports.random = function() {
  cache.list(function(err, pages) {
    if (err) {
      console.error(messages.emptyCache());
      exit(1);
    }
    var page = _.sample(pages);
    printBestPage([page]);
  });
};

exports.randomExample = function() {
  cache.list(function(err, pages) {
    if (err) {
      console.error(messages.emptyCache());
      exit(1);
    }
    var page = _.sample(pages);
    printBestPage([page], {randomExample: true});
  });
};

exports.render = function(file) {
  if (fs.existsSync(file)) {
    var content = fs.readFileSync(file).toString();
    var page = parser.parse(content);
    var output = render.toANSI(page);
    console.log(output);
  } else {
    exit(1);
  }
};

exports.clearCache = function() {
  cache.clear(function() {
    console.log('Done');
  });
};

exports.updateCache = function() {
  console.log('Updating...');
  cache.update(function(err) {
    if (err) {
      console.error(err.stack);
      exit(1);
    }
    console.log('Done');
  });
};

function printBestPage(pages, options) {
  cache.get(pages, function(err, content) {
    if (err) {
      console.error(messages.notFound());
      exit(1);
    }
    checkStale();
    var page = parser.parse(content);
    if (options && options.randomExample === true) {
      page.examples = [_.sample(page.examples)];
    }
    var output = render.toANSI(page);
    console.log(output);
  });
}

function checkStale() {
  if (cache.lastUpdate < Date.now() - ms('30d')) {
    console.warn('Cache is out of date, you should run "tldr --update"');
  }
}

function pageName(file) {
  return file.match(/.*\/(.*)\.md$/)[1];
}
