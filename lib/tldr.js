var sample   = require('lodash.sample');
var fs       = require('fs');
var ms       = require('ms');
var cache    = require('./cache');
var platform = require('./platform');
var messages = require('./messages');
var parser   = require('./parser');
var render   = require('./render');
var index = require('./index');
var exit     = process.exit;

exports.list = function(singleColumn) {
  var os = platform.getPreferredPlatformFolder();
  printPages(index.commandsFor(os), singleColumn);
};

exports.listAll = function(singleColumn) {
  printPages(index.commands(), singleColumn);
};

exports.get = function(commands) {
  if (commands.length > 1) {
    do {
      var hasPage = index.hasPage(commands.join('-'));
      if (hasPage) {
        printCommand(commands.join('-'));
        break;
      }
      commands.pop();
    } while (!hasPage && commands.length > 0);
    if (commands.length === 0) {
      console.error(messages.notFound());
      exit(1);
    }
  } else {
    printCommand(commands[0]);
  }
};

function printCommand(command) {
  // var pages = platform.resolve(command);
  printBestPage(command);
}

exports.random = function() {
  var os = platform.getPreferredPlatformFolder();
  var pages = index.commandsFor(os);
  if (pages.length === 0) {
    console.error(messages.emptyCache());
    exit(1);
  }
  var page = sample(pages);
  console.log('PAGE', page);
  printBestPage(page);
};

exports.randomExample = function() {
  var os = platform.getPreferredPlatformFolder();
  var pages = index.commandsFor(os);
  if (pages.length === 0) {
    console.error(messages.emptyCache());
    exit(1);
  }
  var page = sample(pages);
  console.log('PAGE', page);
  printBestPage(page, {randomExample: true});
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

function printPages(pages, singleColumn) {
  if (pages.length === 0) {
    console.error(messages.emptyCache());
    exit(1);
  }
  checkStale();
  var endOfLine = require('os').EOL;
  var delimiter = singleColumn ? endOfLine : ', ';
  console.log('\n' + pages.join(delimiter));
}

function printBestPage(command, options) {
  /* eslint-disable */ // To allow not checking for err
  cache.getPage(command, (err, content) => {
  /* eslint-enable */
    if (!content) {
      console.log('Page not found. Updating cache ..');
      cache.update(function(err) {
        if (err) {
          console.error(err.stack);
          exit(1);
        }
        cache.getPage(command, (err, content2) => {
          if (err) {
            console.error(err.stack);
            exit(1);
          }
          if (!content2) {
            console.error(messages.notFound());
            exit(1);
          } else {
            checkStale();
            renderContent(content2, options);
          }
        });
      });
    } else {
      checkStale();
      renderContent(content, options);
    }
  });
}

function renderContent(content, options) {
  var page = parser.parse(content);
  if (options && options.randomExample === true) {
    page.examples = [sample(page.examples)];
  }
  var output = render.toANSI(page);
  console.log(output);
}

function checkStale() {
  cache.lastUpdated((err, stats) => {
    if (err) {
      console.error(err.stack);
      exit(1);
    }
    if (stats.mtime < Date.now() - ms('30d')) {
      console.warn('Cache is out of date, you should run "tldr --update"');
    }
  });
}
