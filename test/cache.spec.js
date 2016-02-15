var wrench = require('wrench');
var cache = require('../lib/cache');
var sinon = require('sinon');

describe('Cache', function() {

  describe('list()', function() {

    beforeEach(function() {
      sinon.stub(wrench, 'readdirSyncRecursive')
        .returns([
          'index.json',
          'linux',
          'osx',
          'sunos',
          'common/a.md',
          'common/b.md',
          'common/c.md',
          'common/d.md',
          'linux/e.md',
          'linux/f.md',
          'linux/g.md',
          'osx/f.md',
          'osx/g.md',
          'sunos/f.md',
          'sunos/x.md',
          'sunos/z.md'
        ]);
    });

    afterEach(function() {
      wrench.readdirSyncRecursive.restore();
    });

    it('should return list of pages supported for OSX', function(done) {
      cache.list('osx', function(err, files) {
        (Boolean(err)).should.equal(false);
        files.should.deepEqual([
          'common/a.md',
          'common/b.md',
          'common/c.md',
          'common/d.md',
          'osx/f.md',
          'osx/g.md'
        ]);
        done();
      });
    });

    it('should return list of pages supported for Linux', function(done) {
      cache.list('linux', function(err, files) {
        (Boolean(err)).should.equal(false);
        files.should.deepEqual([
          'common/a.md',
          'common/b.md',
          'common/c.md',
          'common/d.md',
          'linux/e.md',
          'linux/f.md',
          'linux/g.md'
        ]);
        done();
      });
    });

    it('should return list of pages supported for SunOS', function(done) {
      cache.list('sunos', function(err, files) {
        (Boolean(err)).should.equal(false);
        files.should.deepEqual([
          'common/a.md',
          'common/b.md',
          'common/c.md',
          'common/d.md',
          'sunos/f.md',
          'sunos/x.md',
          'sunos/z.md'
        ]);
        done();
      });
    });

    it('should return list of all pages', function(done) {
      cache.list('', function(err, files) {
        (Boolean(err)).should.equal(false);
        files.should.deepEqual([
          'common/a.md',
          'common/b.md',
          'common/c.md',
          'common/d.md',
          'linux/e.md',
          'linux/f.md',
          'linux/g.md',
          'osx/f.md',
          'osx/g.md',
          'sunos/f.md',
          'sunos/x.md',
          'sunos/z.md'
        ]);
        done();
      });
    });
  });

});
