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

  it('should parse description with inline code', function() {
    var page = parser.parse(
      '\n# uname' +
      '\n> See also `lsb_release`'
    );
    page.description.should.eql('See also lsb_release');
  });

  it('should parse examples with inline code', function() {
    var page = parser.parse(
      '\n# uname' +
      '\n> See also' +
      '\n' +
      '\n- example 1, see `inline_cmd1` for details' +
      '\n' +
      '\n`cmd1 --foo`' +
      '\n' +
      '\n- example 2, see `inline_cmd2` for details' +
      '\n' +
      '\n`cmd2 --foo`'
    );
    page.examples[0].description.should.eql('example 1, see inline_cmd1 for details');
    page.examples[1].description.should.eql('example 2, see inline_cmd2 for details');
  });

  it('should parse code examples with unix redirects ">", "<", ">>" and "<<<"', function() {
    var page = parser.parse(
      '\n- Concatenate several files into the target file.' +
      '\n' +
      '\n`cat {{file1}} {{file2}} > {{target-file}}`' +
      '\n' +
      '\n- Concatenate several files into the target file.' +
      '\n' +
      '\n`wc -l < {{users-file}}`' +
      '\n' +
      '\n- Output one file into the target file.' +
      '\n' +
      '\n`cat {{file}} >> {{target-file}}`' +
      '\n' +
      '\n- Calculate the result of expression' +
      '\n' +
      '\n`bc <<< "1 + 1"`'
    );
    page.examples[0].code.should.eql('cat {{file1}} {{file2}} > {{target-file}}');
    page.examples[1].code.should.eql('wc -l < {{users-file}}');
    page.examples[2].code.should.eql('cat {{file}} >> {{target-file}}');
    page.examples[3].code.should.eql('bc <<< "1 + 1"');
  });

});
