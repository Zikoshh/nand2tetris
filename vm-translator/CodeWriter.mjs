import fs from 'fs';

class CodeWriter {
  constructor(outputPath) {
    this.outputPath = outputPath;
    this.output = [];
    this.currentFunction = '';
    this.labelCounter = 0;
    this.segmentsAddress = {
      local: 'LCL',
      argument: 'ARG',
      this: 'THIS',
      that: 'THAT',
      temp: '5',
    };
  }

  setFileName(fileName) {
    this.fileName = fileName;
  }

  writeArithmetic(command) {
    const commands = {
      add: () => '@SP\nAM=M-1\nD=M\nA=A-1\nM=M+D',
      sub: () => '@SP\nAM=M-1\nD=M\nA=A-1\nM=M-D',
      neg: () => '@SP\nA=M-1\nM=-M',
      eq: () => {
        const trueLabel = `TRUE_${this.labelCounter}`;
        const endLabel = `END_${this.labelCounter}`;
        this.labelCounter++;

        return `@SP\nAM=M-1\nD=M\nA=A-1\nD=M-D\n@${trueLabel}\nD;JEQ\n@SP\nA=M-1\nM=0\n@${endLabel}\n0;JMP\n(${trueLabel})\n@SP\nA=M-1\n(${endLabel})`;
      },
      gt: () => {
        const trueLabel = `TRUE_${this.labelCounter}`;
        const endLabel = `END_${this.labelCounter}`;
        this.labelCounter++;

        return `@SP\nAM=M-1\nD=M\nA=A-1\nD=M-D\n@${trueLabel}\nD;JGT\n@SP\nA=M-1\nM=0\n@${endLabel}\n0;JMP\n(${trueLabel})\n@SP\nA=M-1\nM=-1\n(${endLabel})`;
      },
      lt: () => {
        const trueLabel = `TRUE_${this.labelCounter}`;
        const endLabel = `END_${this.labelCounter}`;
        this.labelCounter++;

        return `@SP\nAM=M-1\nD=M\nA=A-1\nD=M-D\n@${trueLabel}\nD;JLT\n@SP\nA=M-1\nM=0\n@${endLabel}\n0;JMP\n(${trueLabel})\n@SP\nA=M-1\nM=-1\n(${endLabel})`;
      },
      and: () => `@SP\nAM=M-1\nD=M\nA=A-1\nM=D&M`,
      or: () => `@SP\nAM=M-1\nD=M\nA=A-1\nM=D|M`,
      not: () => `@SP\nA=M-1\nM=!M`,
    };

    this.output.push(commands[command]());
  }

  writePushPop(commandType, segment, i) {
    switch (commandType) {
      case 'C_PUSH':
        switch (segment) {
          case 'constant':
            this.output.push(`@${i}\nD=A\n@SP\nA=M\nM=D\n@SP\nM=M+1`);
            break;
          case 'local':
          case 'argument':
          case 'this':
          case 'that':
            this.output.push(
              `@${this.segmentsAddress[segment]}\nD=M\nn@${i}\nA=D+A\nD=M\nn@SP\nA=M\nM=D\n@SP\nM=M+1`
            );
            break;
          case 'temp':
            this.output.push(
              `@${this.segmentsAddress[segment]}\nD=A\nn@${i}\nA=D+A\nD=M\n@SP\nA=M\nM=D\n@SP\nM=M+1`
            );
            break;
          case 'pointer':
            this.output.push(
              `@${i === '0' ? 'THIS' : 'THAT'}\nD=M\n@SP\nA=M\nM=D\n@SP\nM=M+1`
            );
            break;
          case 'static':
            this.output.push(
              `@${this.fileName + '.' + i}\nD=M\n@SP\nA=M\nM=D\n@SP\nM=M+1`
            );
            break;
        }
        break;
      case 'C_POP':
        switch (segment) {
          case 'local':
          case 'argument':
          case 'this':
          case 'that':
            this.output.push(
              `@${this.segmentsAddress[segment]}\nD=M\n@${i}\nD=D+A\n@R13\nM=D\n@SP\nAM=M-1\nD=M\n@R13\nA=M\nM=D`
            );
            break;
          case 'temp':
            this.output.push(
              `@${this.segmentsAddress[segment]}\nD=A\n@${i}\nD=D+A\n@R13\nM=D\n@SP\nAM=M-1\nD=M\n@R13\nA=M\nM=D`
            );
            break;
          case 'pointer':
            this.output.push(
              `@SP\nAM=M-1\nD=M\n@${i === '0' ? 'THIS' : 'THAT'}\nM=D`
            );
            break;
          case 'static':
            this.output.push(
              `@SP\nAM=M-1\nD=M\n@${this.fileName + '.' + i}\nM=D`
            );
            break;
        }
        break;
    }
  }

  writeLabel() {

  }

  writeGoto() {
    
  }

  writeIf() {
    
  }

  writeFunction() {
    
  }

  writeCall() {
    
  }

  writeReturn() {
    
  }

  writeToFile() {
    fs.writeFileSync(this.outputPath, this.output.join('\n'), 'utf-8');
  }

  close() {
    this.writeToFile();
  }
}

export default CodeWriter;
