import { readFileSync, writeFileSync } from 'node:fs';
import getArithmeticOperations from './arithmeticOperations.mjs';
import { push, pop } from './memoryOperations.mjs';

const operations = getArithmeticOperations();

function readFile(filePath) {
  return readFileSync(filePath, 'utf8')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('//'));
}

function CodeWriter(instruction) {
  const isArithmeticInstruction =
    !instruction.startsWith('push') && !instruction.startsWith('pop');

  if (isArithmeticInstruction) {
    return operations[instruction]();
  }

  const [type, segment, i] = instruction.split(' ');

  if (type === 'push') {
    return push(segment, i);
  } else {
    return pop(segment, i);
  }
}

function VMTranslator(inputFile, outputFile) {
  const instructions = readFile(inputFile);
  const assemblyCode = instructions.map((instruction) => {
    return CodeWriter(instruction);
  });

  writeFileSync(outputFile, assemblyCode.join('\n'), 'utf8');
  console.log(`Файл ${outputFile} успешно создан.`);
}

VMTranslator('input.vm', 'output.asm');
