var should = require('should');
var render = require('../lib/render');

describe('Render', function() {

  it('surrounds the output with blank lines', function() {
    var text = render.toANSI({
      name: 'tar',
      description: 'archive utility',
      examples: []
    });
    text.should.startWith('\n');
    text.should.endWith('\n');
  });

  it('contains the command name', function() {
    var text = render.toANSI({
      name: 'tar',
      description: 'archive utility',
      examples: []
    });
    text.should.containEql('  tar\n');
  });

  it('contains the description name', function() {
    var text = render.toANSI({
      name: 'tar',
      description: 'archive utility\nwith support for compression',
      examples: []
    });
    text.should.containEql('  archive utility\n  with support for compression\n');
  });

  it('highlights replaceable {{tokens}}', function() {
    var text = render.toANSI({
      name: 'tar',
      description: 'archive utility',
      examples: [{
        description: 'create',
        code: [
          'hello {{token}} bye'
        ]
      }]
    });
    text.should.containEql('hello '.blackBG.red);
    text.should.containEql('token'.blackBG.white);
    text.should.containEql(' bye'.blackBG.red);
  });

});
