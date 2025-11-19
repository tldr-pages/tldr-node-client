'use strict';

const fs = require('fs');
const sinon = require('sinon');
const config = require('../lib/config');

describe('Config', () => {

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

  const CUSTOM_INVALID_JSON =
`# comments are not allowed in json
{}`;

  const CUSTOM_INVALID_SCHEMA =
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
  });

  afterEach(() => {
    /** @type {sinon.SinonSpy} */ (fs.readFileSync).restore();
  });

  it('should load the default config', () => {
    /** @type {sinon.SinonStub} */ (fs.readFileSync).onCall(0).returns(DEFAULT);
    /** @type {sinon.SinonStub} */ (fs.readFileSync).onCall(1).throws('Not found');
    config.get().repository.should.eql('http://tldr-pages.github.io/assets/tldr.zip');
  });

  it('should override the defaults with content from .tldrrc', () => {
    /** @type {sinon.SinonStub} */ (fs.readFileSync).onCall(0).returns(DEFAULT);
    /** @type {sinon.SinonStub} */ (fs.readFileSync).onCall(1).returns(CUSTOM);
    config.get().repository.should.eql('http://myrepo/assets/tldr.zip');
  });

  it('should validate the custom config JSON', () => {
    /** @type {sinon.SinonStub} */ (fs.readFileSync).onCall(0).returns(DEFAULT);
    /** @type {sinon.SinonStub} */ (fs.readFileSync).onCall(1).returns(CUSTOM_INVALID_JSON);
    config.get.should.throw(/not a valid JSON object/);
  });

  it('should validate the custom config schema', () => {
    /** @type {sinon.SinonStub} */ (fs.readFileSync).onCall(0).returns(DEFAULT);
    /** @type {sinon.SinonStub} */ (fs.readFileSync).onCall(1).returns(CUSTOM_INVALID_SCHEMA);
    config.get.should.throw(/Invalid theme value/);
  });

});
