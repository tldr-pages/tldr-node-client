'use strict';

const cache = require('../lib/cache');
const should = require('should');
const sinon = require('sinon');
const fs = require('fs-extra');
const index = require('../lib/index');
const platform = require('../lib/platform');


describe('Cache', () => {
  it('should return a positive number on lastUpdate', function () {
    // To allow setting timeout of 30 secs
    // eslint-disable-next-line no-magic-numbers
    this.timeout(30000);
    return cache.update()
      .then(() => cache.lastUpdated())
      .then((stats) => {
        should.exist(stats);
        stats.mtime.should.be.aboveOrEqual(0);
      });
  });

  describe('getPage()', () => {
    beforeEach(() => {
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

    afterEach(() => {
      index.getShortIndex.restore();
    });

    it('should return page contents for ls', () => {
      sinon.stub(fs, 'readFile').resolves('# ls\n> ls page');
      sinon.stub(platform, 'getPreferredPlatformFolder').returns('osx');
      sinon.stub(index, 'findPlatform').resolves('osx');
      return cache.getPage('ls')
        .then((content) => {
          should.exist(content);
          content.should.startWith('# ls');
          fs.readFile.restore();
          platform.getPreferredPlatformFolder.restore();
          index.findPlatform.restore();
        });
    });

    it('should return empty contents for svcs on OSX', () =>{
      sinon.stub(fs, 'readFile').resolves('# svcs\n> svcs');
      sinon.stub(platform, 'getPreferredPlatformFolder').returns('osx');
      sinon.stub(index, 'findPlatform').resolves(null);
      return cache.getPage('svc')
        .then((content) => {
          should.not.exist(content);
          fs.readFile.restore();
          platform.getPreferredPlatformFolder.restore();
          index.findPlatform.restore();
        });
    });

    it('should return page contents for svcs on SunOS', () => {
      sinon.stub(fs, 'readFile').resolves('# svcs\n> svcs');
      sinon.stub(platform, 'getPreferredPlatformFolder').returns('sunos');
      sinon.stub(index, 'findPlatform').resolves('svcs');
      return cache.getPage('svcs')
        .then((content) => {
          should.exist(content);
          content.should.startWith('# svcs');
          fs.readFile.restore();
          platform.getPreferredPlatformFolder.restore();
          index.findPlatform.restore();
        });
    });

    it('should return empty contents for non-existing page', () => {
      return cache.getPage('qwerty')
        .then((content) => should.not.exist(content));
    });
  });
});
