'use strict';

const sample = require('lodash/sample');
const fs = require('fs-extra');
const ms = require('ms');
const ora = require('ora');
const { EmptyCacheError, MissingPageError, MissingRenderPathError } = require('./errors');
const Cache = require('./cache');
const search = require('./search');
const platform = require('./platform');
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

  /**
   * Print pages for a given platform..
   * @param singleColumn {boolean} A boolean to print one command per line.
   * @returns {Promise<void>} A promise when the operation is completed.
   */
  list(singleColumn) {
    let os = platform.getPreferredPlatformFolder(this.config);
    return index.commandsFor(os)
      .then((commands) => {
        return this.printPages(commands, singleColumn);
      });
  }

  /**
   * Print all pages in the cache.
   * @param singleColumn {boolean} A boolean to print one command per line.
   * @returns {Promise<void>} A promise when the operation is completed.
   */
  listAll(singleColumn) {
    return index.commands()
      .then((commands) => {
        return this.printPages(commands, singleColumn);
      });
  }

  /**
   * Print a command page.
   * @param commands {string[]} A given command to be printed.
   * @param options {object} The options for the render.
   * @returns {Promise<void>} A promise when the operation is completed.
   */
  get(commands, options) {
    return this.printBestPage(commands.join('-'), options);
  }

  /**
   * Print a random page for the current platform.
   * @param options {object} The options for the render.
   * @returns {Promise<void>} A promise when the operation is completed.
   */
  random(options) {
    let os = platform.getPreferredPlatformFolder(this.config);
    return index.commandsFor(os)
      .then((pages) => {
        if (pages.length === 0) {
          throw new EmptyCacheError();
        }
        let page = sample(pages);
        console.log('PAGE', page);
        return this.printBestPage(page, options);
      })
      .catch((err) => {
        console.error(err);
      });
  }

  /**
   * Print a random page.
   * @returns {Promise<void>} A promise when the opration is completed.
   */
  randomExample() {
    let os = platform.getPreferredPlatformFolder(this.config);
    return index.commandsFor(os)
      .then((pages) => {
        if (pages.length === 0) {
          throw new EmptyCacheError();
        }
        let page = sample(pages);
        console.log('PAGE', page);
        return this.printBestPage(page, {randomExample: true});
      })
      .catch((err) => {
        console.error(err);
      });
  }

  /**
   * Print a markdown file.
   * @param file {string} The path to the file.
   * @returns {Promise<void>} A promise when the operation is completed.
   */
  render(file) {
    if (typeof file !== 'string') {
      throw new MissingRenderPathError();
    }
    return fs.readFile(file, 'utf8')
      .then((content) => {
        // Getting the shortindex first to populate the shortindex var
        return index.getShortIndex().then(() => {
          this.renderContent(content);
        });
      });
  }

  /**
   * Clear the cache folder.
   * @returns {Promise<void>} A promise when the cache is deleted.
   */
  clearCache() {
    return this.cache.clear().then(() => {
      console.log('Done');
    });
  }

  /**
   * Update the cache.
   * @returns {Promise<any>} A promise with the index.
   */
  updateCache() {
    return spinningPromise('Updating...', () => {
      return this.cache.update();
    });
  }

  /**
   * Update the index.
   * @returns {Promise<any>} A promise with the index.
   */
  updateIndex() {
    return spinningPromise('Creating index...', () => {
      return search.createIndex();
    });
  }

  /**
   * Search some keywords in the index and print the results.
   * @param keywords {string[]} The given keywords.
   * @returns {Promise<any>} A promise when the operation is completed.
   */
  search(keywords) {
    return search.getResults(keywords.join(' '))
      .then((results) => {
        // TODO: make search into a class also.
        search.printResults(results, this.config);
      });
  }

  /**
   * Print all pages.
   * @param pages {string[]} A list of pages to be printed.
   * @param singleColumn {boolean} A boolean to print one command per line.
   * @returns {Promise<void>} A promise when the operation is completed.
   */
  printPages(pages, singleColumn) {
    if (pages.length === 0) {
      throw new EmptyCacheError();
    }
    return this.checkStale()
      .then(() => {
        let endOfLine = require('os').EOL;
        let delimiter = singleColumn ? endOfLine : ', ';
        console.log('\n' + pages.join(delimiter));
      });
  }

  /**
   * Print a page from the cache.
   *
   * If the page is not present, the cache is updated.
   * @param command {string} The given command to be printed.
   * @param options {object} The options for the render.
   * @returns {Promise<void>} A promise when the operation is completed.
   */
  printBestPage(command, options= {}) {
    // Trying to get the page from cache first
    return this.cache.getPage(command)
      .then((content) => {
        // If found in first try, render it
        if (!content) {
          // If not found, try to update cache unless user explicitly wants to skip
          if (this.config.skipUpdateWhenPageNotFound === true) {
            return '';
          }
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
          throw new MissingPageError(this.config.pagesRepository);
        }
        return this.checkStale()
          .then(() => {
            this.renderContent(content, options);
          });
      });
  }

  /**
   * Print a warning message if the cache is 30 days old.
   * @returns {Promise<void>} A promise when the operation is completed.
   */
  checkStale() {
    return this.cache.lastUpdated()
      .then((stats) => {
        if (stats.mtime < Date.now() - ms('30d')) {
          console.warn('Cache is out of date. You should run "tldr --update"');
        }
      });
  }

  /**
   * Print the page content.
   * @param content {string} The content of a page.
   * @param options {object<{markdown: boolean, randomExample: boolean}>} The options for the render.
   */
  renderContent(content, options= {}) {
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

/**
 * Display a spinner while a task is running.
 * @param text {string} The text of the spinner.
 * @param factory {Function} A task to be run.
 * @returns {Promise} A promise with the result of the task.
 */
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
