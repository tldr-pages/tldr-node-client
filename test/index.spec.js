'use strict';

const fs = require('fs-extra');
const index = require('../lib/index');
const utils = require('../lib/utils');
const sinon = require('sinon');
const should = require('should');

const pages = [
  'index.json',
  'common/cp.md',
  'common/git.md',
  'common/ln.md',
  'common/ls.md',
  'linux/dd.md',
  'linux/du.md',
  'linux/top.md',
  'osx/dd.md',
  'osx/du.md',
  'osx/top.md',
  'sunos/dd.md',
  'sunos/du.md',
  'sunos/svcs.md'
];

describe('Index building', () => {
  beforeEach(() => {
    index.rebuildPagesIndex();
    sinon.stub(fs, 'readJson').rejects('dummy error');
    sinon.stub(fs, 'writeJson').resolves('');
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

  describe('findPlatform()', () => {
    it('should find Linux platform for dd command', () => {
      return index.findPlatform('dd', 'linux')
        .then((folder) => {
          return folder.should.equal('linux');
        });
    });

    it('should find platform common for cp command', () => {
      return index.findPlatform('cp', 'linux')
        .then((folder) => {
          return folder.should.equal('common');
        });
    });

    it('should not find platform for svcs command on Linux', () => {
      return index.findPlatform('svcs', 'linux')
        .then((folder) => {
          return should.not.exist(folder);
        });
    });

    it('should not find platform for non-existing command', () => {
      return index.findPlatform('qwerty', 'linux')
        .then((folder) => {
          return should.not.exist(folder);
        });
    });
  });

  it('should return correct list of all pages', () => {
    return index.commands()
      .then((commands) => {
        commands.should.deepEqual([
          'cp', 'dd', 'du', 'git', 'ln', 'ls', 'svcs', 'top'
        ]);
      });
  });

  describe('commandsFor()', () => {
    it('should return correct list of pages for Linux', () => {
      return index.commandsFor('linux')
        .then((commands) => {
          commands.should.deepEqual([
            'cp', 'dd', 'du', 'git', 'ln', 'ls', 'top'
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
          cp: ['common'],
          git: ['common'],
          ln: ['common'],
          ls: ['common'],
          dd: ['linux', 'osx', 'sunos'],
          du: ['linux', 'osx', 'sunos'],
          top: ['linux', 'osx'],
          svcs: ['sunos']
        });
      });
  });
});
