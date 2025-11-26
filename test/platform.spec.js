'use strict';

const assert = require('node:assert/strict')
const { describe, it } = require('node:test');
const os = require('os');
const platforms = require('../lib/platforms');

describe('Platform', () => {

  describe('getPreferredPlatform', () => {
    it('should return the running platform with no configuration', (t) => {
      t.mock.method(os, 'platform', () => 'darwin');
      const config = {};
      assert.equal(platforms.getPreferredPlatform(config), 'darwin');
    });

    it('should overwrite the running platform if configured', (t) => {
      t.mock.method(os, 'platform', () => 'darwin');
      const config = {
        platform: 'linux'
      };
      assert.equal(platforms.getPreferredPlatform(config), 'linux');
    });

    it('should return current system platform if configuration is wrong', (t) => {
      t.mock.method(os, 'platform', () => 'darwin');
      const config = {
        platform: 'there_is_no_such_platform'
      };
      assert.equal(platforms.getPreferredPlatform(config), 'darwin');
    });
  });

  describe('isSupported', () => {
    it('should tell that Android, FreeBSD, Linux, NetBSD, OpenBSD, OSX, SunOS and Win32 are supported', () => {
      assert.equal(platforms.isSupported('android'), true);
      assert.equal(platforms.isSupported('osx'), true);
      assert.equal(platforms.isSupported('freebsd'), true);
      assert.equal(platforms.isSupported('linux'), true);
      assert.equal(platforms.isSupported('netbsd'), true);
      assert.equal(platforms.isSupported('openbsd'), true);
      assert.equal(platforms.isSupported('sunos'), true);
      assert.equal(platforms.isSupported('windows'), true);
      assert.equal(platforms.isSupported('ios'), false);
    });
  });
});
