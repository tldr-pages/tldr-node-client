var fs = require('fs-extra');
var index = require('../lib/index');
var utils = require('../lib/utils');
var sinon = require('sinon');
var should = require('should');

describe('Index', function() {
  beforeEach(function() {
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
    sinon.stub(fs, 'readFile', (path, encoding, cb) => {
      return cb('dummy error', null);
    });
    sinon.stub(fs, 'writeFile', (path, contents, cb) => {
      return cb();
    });
  });

  afterEach(function() {
    utils.walkSync.restore();
    fs.readFile.restore();
    fs.writeFile.restore();
  });

  describe('findPlatform()', function() {
    it('should find Linux platform for dd command', (done) => {
      index.findPlatform('dd', 'linux', (folder) => {
        folder.should.equal('linux');
        done();
      });
    });

    it('should find platform common for cp command', (done) => {
      index.findPlatform('cp', 'linux', (folder) => {
        folder.should.equal('common');
        done();
      });
    });

    it('should not find platform for svcs command on Linux', (done) => {
      index.findPlatform('svcs', 'linux', (folder) => {
        should.not.exist(folder);
        done();
      });
    });

    it('should not find platform for non-existing command', (done) => {
      index.findPlatform('qwerty', 'linux', (folder) => {
        should.not.exist(folder);
        done();
      });
    });
  });

  it('should return correct list of all pages', (done) => {
    index.commands((commands) => {
      commands.should.deepEqual([
        'cp', 'dd', 'du', 'git', 'ln', 'ls', 'svcs', 'top'
      ]);
      done();
    });
  });

  describe('commandsFor()', function() {
    it('should return correct list of pages for Linux', (done) => {
      index.commandsFor('linux', (commands) => {
        commands.should.deepEqual([
          'cp', 'dd', 'du', 'git', 'ln', 'ls', 'top'
        ]);
        done();
      });
    });

    it('should return correct list of pages for OSX', (done) => {
      index.commandsFor('osx', (commands) => {
        commands.should.deepEqual([
          'cp', 'dd', 'du', 'git', 'ln', 'ls', 'top'
        ]);
        done();
      });
    });

    it('should return correct list of pages for SunOS', (done) => {
      index.commandsFor('sunos', (commands) => {
        commands.should.deepEqual([
          'cp', 'dd', 'du', 'git', 'ln', 'ls', 'svcs'
        ]);
        done();
      });
    });
  });

  it('should return correct short index on getShortIndex()', (done) => {
    index.getShortIndex((idx) => {
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
    });
  });
});
