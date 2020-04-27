'use strict';

const TLDR = require('../lib/tldr');

describe('TLDR class', () => {
  it('should construct', () => {
    const tldr = new TLDR({ cache: 'some-random-string' });
    tldr.should.exist;
  });
});
