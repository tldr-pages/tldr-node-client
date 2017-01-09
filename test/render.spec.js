'use strict';

const render = require('../lib/render');
const config = require('../lib/config');

describe('Render', () => {

  beforeEach(() => {
    config.reset();
    config.get().theme = 'base16';
  });

  it('surrounds the output with blank lines', () => {
    let text = render.toANSI({
      name: 'tar',
      description: 'archive utility',
      examples: []
    });
    text.should.startWith('\n');
    text.should.endWith('\n');
  });

  it('contains the command name', () => {
    let text = render.toANSI({
      name: 'tar',
      description: 'archive utility',
      examples: []
    });
    text.should.containEql('tar');
    text.should.containEql('archive utility');
  });

  it('contains the description name', () => {
    let text = render.toANSI({
      name: 'tar',
      description: 'archive utility\nwith support for compression',
      examples: []
    });
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
    });
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
    });
    text.should.containEql('See also: lsb_release, sudo');
  });
});
