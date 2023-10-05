'use strict';

const os = require('os');
const config = require('../lib/config');
const sinon = require('sinon');
const Platform = require('../lib/platform');

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
      Platform.getPreferredPlatform(this.config).should.eql('darwin');
    });

    it('should overwrite the running platform if configured', () => {
      os.platform.onCall(0).returns('darwin');
      this.config = {
        platform: 'linux'
      };
      Platform.getPreferredPlatform(this.config).should.eql('linux');
    });

    it('should return current system platform if configuration is wrong', () => {
      os.platform.onCall(0).returns('darwin');
      this.config = {
        platform: 'there_is_no_such_platform'
      };
      Platform.getPreferredPlatform(this.config).should.eql('darwin');
    });
  });

  describe('isSupported', () => {
    it('should tell that Android, Linux, OSX, SunOS and Win32 are supported', () => {
      Platform.isSupported('android').should.eql(true);
      Platform.isSupported('osx').should.eql(true);
      Platform.isSupported('linux').should.eql(true);
      Platform.isSupported('sunos').should.eql(true);
      Platform.isSupported('windows').should.eql(true);
      Platform.isSupported('ios').should.eql(false);
    });
  });
});
