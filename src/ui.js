import { evaluate } from './calc.js';

const currentEl = document.getElementById('current');
const historyEl = document.getElementById('history');
const keysEl = document.getElementById('keys');

const MAX_LENGTH = 200;
let expression = '';
let justEvaluated = false;

function render() {
  currentEl.textContent = expression === '' ? '0' : expression;
}

function setError(message) {
  historyEl.textContent = message;
  historyEl.classList.add('error');
}

function clearError() {
  historyEl.classList.remove('error');
}

function append(value) {
  if (justEvaluated) {
    // After "=", a digit starts a new calculation but an operator continues
    // from the previous result.
    expression = '+-*/%'.includes(value) ? expression : '';
    justEvaluated = false;
  }

  if (expression.length >= MAX_LENGTH) return;

  clearError();
  expression += value;
  render();
}

function backspace() {
  clearError();
  justEvaluated = false;
  expression = expression.slice(0, -1);
  render();
}

function clearAll() {
  expression = '';
  justEvaluated = false;
  clearError();
  historyEl.textContent = '';
  render();
}

function toggleSign() {
  const match = expression.match(/(\d+\.?\d*)$/);
  if (!match) return;

  const number = match[1];
  const head = expression.slice(0, expression.length - number.length);
  const prevChar = head.slice(-1);
  const prevPrev = head.slice(-2, -1);
  const isNegated =
    prevChar === '-' && (head.length === 1 || /[+\-*/%(]/.test(prevPrev));

  expression = isNegated ? head.slice(0, -1) + number : `${head}-${number}`;
  clearError();
  render();
}

function calculate() {
  if (expression === '') return;

  try {
    const result = evaluate(expression);
    clearError();
    historyEl.textContent = `${expression} =`;
    expression = String(result);
    justEvaluated = true;
    render();
  } catch (error) {
    setError(error.message);
  }
}

function handleAction(action) {
  switch (action) {
    case 'C':
      clearAll();
      break;
    case 'back':
      backspace();
      break;
    case 'neg':
      toggleSign();
      break;
    case '=':
      calculate();
      break;
    default:
      append(action);
  }
}

keysEl.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-key]');
  if (!button) return;
  handleAction(button.dataset.key);
  button.blur();
});

const KEYBOARD_MAP = {
  Enter: '=',
  '=': '=',
  Escape: 'C',
  Backspace: 'back',
  Delete: 'C',
};

document.addEventListener('keydown', (event) => {
  const { key } = event;

  if (KEYBOARD_MAP[key]) {
    event.preventDefault();
    handleAction(KEYBOARD_MAP[key]);
    return;
  }

  if (/^[0-9.()+\-*/%]$/.test(key)) {
    event.preventDefault();
    append(key);
  }
});

render();
