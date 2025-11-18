'use strict';

const search = require('../lib/search');
const should = require('should');
const sinon = require('sinon');
const path = require('path');
const fs = require('fs-extra');

const config = require('../lib/config');
const utils = require('../lib/utils');
const index = require('../lib/index');

const CACHE_FOLDER = path.join(config.get().cache, 'cache');
const filepath = CACHE_FOLDER + '/search-corpus.json';

const testData = {
  files: [{
    path: '/path/to/file-00.md',
    platforms: ['common'],
    data: 'Random Text Generated Using An Online Sentence Generator',
  }, {
    path: '/path/to/file-01.md',
    platforms: ['common'],
    data: 'Debbie isn\'t a librarian.',
  }, {
    path: '/path/to/file-02.md',
    platforms: ['common'],
    data: 'Joe\'s girlfriend became a photographer.',
  }, {
    path: '/path/to/file-03.md',
    platforms: ['common'],
    data: 'Debbie looks rude.',
  }, {
    path: '/path/to/file-04.md',
    platforms: ['common'],
    data: 'Miss Debbie is careless.',
  }, {
    path: '/path/to/file-05.md',
    platforms: ['common'],
    data: 'Joe is popular.',
  }, {
    path: '/path/to/file-06.md',
    platforms: ['common'],
    data: 'Anthony won\'t become a barber.',
  }, {
    path: '/path/to/file-07.md',
    platforms: ['common'],
    data: 'Stephen will become a store clerk.',
  }, {
    path: '/path/to/file-08.md',
    platforms: ['common'],
    data: 'Stephen is very popular.',
  }, {
    path: '/path/to/file-09.md',
    platforms: ['common'],
    data: 'Anthony is not kind, Anthony is totally evil.',
  }, {
    path: '/path/to/file-10.md',
    platforms: ['common'],
    data: 'Joe has become a science teacher.',
  }, {
    path: '/path/to/file-11.md',
    platforms: ['common'],
    data: 'Roxie and Joe have become spies.',
  }, {
    path: '/path/to/file-12.md',
    platforms: ['common'],
    data: 'Roxie is not a carpenter.',
  }, {
    path: '/path/to/file-13.md',
    platforms: ['common'],
    data: 'Debbie is helpful',
  }, {
    path: '/path/to/file-14.md',
    platforms: ['common'],
    data: 'Roxie isn\'t a scientist.',
  }, {
    path: '/path/to/file-15.md',
    platforms: ['common'],
    data: 'Stephen is amazing at football.',
  }, {
    path: '/path/to/file-16.md',
    platforms: ['common'],
    data: 'Roxie, Debbie, Stephen, Anthony and Joe are friends.',
  }, {
    path: '/path/to/file-17.md',
    platforms: ['common'],
    data: 'Roxie is Joe\'s girlfriend',
  }, {
    path: '/path/to/file-18.md',
    platforms: ['common'],
    data: 'Stephen punched Anthony.',
  }, {
    path: '/path/to/file-19.md',
    platforms: ['common'],
    data: 'End of testing data.',
  }, ],
  corpus: {},
};

let fakes = {
  utils: {
    glob: () => {
      let filenames = [];
      testData.files.forEach((elem) => {
        filenames.push(elem.path);
      });
      return Promise.resolve(filenames);
    },
  },
  index: {
    getShortIndex: (() => {
      let idx = {};
      testData.files.forEach((elem) => {
        idx[utils.parsePagename(elem.path)] = elem.platforms;
      });
      return Promise.resolve(idx);
    }),
  },
  fs: {
    writeFile: (writepath, content) => {
      return new Promise((/** @type {(v?: never) => void} */ resolve, reject) => {
        if (writepath !== filepath) {
          return reject('Incorrect File Path');
        }
        if (content) {
          resolve();
        }
      });
    },
    readFile: (readpath) => {
      return new Promise((resolve, reject) => {
        let file = testData.files.find((elem) => {
          return elem.path === readpath;
        });
        if (file) {
          return resolve(file.data);
        }
        if (readpath === filepath) {
          return resolve(JSON.stringify(testData.corpus));
        }
        return reject('Trying to read incorrect file path: ' + readpath);
      });
    },
  },
};

let restoreStubs = (stubs) => {
  stubs.forEach((stub) => {
    stub.restore();
  });
};

//TODO write tests for private functions in the search module.

describe('Search', () => {
  it('should create index', function(done) {
    let stubs = [];
    stubs.push(sinon.stub(utils, 'glob').callsFake(fakes.utils.glob));
    stubs.push(sinon.stub(fs, 'readFile').callsFake(fakes.fs.readFile));
    stubs.push(sinon.stub(fs, 'writeFile').callsFake(fakes.fs.writeFile));
    search.createIndex().then((data) => {
      Object.keys(data.tfidf).length.should.equal(20);
      Object.keys(data.invertedIndex).length.should.equal(56);
      data.invertedIndex['roxi'][0].should.equal('/path/to/file-11.md');
      testData.corpus = data;
      done();
    }).catch((error) => {
      should.not.exist(error);
      done(error);
    }).then(() => {
      restoreStubs(stubs);
    });
  });
  it('should perform searches', function(done) {
    let stubs = [];
    stubs.push(sinon.stub(fs, 'readFile').callsFake(fakes.fs.readFile));
    stubs.push(sinon.stub(fs, 'writeFile').callsFake(fakes.fs.writeFile));
    stubs.push(sinon.stub(index, 'getShortIndex').callsFake(fakes.index.getShortIndex));
    search.getResults('Anthony').then((data) => {
      data.length.should.equal(4);
      data[0].file.should.equal('/path/to/file-09.md');
      return Promise.resolve();
    }).then(() => {
      return search.getResults('textnotfound').then((data) => {
        data.length.should.equal(0);
        return Promise.resolve();
      });
    }).then(() => {
      return search.getResults('Joe and Roxie').then((data) => {
        data.length.should.equal(8);
        data[1].file.should.equal('/path/to/file-16.md');
        done();
        return Promise.resolve();
      });
    }).catch((error) => {
      should.not.exist(error);
      done(error);
    }).then(() => {
      restoreStubs(stubs);
    });
  });
});
