'use strict';

const render = require('../lib/render');
const sinon = require('sinon');
const should = require('should');

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

  afterEach(() => {
    sinon.restore();
  });

  it('surrounds the output with blank lines', () => {
    let text = render.toANSI({
      name: 'tar',
      description: 'archive utility',
      examples: []
    }, this.config);
    should(text).startWith('\n');
    should(text).endWith('\n');
  });

  it('contains the command name', () => {
    let text = render.toANSI({
      name: 'tar',
      description: 'archive utility',
      examples: []
    }, this.config);
    should(text).containEql('tar');
    should(text).containEql('archive utility');
  });

  it('contains the description name', () => {
    let text = render.toANSI({
      name: 'tar',
      description: 'archive utility\nwith support for compression',
      examples: []
    }, this.config);
    should(text).containEql('archive utility');
    should(text).containEql('with support for compression');
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
    should(text).containEql('hello ');
    should(text).containEql('token');
    should(text).containEql(' bye');
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
    should(text).containEql('See also: lsb_release, sudo');
  });

  it('should return an error for invalid theme', () => {
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
    should.not.exist(text);
    /** @type {sinon.SinonSpy} */ (console.error).getCall(0).args[0].should.equal('invalid theme: bad');
  });
});
