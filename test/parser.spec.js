'use strict';

const assert = require('node:assert/strict')
const { describe, it } = require('node:test');
const parser = require('../lib/parser');
const index = require('../lib/index');

describe('Parser', () => {
  it('parses the command name', () => {
    let page = parser.parse(
      '\n# tar'
    );
    assert.equal(page.name, 'tar');
  });

  it('parses the description', () => {
    let page = parser.parse(`
# tar
> archiving utility`
    );
    assert.equal(page.description, 'archiving utility');
  });

  it('can parse the description on multiple lines', () => {
    let page = parser.parse(`
# tar
> archiving utility
> with support for compression`
    );
    assert.equal(page.description, 'archiving utility\nwith support for compression');
  });

  it('can parse the homepage', () => {
    let page = parser.parse(`
# tar
> archiving utility
> Homepage: <https://www.gnu.org/software/tar/manual/tar.html>.`
    );
    assert.equal(page.description, 'archiving utility\nHomepage: https://www.gnu.org/software/tar/manual/tar.html.');
  });

  it('does not escape HTML entities', () => {
    let page = parser.parse(`
# tar
> compress & decompress`
    );
    assert.equal(page.description, 'compress & decompress');
  });

  it('parses example descriptions and codes', () => {
    let page = parser.parse(`
# tar
> archiving utility

- create an archive

\`tar cf {{file.tar}}\``
    );
    assert.equal(page.examples.length, 1);
    assert.equal(page.examples[0].description, 'create an archive');
    assert.equal(page.examples[0].code, 'tar cf {{file.tar}}');
  });

  it('does not escape HTML in the examples either', () => {
    let page = parser.parse(`
- this & that

\`cmd & data\``
    );
    assert.equal(page.examples.length, 1);
    assert.equal(page.examples[0].description, 'this & that');
    assert.equal(page.examples[0].code, 'cmd & data');
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
    assert.equal(page.examples.length, 2);
  });

  it('leaves out malformed examples', () => {
    let page = parser.parse(`
- example 1

\`cmd --foo\`

- example 2`
    );
    assert.equal(page.examples.length, 1);
  });

  it('should parse description with inline code', () => {
    let page = parser.parse(`
# uname
> See also \`lsb_release\``
    );
    assert.equal(page.description, 'See also lsb_release');
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
    assert.equal(page.examples[0].code, 'cmd1 --foo');
    assert.equal(page.examples[1].code, 'cmd2 --foo');
    assert.equal(page.examples[0].description, 'example 1, see inline_cmd1 for details');
    assert.equal(page.examples[1].description, 'example 2, see inline_cmd2 for details');
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
    assert.equal(page.examples[0].code, 'cat {{file1}} {{file2}} > {{target-file}}');
    assert.equal(page.examples[1].code, 'wc -l < {{users-file}}');
    assert.equal(page.examples[2].code, 'cat {{file}} >> {{target-file}}');
    assert.equal(page.examples[3].code, 'bc <<< "1 + 1"');
  });

  describe('See also section', () => {

    /** @param {import('node:test').TestContext} t */
    function mockFn(t) {
      t.mock.method(index, 'hasPage', (arg) => arg === 'lsb_release' || arg === 'ln');
    }

    it('should parse seeAlso commands when mentioned in description', (t) => {
      mockFn(t);
      let page = parser.parse(`
# uname
> See also \`lsb_release\`, \`mv\``
      );
      assert.deepEqual(page.seeAlso, ['lsb_release']);
    });

    it('should parse seeAlso commands when mentioned in examples', (t) => {
      mockFn(t);
      let page = parser.parse(`
# uname
> Description for uname

- example 1, see \`ln\` for details

\`cmd1 --foo\``
      );
      assert.deepEqual(page.seeAlso, ['ln']);
    });

    it('should have only unique seeAlso commands when mentioned a few times', (t) => {
      mockFn(t);
      let page = parser.parse(`
# uname
> Description for uname, see \`lsb_release\`, \`ln\`

- example 1, see \`ln\`, \`lsb_release\` for details

\`cmd1 --foo\`

- example 2, see \`ln\` for details

\`cmd1 --foo\``
      );
      assert.deepEqual(page.seeAlso, ['lsb_release', 'ln']);
    });
  });
});
