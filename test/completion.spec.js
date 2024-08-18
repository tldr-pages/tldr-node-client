'use strict';

const Completion = require('../lib/completion');
const { UnsupportedShellError, CompletionScriptError } = require('../lib/errors');
const sinon = require('sinon');
const fs = require('fs');
const os = require('os');
const should = require('should');

describe('Completion', () => {
  describe('constructor()', () => {
    it('should construct with supported shell', () => {
      const completion = new Completion('zsh');
      should.exist(completion);
      completion.shell.should.equal('zsh');
      completion.rcFilename.should.equal('.zshrc');
    });

    it('should throw UnsupportedShellError for unsupported shell', () => {
      (() => {return new Completion('fish');}).should.throw(UnsupportedShellError);
    });
  });

  describe('getFilePath()', () => {
    let homeStub;

    beforeEach(() => {
      homeStub = sinon.stub(os, 'homedir').returns('/home/user');
    });

    afterEach(() => {
      homeStub.restore();
    });

    it('should return .zshrc path for zsh', () => {
      const completion = new Completion('zsh');
      completion.getFilePath().should.equal('/home/user/.zshrc');
    });

    it('should return .bashrc path for bash', () => {
      const completion = new Completion('bash');
      completion.getFilePath().should.equal('/home/user/.bashrc');
    });
  });

  describe('appendScript()', () => {
    let appendFileStub;
    let getFilePathStub;

    beforeEach(() => {
      appendFileStub = sinon.stub(fs, 'appendFile').yields(null);
      getFilePathStub = sinon.stub(Completion.prototype, 'getFilePath').returns('/home/user/.zshrc');
    });

    afterEach(() => {
      appendFileStub.restore();
      getFilePathStub.restore();
    });

    it('should append script to file', () => {
      const completion = new Completion('zsh');
      return completion.appendScript('test script')
        .then(() => {
          appendFileStub.calledOnce.should.be.true();
          appendFileStub.firstCall.args[0].should.equal('/home/user/.zshrc');
          appendFileStub.firstCall.args[1].should.equal('\ntest script\n');
        });
    });

    it('should reject with CompletionScriptError on fs error', () => {
      const completion = new Completion('zsh');
      appendFileStub.yields(new Error('File write error'));
      return completion.appendScript('test script')
        .should.be.rejectedWith(CompletionScriptError);
    });
  });

  describe('getScript()', () => {
    it('should return zsh script for zsh shell', () => {
      const completion = new Completion('zsh');
      return completion.getScript()
        .then((script) => {
          script.should.containEql('# tldr zsh completion');
          script.should.containEql('fpath=(');
        });
    });

    it('should return bash script for bash shell', () => {
      const completion = new Completion('bash');
      const readFileStub = sinon.stub(fs, 'readFile').yields(null, '# bash completion script');

      return completion.getScript()
        .then((script) => {
          script.should.equal('# bash completion script');
          readFileStub.restore();
        });
    });
  });

  describe('getZshScript()', () => {
    it('should return zsh completion script', () => {
      const completion = new Completion('zsh');
      const script = completion.getZshScript();
      script.should.containEql('# tldr zsh completion');
      script.should.containEql('fpath=(');
      script.should.containEql('compinit');
    });
  });

  describe('getBashScript()', () => {
    let readFileStub;

    beforeEach(() => {
      readFileStub = sinon.stub(fs, 'readFile');
    });

    afterEach(() => {
      readFileStub.restore();
    });

    it('should return bash completion script', () => {
      const completion = new Completion('bash');
      readFileStub.yields(null, '# bash completion script');

      return completion.getBashScript()
        .then((script) => {
          script.should.equal('# bash completion script');
        });
    });

    it('should reject with CompletionScriptError on fs error', () => {
      const completion = new Completion('bash');
      readFileStub.yields(new Error('File read error'));

      return completion.getBashScript()
        .should.be.rejectedWith(CompletionScriptError);
    });
  });
});