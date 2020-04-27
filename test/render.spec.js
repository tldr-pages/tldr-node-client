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
    text.should.startWith('\n');
    text.should.endWith('\n');
  });

  it('contains the command name', () => {
    let text = render.toANSI({
      name: 'tar',
      description: 'archive utility',
      examples: []
    }, this.config);
    text.should.containEql('tar');
    text.should.containEql('archive utility');
  });

  it('contains the description name', () => {
    let text = render.toANSI({
      name: 'tar',
      description: 'archive utility\nwith support for compression',
      examples: []
    }, this.config);
    text.should.containEql('archive utility');
    text.should.containEql('with support for compression');
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
    text.should.containEql('hello ');
    text.should.containEql('token');
    text.should.containEql(' bye');
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
    text.should.containEql('See also: lsb_release, sudo');
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
    }, config);
    should.not.exist(text);
    console.error.getCall(0).args[0].should.equal('invalid theme: bad');
  });
});
