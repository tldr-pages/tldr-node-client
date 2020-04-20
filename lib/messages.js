
module.exports = {
  emptyCache() {
    return `Local cache is empty
Please run tldr --update`;
  },

  notFound(config) {
    return `Page not found.
If you want to contribute it, feel free to send a pull request to: ` + config.pagesRepository;
  }
};
