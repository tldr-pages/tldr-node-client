'use strict';

const { styleText } = require('node:util');
const assert = require('node:assert/strict')
const { describe, it } = require('node:test');
const Theme = require('../lib/theme');

describe('Theme', () => {

  describe('Rendering', () => {

    let theme = new Theme({
      commandName: 'green, bold',
      mainDescription: 'red, underline',
      exampleDescription: 'blue',
      exampleCode: 'bold',
      exampleToken: 'yellow,dim,underline'
    });

    it('should render name with green and bold', () => {
      assert.equal(theme.renderCommandName('text'), styleText(['green', 'bold'], 'text'));
    });

    it('should render description with red and underline', () => {
      assert.equal(theme.renderMainDescription('text'), styleText(['red', 'underline'], 'text'));
    });

    it('should render example description with blue', () => {
      assert.equal(theme.renderExampleDescription('text'), styleText('blue', 'text'));
    });

    it('should render example code with blue', () => {
      assert.equal(theme.renderExampleCode('text'), styleText('bold', 'text'));
    });

    it('should render example argument with yellow, dim, underline', () => {
      assert.equal(theme.renderExampleToken('text'), styleText(['yellow', 'dim', 'underline'], 'text'));
    });
  });

  describe('Rendering with new theme colors', () => {

    let theme = new Theme({
      commandName: 'greenBright, bold',
      mainDescription: 'greenBright, bold',
      exampleDescription: 'greenBright',
      exampleCode: 'redBright',
      exampleToken: 'white'
    });

    it('should render name with greenBright and bold', () => {
      assert.equal(theme.renderCommandName('text'), styleText(['greenBright', 'bold'], 'text'));
    });

    it('should render description with greenBright and bold', () => {
      assert.equal(theme.renderMainDescription('text'), styleText(['greenBright', 'bold'], 'text'));
    });

    it('should render example description with greenBright', () => {
      assert.equal(theme.renderExampleDescription('text'), styleText('greenBright', 'text'));
    });

    it('should render example code with redBright', () => {
      assert.equal(theme.renderExampleCode('text'), styleText('redBright', 'text'));
    });

    it('should render example argument with white', () => {
      assert.equal(theme.renderExampleToken('text'), styleText('white', 'text'));
    });
  });

  describe('Rendering with distinct colors for each token type', () => {

    let theme = new Theme({
      commandName: 'greenBright, bold',
      mainDescription: 'greenBright, bold',
      exampleDescription: 'greenBright',
      exampleCode: 'redBright',
      exampleBool: 'magenta',
      exampleNumber: 'white',
      exampleString: 'blue'
    });

    it('should render name with greenBright and bold', () => {
      assert.equal(theme.renderCommandName('text'), styleText(['greenBright', 'bold'], 'text'));
    });

    it('should render description with greenBright and bold', () => {
      assert.equal(theme.renderMainDescription('text'), styleText(['greenBright', 'bold'], 'text'));
    });

    it('should render example description with greenBright', () => {
      assert.equal(theme.renderExampleDescription('text'), styleText('greenBright', 'text'));
    });

    it('should render example code with redBright', () => {
      assert.equal(theme.renderExampleCode('text'), styleText('redBright', 'text'));
    });

    it('should render example arguments with magenta, white, and blue, for boolean, number, and string respectively', () => {
      assert.equal(theme.renderExampleToken('true'), styleText('magenta', 'true'));
      assert.equal(theme.renderExampleToken('9'), styleText('white', '9'));
      assert.equal(theme.renderExampleToken('text'), styleText('blue', 'text'));
    });
  });
});
