'use strict';

const fs = require('fs-extra');
const path = require('path');
const index = require('../lib/index');
const utils = require('../lib/utils');
const sinon = require('sinon');
const should = require('should');

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
  beforeEach(() => {
    sinon.stub(fs, 'readJson').rejects('dummy error');
    sinon.stub(fs, 'writeJson').resolves('');
    return index.rebuildPagesIndex();
  });

  describe('failure', () => {
    before(() => {
      sinon.stub(utils, 'walk').rejects('dummy error');
    });

    it('shortIndex should not be created', () => {
      return index.hasPage('cp').should.be.false() &&
        index.hasPage('dummy').should.be.false();
    });
  });

  describe('success', () => {
    before(() => {
      sinon.stub(utils, 'walk').resolves(pages);
    });

    it('correct shortIndex should be created', () => {
      return index.hasPage('cp').should.be.true() &&
        index.hasPage('dummy').should.be.false();
    });
  });

  afterEach(() => {
    utils.walk.restore();
    fs.readJson.restore();
    fs.writeJson.restore();
  });
});

describe('Index', () => {
  beforeEach(() => {
    index.clearRuntimeIndex();
    sinon.stub(utils, 'walk').resolves(pages);
    sinon.stub(fs, 'readJson').rejects('dummy error');
    sinon.stub(fs, 'writeJson').resolves('');
  });

  afterEach(() => {
    utils.walk.restore();
    fs.readJson.restore();
    fs.writeJson.restore();
  });

  describe('findPage()', () => {
    it('should find Linux platform for apk command for Chinese', () => {
      return index.findPage('apk', 'linux', 'zh')
        .then((folder) => {
          should.equal(folder, path.join('pages.zh', 'linux'));
        });
    });

    it('should find platform android for pkg command for English', () => {
      return index.findPage('pkg', 'android', 'en')
        .then((folder) => {
          should.equal(folder, path.join('pages', 'android'));
        });
    });

    it('should find platform freebsd for pkg command for English', () => {
      return index.findPage('pkg', 'freebsd', 'en')
        .then((folder) => {
          should.equal(folder, path.join('pages', 'freebsd'));
        });
    });

    it('should find platform openbsd for pkg command for English', () => {
      return index.findPage('pkg', 'openbsd', 'en')
        .then((folder) => {
          should.equal(folder, path.join('pages', 'openbsd'));
        });
    });

    it('should find platform netbsd for pkgin command for English', () => {
      return index.findPage('pkgin', 'netbsd', 'en')
        .then((folder) => {
          should.equal(folder, path.join('pages', 'netbsd'));
        });
    });

    it('should find Linux platform for apk command for Chinese given Windows', () => {
      return index.findPage('apk', 'windows', 'zh')
        .then((folder) => {
          should.equal(folder, path.join('pages.zh', 'linux'));
        });
    });

    it('should find Linux platform for dd command', () => {
      return index.findPage('dd', 'linux', 'en')
        .then((folder) => {
          should.equal(folder, path.join('pages', 'linux'));
        });
    });

    it('should find platform common for cp command for English', () => {
      return index.findPage('cp', 'linux', 'en')
        .then((folder) => {
          should.equal(folder, path.join('pages', 'common'));
        });
    });

    it('should find platform common for cp command for Tamil', () => {
      return index.findPage('cp', 'linux', 'ta')
        .then((folder) => {
          should.equal(folder, path.join('pages.ta', 'common'));
        });
    });

    it('should find platform common for cp command for Italian', () => {
      return index.findPage('cp', 'linux', 'it')
        .then((folder) => {
          should.equal(folder, path.join('pages.it', 'common'));
        });
    });

    it('should find platform common for cp command for Italian given Windows', () => {
      return index.findPage('cp', 'windows', 'it')
        .then((folder) => {
          should.equal(folder, path.join('pages.it', 'common'));
        });
    });

    it('should find platform common for ls command for Italian', () => {
      return index.findPage('ls', 'linux', 'it')
        .then((folder) => {
          should.equal(folder, path.join('pages', 'common'));
        });
    });


    it('should find platform common for cp command for Italian given common platform', () => {
      return index.findPage('cp', 'common', 'it')
        .then((folder) => {
          should.equal(folder, path.join('pages.it', 'common'));
        });
    });

    it('should find platform common for cp command for English given a bad language', () => {
      return index.findPage('cp', 'linux', 'notexist')
        .then((folder) => {
          should.equal(folder, path.join('pages', 'common'));
        });
    });

    it('should find platform for svcs command on Linux', () => {
      return index.findPage('svcs', 'linux', 'en')
        .then((folder) => {
          should.equal(folder, path.join('pages', 'sunos'));
        });
    });

    it('should not find platform for non-existing command', () => {
      return index.findPage('qwerty', 'linux', 'en')
        .then((folder) => {
          should.not.exist(folder);
        });
    });
  });

  it('should return the correct list of all pages', () => {
    return index.commands()
      .then((commands) => {
        should.deepEqual(commands, [
          'apk', 'cp', 'dd', 'du', 'git', 'ln', 'ls', 'pkg', 'pkgin', 'svcs', 'top'
        ]);
      });
  });

  describe('commandsFor()', () => {
    it('should return the correct list of pages for Linux', () => {
      return index.commandsFor('linux')
        .then((commands) => {
          should.deepEqual(commands, [
            'apk', 'cp', 'dd', 'du', 'git', 'ln', 'ls', 'top'
          ]);
        });
    });

    it('should return the correct list of pages for OSX', () => {
      return index.commandsFor('osx')
        .then((commands) => {
          should.deepEqual(commands, [
            'cp', 'dd', 'du', 'git', 'ln', 'ls', 'top'
          ]);
        });
    });

    it('should return the correct list of pages for SunOS', () => {
      return index.commandsFor('sunos')
        .then((commands) => {
          should.deepEqual(commands, [
            'cp', 'dd', 'du', 'git', 'ln', 'ls', 'svcs'
          ]);
        });
    });
  });

  it('should return the correct short index on getShortIndex()', () => {
    return index.getShortIndex()
      .then((idx) => {
        should.deepEqual(idx, {
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
