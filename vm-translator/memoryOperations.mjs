const segmentsAddress = {
  local: 'LCL',
  argument: 'ARG',
  this: 'THIS',
  that: 'THAT',
  temp: '5',
};

function push(segment, i) {
  let result = '';

  switch (segment) {
    case 'local':
    case 'argument':
    case 'this':
    case 'that':
      result = getPushBase(segment, i);
      break;
    case 'constant':
      result = getPushConstant(i);
      break;
    case 'temp':
      result = getPushTemp(i);
      break;
    case 'pointer':
      result = getPushPointer(i);
      break;
    case 'static':
      result = getPushStatic(i);
      break;
  }

  return result;
}

function pop(segment, i) {
  let result = '';

  switch (segment) {
    case 'local':
    case 'argument':
    case 'this':
    case 'that':
      result = getPopBase(segment, i);
      break;
    case 'temp':
      result = getPopTemp(i);
      break;
    case 'pointer':
      result = getPopPointer(i);
      break;
    case 'static':
      result = getPopStatic(i);
      break;
  }

  return result;
}



function getPushBase(segment, i) {
  return `@${segmentsAddress[segment]}
D=M
@${i}
A=D+A
D=M
@SP
A=M
M=D
@SP
M=M+1`;
}

function getPushConstant(x) {
  return `@${x}
D=A
@SP
A=M
M=D
@SP
M=M+1`;
}

function getPushTemp(i) {
  return `@${segmentsAddress['temp']}
D=A
@${i}
A=D+A
D=M
@SP
A=M
M=D
@SP
M=M+1`;
}

function getPushPointer(i) {
  const pointer = i === '0' ? 'THIS' : 'THAT';

  return `@${pointer}
D=M
@SP
A=M
M=D
@SP
M=M+1`;
}

function getPushStatic(i) {
  return `@STATIC.${i}
D=M
@SP
A=M
M=D
@SP
M=M+1`;
}

function getPopBase(segment, i) {
  return `@${segmentsAddress[segment]}
D=M
@${i}
D=D+A
@R13
M=D
@SP
AM=M-1
D=M
@R13
A=M
M=D`;
}

function getPopTemp(i) {
  return `@${segmentsAddress['temp']}
D=A
@${i}
D=D+A
@R13
M=D
@SP
AM=M-1
D=M
@R13
A=M
M=D`;
}

function getPopPointer(i) {
  const pointer = i === '0' ? 'THIS' : 'THAT';

  return `@SP
AM=M-1
D=M
@${pointer}
M=D`;
}

function getPopStatic(i) {
  return `@SP
AM=M-1
D=M
@STATIC.${i}
M=D`;
}

export { push, pop };
