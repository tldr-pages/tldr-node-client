'use strict';

const Cache = require('../lib/cache');
const config = require('../lib/config');
const should = require('should');
const sinon = require('sinon');
const path = require('path');
const fs = require('fs-extra');
const index = require('../lib/index');
const remote = require('../lib/remote');
const platformUtils = require('../lib/platformUtils');


describe('Cache', () => {
  describe('update()', () => {
    beforeEach(() => {
      sinon.spy(fs, 'ensureDir');
      sinon.spy(fs, 'remove');
      sinon.stub(fs, 'copy').resolves();
      sinon.stub(remote, 'download').resolves();
      sinon.stub(index, 'rebuildPagesIndex').resolves();
      this.cacheFolder = path.join(config.get().cache, 'cache');
    });

    it('should use randomly created temp folder', () => {
      const count = 16;
      const cache = new Cache(config.get());
      return Promise.all(Array.from({ length: count }).map(() => {
        return cache.update();
      })).then(() => {
        let calls = fs.ensureDir.getCalls().filter((call) => {
          return !call.calledWith(this.cacheFolder);
        });
        calls.should.have.length(count);
        let tempFolders = calls.map((call) => {
          return call.args[0];
        });
        tempFolders.should.have.length(new Set(tempFolders).size);
      });
    });

    it('should remove temp folder after cache gets updated', () => {
      const cache = new Cache(config.get());
      return cache.update().then(() => {
        let createFolder = fs.ensureDir.getCalls().find((call) => {
          return !call.calledWith(this.cacheFolder);
        });
        let removeFolder = fs.remove.getCall(0);
        removeFolder.args[0].should.be.equal(createFolder.args[0]);
      });
    });

    afterEach(() => {
      fs.ensureDir.restore();
      fs.remove.restore();
      fs.copy.restore();
      remote.download.restore();
      index.rebuildPagesIndex.restore();
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
      sinon.stub(platformUtils, 'getPreferredPlatformFolder').returns('osx');
      sinon.stub(index, 'findPage').resolves('osx');
      const cache = new Cache(config.get());
      return cache.getPage('ls')
        .then((content) => {
          should.exist(content);
          content.should.startWith('# ls');
          fs.readFile.restore();
          platformUtils.getPreferredPlatformFolder.restore();
          index.findPage.restore();
        });
    });

    it('should return empty contents for svcs on OSX', () =>{
      sinon.stub(fs, 'readFile').resolves('# svcs\n> svcs');
      sinon.stub(platformUtils, 'getPreferredPlatformFolder').returns('osx');
      sinon.stub(index, 'findPage').resolves(null);
      const cache = new Cache(config.get());
      return cache.getPage('svc')
        .then((content) => {
          should.not.exist(content);
          fs.readFile.restore();
          platformUtils.getPreferredPlatformFolder.restore();
          index.findPage.restore();
        });
    });

    it('should return page contents for svcs on SunOS', () => {
      sinon.stub(fs, 'readFile').resolves('# svcs\n> svcs');
      sinon.stub(platformUtils, 'getPreferredPlatformFolder').returns('sunos');
      sinon.stub(index, 'findPage').resolves('svcs');
      const cache = new Cache(config.get());
      return cache.getPage('svcs')
        .then((content) => {
          should.exist(content);
          content.should.startWith('# svcs');
          fs.readFile.restore();
          platformUtils.getPreferredPlatformFolder.restore();
          index.findPage.restore();
        });
    });

    it('should return empty contents for non-existing page', () => {
      const cache = new Cache(config.get());
      return cache.getPage('qwerty')
        .then((content) => {
          return should.not.exist(content);
        });
    });
  });
});
