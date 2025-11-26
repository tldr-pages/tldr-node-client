'use strict';

const assert = require('node:assert/strict')
const { describe, beforeEach, it } = require('node:test');
const Cache = require('../lib/cache');
const config = require('../lib/config');
const path = require('path');
const fs = require('fs-extra');
const index = require('../lib/index');
const remote = require('../lib/remote');
const platforms = require('../lib/platforms');

describe('Cache', () => {
  describe('update()', () => {
    /** @param {import('node:test').TestContext} t */
    function mockFns(t) {
      t.mock.method(fs, 'ensureDir');
      t.mock.method(fs, 'remove');
      t.mock.method(fs, 'copy', () => Promise.resolve());
      t.mock.method(remote, 'download', () => Promise.resolve());
      t.mock.method(index, 'rebuildPagesIndex', () => Promise.resolve());
    }

    beforeEach(() => {
      this.cacheFolder = path.join(config.get().cache, 'cache');
    });

    it('should use randomly created temp folder', (t) => {
      mockFns(t);

      const count = 16;
      const cache = new Cache(config.get());
      return Promise.all(Array.from({ length: count }).map(() => {
        return cache.update();
      })).then(() => {
        let calls = fs.ensureDir.mock.calls.filter((call) => {
          return call.arguments[0] !== this.cacheFolder;
        });
        assert.equal(calls.length, count);
        let tempFolders = calls.map((call) => {
          return call.arguments[0];
        });
        assert.equal(tempFolders.length, new Set(tempFolders).size);
      });
    });

    it('should remove temp folder after cache gets updated', (t) => {
      mockFns(t);

      const cache = new Cache(config.get());
      return cache.update().then(() => {
        let createFolder = fs.ensureDir.mock.calls.find((call) => {
          return call.arguments[0] !== this.cacheFolder;
        });
        let removeFolder = fs.remove.mock.calls[0];
        assert.equal(removeFolder.arguments[0], createFolder.arguments[0]);
      });
    });
  });

  describe('getPage()', () => {
    /** @param {import('node:test').TestContext} t */
    function mockFns(t) {
      t.mock.method(index, 'getShortIndex', () => ({
        cp: ['common'],
        git: ['common'],
        ln: ['common'],
        ls: ['common'],
        dd: ['linux', 'osx', 'sunos'],
        du: ['linux', 'osx', 'sunos'],
        top: ['linux', 'osx'],
        svcs: ['sunos'],
        pkg: ['android', 'freebsd', 'openbsd'],
        pkgin: ['netbsd']
      }));
    }

    it('should return page contents for ls', (t) => {
      mockFns(t);
      t.mock.method(fs, 'readFile', () => Promise.resolve('# ls\n> ls page'));
      t.mock.method(platforms, 'getPreferredPlatformFolder', () => 'osx');
      t.mock.method(index, 'findPage', () => Promise.resolve('osx'));

      const cache = new Cache(config.get());
      return cache.getPage('ls')
        .then((content) => {
          assert.equal(!!content, true);
          assert.equal(content?.startsWith('# ls'), true);
        });
    });

    it('should return empty contents for svcs on OSX', (t) => {
      mockFns(t);
      t.mock.method(fs, 'readFile', () => Promise.resolve('# svcs\n> svcs'));
      t.mock.method(platforms, 'getPreferredPlatformFolder', () => 'osx');
      t.mock.method(index, 'findPage', () => Promise.resolve(null));

      const cache = new Cache(config.get());
      return cache.getPage('svc')
        .then((content) => {
          assert.equal(!!content, false);
        });
    });

    it('should return page contents for svcs on SunOS', (t) => {
      mockFns(t);
      t.mock.method(fs, 'readFile', () => Promise.resolve('# svcs\n> svcs'));
      t.mock.method(platforms, 'getPreferredPlatformFolder', () => 'sunos');
      t.mock.method(index, 'findPage', () => Promise.resolve('svcs'));

      const cache = new Cache(config.get());
      return cache.getPage('svcs')
        .then((content) => {
          assert.equal(!!content, true);
          assert.equal(content?.startsWith('# svcs'), true);
        });
    });

    it('should return page contents for pkg on Android', (t) => {
      mockFns(t);
      t.mock.method(fs, 'readFile', () => Promise.resolve('# pkg\n> pkg'));
      t.mock.method(platforms, 'getPreferredPlatformFolder', () => 'android');
      t.mock.method(index, 'findPage', () => Promise.resolve('pkg'));

      const cache = new Cache(config.get());
      return cache.getPage('pkg')
        .then((content) => {
          assert.equal(!!content, true);
          assert.equal(content?.startsWith('# pkg'), true);
        });
    });

    it('should return empty contents for non-existing page', () => {
      const cache = new Cache(config.get());
      return cache.getPage('qwerty')
        .then((content) => {
          assert.equal(!!content, false);
        });
    });
  });
});
