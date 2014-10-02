var should = require('should');
var parser = require('../lib/parser');

describe('Parser', function() {

  it('parses the command name', function() {
    var page = parser.parse(
      '\n# tar'
    );
    page.name.should.eql('tar');
  });

  it('parses the description', function() {
    var page = parser.parse(
      '\n# tar' +
      '\n> archiving utility'
    );
    page.description.should.eql('archiving utility');
  });

  it('can parse the description on multiple lines', function() {
    var page = parser.parse(
      '\n# tar' +
      '\n> archiving utility' +
      '\n> with support for compression'
    );
    page.description.should.eql('archiving utility\nwith support for compression');
  });

  it('does not escape HTML entities', function() {
    var page = parser.parse(
      '\n# tar' +
      '\n> compress & decompress'
    );
    page.description.should.eql('compress & decompress');
  });

  it('parses example descriptions and codes', function() {
    var page = parser.parse(
      '\n# tar' +
      '\n> archiving utility' +
      '\n' +
      '\n- create an archive' +
      '\n' +
      '\n`tar cf {{file.tar}}`'
    );
    page.examples.should.have.length(1);
    page.examples[0].description.should.eql('create an archive');
    page.examples[0].code.should.eql('tar cf {{file.tar}}');
  });

  it('does not escape HTML in the examples either', function() {
    var page = parser.parse(
      '\n- this & that' +
      '\n' +
      '\n`cmd & data`'
    );
    page.examples.should.have.length(1);
    page.examples[0].description.should.eql('this & that');
    page.examples[0].code.should.eql('cmd & data');
  });

  it('parses all the examples', function() {
    var page = parser.parse(
      '\n# tar' +
      '\n> archiving utility' +
      '\n' +
      '\n- create an archive' +
      '\n' +
      '\n`tar cf {{file.tar}}`' +
      '\n' +
      '\n- extract an archive' +
      '\n' +
      '\n`tar xf {{file}}`'
    );
    page.examples.should.have.length(2);
  });

  it('leaves out malformed examples', function() {
    var page = parser.parse(
      '\n- example 1' +
      '\n' +
      '\n`cmd --foo`' +
      '\n' +
      '\n- example 2'
    );
    page.examples.should.have.length(1);
  });

});
