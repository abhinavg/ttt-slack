const lodash = require('lodash');

const models = require('./models');

const Separator = '|---+---+---|';

function hasLine(grid, value) {
  for (const line of models.AllLines) {
    if (lodash.every(line, pos => grid[pos] === value)) {
      return true;
    }
  }
  return false;
}

function allPositionsFilled(grid) {
  return lodash.every(models.Positions, pos => grid[pos] !== models.Values.Empty);
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
  allPositionsFilled,
  hasLine,
  render,
};
