'use strict';

process.env.NODE_ENV = 'test';

const sinon = require('sinon');

beforeEach(() => {
  sinon.stub(console);
});

afterEach(() => {
  sinon.restore();
});
