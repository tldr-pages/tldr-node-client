'use strict';

const os = require('os');
const config = require('../lib/config');
const sinon = require('sinon');
const platform = require('../lib/platform');

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
      platform.getPreferredPlatform(this.config).should.eql('darwin');
    });

    it('should overwrite the running platform if configured', () => {
      os.platform.onCall(0).returns('darwin');
      this.config = {
        platform: 'linux'
      };
      platform.getPreferredPlatform(this.config).should.eql('linux');
    });

    it('should return current system platform if configuration is wrong', () => {
      os.platform.onCall(0).returns('darwin');
      this.config = {
        platform: 'there_is_no_such_platform'
      };
      platform.getPreferredPlatform(this.config).should.eql('darwin');
    });
  });

  describe('isSupported', () => {
    it('should tell that Linux, OSX, SunOS and Win32 are supported', () => {
      platform.isSupported('osx').should.eql(true);
      platform.isSupported('linux').should.eql(true);
      platform.isSupported('sunos').should.eql(true);
      platform.isSupported('windows').should.eql(true);
      platform.isSupported('ios').should.eql(false);
    });
  });
});
