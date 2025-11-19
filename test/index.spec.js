'use strict';

const assert = require('node:assert/strict')
const { describe, it, beforeEach } = require('node:test');
const fs = require('fs-extra');
const path = require('path');
const index = require('../lib/index');
const utils = require('../lib/utils');

const pages = [
  ['/index.json'],
  ['/pages', 'linux', 'apk.md'],
  ['/pages.zh', 'linux', 'apk.md'],
  ['/pages', 'common', 'cp.md'],
  ['/pages.it', 'common', 'cp.md'],
  ['/pages.ta', 'common', 'cp.md'],
  ['/pages', 'common', 'git.md'],
  ['/pages', 'common', 'ln.md'],
  ['/pages', 'common', 'ls.md'],
  ['/pages', 'freebsd', 'pkg.md'],
  ['/pages', 'linux', 'dd.md'],
  ['/pages', 'linux', 'du.md'],
  ['/pages', 'linux', 'top.md'],
  ['/pages', 'netbsd', 'pkgin.md'],
  ['/pages', 'openbsd', 'pkg.md'],
  ['/pages', 'osx', 'dd.md'],
  ['/pages', 'osx', 'du.md'],
  ['/pages', 'osx', 'top.md'],
  ['/pages', 'sunos', 'dd.md'],
  ['/pages', 'sunos', 'du.md'],
  ['/pages', 'sunos', 'svcs.md'],
  ['/pages', 'android', 'pkg.md'],
].map((x) => {
  return path.join(...x);
});

describe('Index building', () => {
  /** @param {import('node:test').TestContext} t */
  function mockFns(t) {
    t.mock.method(fs, 'readJSON', () => Promise.reject('dummy error'));
    t.mock.method(fs, 'writeJson', () => Promise.resolve(''));
  }

  describe('failure', () => {
    it('shortIndex should not be created', async (t) => {
      mockFns(t);
      t.mock.method(utils, 'walk', () => Promise.reject('dummy error'));
      await index.rebuildPagesIndex();

      assert.equal(index.hasPage('cp'), false);
      assert.equal(index.hasPage('dummy'), false);
    });
  });

  describe('success', () => {
    it('correct shortIndex should be created', async (t) => {
      mockFns(t);
      t.mock.method(utils, 'walk', () => Promise.resolve(pages));
      await index.rebuildPagesIndex();

      assert.equal(index.hasPage('cp'), true);
      assert.equal(index.hasPage('dummy'), false);
    });
  });
});

describe('Index', () => {
  /** @param {import('node:test').TestContext} t */
  function mockFns(t) {
    t.mock.method(utils, 'walk', () => Promise.resolve(pages));
    t.mock.method(fs, 'readJSON', () => Promise.reject('dummy error'));
    t.mock.method(fs, 'writeJson', () => Promise.resolve(''));
  }

  beforeEach(() => {
    index.clearRuntimeIndex();
  });

  describe('findPage()', () => {
    it('should find Linux platform for apk command for Chinese', (t) => {
      mockFns(t);
      return index.findPage('apk', 'linux', 'zh')
        .then((folder) => {
          assert.equal(folder, path.join('pages.zh', 'linux'));
        });
    });

    it('should find platform android for pkg command for English', (t) => {
      mockFns(t);
      return index.findPage('pkg', 'android', 'en')
        .then((folder) => {
          assert.equal(folder, path.join('pages', 'android'));
        });
    });

    it('should find platform freebsd for pkg command for English', (t) => {
      mockFns(t);
      return index.findPage('pkg', 'freebsd', 'en')
        .then((folder) => {
          assert.equal(folder, path.join('pages', 'freebsd'));
        });
    });

    it('should find platform openbsd for pkg command for English', (t) => {
      mockFns(t);
      return index.findPage('pkg', 'openbsd', 'en')
        .then((folder) => {
          assert.equal(folder, path.join('pages', 'openbsd'));
        });
    });

    it('should find platform netbsd for pkgin command for English', (t) => {
      mockFns(t);
      return index.findPage('pkgin', 'netbsd', 'en')
        .then((folder) => {
          assert.equal(folder, path.join('pages', 'netbsd'));
        });
    });

    it('should find Linux platform for apk command for Chinese given Windows', (t) => {
      mockFns(t);
      return index.findPage('apk', 'windows', 'zh')
        .then((folder) => {
          assert.equal(folder, path.join('pages.zh', 'linux'));
        });
    });

    it('should find Linux platform for dd command', (t) => {
      mockFns(t);
      return index.findPage('dd', 'linux', 'en')
        .then((folder) => {
          assert.equal(folder, path.join('pages', 'linux'));
        });
    });

    it('should find platform common for cp command for English', (t) => {
      mockFns(t);
      return index.findPage('cp', 'linux', 'en')
        .then((folder) => {
          assert.equal(folder, path.join('pages', 'common'));
        });
    });

    it('should find platform common for cp command for Tamil', (t) => {
      mockFns(t);
      return index.findPage('cp', 'linux', 'ta')
        .then((folder) => {
          assert.equal(folder, path.join('pages.ta', 'common'));
        });
    });

    it('should find platform common for cp command for Italian', (t) => {
      mockFns(t);
      return index.findPage('cp', 'linux', 'it')
        .then((folder) => {
          assert.equal(folder, path.join('pages.it', 'common'));
        });
    });

    it('should find platform common for cp command for Italian given Windows', (t) => {
      mockFns(t);
      return index.findPage('cp', 'windows', 'it')
        .then((folder) => {
          assert.equal(folder, path.join('pages.it', 'common'));
        });
    });

    it('should find platform common for ls command for Italian', (t) => {
      mockFns(t);
      return index.findPage('ls', 'linux', 'it')
        .then((folder) => {
          assert.equal(folder, path.join('pages', 'common'));
        });
    });


    it('should find platform common for cp command for Italian given common platform', (t) => {
      mockFns(t);
      return index.findPage('cp', 'common', 'it')
        .then((folder) => {
          assert.equal(folder, path.join('pages.it', 'common'));
        });
    });

    it('should find platform common for cp command for English given a bad language', (t) => {
      mockFns(t);
      return index.findPage('cp', 'linux', 'notexist')
        .then((folder) => {
          assert.equal(folder, path.join('pages', 'common'));
        });
    });

    it('should find platform for svcs command on Linux', (t) => {
      mockFns(t);
      return index.findPage('svcs', 'linux', 'en')
        .then((folder) => {
          assert.equal(folder, path.join('pages', 'sunos'));
        });
    });

    it('should not find platform for non-existing command', (t) => {
      mockFns(t);
      return index.findPage('qwerty', 'linux', 'en')
        .then((folder) => {
          assert.equal(!!folder, false);
        });
    });
  });

  it('should return the correct list of all pages', (t) => {
    mockFns(t);
    return index.commands()
      .then((commands) => {
        assert.deepEqual(commands, [
          'apk', 'cp', 'dd', 'du', 'git', 'ln', 'ls', 'pkg', 'pkgin', 'svcs', 'top'
        ])
      });
  });

  describe('commandsFor()', () => {
    it('should return the correct list of pages for Linux', (t) => {
      mockFns(t);
      return index.commandsFor('linux')
        .then((commands) => {
          assert.deepEqual(commands, [
            'apk', 'cp', 'dd', 'du', 'git', 'ln', 'ls', 'top'
          ]);
        });
    });

    it('should return the correct list of pages for OSX', (t) => {
      mockFns(t);
      return index.commandsFor('osx')
        .then((commands) => {
          assert.deepEqual(commands, [
            'cp', 'dd', 'du', 'git', 'ln', 'ls', 'top'
          ]);
        });
    });

    it('should return the correct list of pages for SunOS', (t) => {
      mockFns(t);
      return index.commandsFor('sunos')
        .then((commands) => {
          assert.deepEqual(commands, [
            'cp', 'dd', 'du', 'git', 'ln', 'ls', 'svcs'
          ]);
        });
    });
  });

  it('should return the correct short index on getShortIndex()', (t) => {
    mockFns(t);
    return index.getShortIndex()
      .then((idx) => {
        assert.deepEqual(idx, {
          apk: { targets: [{ language: 'en', platform: 'linux' }, { language: 'zh', platform: 'linux' }] },
          cp: { targets: [{ language: 'en', platform: 'common' }, { language: 'it', platform: 'common' }, { language: 'ta', platform: 'common' }] },
          dd: { targets: [{ language: 'en', platform: 'linux' }, { language: 'en', platform: 'osx' }, { language: 'en', platform: 'sunos' }] },
          du: { targets: [{ language: 'en', platform: 'linux' }, { language: 'en', platform: 'osx' }, { language: 'en', platform: 'sunos' }] },
          git: { targets: [{ language: 'en', platform: 'common' }] },
          ln: { targets: [{ language: 'en', platform: 'common' }] },
          ls: { targets: [{ language: 'en', platform: 'common' }] },
          pkg: { targets: [{ language: 'en', platform: 'freebsd' }, { language: 'en', platform: 'openbsd' }, { language: 'en', platform: 'android' }] },
          pkgin: { targets: [{ language: 'en', platform: 'netbsd' }] },
          svcs: { targets: [{ language: 'en', platform: 'sunos' }] },
          top: { targets: [{ language: 'en', platform: 'linux' }, { language: 'en', platform: 'osx' }] },
        });
      });
  });
});
