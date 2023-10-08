'use strict';

const Cache = require('../lib/cache');
const config = require('../lib/config');
const sinon = require('sinon');
const path = require('path');
const fs = require('fs-extra');
const index = require('../lib/index');
const utils = require('../lib/utils');
var assert = require('assert');

describe('Remote', () => {
  describe('update()', () => {
    const TIMEOUT_INTERVAL = 60000; // 1min timeout for each test case.
    let tempFolder;
    let i = 0;

    const testCases = [
      {
        description: 'No language specified',
        LANG: ['en'],
        expectedFolders: ['pages'],
      },
      {
        description: '1 Language Specified that doesn\'t exist',
        LANG: ['pt_BB'],
        expectedFolders: ['pages'],
      },
      {
        description: '1 Language Specified that does exist',
        LANG: ['ca'],
        expectedFolders: ['pages', 'pages.ca'],
      },
      {
        description: 'Languages Specified that exist',
        LANG: ['pt', 'pt_BR'],
        expectedFolders: ['pages', 'pages.pt_BR'],
      },
      {
        description: 'Multiple Languages Specified that exist',
        LANG: ['pt_BR', 'pt', 'en', 'hi', 'mo'],
        expectedFolders: ['pages', 'pages.hi', 'pages.pt_BR'],
      },
    ];

    beforeEach(() => {
      // Iterate over the test cases
      sinon.spy(fs, 'ensureDir');
      sinon.stub(fs, 'remove').resolves();
      sinon.stub(fs, 'copy').resolves();
      sinon.stub(utils, 'localeToLang').returns(testCases[i].LANG);
      sinon.stub(index, 'rebuildPagesIndex').resolves();
    });

    testCases.forEach((testCase) => {
      it(`${testCase.description}`, () => {
        const cache = new Cache(config.get());
        return cache.update().then(() => {
          let call = fs.ensureDir.getCall(0);
          tempFolder = call.args[0];
          
          // Get the actual cache folders created
          const items = fs.readdirSync(tempFolder);
          
          // Filter the items to get only the directories
          const presentFolders = items.filter((item) => {
            try {
              return fs.statSync(path.join(tempFolder, item)).isDirectory();
            } catch (err) {
              return false;
            }
          });
          assert.deepEqual(presentFolders, testCase.expectedFolders);
        }).catch((err) => {
          throw err;
        });
      }).timeout(TIMEOUT_INTERVAL);
    });

    afterEach(() => {
      // Clearing Spies & Stubs
      fs.copy.restore();
      fs.remove.restore();
      fs.ensureDir.restore();
      utils.localeToLang.restore();
      index.rebuildPagesIndex.restore();
      
      fs.remove(tempFolder);
      i = i + 1;
    });
  });

  describe('localeToLang()', () => {
    it('should return with cc', () => {
      let result = utils.localeToLang('pt_BR');
      assert.deepEqual(result, ['pt', 'pt_BR']);
    });

    it('should return without cc', () => {
      let result = utils.localeToLang('pp_BR');
      assert.deepEqual(result, ['pp']);
    });
  });
});

