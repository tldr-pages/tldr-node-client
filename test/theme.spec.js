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
});
