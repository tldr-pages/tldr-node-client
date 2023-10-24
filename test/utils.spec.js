'use strict';

const utils = require('../lib/utils');
var assert = require('assert');

describe('Utils', () => {
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
