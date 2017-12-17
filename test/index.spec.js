'use strict';

const fs = require('fs-extra');
const index = require('../lib/index');
const utils = require('../lib/utils');
const sinon = require('sinon');
const should = require('should');

describe('Index', () => {
  beforeEach(() => {
    index.clearRuntimeIndex();
    sinon.stub(utils, 'walkSync')
      .returns([
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
      ]);
    sinon.stub(fs, 'readFile')
      .rejects('dummy error');
    sinon.stub(fs, 'writeFile')
      .resolves('');
  });

  afterEach(() => {
    utils.walkSync.restore();
    fs.readFile.restore();
    fs.writeFile.restore();
  });

  describe('findPlatform()', () => {
    it('should find Linux platform for dd command', (done) => {
      index.findPlatform('dd', 'linux')
        .then((folder) => {
          folder.should.equal('linux');
          done();
        });
    });

    it('should find platform common for cp command', (done) => {
      index.findPlatform('cp', 'linux')
        .then((folder) => {
          folder.should.equal('common');
          done();
        });
    });

    it('should not find platform for svcs command on Linux', (done) => {
      index.findPlatform('svcs', 'linux')
        .then((folder) => {
          should.not.exist(folder);
          done();
        });
    });

    it('should not find platform for non-existing command', (done) => {
      index.findPlatform('qwerty', 'linux')
        .then((folder) => {
          should.not.exist(folder);
          done();
        });
    });
  });

  it('should return correct list of all pages', (done) => {
    index.commands()
      .then((commands) => {
        commands.should.deepEqual([
          'cp', 'dd', 'du', 'git', 'ln', 'ls', 'svcs', 'top'
        ]);
        done();
      })
      .catch((err) => {
        console.error(err);
        done();
      });
  });

  describe('commandsFor()', () => {
    it('should return correct list of pages for Linux', (done) => {
      index.commandsFor('linux')
        .then((commands) => {
          commands.should.deepEqual([
            'cp', 'dd', 'du', 'git', 'ln', 'ls', 'top'
          ]);
          done();
        })
        .catch((err) => {
          console.error(err);
          done();
        });
    });

    it('should return correct list of pages for OSX', (done) => {
      index.commandsFor('osx')
        .then((commands) => {
          commands.should.deepEqual([
            'cp', 'dd', 'du', 'git', 'ln', 'ls', 'top'
          ]);
          done();
        })
        .catch((err) => {
          console.error(err);
          done();
        });
    });

    it('should return correct list of pages for SunOS', (done) => {
      index.commandsFor('sunos')
        .then((commands) => {
          commands.should.deepEqual([
            'cp', 'dd', 'du', 'git', 'ln', 'ls', 'svcs'
          ]);
          done();
        })
        .catch((err) => {
          console.error(err);
          done();
        });
    });
  });

  it('should return correct short index on getShortIndex()', (done) => {
    index.getShortIndex()
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
        done();
      })
      .catch((err) => {
        console.error(err);
        done();
      });
  });
});
