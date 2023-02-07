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
    // eslint-disable-next-line no-magic-numbers
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
    // eslint-disable-next-line no-magic-numbers
    this.code = 3;
  }
}

class MissingRenderPathError extends TldrError {
  constructor() {
    super('Option --render needs an argument.');
    this.name = 'MissingRenderPathError';
    // eslint-disable-next-line no-magic-numbers
    this.code = 4;
  }
}

module.exports = {
  TldrError,
  EmptyCacheError,
  MissingPageError,
  MissingRenderPathError
};

function trim(strings, ...values) {
  let output = values.reduce((acc, value, i) => {
    return acc + strings[i] + value;
  }, '') + strings[values.length];
  return output.trim();
}
