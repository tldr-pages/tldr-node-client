'use strict';

const os = require('os');
const config = require('../lib/config');
const sinon = require('sinon');
const platformUtils = require('../lib/platformUtils');

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
      platformUtils.getPreferredPlatform(this.config).should.eql('darwin');
    });

    it('should overwrite the running platform if configured', () => {
      os.platform.onCall(0).returns('darwin');
      this.config = {
        platform: 'linux'
      };
      platformUtils.getPreferredPlatform(this.config).should.eql('linux');
    });

    it('should return current system platform if configuration is wrong', () => {
      os.platform.onCall(0).returns('darwin');
      this.config = {
        platform: 'there_is_no_such_platform'
      };
      platformUtils.getPreferredPlatform(this.config).should.eql('darwin');
    });
  });

  describe('isSupported', () => {
    it('should tell that Linux, OSX, SunOS and Win32 are supported', () => {
      platformUtils.isSupported('osx').should.eql(true);
      platformUtils.isSupported('linux').should.eql(true);
      platformUtils.isSupported('sunos').should.eql(true);
      platformUtils.isSupported('windows').should.eql(true);
      platformUtils.isSupported('ios').should.eql(false);
    });
  });
});
