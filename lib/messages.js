const config = require('./config');

module.exports = {
  emptyCache() {
    return `Local cache is empty
Please run tldr --update`;
  },

  notFound() {
    return `Page not found.
Feel free to send a pull request to: ` + config.get().pagesRepository;
  }
};
