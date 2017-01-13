var fs = require('fs-extra');
var path = require('path');

module.exports = {
  parsePlatform(pagefile) {
    return path.dirname(pagefile);
  },

  parsePagename(pagefile) {
    return path.basename(pagefile, '.md');
  },

  isPage(file) {
    return path.extname(file) === '.md';
  },

  // TODO: remove this
  commandSupportedOn(platform) {
    return (command) => {
      return command.platform.indexOf(platform) >= 0
        || command.platform.indexOf('common') >= 0;
    };
  },

  walkSync(dir, filelist) {
    var files = fs.readdirSync(dir);
    filelist = filelist || [];
    files.forEach((file) => {
      if (fs.statSync(path.join(dir, file)).isDirectory()) {
        filelist = this.walkSync(path.join(dir, file), filelist);
      }
      else {
        filelist.push(path.join(path.basename(dir), file));
      }
    });
    return filelist;
  }
};
