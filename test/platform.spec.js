'use strict';

const os = require('os');
const config = require('../lib/config');
const sinon = require('sinon');
const platforms = require('../lib/platforms');

describe('Platform', () => {

  describe('getPreferredPlatform', () => {
    beforeEach(() => {
      sinon.stub(os, 'platform');
    });

    afterEach(() => {
      /** @type {sinon.SinonStub} */ (os.platform).restore();
    });

    it('should return the running platform with no configuration', () => {
      /** @type {sinon.SinonStub} */ (os.platform).onCall(0).returns('darwin');
      const config = {};
      platforms.getPreferredPlatform(config).should.eql('darwin');
    });

    it('should overwrite the running platform if configured', () => {
      /** @type {sinon.SinonStub} */ (os.platform).onCall(0).returns('darwin');
      const config = {
        platform: 'linux'
      };
      platforms.getPreferredPlatform(config).should.eql('linux');
    });

    it('should return current system platform if configuration is wrong', () => {
      /** @type {sinon.SinonStub} */ (os.platform).onCall(0).returns('darwin');
      const config = {
        platform: 'there_is_no_such_platform'
      };
      platforms.getPreferredPlatform(config).should.eql('darwin');
    });
  });

  describe('isSupported', () => {
    it('should tell that Android, FreeBSD, Linux, NetBSD, OpenBSD, OSX, SunOS and Win32 are supported', () => {
      platforms.isSupported('android').should.eql(true);
      platforms.isSupported('osx').should.eql(true);
      platforms.isSupported('freebsd').should.eql(true);
      platforms.isSupported('linux').should.eql(true);
      platforms.isSupported('netbsd').should.eql(true);
      platforms.isSupported('openbsd').should.eql(true);
      platforms.isSupported('sunos').should.eql(true);
      platforms.isSupported('windows').should.eql(true);
      platforms.isSupported('ios').should.eql(false);
    });
  });
});
