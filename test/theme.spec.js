var theme = require('../lib/theme');

describe('Theme', function() {

  it('should load theme', function() {
    var t = theme._private.loadTheme();
    t.should.not.be.empty();
  });
});
