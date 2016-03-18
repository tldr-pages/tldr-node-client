var Theme = require('../lib/theme');
var chalk = require('chalk');

describe('Theme', function() {

  describe('Redering', function() {

    var theme = new Theme({
      name: 'green, bold',
      description: 'red, underline',
      exampleDescription: 'blue',
      exampleCode: 'bold',
      exampleArgument: 'yellow,dim,underline'
    });

    it('should render name with green and bold', function () {
      theme.renderName('text')
        .should.equal(
          chalk.green.bold('text'));
    });

    it('should render description with red and underline', function () {
      theme.renderDescription('text')
        .should.equal(
          chalk.red.underline('text'));
    });

    it('should render example description with blue', function() {
      theme.renderExampleDescription('text')
        .should.equal(
          chalk.blue('text'));
    });

    it('should render example code with blue', function() {
      theme.renderExampleCode('text')
        .should.equal(
          chalk.bold('text'));
    });

    it('should render example argument with yellow, dim, underline', function() {
      theme.renderExampleArgument('text')
        .should.equal(
          chalk.yellow.dim.underline('text'));
    });
  });
});
