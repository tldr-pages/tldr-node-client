'use strict';

const assert = require('node:assert/strict')
const { describe, it } = require('node:test');
const TLDR = require('../lib/tldr');
const search = require('../lib/search');
const { MissingPageError } = require('../lib/errors');

describe('TLDR class', () => {
  it('should construct', () => {
    const tldr = new TLDR({ cache: 'some-random-string' });
    assert.equal(!!tldr, true);
  });

  it('printBestPage miss path no longer calls search.createIndex', async (t) => {
    const tldr = new TLDR({ cache: 'some-random-string', skipUpdateWhenPageNotFound: false, pagesRepository: 'https://example.test' });
    let updateCalled = false;
    let createIndexCalled = false;
    t.mock.method(tldr.cache, 'getPage', () => Promise.resolve(undefined));
    t.mock.method(tldr.cache, 'update', () => { updateCalled = true; return Promise.resolve(); });
    t.mock.method(search, 'createIndex', () => { createIndexCalled = true; return Promise.resolve(); });

    await assert.rejects(tldr.printBestPage('definitely-not-a-real-tool'), MissingPageError);
    assert.equal(updateCalled, true, 'cache.update should run on miss');
    assert.equal(createIndexCalled, false, 'search.createIndex must NOT run on miss');
  });

  it('printBestPage miss path is skipped entirely when skipUpdateWhenPageNotFound is true', async (t) => {
    const tldr = new TLDR({ cache: 'some-random-string', skipUpdateWhenPageNotFound: true, pagesRepository: 'https://example.test' });
    let updateCalled = false;
    let createIndexCalled = false;
    t.mock.method(tldr.cache, 'getPage', () => Promise.resolve(undefined));
    t.mock.method(tldr.cache, 'update', () => { updateCalled = true; return Promise.resolve(); });
    t.mock.method(search, 'createIndex', () => { createIndexCalled = true; return Promise.resolve(); });

    await assert.rejects(tldr.printBestPage('definitely-not-a-real-tool'), MissingPageError);
    assert.equal(updateCalled, false, 'cache.update should be skipped when skipUpdateWhenPageNotFound is true');
    assert.equal(createIndexCalled, false, 'search.createIndex should be skipped too');
  });
});
