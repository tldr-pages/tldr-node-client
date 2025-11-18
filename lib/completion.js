'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const { UnsupportedShellError, CompletionScriptError } = require('./errors');

class Completion {
  constructor(shell) {
    this.supportedShells = ['bash', 'zsh'];
    if (!this.supportedShells.includes(shell)) {
      throw new UnsupportedShellError(shell, this.supportedShells);
    }
    this.shell = shell;
    this.rcFilename = shell === 'zsh' ? '.zshrc' : '.bashrc';
  }

  getFilePath() {
    const homeDir = os.homedir();
    return path.join(homeDir, this.rcFilename);
  }

  appendScript(script) {
    const rcFilePath = this.getFilePath();
    return new Promise((/** @type {(v?: never) => void} */ resolve, reject) => {
      fs.appendFile(rcFilePath, `\n${script}\n`, (err) => {
        if (err) {
          reject((new CompletionScriptError(`Error appending to ${rcFilePath}: ${err.message}`)));
        } else {
          console.log(`Completion script added to ${rcFilePath}`);
          console.log(`Please restart your shell or run 'source ~/${this.rcFilename}' to enable completions`);
          resolve();
        }
      });
    });
  }

  getScript() {
    return new Promise((resolve) => {
      if (this.shell === 'zsh') {
        resolve(this.getZshScript());
      } else if (this.shell === 'bash') {
        resolve(this.getBashScript());
      }
    });
  }

  getZshScript() {
    const completionDir = path.join(__dirname, '..', 'bin', 'completion', 'zsh');
    return `
# tldr zsh completion
fpath=(${completionDir} $fpath)

# You might need to force rebuild zcompdump:
# rm -f ~/.zcompdump; compinit

# If you're using oh-my-zsh, you can force reload of completions:
# autoload -U compinit && compinit

# Check if compinit is already loaded, if not, load it
if (( ! $+functions[compinit] )); then
  autoload -Uz compinit
  compinit -C
fi
    `.trim();
  }

  getBashScript() {
    return new Promise((resolve, reject) => {
      const scriptPath = path.join(__dirname, '..', 'bin', 'completion', 'bash', 'tldr');
      fs.readFile(scriptPath, 'utf8', (err, data) => {
        if (err) {
          reject(new CompletionScriptError(`Error reading bash completion script: ${err.message}`));
        } else {
          resolve(data);
        }
      });
    });
  }
}

module.exports = Completion;
