import fs from 'fs';

class Parser {
  constructor(filePath) {
    this.commands = fs
      .readFileSync(filePath, 'utf-8')
      .split('\n')
      .map((line) => line.replace(/\/\/.*$/, '').trim())
      .filter((line) => line.length > 0);
    this.currentCommand = null;
    this.currentIndex = -1;
  }

  hasMoreCommands() {
    return this.currentIndex < this.commands.length - 1;
  }

  advance() {
    if (this.hasMoreCommands()) {
      this.currentIndex++;
      this.currentCommand = this.commands[this.currentIndex];
    }
  }

  commandType() {
    if (/^(add|sub|neg|eq|gt|lt|and|or|not)$/.test(this.currentCommand)) {
      return 'C_ARITHMETIC';
    } else if (/^push/.test(this.currentCommand)) {
      return 'C_PUSH';
    } else if (/^pop/.test(this.currentCommand)) {
      return 'C_POP';
    } else if (/^label/.test(this.currentCommand)) {
      return 'C_LABEL';
    } else if (/^goto/.test(this.currentCommand)) {
      return 'C_GOTO';
    } else if (/^if-goto/.test(this.currentCommand)) {
      return 'C_IF';
    } else if (/^function/.test(this.currentCommand)) {
      return 'C_FUNCTION';
    } else if (/^call/.test(this.currentCommand)) {
      return 'C_CALL';
    } else if (/^return/.test(this.currentCommand)) {
      return 'C_RETURN';
    }
  }

  arg1() {
    if (this.commandType() === 'C_ARITHMETIC') {
      return this.currentCommand;
    }
    return this.currentCommand.split(' ')[1];
  }

  arg2() {
    let cType = this.commandType();
    if (['C_PUSH', 'C_POP', 'C_FUNCTION', 'C_CALL'].includes(cType)) {
      return parseInt(this.currentCommand.split(' ')[2], 10);
    }
  }
}

module.exports = Parser;
