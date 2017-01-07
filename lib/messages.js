const config = require('./config');

module.exports = {
  emptyCache() {
    return `Local cache is empty
Please run tldr --update`;
  },

  notFound() {
    return `Page not found
Try updating with "tldr --update", or submit a pull request to:
https://github.com/` + config.get().pagesRepository;
  }
};
