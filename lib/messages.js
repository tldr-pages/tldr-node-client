const config = require('./config');

module.exports = {
  emptyCache() {
    return `Local cache is empty
Please run tldr --update`;
  },

  notFound() {
    return `Page not found.
If you want to contribute it, feel free to send a pull request to: ` + config.get().pagesRepository;
  }
};
