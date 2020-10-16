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


class Tldr {
  constructor(config) {
    // TODO: replace this with a private field when it reaches enough maturity
    // https://github.com/tc39/proposal-class-fields#private-fields
    this.config = config;
    this.cache = new Cache(this.config);
  }

  list(singleColumn) {
    let os = platform.getPreferredPlatformFolder(this.config);
    return index.commandsFor(os)
      .then((commands) => {
        return this.printPages(commands, singleColumn);
      });
  }

  listAll(singleColumn) {
    return index.commands()
      .then((commands) => {
        return this.printPages(commands, singleColumn);
      });
  }

  get(commands, options) {
    return this.printBestPage(commands.join('-'), options);
  }

  random(options) {
    let os = platform.getPreferredPlatformFolder(this.config);
    return index.commandsFor(os)
      .then((pages) => {
        if (pages.length === 0) {
          throw new Error(messages.emptyCache());
        }
        let page = sample(pages);
        console.log('PAGE', page);
        return this.printBestPage(page, options);
      })
      .catch((err) => {
        console.error(err);
      });
  }

  randomExample() {
    let os = platform.getPreferredPlatformFolder(this.config);
    return index.commandsFor(os)
      .then((pages) => {
        if (pages.length === 0) {
          throw new Error(messages.emptyCache());
        }
        let page = sample(pages);
        console.log('PAGE', page);
        return this.printBestPage(page, {randomExample: true});
      })
      .catch((err) => {
        console.error(err);
      });
  }

  render(file) {
    return fs.readFile(file, 'utf8')
      .then((content) => {
        // Getting the shortindex first to populate the shortindex var
        return index.getShortIndex().then(() => {
          this.renderContent(content);
        });
      });
  }

  clearCache() {
    return this.cache.clear().then(() => {
      console.log('Done');
    });
  }

  updateCache() {
    return spinningPromise('Updating...', () => {
      return this.cache.update();
    });
  }

  updateIndex() {
    return spinningPromise('Creating index...', () => {
      return search.createIndex();
    });
  }

  search(keywords) {
    return search.getResults(keywords.join(' '))
      .then((results) => {
        // TODO: make search into a class also.
        search.printResults(results, this.config);
      });
  }

  printPages(pages, singleColumn) {
    if (pages.length === 0) {
      throw new Error(messages.emptyCache());
    }
    return this.checkStale()
      .then(() => {
        let endOfLine = require('os').EOL;
        let delimiter = singleColumn ? endOfLine : ', ';
        console.log('\n' + pages.join(delimiter));
      });
  }

  printBestPage(command, options={}) {
    // Trying to get the page from cache first
    return this.cache.getPage(command)
      .then((content) => {
        // If found in first try, render it
        if (!content) {
          // If not found, try to update
          return spinningPromise('Page not found. Updating cache...', () => {
            return this.cache.update();
          })
            .then(() => {
              return spinningPromise('Creating index...', () => {
                return search.createIndex();
              });
            })
            .then(() => {
              // And then, try to check in cache again
              return this.cache.getPage(command);
            });
        }
        return content;
      })
      .then((content) => {
        if (!content) {
          throw new Error(messages.notFound());
        }
        return this.checkStale()
          .then(() => {
            this.renderContent(content, options);
          });
      });
  }

  checkStale() {
    return this.cache.lastUpdated()
      .then((stats) => {
        if (stats.mtime < Date.now() - ms('30d')) {
          console.warn('Cache is out of date. You should run "tldr --update"');
        }
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

function spinningPromise(text, factory) {
  const spinner = ora();
  spinner.start(text);
  return factory()
    .then((val) => {
      spinner.succeed();
      return val;
    })
    .catch((err) => {
      spinner.fail();
      throw err;
    });
}

module.exports = Tldr;
