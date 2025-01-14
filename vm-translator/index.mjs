import fs from 'fs';
import path from 'path';
import CodeWriter from './CodeWriter.mjs';
import Parser from './Parser.mjs';

const inputPath = process.argv[2];
if (!inputPath) {
  console.error('Укажите путь к .vm файлу или директории.');
  process.exit(1);
}

const outputPath = inputPath.endsWith('.vm')
  ? inputPath.replace('.vm', '.asm')
  : path.join(inputPath, `${path.basename(inputPath)}.asm`);

const files = inputPath.endsWith('.vm')
  ? [inputPath]
  : fs
      .readdirSync(inputPath)
      .filter((file) => file.endsWith('.vm'))
      .map((file) => path.join(inputPath, file));

const codeWriter = new CodeWriter(outputPath);

files.forEach((file) => {
  const parser = new Parser(file);
  codeWriter.setFileName(path.basename(file, '.vm'));

  while (parser.hasMoreCommands()) {
    parser.advance();
    const commandType = parser.commandType();

    switch (commandType) {
      case 'C_ARITHMETIC':
        codeWriter.writeArithmetic(parser.arg1());
        break;
      case 'C_PUSH':
      case 'C_POP':
        codeWriter.writePushPop(commandType, parser.arg1(), parser.arg2());
        break;
      case 'C_LABEL':
        codeWriter.writeLabel(parser.arg1());
        break;
      case 'C_GOTO':
        codeWriter.writeGoto(parser.arg1());
        break;
      case 'C_IF':
        codeWriter.writeIf(parser.arg1());
        break;
      case 'C_FUNCTION':
        codeWriter.writeFunction(parser.arg1(), parser.arg2());
        break;
      case 'C_CALL':
        codeWriter.writeCall(parser.arg1(), parser.arg2());
        break;
      case 'C_RETURN':
        codeWriter.writeReturn();
        break;
      default:
        throw new Error(`Неизвестный тип команды`);
    }
  }
});

codeWriter.close();
console.log(`Файл ${outputPath} успешно создан.`);
