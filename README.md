# js-calculator

An interactive calculator built with **vanilla JavaScript, HTML, and CSS** — no frameworks, no build step, no dependencies.

The expression parser lives in a small, dependency-free module (`src/calc.js`) that is unit tested, so the maths is verified independently of the UI.

## Features

- **Full expression evaluation** — add, subtract, multiply, divide, and modulo with correct operator precedence.
- **Parentheses** and **unary minus** (e.g. `-(2 + 3)`, `3 * -2`).
- **Decimal support** with floating-point noise trimmed (`0.1 + 0.2` → `0.3`, not `0.30000000000000004`).
- **Keyboard support** — numbers, `+ - * / %`, `Enter` to evaluate, `Backspace` to delete, `Esc` to clear.
- **Friendly errors** — division by zero, mismatched parentheses, and invalid input are reported in the display instead of crashing.
- **Sign toggle**, **backspace**, and a **history line** that shows the expression that produced the current result.
- **Responsive, accessible UI** — large touch targets, focus-visible outlines, `aria-label`s, and a layout that fits small screens.

## Getting started

There is nothing to install for the app itself.

```sh
# Option 1: just open the file
start index.html        # Windows
open index.html         # macOS

# Option 2: serve it (needed for the ES module import)
npx --yes serve .
```

Because the UI is an ES module (`<script type="module">`), some browsers block `file://` module loading — use the `serve` option if the page appears blank.

## Running the tests

The calculation engine is covered by tests using Node's built-in test runner (Node 18+):

```sh
npm test
```

```
> js-calculator@1.0.0 test
> node --test

✔ adds and subtracts with correct precedence
✔ multiplies and divides
✔ respects parentheses
✔ handles decimals without floating point noise
✔ handles unary minus
✔ throws on division by zero
✔ throws on malformed input
✔ tokenize splits numbers and operators
```

## Project structure

```
js-calculator/
├── index.html        # Markup: display + keypad
├── styles.css        # Dark, responsive styling
├── src/
│   ├── calc.js       # Pure tokenizer + shunting-yard evaluator (tested)
│   └── ui.js         # DOM wiring, keyboard handling, error display
├── test/
│   └── calc.test.js  # node:test unit tests for the engine
├── package.json
└── README.md
```

### How the engine works

1. **`tokenize`** turns the raw string into numbers and operators.
2. **Shunting-yard** converts the infix tokens into reverse-polish notation, resolving unary minus and validating parentheses.
3. **`evaluateRPN`** walks the RPN list and applies the operators.

Keeping this logic separate means the same code powers both the browser UI and the test suite.

## Tech

- Vanilla JavaScript (ES modules)
- HTML5 + semantic elements
- Modern CSS (custom properties, grid, `:focus-visible`)
- Node's built-in `node:test` for unit tests

## License

MIT
