'use strict';

const Theme = require('../lib/theme');
const chalk = require('chalk');

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
      theme.renderCommandName('text')
        .should.equal(
          chalk.green.bold('text'));
    });

    it('should render description with red and underline', () => {
      theme.renderMainDescription('text')
        .should.equal(
          chalk.red.underline('text'));
    });

    it('should render example description with blue', () => {
      theme.renderExampleDescription('text')
        .should.equal(
          chalk.blue('text'));
    });

    it('should render example code with blue', () => {
      theme.renderExampleCode('text')
        .should.equal(
          chalk.bold('text'));
    });

    it('should render example argument with yellow, dim, underline', () => {
      theme.renderExampleToken('text')
        .should.equal(
          chalk.yellow.dim.underline('text'));
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
      theme.renderCommandName('text')
        .should.equal(
          chalk.greenBright.bold('text'));
    });

    it('should render description with greenBright and bold', () => {
      theme.renderMainDescription('text')
        .should.equal(
          chalk.greenBright.bold('text'));
    });

    it('should render example description with greenBright', () => {
      theme.renderExampleDescription('text')
        .should.equal(
          chalk.greenBright('text'));
    });

    it('should render example code with redBright', () => {
      theme.renderExampleCode('text')
        .should.equal(
          chalk.redBright('text'));
    });

    it('should render example argument with white', () => {
      theme.renderExampleToken('text')
        .should.equal(
          chalk.white('text'));
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
      theme.renderCommandName('text')
        .should.equal(
          chalk.greenBright.bold('text'));
    });

    it('should render description with greenBright and bold', () => {
      theme.renderMainDescription('text')
        .should.equal(
          chalk.greenBright.bold('text'));
    });

    it('should render example description with greenBright', () => {
      theme.renderExampleDescription('text')
        .should.equal(
          chalk.greenBright('text'));
    });

    it('should render example code with redBright', () => {
      theme.renderExampleCode('text')
        .should.equal(
          chalk.redBright('text'));
    });

    it('should render example arguments with magenta, white, and blue, for boolean, number, and string respectively', () => {
      theme.renderExampleToken('true')
        .should.equal(
          chalk.magenta('true'));
      theme.renderExampleToken('9')
        .should.equal(
          chalk.white('9'));
      theme.renderExampleToken('text')
        .should.equal(
          chalk.blue('text'));
    });
  });
});
