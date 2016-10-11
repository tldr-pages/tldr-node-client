var fs = require('fs-extra');
var path = require('path');

var walkSync = function(dir, filelist) {
  var files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(path.join(dir, file)).isDirectory()) {
      filelist = walkSync(path.join(dir, file), filelist);
    }
    else {
      filelist.push(path.join(path.basename(dir), file));
    }
  });
  return filelist;
};

module.exports = {
  walkSync: walkSync
};