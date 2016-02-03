var os     = require('os');
var config = require('../lib/config');
var sinon  = require('sinon');
var platform = require('../lib/platform');

describe('Platform', function() {

  describe('getPreferredPlatform', function() {
    beforeEach(function() {
      sinon.stub(os, 'platform');
      sinon.stub(config, 'get');
    });

    afterEach(function() {
      os.platform.restore();
      config.get.restore();
    });

    it('should return the running platform with no configuration', function() {
      os.platform.onCall(0).returns('darwin');
      config.get.onCall(0).returns({});
      platform.getPreferredPlatform().should.eql('darwin');
    });

    it('should overwrite the running platform if configured', function() {
      os.platform.onCall(0).returns('darwin');
      config.get.onCall(0).returns({
        platform: 'linux'
      });
      platform.getPreferredPlatform().should.eql('linux');
    });

    it('should return current system platform if configuration is wrong', function() {
      os.platform.onCall(0).returns('darwin');
      config.get.onCall(0).returns({
        platform: 'there_is_no_such_platform'
      });
      platform.getPreferredPlatform().should.eql('darwin');
    });
  });

  describe('isSupported', function() {
    it('should tell that Linux, OSX, SunOS and Win32 are supported', function() {
      platform.isSupported('osx').should.eql(true);
      platform.isSupported('linux').should.eql(true);
      platform.isSupported('sunos').should.eql(true);
      platform.isSupported('win32').should.eql(true);
      platform.isSupported('ios').should.eql(false);
    });
  });

  describe('resolve', function() {
    beforeEach(function() {
      sinon.stub(os, 'platform');
    });

    afterEach(function() {
      os.platform.restore();
    });

    it('should resolve tar command with specific OS and common folder', function() {
      os.platform.onCall(0).returns('linux');
      platform.resolve('tar').should.eql([
        'linux/tar.md',
        'common/tar.md'
      ]);
    });
  });
});
