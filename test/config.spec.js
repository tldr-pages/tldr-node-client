'use strict';

const assert = require('node:assert/strict')
const { describe, it } = require('node:test');
const fs = require('fs');
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

  it('should load the default config', (t) => {
    const readFileSync = t.mock.method(fs, 'readFileSync');
    // @ts-expect-error Types are narrowed in implementation detail.
    readFileSync.mock.mockImplementationOnce(() => DEFAULT, 0);
    readFileSync.mock.mockImplementationOnce(() => { throw new Error('Not found') }, 1);
    assert.equal(config.get().repository, 'http://tldr-pages.github.io/assets/tldr.zip');
  });

  it('should override the defaults with content from .tldrrc', (t) => {
    const readFileSync = t.mock.method(fs, 'readFileSync');
    // @ts-expect-error Types are narrowed in implementation detail.
    readFileSync.mock.mockImplementationOnce(() => DEFAULT, 0);
    // @ts-expect-error Types are narrowed in implementation detail.
    readFileSync.mock.mockImplementationOnce(() => CUSTOM, 1);
    assert.equal(config.get().repository, 'http://myrepo/assets/tldr.zip');
  });

  it('should validate the custom config JSON', (t) => {
    const readFileSync = t.mock.method(fs, 'readFileSync');
    // @ts-expect-error Types are narrowed in implementation detail.
    readFileSync.mock.mockImplementationOnce(() => DEFAULT, 0);
    // @ts-expect-error Types are narrowed in implementation detail.
    readFileSync.mock.mockImplementationOnce(() => CUSTOM_INVALID_JSON, 1);
    assert.throws(() => config.get(), /not a valid JSON object/);
  });

  it('should validate the custom config schema', (t) => {
    const readFileSync = t.mock.method(fs, 'readFileSync');
    // @ts-expect-error Types are narrowed in implementation detail.
    readFileSync.mock.mockImplementationOnce(() => DEFAULT, 0);
    // @ts-expect-error Types are narrowed in implementation detail.
    readFileSync.mock.mockImplementationOnce(() => CUSTOM_INVALID_SCHEMA, 1);
    assert.throws(() => config.get(), /Invalid theme value/);
  });

});
