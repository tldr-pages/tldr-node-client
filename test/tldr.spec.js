'use strict';

const assert = require('node:assert/strict')
const { describe, it } = require('node:test');
const TLDR = require('../lib/tldr');

describe('TLDR class', () => {
  it('should construct', () => {
    const tldr = new TLDR({ cache: 'some-random-string' });
    assert.equal(!!tldr, true);
  });
});
