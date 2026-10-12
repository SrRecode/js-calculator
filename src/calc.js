// Pure calculation engine.
//
// This module has no DOM dependencies so it can be unit tested in Node and
// imported directly by the browser UI. It supports + - * / %, parentheses,
// decimal numbers, unary minus, and reports friendly errors for bad input.

const OPERATORS = {
  '+': { precedence: 1, assoc: 'left', apply: (a, b) => a + b },
  '-': { precedence: 1, assoc: 'left', apply: (a, b) => a - b },
  '*': { precedence: 2, assoc: 'left', apply: (a, b) => a * b },
  '/': {
    precedence: 2,
    assoc: 'left',
    apply: (a, b) => {
      if (b === 0) throw new Error('Cannot divide by zero');
      return a / b;
    },
  },
  '%': {
    precedence: 2,
    assoc: 'left',
    apply: (a, b) => {
      if (b === 0) throw new Error('Cannot divide by zero');
      return a % b;
    },
  },
};

const UNARY = { precedence: 3, assoc: 'right' };

/**
 * Turn a raw expression string into a flat list of number/operator tokens.
 * @param {string} input
 * @returns {Array<{type: 'number'|'op', value: number|string, unary?: boolean}>}
 */
export function tokenize(input) {
  const source = String(input).replace(/\s+/g, '');
  const tokens = [];
  let i = 0;

  while (i < source.length) {
    const ch = source[i];

    if (/[0-9.]/.test(ch)) {
      let literal = '';
      let dots = 0;
      while (i < source.length && /[0-9.]/.test(source[i])) {
        if (source[i] === '.') dots += 1;
        literal += source[i];
        i += 1;
      }
      if (dots > 1) throw new Error(`Invalid number "${literal}"`);
      if (literal === '.') throw new Error('Invalid number "."');
      tokens.push({ type: 'number', value: Number(literal) });
      continue;
    }

    if ('+-*/%()'.includes(ch)) {
      tokens.push({ type: 'op', value: ch });
      i += 1;
      continue;
    }

    throw new Error(`Unexpected character "${ch}"`);
  }

  return tokens;
}

/**
 * Convert infix tokens into reverse-polish notation using the shunting-yard
 * algorithm, resolving unary minus along the way.
 * @param {ReturnType<typeof tokenize>} tokens
 */
function toRPN(tokens) {
  const output = [];
  const stack = [];
  let previous = null;

  for (const token of tokens) {
    if (token.type === 'number') {
      output.push(token);
    } else if (token.value === '(') {
      stack.push(token);
    } else if (token.value === ')') {
      while (stack.length && stack[stack.length - 1].value !== '(') {
        output.push(stack.pop());
      }
      if (!stack.length) throw new Error('Mismatched parentheses');
      stack.pop();
    } else {
      const isUnary =
        token.value === '-' &&
        (previous === null ||
          previous.value === '(' ||
          (previous.type === 'op' && previous.value !== ')'));

      if (isUnary) {
        stack.push({ type: 'op', value: 'u-', unary: true });
      } else {
        const current = OPERATORS[token.value];
        while (stack.length) {
          const top = stack[stack.length - 1];
          if (top.value === '(') break;
          const topOp = top.unary ? UNARY : OPERATORS[top.value];
          const shouldPop =
            topOp.precedence > current.precedence ||
            (topOp.precedence === current.precedence && current.assoc === 'left');
          if (shouldPop) output.push(stack.pop());
          else break;
        }
        stack.push(token);
      }
    }
    previous = token;
  }

  while (stack.length) {
    const top = stack.pop();
    if (top.value === '(') throw new Error('Mismatched parentheses');
    output.push(top);
  }

  return output;
}

function evaluateRPN(rpn) {
  const stack = [];

  for (const token of rpn) {
    if (token.type === 'number') {
      stack.push(token.value);
      continue;
    }

    if (token.unary) {
      if (!stack.length) throw new Error('Invalid expression');
      stack.push(-stack.pop());
      continue;
    }

    const b = stack.pop();
    const a = stack.pop();
    if (a === undefined || b === undefined) throw new Error('Invalid expression');
    stack.push(OPERATORS[token.value].apply(a, b));
  }

  if (stack.length !== 1) throw new Error('Invalid expression');
  return stack[0];
}

function round(value) {
  // Trim floating point noise (0.1 + 0.2) without losing meaningful precision.
  return Math.round((value + Number.EPSILON) * 1e12) / 1e12;
}

/**
 * Evaluate an arithmetic expression.
 * @param {string} input e.g. "2 + 3 * (4 - 1)"
 * @returns {number}
 */
export function evaluate(input) {
  if (input === '' || input === undefined || input === null) {
    throw new Error('Empty expression');
  }
  const tokens = tokenize(input);
  if (!tokens.length) throw new Error('Empty expression');
  return round(evaluateRPN(toRPN(tokens)));
}
