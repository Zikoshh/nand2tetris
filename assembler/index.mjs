import { readFileSync, writeFileSync } from 'node:fs';
import { compMap, destMap, jumpMap } from './constants.mjs';

let labelsCounter = 0;
let nextVariableAddress = 16;
const symbolTable = {
  SP: 0,
  LCL: 1,
  ARG: 2,
  THIS: 3,
  THAT: 4,
  SCREEN: 16384,
  KBD: 24576,
};
for (let i = 0; i <= 15; i++) {
  symbolTable[`R${i}`] = i;
}

// Чтение файла
function readFile(filePath) {
  return readFileSync(filePath, 'utf8')
    .split('\n')
    .map((line) => line.trim());
}

// Удаление комментариев и пустых строк
function cleanCode(lines) {
  const cleaned = lines
    .map((line) => line.split('//')[0].trim())
    .filter((line) => line.length > 0);

  declareLabels(cleaned);

  return cleaned.filter((line) => !line.startsWith('(')); // Удаление лейблов
}

// Обьявление лейблов
function declareLabels(lines) {
  lines.forEach((line, i) => {
    if (line.startsWith('(')) {
      const cleanedLabel = line.replace(/[()]/g, '');
      symbolTable[cleanedLabel] = i - labelsCounter;
      labelsCounter++;
    }
  });
}

// Преобразование A-команд
function handleACommand(command) {
  const value = command.slice(1); // Убираем "@"
  let address;
  if (isNaN(value)) {
    if (value in symbolTable) {
      address = symbolTable[value];
    } else {
      symbolTable[value] = nextVariableAddress;
      nextVariableAddress++;
      address = symbolTable[value];
    }
  } else {
    address = parseInt(value, 10);
  }
  return address.toString(2).padStart(16, '0');
}

// Преобразование C-команд
function handleCCommand(command) {
  const [destComp, jump] = command.split(';');
  const [dest, comp] = destComp.includes('=')
    ? destComp.split('=')
    : [null, destComp];

  return `111${compMap[comp] || '0000000'}${destMap[dest] || '000'}${
    jumpMap[jump] || '000'
  }`;
}

// Основная логика
function assemble(inputFile, outputFile) {
  const lines = readFile(inputFile);
  const cleaned = cleanCode(lines);

  const binaryCode = cleaned.map((line) => {
    if (line.startsWith('@')) {
      return handleACommand(line);
    } else {
      return handleCCommand(line);
    }
  });

  writeFileSync(outputFile, binaryCode.join('\n'), 'utf8');
  console.log(`Файл ${outputFile} успешно создан.`);
}

// Запуск ассемблера
assemble('input.asm', 'output.hack');
