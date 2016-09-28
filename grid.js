const models = require('./models');

const Separator = '|---+---+---|';

function valueAtPositions(grid, positions) {
  if (positions.length === 0) {
    return null;
  }
  const firstValue = grid[positions[0]];
  for (const pos of positions) {
    if (grid[pos] !== firstValue) {
      return null;
    }
  }
  return firstValue;
}

function hasLine(grid) {
  for (const line of models.AllLines) {
    // This logic could be optimized but we prefer readability over performance here.
    const lineValue = valueAtPositions(grid, line);
    if ((lineValue !== null) && (lineValue !== models.Values.Empty)) {
      return lineValue;
    }
  }
  return null;
}

function renderLine(grid, line) {
  let str = '|';
  for (const pos of line) {
    str += ` ${grid[pos]} |`;
  }
  return str;
}

function render(grid) {
  const renderedLines = [];
  for (const line of models.HorizontalLines) {
    renderedLines.push(renderLine(grid, line));
  }
  return renderedLines.join(`\n${Separator}\n`);
}

module.exports = {
  hasLine,
  render,
};
