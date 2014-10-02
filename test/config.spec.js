var fs     = require('fs');
var path   = require('path');
var sinon  = require('sinon');
var should = require('should');
var config = require('../lib/config');

describe('Config', function() {

  var DEFAULT =
    '{' +
    '  "repository": "tldr-pages/tldr"' +
    '}';

  var CUSTOM =
    '{' +
    '  "repository": "myfork/tldr"' +
    '}';

  var CUSTOM_INVALID =
    '{' +
    '  "colors": {' +
    '    "text": "pretty" ' +
    '  }' +
    '}';

  beforeEach(function() {
    sinon.stub(fs, 'readFileSync');
    config.reset();
  });

  afterEach(function() {
    fs.readFileSync.restore();
  });

  it('should load the default config', function() {
    fs.readFileSync.onCall(0).returns(DEFAULT);
    fs.readFileSync.onCall(1).throws('Not found');
    config.get().repository.should.eql('tldr-pages/tldr');
  });

  it('should override the defaults with content from .tldrrc', function() {
    fs.readFileSync.onCall(0).returns(DEFAULT);
    fs.readFileSync.onCall(1).returns(CUSTOM);
    config.get().repository.should.eql('myfork/tldr');
  });

  it('should validate the custom config format', function() {
    fs.readFileSync.onCall(0).returns(DEFAULT);
    fs.readFileSync.onCall(1).returns(CUSTOM_INVALID);
    config.get.should.throw(/Invalid ANSI color/);
  });

});
