var _        = require('lodash');
var fs       = require('fs');
var ms       = require('ms');
var cache    = require('./cache');
var platform = require('./platform');
var messages = require('./messages');
var parser   = require('./parser');
var render   = require('./render');
var exit     = process.exit;


function printPages(pages, singleColumn) {
  var endOfLine = require('os').EOL;
  var delimiter = ', ';
  if (singleColumn) {
    delimiter = endOfLine;
  }
  console.log('\n' + pages.map(pageName).join(delimiter));
}

exports.list = function(singleColumn) {
  cache.list(platform.getPreferredPlatformFolder(), function(err, pages) {
    if (err) {
      console.log(err.message);
      console.error(messages.emptyCache());
      exit(1);
    }
    checkStale();
    printPages(pages, singleColumn);
  });
};

exports.listAll = function(singleColumn) {
  cache.list('', function(err, pages) {
    if (err) {
      console.log(err.message);
      console.error(messages.emptyCache());
      exit(1);
    }
    checkStale();
    printPages(pages, singleColumn);
  });
};

exports.get = function(commands) {
  if (commands.length > 1) {
    var index = require('./index');
    do {
      var hasPage = index.hasPage(commands.join('-'));
      if (hasPage) {
        printCommand(commands.join('-'));
      } else {
        commands.pop();
      }
    } while (!hasPage);

  } else {
    printCommand(commands[0]);
  }
};

function printCommand(command) {
  var pages = platform.resolve(command);
  printBestPage(pages);
}

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
