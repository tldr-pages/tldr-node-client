var cache = require('../lib/cache');
// var should = require('should');
// var sinon = require('sinon');

describe('Cache', function() {

  it('should return a positive number on lastUpdate', function() {
    cache.lastUpdate.should.be.aboveOrEqual(0);
  });

  // WARNING!
  // The following tests are incorrect, because they rely on cache availability
  //
  // describe('getPage()', function() {
  //   var index = require('../lib/index');
  //   var platform = require('../lib/platform');

  //   beforeEach(function() {
  //     index.clearRuntimeIndex();
  //   });

  //   it('should return page contents for ls', function() {
  //     cache.getPage('ls').should.startWith('# ls');
  //   });

  //   it('should return empty contents for apt-get on OSX', function() {
  //     sinon.stub(platform, 'getPreferredPlatformFolder').returns('osx');
  //     should.not.exist(cache.getPage('apt-get'));
  //     platform.getPreferredPlatformFolder.restore();
  //   });

  //   it('should return page contents for apt-get on Linux', function() {
  //     sinon.stub(platform, 'getPreferredPlatformFolder').returns('linux');
  //     cache.getPage('apt-get').should.startWith('# apt-get');
  //     platform.getPreferredPlatformFolder.restore();
  //   });

  //   it('should return empty contents for non-existing page', function() {
  //     should.not.exist(cache.getPage('qwerty'));
  //   });
  // });

});
