'use strict';

const sample = require('lodash/sample');
const fs = require('fs');
const ms = require('ms');
const ora = require('ora');
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
  index.commandsFor(os)
    .then((commands) => {
      printPages(commands, singleColumn);
    });
};

exports.listAll = (singleColumn) => {
  index.commands()
    .then((commands) => {
      printPages(commands, singleColumn);
    });
};

exports.get = (commands, options) => {
  printBestPage(commands.join('-'), options);
};

exports.random = () => {
  let os = platform.getPreferredPlatformFolder();
  index.commandsFor(os)
    .then((pages) => {
      if (pages.length === 0) {
        console.error(messages.emptyCache());
        exit(1);
      }
      let page = sample(pages);
      console.log('PAGE', page);
      printBestPage(page);
    })
    .catch((err) => {
      console.error(err);
    });
};

exports.randomExample = () => {
  let os = platform.getPreferredPlatformFolder();
  index.commandsFor(os)
    .then((pages) => {
      if (pages.length === 0) {
        console.error(messages.emptyCache());
        exit(1);
      }
      let page = sample(pages);
      console.log('PAGE', page);
      printBestPage(page, {randomExample: true});
    })
    .catch((err) => {
      console.error(err);
    });
};

exports.render = (file) => {
  fs.readFile(file, 'utf8')
    .then((content) => {
      // Getting the shortindex first to populate the shortindex var
      return index.getShortIndex().then(() => {
        renderContent(content);
      });
    })
    .catch((err) => {
      console.error(err);
      exit(1);
    });
};

exports.clearCache = () => {
  cache.clear().then(() => {
    console.log('Done');
  });
};

exports.updateCache = () => {
  const spinner = ora();
  spinner.start('Updating');
  return cache.update()
    .then(() => {
      spinner.succeed();
    })
    .catch((err) => {
      console.error(err);
      exit(1);
    });
};

exports.updateIndex = () => {
  const spinner = ora();
  spinner.start('Creating index');
  search.createIndex()
    .then(() => {
      spinner.succeed();
    })
    .catch((err) => {
      console.error(err);
    });
};

exports.search = (keywords) => {
  search.getResults(keywords.join(' '))
    .then((results) => {
      search.printResults(results);
    })
    .catch((err) => {
      console.error(err);
    });
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

function printBestPage(command, options={}) {
  const spinner = ora();

  // Trying to get the page from cache first
  cache.getPage(command)
    .then((content) => {
      // If found in first try, render it
      if (content) {
        checkStale();
        renderContent(content, options);
        return exit();
      }
      // If not found, try to update
      spinner.start('Page not found. Updating cache');
      return cache.update();
    })
    .then(() => {
      spinner.succeed();
      spinner.start('Creating index');
      return search.createIndex();
    })
    .then(() => {
      spinner.succeed();
      // And then, try to check in cache again
      return cache.getPage(command);
    })
    .then((content) => {
      if (!content) {
        console.error(messages.notFound());
        return exit(1);
      }
      checkStale();
      renderContent(content, options);
    })
    .catch((err) => {
      console.error(err);
      exit(1);
    });
}

function renderContent(content, options={}) {
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
  cache.lastUpdated()
    .then((stats) => {
      if (stats.mtime < Date.now() - ms('30d')) {
        console.warn('Cache is out of date, you should run "tldr --update"');
      }
    })
    .catch((err) => {
      console.error(err);
      exit(1);
    });
}
