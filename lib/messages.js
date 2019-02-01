const config = require('./config');

module.exports = {
  emptyCache() {
    return `Local cache is empty
Please run tldr --update`;
  },

  notFound(command, platform, otherPlatforms) {
    let message = `Page \`${command}\` not found on target platform (${platform}).`;
    if (Array.isArray(otherPlatforms) && otherPlatforms.length > 0) {
      message += `\n\nAvailable on: ${otherPlatforms.join(', ')}\n`;
      message += otherPlatforms.map((platform) => {
        return `To view ${platform} version run:\n  $ tldr ${command} --os=${platform}`;
      }).join('\n');
      message += '\n';
    }
    message += `\nIf you want to contribute it, feel free to send a pull request to: ${config.get().pagesRepository}`;
    return message;
  }
};
