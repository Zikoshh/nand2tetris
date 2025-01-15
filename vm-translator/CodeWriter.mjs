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
      add: () => '@SP\nAM=M-1\nD=M\nA=A-1\nM=D+M',
      sub: () => '@SP\nAM=M-1\nD=M\nA=A-1\nM=D-M',
      neg: () => '@SP\nA=M-1\nM=-M',
      eq: () => {
        const trueLabel = `TRUE_${this.labelCounter}`;
        const endLabel = `END_${this.labelCounter}`;
        this.labelCounter++;

        return `@SP\nAM=M-1\nD=M\nA=A-1\nD=D-M\n@${trueLabel}\nD;JEQ\n@SP\nA=M-1\nM=0\n@${endLabel}\n0;JMP\n(${trueLabel})\n@SP\nA=M-1\n(${endLabel})`;
      },
      gt: () => {
        const trueLabel = `TRUE_${this.labelCounter}`;
        const endLabel = `END_${this.labelCounter}`;
        this.labelCounter++;

        return `@SP\nAM=M-1\nD=M\nA=A-1\nD=D-M\n@${trueLabel}\nD;JGT\n@SP\nA=M-1\nM=0\n@${endLabel}\n0;JMP\n(${trueLabel})\n@SP\nA=M-1\nM=-1\n(${endLabel})`;
      },
      lt: () => {
        const trueLabel = `TRUE_${this.labelCounter}`;
        const endLabel = `END_${this.labelCounter}`;
        this.labelCounter++;

        return `@SP\nAM=M-1\nD=M\nA=A-1\nD=D-M\n@${trueLabel}\nD;JLT\n@SP\nA=M-1\nM=0\n@${endLabel}\n0;JMP\n(${trueLabel})\n@SP\nA=M-1\nM=-1\n(${endLabel})`;
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
              `@${this.segmentsAddress[segment]}\nD=M\n@${i}\nA=D+A\nD=M\n@SP\nA=M\nM=D\n@SP\nM=M+1`
            );
            break;
          case 'temp':
            this.output.push(
              `@${this.segmentsAddress[segment]}\nD=A\n@${i}\nA=D+A\nD=M\n@SP\nA=M\nM=D\n@SP\nM=M+1`
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

  writeLabel(labelName) {
    const fullLabel = this.currentFunction
      ? `${this.currentFunction}$${labelName}`
      : labelName;
    this.output.push(`(${fullLabel})`);
  }

  writeGoto(labelName) {
    const fullLabel = this.currentFunction
      ? `${this.currentFunction}$${labelName}`
      : labelName;
    this.output.push(`@${fullLabel}\n0;JMP`);
  }

  writeIf(labelName) {
    const fullLabel = this.currentFunction
      ? `${this.currentFunction}$${labelName}`
      : labelName;
    this.output.push(`@SP\nAM=M-1\nD=M\n@${fullLabel}\nD;JNE`);
  }

  writeFunction(functionName, numLocals) {
    this.currentFunction = functionName;
    this.output.push(`(${functionName})`);
    for (let i = 0; i < numLocals; i++) {
      this.output.push('@SP\nA=M\nM=0\n@SP\nM=M+1');
    }
  }

  writeCall(functionName, nArgs) {
    const returnLabel = `${functionName}$ret.${this.labelCounter++}`;

    this.output.push(
      `@${returnLabel}\nD=A\n@SP\nA=M\nM=D\n@SP\nM=M+1`,
      `@LCL\nD=M\n@SP\nA=M\nM=D\n@SP\nM=M+1`,
      `@ARG\nD=M\n@SP\nA=M\nM=D\n@SP\nM=M+1`,
      `@THIS\nD=M\n@SP\nA=M\nM=D\n@SP\nM=M+1`,
      `@THAT\nD=M\n@SP\nA=M\nM=D\n@SP\nM=M+1`,
      `@SP\nD=M\n@${5 + nArgs}\nD=D-A\n@ARG\nM=D`,
      `@SP\nD=M\n@LCL\nM=D`,
      `@${functionName}\n0;JMP`,
      `(${returnLabel})`
    );
  }

  writeReturn() {
    this.output.push(
      `@LCL\nD=M\n@R13\nM=D`,
      `@5\nA=D-A\nD=M\n@R14\nM=D`,
      `@SP\nAM=M-1\nD=M\n@ARG\nA=M\nM=D`,
      `@ARG\nD=M+1\n@SP\nM=D`,
      `@R13\nAM=M-1\nD=M\n@THAT\nM=D`,
      `@R13\nAM=M-1\nD=M\n@THIS\nM=D`,
      `@R13\nAM=M-1\nD=M\n@ARG\nM=D`,
      `@R13\nAM=M-1\nD=M\n@LCL\nM=D`,
      `@R14\nA=M\n0;JMP`
    );
  }

  writeToFile() {
    fs.writeFileSync(this.outputPath, this.output.join('\n'), 'utf-8');
  }

  close() {
    this.writeToFile();
  }
}

export default CodeWriter;
