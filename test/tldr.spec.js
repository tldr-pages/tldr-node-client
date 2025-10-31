'use strict';

const should = require('should');
const TLDR = require('../lib/tldr');

describe('TLDR class', () => {
  it('should construct', () => {
    const tldr = new TLDR({ cache: 'some-random-string' });
    should(tldr).instanceOf(TLDR);
  });
});
