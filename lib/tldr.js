'use strict';

const sample = require('lodash/sample');
const fs = require('fs-extra');
const ms = require('ms');
const ora = require('ora');
const Cache = require('./cache');
const search = require('./search');
const platform = require('./platform');
const messages = require('./messages');
const parser = require('./parser');
const render = require('./render');
const index = require('./index');
const exit = process.exit;

class Tldr {
  constructor(config) {
    // TODO: replace this with a private field when it reaches enough maturity
    // https://github.com/tc39/proposal-class-fields#private-fields
    this.config = config;
    this.cache = new Cache(this.config);
  }

  list(singleColumn) {
    let os = platform.getPreferredPlatformFolder(this.config);
    index.commandsFor(os)
      .then((commands) => {
        this.printPages(commands, singleColumn);
      });
  }

  listAll(singleColumn) {
    index.commands()
      .then((commands) => {
        this.printPages(commands, singleColumn);
      });
  }

  get(commands, options) {
    this.printBestPage(commands.join('-'), options);
  }

  random(options) {
    let os = platform.getPreferredPlatformFolder(this.config);
    index.commandsFor(os)
      .then((pages) => {
        if (pages.length === 0) {
          console.error(messages.emptyCache());
          exit(1);
        }
        let page = sample(pages);
        console.log('PAGE', page);
        this.printBestPage(page, options);
      })
      .catch((err) => {
        console.error(err);
      });
  }

  randomExample() {
    let os = platform.getPreferredPlatformFolder(this.config);
    index.commandsFor(os)
      .then((pages) => {
        if (pages.length === 0) {
          console.error(messages.emptyCache());
          exit(1);
        }
        let page = sample(pages);
        console.log('PAGE', page);
        this.printBestPage(page, {randomExample: true});
      })
      .catch((err) => {
        console.error(err);
      });
  }

  render(file) {
    fs.readFile(file, 'utf8')
      .then((content) => {
        // Getting the shortindex first to populate the shortindex var
        return index.getShortIndex().then(() => {
          this.renderContent(content);
        });
      })
      .catch((err) => {
        console.error(err);
        exit(1);
      });
  }

  clearCache() {
    this.cache.clear().then(() => {
      console.log('Done');
    });
  }

  updateCache() {
    const spinner = ora();
    spinner.start('Updating...');
    return this.cache.update()
      .then(() => {
        spinner.succeed();
      })
      .catch((err) => {
        console.error(err);
        exit(1);
      });
  }

  updateIndex() {
    const spinner = ora();
    spinner.start('Creating index...');
    search.createIndex()
      .then(() => {
        spinner.succeed();
      })
      .catch((err) => {
        console.error(err);
      });
  }

  search(keywords) {
    search.getResults(keywords.join(' '))
      .then((results) => {
        // TODO: make search into a class also.
        search.printResults(results, this.config);
      })
      .catch((err) => {
        console.error(err);
      });
  }

  printPages(pages, singleColumn) {
    if (pages.length === 0) {
      console.error(messages.emptyCache());
      exit(1);
    }
    this.checkStale();
    let endOfLine = require('os').EOL;
    let delimiter = singleColumn ? endOfLine : ', ';
    console.log('\n' + pages.join(delimiter));
  }

  printBestPage(command, options={}) {
    const spinner = ora();

    // Trying to get the page from cache first
    this.cache.getPage(command)
      .then((content) => {
        // If found in first try, render it
        if (content) {
          this.checkStale();
          this.renderContent(content, options);
          return exit();
        }
        // If not found, try to update
        spinner.start('Page not found. Updating cache...');
        return this.cache.update();
      })
      .then(() => {
        spinner.succeed();
        spinner.start('Creating index...');
        return search.createIndex();
      })
      .then(() => {
        spinner.succeed();
        // And then, try to check in cache again
        return this.cache.getPage(command);
      })
      .then((content) => {
        if (!content) {
          console.error(messages.notFound());
          return exit(1);
        }
        this.checkStale();
        this.renderContent(content, options);
      })
      .catch((err) => {
        console.error(err);
        exit(1);
      });
  }

  checkStale() {
    this.cache.lastUpdated()
      .then((stats) => {
        if (stats.mtime < Date.now() - ms('30d')) {
          console.warn('Cache is out of date. You should run "tldr --update"');
        }
      })
      .catch((err) => {
        console.error(err);
        exit(1);
      });
  }

  renderContent(content, options={}) {
    if (options.markdown) {
      return console.log(content);
    }
    let page = parser.parse(content);
    if (options && options.randomExample === true) {
      page.examples = [sample(page.examples)];
    }
    let output = render.toANSI(page, this.config);
    if (output) {
      console.log(output);
    }
  }
}

module.exports = Tldr;
