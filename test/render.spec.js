var should = require('should');
var render = require('../lib/render');

describe('Render console output from Markdown', function() {

  it('surrounds the output with blank lines', function() {
    var o = render.fromMarkdown('');
    o.should.eql('\n\n');
  });

  it('strips paragraph tags', function() {
    var o = render.fromMarkdown(
      '\nline 1' +
      '\n' +
      '\nline 2' +
      '\n'
    );
    o.should.eql('\nline 1line 2\n');
  });

  it('reads the command description from block quotes', function() {
    var o = render.fromMarkdown(
      '\n> archiving utility' +
      '\n> supports optional compression'
    );
    o.should.include('archiving utility');
    o.should.include('supports optional compression');
  });

  it('ignores all other Markdown syntax', function() {
    var o = render.fromMarkdown(
      '\n# heading 1' +
      '\n' +
      '\n## heading 2' +
      '\n' +
      '\n[link](http://link)' +
      '\n' +
      '\n```' +
      '\ncode block' +
      '\n```'
    );
    o.should.eql('\n\n');
  });

  it('highlights replaceable {{tokens}}', function() {
    var o = render.fromMarkdown('`hello {{token}} bye`');
    o.should.include('hello '.blackBG.red);
    o.should.include('token'.blackBG.white);
    o.should.include(' bye'.blackBG.red);
  });

});
