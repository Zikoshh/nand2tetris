import fs from 'fs';

class Parser {
  constructor(filePath) {
    this.commands = fs
      .readFileSync(filePath, 'utf-8')
      .split('\n')
      .map((line) => line.replace(/\/\/.*$/, '').trim())
      .filter((line) => line.length > 0);
    this.currentCommand = null;
    this.currentIndex = 0;
  }

  hasMoreCommands() {
    return this.currentIndex < this.commands.length;
  }

  advance() {
    if (this.hasMoreCommands()) {
      this.currentCommand = this.commands[this.currentIndex];
      this.currentIndex++;
    }
  }

  commandType() {
    if (this.currentCommand.startsWith('push')) return 'C_PUSH';
    if (this.currentCommand.startsWith('pop')) return 'C_POP';
    if (this.currentCommand.startsWith('label')) return 'C_LABEL';
    if (this.currentCommand.startsWith('goto')) return 'C_GOTO';
    if (this.currentCommand.startsWith('if-goto')) return 'C_IF';
    if (this.currentCommand.startsWith('function')) return 'C_FUNCTION';
    if (this.currentCommand.startsWith('call')) return 'C_CALL';
    if (this.currentCommand.startsWith('return')) return 'C_RETURN';
    return 'C_ARITHMETIC';
  }

  arg1() {
    if (this.commandType() === 'C_ARITHMETIC') {
      return this.currentCommand;
    }
    return this.currentCommand.split(' ')[1];
  }

  arg2() {
    return parseInt(this.currentCommand.split(' ')[2], 10);
  }
}

export default Parser;
