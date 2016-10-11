var cache = require('../lib/cache');
var should = require('should');
var sinon = require('sinon');
var fs = require('fs-extra');
var index = require('../lib/index');
var platform = require('../lib/platform');


describe('Cache', function() {

  it('should return a positive number on lastUpdate', function() {
    cache.lastUpdate.should.be.aboveOrEqual(0);
  });

  describe('getPage()', function() {

    beforeEach(function() {
      // index.clearRuntimeIndex();
      sinon.stub(index, 'getShortIndex').returns({
        cp: ['common'],
        git: ['common'],
        ln: ['common'],
        ls: ['common'],
        dd: ['linux', 'osx', 'sunos'],
        du: ['linux', 'osx', 'sunos'],
        top: ['linux', 'osx'],
        svcs: ['sunos']
      });
      sinon.stub(index, 'getClassicIndex').returns({
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

    afterEach(function() {
      index.getClassicIndex.restore();
      index.getShortIndex.restore();
    });

    it('should return page contents for ls', function() {
      sinon.stub(fs, 'readFileSync').returns('# ls\n> ls page');
      sinon.stub(platform, 'getPreferredPlatformFolder').returns('osx');
      sinon.stub(index, 'findPlatform').returns('osx');
      cache.getPage('ls').should.startWith('# ls');
      fs.readFileSync.restore();
      platform.getPreferredPlatformFolder.restore();
      index.findPlatform.restore();
    });

    it('should return empty contents for svcs on OSX', function() {
      sinon.stub(fs, 'readFileSync').returns('# svcs\n> svcs');
      sinon.stub(platform, 'getPreferredPlatformFolder').returns('osx');
      sinon.stub(index, 'findPlatform').returns(null);
      should.not.exist(cache.getPage('svcs'));
      platform.getPreferredPlatformFolder.restore();
      fs.readFileSync.restore();
      index.findPlatform.restore();
    });

    it('should return page contents for svcs on SunOS', function() {
      sinon.stub(fs, 'readFileSync').returns('# svcs\n> svcs');
      sinon.stub(platform, 'getPreferredPlatformFolder').returns('sunos');
      sinon.stub(index, 'findPlatform').returns('svcs');
      cache.getPage('svcs').should.startWith('# svcs');
      platform.getPreferredPlatformFolder.restore();
      fs.readFileSync.restore();
      index.findPlatform.restore();
    });

    it('should return empty contents for non-existing page', function() {
      should.not.exist(cache.getPage('qwerty'));
    });
  });

});
