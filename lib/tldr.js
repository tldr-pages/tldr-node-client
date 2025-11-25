'use strict';

const sample = require('lodash/sample');
const fs = require('fs-extra');
const ms = require('ms');
const ora = require('ora');
const { EmptyCacheError, MissingPageError, MissingRenderPathError } = require('./errors');
const Cache = require('./cache');
const search = require('./search');
const platforms = require('./platforms');
const parser = require('./parser');
const render = require('./render');
const index = require('./index');

/**
 * @typedef {object} TldrPage
 * @property {string} name
 * @property {string} description
 * @property {TldrExample[]} examples
 * @property {string[]=} seeAlso
 *
 * @typedef {object} TldrExample
 * @property {string} code
 * @property {string} description
 */

class Tldr {
  constructor(config) {
    this.config = config;
    this.cache = new Cache(this.config);
  }

  /**
   * Print pages for a given platform.
   * @returns {Promise<void>} A promise when the operation is completed.
   */
  list() {
    let platform = platforms.getPreferredPlatformFolder(this.config);
    return index.commandsFor(platform)
      .then((commands) => {
        return this.printPages(commands);
      });
  }

  /**
   * Print the name of all pages in the index.
   * @returns {Promise<void>} A promise when the operation is completed.
   */
  listAll() {
    return index.commands()
      .then((commands) => {
        return this.printPages(commands);
      });
  }

  /**
   * Print a command page.
   * @param {string[]} commands Given commands to be printed.
   * @param {object} options The options for the render.
   * @returns {Promise<void>} A promise when the operation is completed.
   */
  get(commands, options) {
    return this.printBestPage(commands.join('-'), options);
  }

  /**
   * Print a random page for the current platform.
   * @param {object} options The options for the render.
   * @returns {Promise<void>} A promise when the operation is completed.
   */
  random(options) {
    let platform = platforms.getPreferredPlatformFolder(this.config);
    return index.commandsFor(platform)
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
   * Print a random page example.
   * @returns {Promise<void>} A promise when the operation is completed.
   */
  randomExample() {
    let platform = platforms.getPreferredPlatformFolder(this.config);
    return index.commandsFor(platform)
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
   * Render a markdown file.
   *
   * @param {string} file The path to the file.
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
   * @returns {Promise<any>} The index.
   */
  updateCache() {
    return spinningPromise('Updating...', () => {
      return this.cache.update();
    });
  }

  /**
   * Update the index.
   * @returns {Promise<any>} The index.
   */
  updateIndex() {
    return spinningPromise('Creating index...', () => {
      return search.createIndex();
    });
  }

  /**
   * Search some keywords in the index and print the results.
   * @param {string[]} keywords The given keywords.
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
   * Print the name of all pages.
   * @param {string[]} pages A list of pages to be printed.
   * @returns {Promise<void>} A promise when the operation is completed.
   */
  printPages(pages) {
    if (pages.length === 0) {
      throw new EmptyCacheError();
    }
    return this.checkStale()
      .then(() => {
        let delimiter = require('os').EOL;
        console.log('\n' + pages.join(delimiter));
      });
  }

  /**
   * Print a page from the cache.
   *
   * If the page is not present, the cache is updated.
   * @param {string} command The given command to be printed.
   * @param {object} options The options for the render.
   * @returns {Promise<void>} A promise when the operation is completed.
   */
  printBestPage(command, options = {}) {
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
   * @param {string} content The content of a page.
   * @param {{markdown?: boolean, randomExample?: boolean}} options The options for the render.
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
 * @param {string} text The text of the spinner.
 * @param {Function} factory A task to be run.
 * @returns {Promise<unknown>} A promise with the result of the task.
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
