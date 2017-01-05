var cache = require('../lib/cache');
var should = require('should');
var sinon = require('sinon');
var fs = require('fs-extra');
var index = require('../lib/index');
var platform = require('../lib/platform');


describe('Cache', () => {

  it('should return a positive number on lastUpdate', function(done) {
    /* eslint-disable */ // To allow setting timeout of 5 secs
    this.timeout(5000);
    cache.update(function(err) {
    /* eslint-enable */
      cache.lastUpdated((err, stats) => {
        should.not.exist(err);
        should.exist(stats);
        stats.mtime.should.be.aboveOrEqual(0);
        done();
      });
    });
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
    });

    afterEach(function() {
      index.getShortIndex.restore();
    });

    it('should return page contents for ls', (done) => {
      sinon.stub(fs, 'readFile', (path, encoding, cb) => {
        return cb(null, '# ls\n> ls page');
      });
      sinon.stub(platform, 'getPreferredPlatformFolder').returns('osx');
      sinon.stub(index, 'findPlatform', (page, preferredPlatform, done) => {
        return done('osx');
      });
      cache.getPage('ls', (err, content) => {
        should.not.exist(err);
        should.exist(content);
        content.should.startWith('# ls');
        fs.readFile.restore();
        platform.getPreferredPlatformFolder.restore();
        index.findPlatform.restore();
        done();
      });
    });

    it('should return empty contents for svcs on OSX', (done) =>{
      sinon.stub(fs, 'readFile', (path, encoding, cb) => {
        return cb(null, '# svcs\n> svcs');
      });
      sinon.stub(platform, 'getPreferredPlatformFolder').returns('osx');
      sinon.stub(index, 'findPlatform', (page, preferredPlatform, done) => {
        return done(null);
      });
      cache.getPage('svc', (err, content) => {
        should.not.exist(err);
        should.not.exist(content);
        fs.readFile.restore();
        platform.getPreferredPlatformFolder.restore();
        index.findPlatform.restore();
        done();
      });
    });

    it('should return page contents for svcs on SunOS', (done) => {
      sinon.stub(fs, 'readFile', (path, encoding, cb) => {
        return cb(null, '# svcs\n> svcs');
      });
      sinon.stub(platform, 'getPreferredPlatformFolder').returns('sunos');
      sinon.stub(index, 'findPlatform', (page, preferredPlatform, done) => {
        return done('svcs');
      });
      cache.getPage('svcs', (err, content) => {
        should.not.exist(err);
        should.exist(content);
        content.should.startWith('# svcs');
        fs.readFile.restore();
        platform.getPreferredPlatformFolder.restore();
        index.findPlatform.restore();
        done();
      });
    });

    it('should return empty contents for non-existing page', (done) => {
      cache.getPage('qwerty', (err, content) => {
        should.not.exist(err);
        should.not.exist(content);
        done();
      });
    });
  });

});
