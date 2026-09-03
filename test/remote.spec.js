'use strict';

const assert = require('node:assert/strict')
const { describe, it, before, after, afterEach } = require('node:test');
const Cache = require('../lib/cache');
const config = require('../lib/config');
const path = require('path');
const fs = require('fs-extra');
const nock = require('nock');
const index = require('../lib/index');
const utils = require('../lib/utils');

// Instead of hitting the real tldr-pages release archives over the network
// (slow and flaky in CI - see the failures on random OS/Node jobs), nock
// intercepts the HTTP layer and replays small cached fixture zips, one per
// locale that actually has pages upstream. Locales without a fixture get a
// 404, just like the real release assets for a locale with no pages.
const REPOSITORY_ORIGIN = 'https://github.com';
const REPOSITORY_PATH = '/tldr-pages/tldr/releases/latest/download/tldr-pages';
const FIXTURES_DIR = path.join(__dirname, 'fixtures', 'remote');
const FIXTURE_BY_SUFFIX = {
  '': 'tldr-pages.zip',
  '.ca': 'tldr-pages.ca.zip',
  '.hi': 'tldr-pages.hi.zip',
  '.pt_BR': 'tldr-pages.pt_BR.zip',
};

function mockDownload(lang) {
  const suffix = lang === 'en' ? '' : '.' + lang;
  const fixture = FIXTURE_BY_SUFFIX[suffix];
  const interceptor = nock(REPOSITORY_ORIGIN).get(`${REPOSITORY_PATH}${suffix}.zip`);
  return fixture
    ? interceptor.replyWithFile(200, path.join(FIXTURES_DIR, fixture), { 'Content-Type': 'application/zip' })
    : interceptor.reply(404);
}

describe('Remote', () => {
  before(() => {
    nock.disableNetConnect();
  });

  after(() => {
    nock.enableNetConnect();
  });

  describe('update()', () => {
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

    testCases.forEach((testCase) => {
      describe(`${testCase.description}`, async () => {
        /** @type {import('node:test').Mock<() => unknown>} */
        let remove;
        let tempFolder;

        await it('passes', async (t) => {
          remove = t.mock.method(fs, 'remove', () => Promise.resolve());
          t.mock.method(fs, 'ensureDir');
          t.mock.method(fs, 'copy', () => Promise.resolve());
          t.mock.method(utils, 'localeToLang', () => testCase.LANG);
          t.mock.method(index, 'rebuildPagesIndex', () => Promise.resolve());

          const languages = [...new Set(['en', ...testCase.LANG])];
          languages.forEach(mockDownload);

          const cache = new Cache(config.get());
          await cache.update();

          assert.ok(nock.isDone(), `Not all mocked requests were made: ${nock.pendingMocks()}`);

          let call = fs.ensureDir.mock.calls[0];
          tempFolder = call.arguments[0];

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
        });

        afterEach(async () => {
          nock.cleanAll();
          remove.mock.restore();
          await fs.remove(tempFolder);
        });

      });
    });
  });
});
