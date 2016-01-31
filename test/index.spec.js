var wrench = require('wrench');
var fs = require('fs');
var index = require('../lib/index');
var sinon = require('sinon');

describe('Index', function() {

  beforeEach(function() {
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

  it('should have cp page', function() {
    index.hasPage('cp').should.equal(true);
  });

  it('should not have mv page', function() {
    index.hasPage('mv').should.equal(false);
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
