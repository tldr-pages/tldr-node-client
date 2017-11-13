'use strict';

const sample = require('lodash.sample');
const fs = require('fs');
const ms = require('ms');
const cache = require('./cache');
const search = require('./search');
const platform = require('./platform');
const messages = require('./messages');
const parser = require('./parser');
const render = require('./render');
const index = require('./index');
const exit = process.exit;

exports.list = (singleColumn) => {
  let os = platform.getPreferredPlatformFolder();
  index.commandsFor(os, (commands) => {
    printPages(commands, singleColumn);
  });
};

exports.listAll = (singleColumn) => {
  index.commands((commands) => {
    printPages(commands, singleColumn);
  });
};

exports.get = (commands, options) => {
  printBestPage(commands.join('-'), options);
};

exports.random = () => {
  let os = platform.getPreferredPlatformFolder();
  index.commandsFor(os, (pages) => {
    if (pages.length === 0) {
      console.error(messages.emptyCache());
      exit(1);
    }
    let page = sample(pages);
    console.log('PAGE', page);
    printBestPage(page);
  });
};

exports.randomExample = () => {
  let os = platform.getPreferredPlatformFolder();
  index.commandsFor(os, (pages) => {
    if (pages.length === 0) {
      console.error(messages.emptyCache());
      exit(1);
    }
    let page = sample(pages);
    console.log('PAGE', page);
    printBestPage(page, {randomExample: true});
  });
};

exports.render = (file) => {
  // Reading the file
  fs.readFile(file, 'utf8', (err, content) => {
    if (err) {
      console.error(err);
      exit(1);
    }
    // Getting the shortindex first to populate the shortindex var
    index.getShortIndex(() => {
      renderContent(content, {});
    });
  });
};

exports.clearCache = () => {
  cache.clear(() => {
    console.log('Done');
  });
};

exports.updateCache = () => {
  console.log('Updating...');
  return new Promise(function(resolve, reject) {
    cache.update(err => {
      if (err) {
        console.error(err);
        exit(1);
        reject(err);
      } else {
        console.log('Done');
        resolve();
      }
    });
  });
};

exports.updateIndex = () => {
  console.log('Creating index...');
  search.createIndex();
};

exports.search = (keywords) => {
  search.getResults(keywords.join(' '));
};

function printPages(pages, singleColumn) {
  if (pages.length === 0) {
    console.error(messages.emptyCache());
    exit(1);
  }
  checkStale();
  let endOfLine = require('os').EOL;
  let delimiter = singleColumn ? endOfLine : ', ';
  console.log('\n' + pages.join(delimiter));
}

function printBestPage(command, options) {
  // TODO: replace with default parameter if Node v4 support dropped.
  options = options || {};
  /* eslint-disable */ // To allow not checking for err
  // Trying to get the page from cache first
  cache.getPage(command, (err, content) => {
  /* eslint-enable */
    if (!content) {
      // If not found, try to update
      console.log('Page not found. Updating cache ..');
      cache.update((err) => {
        if (err) {
          console.error(err);
          exit(1);
        }
        // And then, try to check in cache again
        cache.getPage(command, (err, content2) => {
          if (err) {
            console.error(err);
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
    } else { // If found in first try, render it
      checkStale();
      renderContent(content, options);
    }
  });
}

function renderContent(content, options) {
  if (options.markdown) {
    return console.log(content);
  }
  let page = parser.parse(content);
  if (options && options.randomExample === true) {
    page.examples = [sample(page.examples)];
  }
  let output = render.toANSI(page);
  console.log(output);
}

function checkStale() {
  cache.lastUpdated((err, stats) => {
    if (err) {
      console.error(err);
      exit(1);
    }
    if (stats.mtime < Date.now() - ms('30d')) {
      console.warn('Cache is out of date, you should run "tldr --update"');
    }
  });
}
