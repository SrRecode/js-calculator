import test from 'node:test';
import assert from 'node:assert/strict';

import { evaluate, tokenize } from '../src/calc.js';

test('adds and subtracts with correct precedence', () => {
  assert.equal(evaluate('2 + 3'), 5);
  assert.equal(evaluate('10 - 4'), 6);
  assert.equal(evaluate('2 + 3 * 4'), 14);
  assert.equal(evaluate('2 + 3 - 1'), 4);
});

test('multiplies and divides', () => {
  assert.equal(evaluate('6 * 7'), 42);
  assert.equal(evaluate('8 / 2'), 4);
  assert.equal(evaluate('9 % 4'), 1);
});

test('respects parentheses', () => {
  assert.equal(evaluate('(2 + 3) * 4'), 20);
  assert.equal(evaluate('2 * (3 + (4 - 1))'), 12);
});

test('handles decimals without floating point noise', () => {
  assert.equal(evaluate('0.1 + 0.2'), 0.3);
  assert.equal(evaluate('1.5 * 2'), 3);
});

test('handles unary minus', () => {
  assert.equal(evaluate('-5 + 3'), -2);
  assert.equal(evaluate('3 * -2'), -6);
  assert.equal(evaluate('-(2 + 3)'), -5);
});

test('throws on division by zero', () => {
  assert.throws(() => evaluate('5 / 0'), /divide by zero/);
  assert.throws(() => evaluate('5 % 0'), /divide by zero/);
});

test('throws on malformed input', () => {
  assert.throws(() => evaluate(''), /Empty expression/);
  assert.throws(() => evaluate('2 +'), /Invalid expression/);
  assert.throws(() => evaluate('(2 + 3'), /Mismatched parentheses/);
  assert.throws(() => evaluate('2 $ 3'), /Unexpected character/);
  assert.throws(() => evaluate('1.2.3'), /Invalid number/);
});

test('tokenize splits numbers and operators', () => {
  assert.deepEqual(tokenize('12+3'), [
    { type: 'number', value: 12 },
    { type: 'op', value: '+' },
    { type: 'number', value: 3 },
  ]);
});
