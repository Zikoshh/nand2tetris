function getArithmeticOperations() {
  let labelCounter = 0;

  function add() {
    return `@SP
AM=M-1
D=M
A=A-1
M=D+M`;
  }

  function sub() {
    return `@SP
AM=M-1
D=M
A=A-1
M=M-D`;
  }

  function neg() {
    return `@SP
A=M-1
M=-M`;
  }

  function eq() {
    const trueLabel = `TRUE_${labelCounter}`;
    const endLabel = `END_${labelCounter}`;
    labelCounter++;

    return `@SP
AM=M-1
D=M
A=A-1
D=M-D
@${trueLabel}
D;JEQ
@SP
A=M-1
M=0
@${endLabel}
0;JMP
(${trueLabel})
@SP
A=M-1
M=-1
(${endLabel})`;
  }

  function gt() {
    const trueLabel = `TRUE_${labelCounter}`;
    const endLabel = `END_${labelCounter}`;
    labelCounter++;

    return `@SP
AM=M-1
D=M
A=A-1
D=M-D
@${trueLabel}
D;JGT
@SP
A=M-1
M=0
@${endLabel}
0;JMP
(${trueLabel})
@SP
A=M-1
M=-1
(${endLabel})`;
  }

  function lt() {
    const trueLabel = `TRUE_${labelCounter}`;
    const endLabel = `END_${labelCounter}`;
    labelCounter++;

    return `@SP
AM=M-1
D=M
A=A-1
D=M-D
@${trueLabel}
D;JLT
@SP
A=M-1
M=0
@${endLabel}
0;JMP
(${trueLabel})
@SP
A=M-1
M=-1
(${endLabel})`;
  }

  function and() {
    return `@SP
AM=M-1
D=M
A=A-1
M=D&M`;
  }

  function or() {
    return `@SP
AM=M-1
D=M
A=A-1
M=D|M`;
  }

  function not() {
    return `@SP
A=M-1
M=!M`;
  }

  return {
    add,
    sub,
    neg,
    eq,
    gt,
    lt,
    and,
    or,
    not,
  };
}

export default getArithmeticOperations;
