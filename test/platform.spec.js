'use strict';

const os = require('os');
const config = require('../lib/config');
const sinon = require('sinon');
const platforms = require('../lib/platform');

describe('Platform', () => {

  describe('getPreferredPlatform', () => {
    beforeEach(() => {
      sinon.stub(os, 'platform');
      this.config = config.get();
    });

    afterEach(() => {
      os.platform.restore();
    });

    it('should return the running platform with no configuration', () => {
      os.platform.onCall(0).returns('darwin');
      this.config = {};
      platforms.getPreferredPlatform(this.config).should.eql('darwin');
    });

    it('should overwrite the running platform if configured', () => {
      os.platform.onCall(0).returns('darwin');
      this.config = {
        platform: 'linux'
      };
      platforms.getPreferredPlatform(this.config).should.eql('linux');
    });

    it('should return current system platform if configuration is wrong', () => {
      os.platform.onCall(0).returns('darwin');
      this.config = {
        platform: 'there_is_no_such_platform'
      };
      platforms.getPreferredPlatform(this.config).should.eql('darwin');
    });
  });

  describe('isSupported', () => {
    it('should tell that Android, Linux, OSX, SunOS and Win32 are supported', () => {
      platforms.isSupported('android').should.eql(true);
      platforms.isSupported('osx').should.eql(true);
      platforms.isSupported('linux').should.eql(true);
      platforms.isSupported('sunos').should.eql(true);
      platforms.isSupported('windows').should.eql(true);
      platforms.isSupported('ios').should.eql(false);
    });
  });
});
