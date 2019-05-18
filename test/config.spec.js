'use strict';

const assert = require('assert');
const fs = require('fs-extra');
const sinon = require('sinon');
const config = require('../lib/config');

describe('Config', () => {

  const DEFAULT_CFG = {
    repository: 'http://tldr-pages.github.io/assets/tldr.zip'
  };

  const CUSTOM_CFG = {
    repository: 'http://myrepo/assets/tldr.zip'
  };

  const CUSTOM_INVALID =
    `
{
  "themes": {
    "simple": {
      "commandName": "bold,underline",
      "mainDescription": "#876992",
      "exampleDescription": "",
      "exampleCode": "",
      "exampleToken": "underline"
    }
  }
}`;


  beforeEach(() => {
    sinon.stub(fs, 'readFileSync');
    config.reset();
  });

  afterEach(() => {
    fs.readFileSync.restore();
  });

  it('should load the default config', () => {
    fs.readFileSync.onCall(0).returns(JSON.stringify(DEFAULT_CFG));
    const err = new Error('Not found');
    err.code = 'ENOENT';
    fs.readFileSync.onCall(1).throws(err);
    const result = config.get().repository;
    assert.strictEqual(result, DEFAULT_CFG.repository);
  });

  it('should override the defaults with content from .tldrrc', () => {
    fs.readFileSync.onCall(0).returns(JSON.stringify(DEFAULT_CFG));
    fs.readFileSync.onCall(1).returns(JSON.stringify(CUSTOM_CFG));

    const result = config.get().repository;
    assert.strictEqual(result, CUSTOM_CFG.repository);
  });

  it('should validate the custom config format', () => {
    fs.readFileSync.onCall(0).returns(JSON.stringify(DEFAULT_CFG));
    fs.readFileSync.onCall(1).returns(CUSTOM_INVALID);
    assert.throws(() => {
      config.get();
    }, /Invalid theme value/);
  });

});
