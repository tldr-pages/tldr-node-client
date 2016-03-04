var wrench = require('wrench');
var fs = require('fs');
var index = require('../lib/index');
var sinon = require('sinon');
var should = require('should');

describe('Index', function() {

  beforeEach(function() {
    index.clearRuntimeIndex();
    sinon.stub(wrench, 'readdirSyncRecursive')
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
    sinon.stub(fs, 'readFileSync').throws('TypeError');
    sinon.stub(fs, 'writeFileSync').returns(true);
  });

  afterEach(function() {
    wrench.readdirSyncRecursive.restore();
    fs.readFileSync.restore();
    fs.writeFileSync.restore();
  });

  describe('findPlatform()', function() {
    it('should find Linux platform for dd command (as dd is specific to Linux)', function() {
      index.findPlatform('dd', 'linux').should.equal('linux');
    });

    it('should find platform common for cp command', function() {
      index.findPlatform('cp', 'linux').should.equal('common');
    });

    it('should not find platform for svcs command on Linux', function() {
      should.not.exist(index.findPlatform('svcs', 'linux'));
    });

    it('should not find platform for non-existing command', function() {
      should.not.exist(index.findPlatform('qwerty', 'linux'));
    });
  });

  describe('hasPage()', function() {
    it('should have cp page', function() {
      index.hasPage('cp').should.equal(true);
    });

    it('should not have mv page', function() {
      index.hasPage('mv').should.equal(false);
    });
  });

  it('should return correct list of all pages', function() {
    index.commands().should.deepEqual([
      'cp', 'dd', 'du', 'git', 'ln', 'ls', 'svcs', 'top'
    ]);
  });

  describe('commandsFor()', function() {
    it('should return correct list of pages for Linux', function() {
      index.commandsFor('linux').should.deepEqual([
        'cp', 'dd', 'du', 'git', 'ln', 'ls', 'top'
      ]);
    });

    it('should return correct list of pages for OSX', function() {
      index.commandsFor('osx').should.deepEqual([
        'cp', 'dd', 'du', 'git', 'ln', 'ls', 'top'
      ]);
    });

    it('should return correct list of pages for SunOS', function() {
      index.commandsFor('sunos').should.deepEqual([
        'cp', 'dd', 'du', 'git', 'ln', 'ls', 'svcs'
      ]);
    });
  });

  it('should return correct short index on getShortIndex()', function() {
    index.getShortIndex().should.deepEqual({
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

  it('should return correct classic index on getClassicIndex()', function() {
    index.getClassicIndex().should.deepEqual({
      commands: [
        { name: 'cp', platform: ['common'] },
        { name: 'dd', platform: ['linux', 'osx', 'sunos'] },
        { name: 'du', platform: ['linux', 'osx', 'sunos'] },
        { name: 'git', platform: ['common'] },
        { name: 'ln', platform: ['common'] },
        { name: 'ls', platform: ['common'] },
        { name: 'svcs', platform: ['sunos'] },
        { name: 'top', platform: ['linux', 'osx'] }
      ]
    });
  });

});
