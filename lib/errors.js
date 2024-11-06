'use strict';

class TldrError extends Error {
  constructor(message) {
    super(message);
    this.name = 'TldrError';
  }

  static isTldrError(err) {
    return err instanceof this;
  }
}

class EmptyCacheError extends TldrError {
  constructor() {
    super(trim`
Local cache is empty
Please run tldr --update
    `);
    this.name = 'EmptyCacheError';
     
    this.code = 2;
  }
}

class MissingPageError extends TldrError {
  constructor(repo) {
    super(trim`
Page not found.
If you want to contribute it, feel free to send a pull request to: ${repo}
    `);
    this.name = 'MissingPageError';
     
    this.code = 3;
  }
}

class MissingRenderPathError extends TldrError {
  constructor() {
    super('Option --render needs an argument.');
    this.name = 'MissingRenderPathError';
     
    this.code = 4;
  }
}

class UnsupportedShellError extends TldrError {
  constructor(shell, supportedShells) {
    super(`Unsupported shell: ${shell}. Supported shells are: ${supportedShells.join(', ')}`);
    this.name = 'UnsupportedShellError';
     
    this.code = 5;
  }
}

class CompletionScriptError extends TldrError {
  constructor(message) {
    super(message);
    this.name = 'CompletionScriptError';
     
    this.code = 6;
  }
}

module.exports = {
  TldrError,
  EmptyCacheError,
  MissingPageError,
  MissingRenderPathError,
  UnsupportedShellError,
  CompletionScriptError
};

function trim(strings, ...values) {
  let output = values.reduce((acc, value, i) => {
    return acc + strings[i] + value;
  }, '') + strings[values.length];
  return output.trim();
}
