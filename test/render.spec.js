'use strict';

const assert = require('node:assert/strict')
const { describe, it, beforeEach } = require('node:test');
const render = require('../lib/render');

describe('Render', () => {

  beforeEach(() => {
    this.config = {
      'themes': {
        'base16': {
          'commandName': 'bold',
          'mainDescription': '',
          'exampleDescription': 'green',
          'exampleCode': 'red',
          'exampleToken': 'cyan'
        }
      },
      'theme': 'base16'
    };
  });

  it('surrounds the output with blank lines', () => {
    let text = render.toANSI({
      name: 'tar',
      description: 'archive utility',
      examples: []
    }, this.config);
    assert.equal(text?.startsWith('\n'), true);
    assert.equal(text?.endsWith('\n'), true);
  });

  it('contains the command name', () => {
    let text = render.toANSI({
      name: 'tar',
      description: 'archive utility',
      examples: []
    }, this.config);
    assert.equal(text?.includes('tar'), true);
    assert.equal(text?.includes('archive utility'), true);
  });

  it('contains the description name', () => {
    let text = render.toANSI({
      name: 'tar',
      description: 'archive utility\nwith support for compression',
      examples: []
    }, this.config);
    assert.equal(text?.includes('archive utility'), true);
    assert.equal(text?.includes('with support for compression'), true);
  });

  it('highlights replaceable {{tokens}}', () => {
    let text = render.toANSI({
      name: 'tar',
      description: 'archive utility',
      examples: [{
        description: 'create',
        code: 'hello {{token}} bye'
      }]
    }, this.config);
    assert.equal(text?.includes('hello'), true);
    assert.equal(text?.includes('token'), true);
    assert.equal(text?.includes('bye'), true);
  });

  it('should correctly render see also section', () => {
    let text = render.toANSI({
      name: 'uname',
      description: 'Description for `uname`.\n' +
        'See also `lsb_release`.',
      examples: [{
        description: '1st example. You need `sudo` to run this',
        code: 'uname {{token}}'
      }],
      seeAlso: [
        'lsb_release',
        'sudo'
      ]
    }, this.config);
    assert.equal(text?.includes('See also: lsb_release, sudo'), true);
  });

  it('should return an error for invalid theme', (t) => {
    const error = t.mock.method(console, 'error');

    const config = {
      'themes': {
        'base16': {
          'commandName': 'bold',
          'mainDescription': '',
          'exampleDescription': 'green',
          'exampleCode': 'red',
          'exampleToken': 'cyan'
        }
      },
      'theme': 'bad'
    };

    let text = render.toANSI({
      name: 'tar',
      description: 'archive utility',
      examples: [],
    }, config);
    assert.equal(!!text, false);
    assert.equal(error.mock.calls[0].arguments[0], 'invalid theme: bad');
  });
});
