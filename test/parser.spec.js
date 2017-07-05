'use strict';

const parser = require('../lib/parser');
const sinon = require('sinon');
const index = require('../lib/index');

describe('Parser', () => {
  it('parses the command name', () => {
    let page = parser.parse(
      '\n# tar'
    );
    page.name.should.eql('tar');
  });

  it('parses the description', () => {
    let page = parser.parse(`
# tar
> archiving utility`
    );
    page.description.should.eql('archiving utility');
  });

  it('can parse the description on multiple lines', () => {
    let page = parser.parse(`
# tar
> archiving utility
> with support for compression`
    );
    page.description.should.eql('archiving utility\nwith support for compression');
  });

  it('does not escape HTML entities', () => {
    let page = parser.parse(`
# tar
> compress & decompress`
    );
    page.description.should.eql('compress & decompress');
  });

  it('parses example descriptions and codes', () => {
    let page = parser.parse(`
# tar
> archiving utility

- create an archive

\`tar cf {{file.tar}}\``
    );
    page.examples.should.have.length(1);
    page.examples[0].description.should.eql('create an archive');
    page.examples[0].code.should.eql('tar cf {{file.tar}}');
  });

  it('does not escape HTML in the examples either', () => {
    let page = parser.parse(`
- this & that

\`cmd & data\``
    );
    page.examples.should.have.length(1);
    page.examples[0].description.should.eql('this & that');
    page.examples[0].code.should.eql('cmd & data');
  });

  it('parses all the examples', () => {
    let page = parser.parse(`
# tar
> archiving utility

- create an archive

\`tar cf {{file.tar}}\`

- extract an archive

\`tar xf {{file}}\``
    );
    page.examples.should.have.length(2);
  });

  it('leaves out malformed examples', () => {
    let page = parser.parse(`
- example 1

\`cmd --foo\`

- example 2`
    );
    page.examples.should.have.length(1);
  });

  it('should parse description with inline code', () => {
    let page = parser.parse(`
# uname
> See also \`lsb_release\``
    );
    page.description.should.eql('See also lsb_release');
  });

  it('should parse examples with inline code', () => {
    let page = parser.parse(`
# uname
> See also

- example 1, see \`inline_cmd1\` for details

\`cmd1 --foo\`

- example 2, see \`inline_cmd2\` for details

\`cmd2 --foo\``
    );
    page.examples[0].code.should.eql('cmd1 --foo');
    page.examples[1].code.should.eql('cmd2 --foo');
    page.examples[0].description.should.eql('example 1, see inline_cmd1 for details');
    page.examples[1].description.should.eql('example 2, see inline_cmd2 for details');
  });

  it('should parse code examples with unix redirects ">", "<", ">>" and "<<<"', () => {
    let page = parser.parse(`
- Concatenate several files into the target file.

\`cat {{file1}} {{file2}} > {{target-file}}\`

- Concatenate several files into the target file.

\`wc -l < {{users-file}}\`

- Output one file into the target file.

\`cat {{file}} >> {{target-file}}\`

- Calculate the result of expression

\`bc <<< "1 + 1"\``
    );
    page.examples[0].code.should.eql('cat {{file1}} {{file2}} > {{target-file}}');
    page.examples[1].code.should.eql('wc -l < {{users-file}}');
    page.examples[2].code.should.eql('cat {{file}} >> {{target-file}}');
    page.examples[3].code.should.eql('bc <<< "1 + 1"');
  });

  describe('See also section', () => {

    beforeEach(() => {
      let hasPage = sinon.stub(index, 'hasPage');
      hasPage.withArgs('lsb_release').returns(true);
      hasPage.withArgs('ln').returns(true);
      hasPage.withArgs('cp').returns(false);
      hasPage.withArgs('mv').returns(false);
    });

    afterEach(() => {
      index.hasPage.restore();
    });

    it('should parse seeAlso commands when mentioned in description', () => {
      let page = parser.parse(`
# uname
> See also \`lsb_release\`, \`mv\``
      );
      page.seeAlso.should.eql(['lsb_release']);
    });

    it('should parse seeAlso commands when mentioned in examples', () => {
      let page = parser.parse(`
# uname
> Description for uname

- example 1, see \`ln\` for details

\`cmd1 --foo\``
      );
      page.seeAlso.should.eql(['ln']);
    });

    it('should have only unique seeAlso commands when mentioned a few times', () => {
      let page = parser.parse(`
# uname
> Description for uname, see \`lsb_release\`, \`ln\`

- example 1, see \`ln\`, \`lsb_release\` for details

\`cmd1 --foo\`

- example 2, see \`ln\` for details

\`cmd1 --foo\``
      );
      page.seeAlso.should.eql(['lsb_release', 'ln']);
    });
  });
});
