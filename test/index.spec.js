'use strict';

const fs = require('fs-extra');
const index = require('../lib/index');
const utils = require('../lib/utils');
const sinon = require('sinon');
const should = require('should');

const pages = [
  '/index.json',
  '/pages/linux/apk.md',
  '/pages.zh/linux/apk.md',
  '/pages/common/cp.md',
  '/pages.it/common/cp.md',
  '/pages.ta/common/cp.md',
  '/pages/common/git.md',
  '/pages/common/ln.md',
  '/pages/common/ls.md',
  '/pages/linux/dd.md',
  '/pages/linux/du.md',
  '/pages/linux/top.md',
  '/pages/osx/dd.md',
  '/pages/osx/du.md',
  '/pages/osx/top.md',
  '/pages/sunos/dd.md',
  '/pages/sunos/du.md',
  '/pages/sunos/svcs.md'
];

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
          return folder.should.equal('pages.zh/linux');
        });
    });

    it('should find Linux platform for dd command', () => {
      return index.findPage('dd', 'linux', 'en')
        .then((folder) => {
          return folder.should.equal('pages/linux');
        });
    });

    it('should find platform common for cp command for English', () => {
      return index.findPage('cp', 'linux', 'en')
        .then((folder) => {
          return folder.should.equal('pages/common');
        });
    });

    it('should find platform common for cp command for Tamil', () => {
      return index.findPage('cp', 'linux', 'ta')
        .then((folder) => {
          return folder.should.equal('pages.ta/common');
        });
    });

    it('should find platform common for cp command for Italian', () => {
      return index.findPage('cp', 'linux', 'it')
        .then((folder) => {
          return folder.should.equal('pages.it/common');
        });
    });


    it('should find platform common for cp command for Italian given common platform', () => {
      return index.findPage('cp', 'common', 'it')
        .then((folder) => {
          return folder.should.equal('pages.it/common');
        });
    });


    it('should find platform common for cp command for English given a bad language', () => {
      return index.findPage('cp', 'linux', 'notexist')
        .then((folder) => {
          return folder.should.equal('pages/common');
        });
    });

    it('should not find platform for svcs command on Linux', () => {
      return index.findPage('svcs', 'linux', 'en')
        .then((folder) => {
          return should.not.exist(folder);
        });
    });

    it('should not find platform for non-existing command', () => {
      return index.findPage('qwerty', 'linux', 'en')
        .then((folder) => {
          return should.not.exist(folder);
        });
    });
  });

  it('should return correct list of all pages', () => {
    return index.commands()
      .then((commands) => {
        commands.should.deepEqual([
          'apk', 'cp', 'dd', 'du', 'git', 'ln', 'ls', 'svcs', 'top'
        ]);
      });
  });

  describe('commandsFor()', () => {
    it('should return correct list of pages for Linux', () => {
      return index.commandsFor('linux')
        .then((commands) => {
          commands.should.deepEqual([
            'apk', 'cp', 'dd', 'du', 'git', 'ln', 'ls', 'top'
          ]);
        });
    });

    it('should return correct list of pages for OSX', () => {
      return index.commandsFor('osx')
        .then((commands) => {
          commands.should.deepEqual([
            'cp', 'dd', 'du', 'git', 'ln', 'ls', 'top'
          ]);
        });
    });

    it('should return correct list of pages for SunOS', () => {
      return index.commandsFor('sunos')
        .then((commands) => {
          commands.should.deepEqual([
            'cp', 'dd', 'du', 'git', 'ln', 'ls', 'svcs'
          ]);
        });
    });
  });

  it('should return correct short index on getShortIndex()', () => {
    return index.getShortIndex()
      .then((idx) => {
        idx.should.deepEqual({
          apk: {languages: ['en', 'zh'], platforms: ['linux']},
          cp: {languages: ['en', 'it', 'ta'], platforms: ['common']},
          git: {languages: ['en'], platforms: ['common']},
          ln: {languages: ['en'], platforms: ['common']},
          ls: {languages: ['en'], platforms: ['common']},
          dd: {languages: ['en'], platforms: ['linux', 'osx', 'sunos']},
          du: {languages: ['en'], platforms: ['linux', 'osx', 'sunos']},
          top: {languages: ['en'], platforms: ['linux', 'osx']},
          svcs: {languages: ['en'], platforms: ['sunos']},
        });
      });
  });
});
