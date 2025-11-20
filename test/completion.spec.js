'use strict';

const assert = require('node:assert/strict')
const { describe, it } = require('node:test');
const Completion = require('../lib/completion');
const { UnsupportedShellError, CompletionScriptError } = require('../lib/errors');
const fs = require('fs');
const os = require('os');
const path = require('path');

describe('Completion', () => {
  const zshrcPath = path.join(os.homedir(), '.zshrc');
  const bashrcPath = path.join(os.homedir(), '.bashrc');

  describe('constructor()', () => {
    it('should construct with supported shell', () => {
      const completion = new Completion('zsh');
      assert.equal(!!completion, true);
      assert.equal(completion.shell, 'zsh');
      assert.equal(completion.rcFilename, '.zshrc');
    });

    it('should throw UnsupportedShellError for unsupported shell', () => {
      assert.throws(() => {return new Completion('fish')}, UnsupportedShellError);
    });
  });

  describe('getFilePath()', () => {
    it('should return .zshrc path for zsh', () => {
      const completion = new Completion('zsh');
      assert.equal(completion.getFilePath(), zshrcPath);
    });

    it('should return .bashrc path for bash', () => {
      const completion = new Completion('bash');
      assert.equal(completion.getFilePath(), bashrcPath);
    });
  });

  describe('appendScript()', () => {
    it('should append script to file', (t) => {
      const appendFile = t.mock.method(fs, 'appendFile', (_, __, callback) => callback(null));
      const completion = new Completion('zsh');
      return completion.appendScript('test script')
        .then(() => {
          assert.equal(appendFile.mock.callCount(), 1);
          assert.equal(appendFile.mock.calls[0].arguments[0], zshrcPath);
          assert.equal(appendFile.mock.calls[0].arguments[1], '\ntest script\n');
        });
    });

    it('should reject with CompletionScriptError on fs error', (t) => {
      t.mock.method(fs, 'appendFile', (_, __, callback) => callback(new Error('File write error')));
      const completion = new Completion('zsh');
      assert.rejects(() => completion.appendScript('test script'), CompletionScriptError);
    });
  });

  describe('getScript()', () => {
    it('should return zsh script for zsh shell', () => {
      const completion = new Completion('zsh');
      return completion.getScript()
        .then((script) => {
          assert.match(script, /# tldr zsh completion/);
          assert.match(script, /fpath=\(/);
        });
    });

    it('should return bash script for bash shell', (t) => {
      const completion = new Completion('bash');
      t.mock.method(fs, 'readFile', (_, __, callback) => callback(null, '# bash completion script'));

      return completion.getScript()
        .then((script) => {
          assert.equal(script, '# bash completion script');
        });
    });
  });

  describe('getZshScript()', () => {
    it('should return zsh completion script', () => {
      const completion = new Completion('zsh');
      const script = completion.getZshScript();
      assert.match(script, /# tldr zsh completion/);
      assert.match(script, /fpath=\(/);
      assert.match(script, /compinit/);
    });
  });

  describe('getBashScript()', () => {
    it('should return bash completion script', (t) => {
      const completion = new Completion('bash');
      t.mock.method(fs, 'readFile', (_, __, callback) => callback(null, '# bash completion script'));

      return completion.getBashScript()
        .then((script) => {
          assert.equal(script, '# bash completion script');
        });
    });

    it('should reject with CompletionScriptError on fs error', async (t) => {
      const completion = new Completion('bash');
      t.mock.method(fs, 'readFile', (_, __, callback) => callback(new Error('File read error')));

      assert.rejects(() => completion.getBashScript(), CompletionScriptError);
    });
  });
});
