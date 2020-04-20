'use strict';

const fs = require('fs');
const sinon = require('sinon');
const config = require('../lib/config');

const DEFAULT =
`
{
"repository": "http://tldr-pages.github.io/assets/tldr.zip"
}`;

const CUSTOM =
`
{
"repository": "http://myrepo/assets/tldr.zip"
}`;

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

describe('Config', () => {
  beforeEach(() => {
    sinon.stub(fs, 'readFileSync');
  });

  afterEach(() => {
    fs.readFileSync.restore();
  });

  it('should load the default config', () => {
    fs.readFileSync.onCall(0).returns(DEFAULT);
    fs.readFileSync.onCall(1).throws('Not found');
    config.get().repository.should.eql('http://tldr-pages.github.io/assets/tldr.zip');
  });

  it('should override the defaults with content from .tldrrc', () => {
    fs.readFileSync.onCall(0).returns(DEFAULT);
    fs.readFileSync.onCall(1).returns(CUSTOM);
    config.get().repository.should.eql('http://myrepo/assets/tldr.zip');
  });

  it('should validate the custom config format', () => {
    fs.readFileSync.onCall(0).returns(DEFAULT);
    fs.readFileSync.onCall(1).returns(CUSTOM_INVALID);
    config.get.should.throw(/Invalid theme value/);
  });
});

describe('Config construction', () => {
  beforeEach(() => {
    sinon.stub(fs, 'readFileSync');
    fs.readFileSync.returns(DEFAULT);
  });

  afterEach(() => {
    fs.readFileSync.restore();
  });

  it('should generate randomly salted temp directory paths', () => {
    const length = 16;
    const tempPaths = Array.from({ length }, () => {
      return config.get().tempFolder;
    });
    tempPaths.should.have.length(new Set(tempPaths).size);
  });
});
