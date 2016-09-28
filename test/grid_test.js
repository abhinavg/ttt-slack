const assert = require('assert');

const grid = require('../grid');
const models = require('../models');

const gridWithHorizontalLine = {
  1: 'O', 2: ' ', 3: 'O',
  4: 'X', 5: 'X', 6: 'X',
  7: ' ', 8: ' ', 9: ' ',
};

const renderedGridWithHorizontalLine = `
| O |   | O |
|---+---+---|
| X | X | X |
|---+---+---|
|   |   |   |`.slice(1);

const gridWithVerticalLine = {
  1: 'O', 2: ' ', 3: 'O',
  4: 'X', 5: 'X', 6: 'O',
  7: ' ', 8: 'X', 9: 'O',
};
const renderedGridWithVerticalLine = `
| O |   | O |
|---+---+---|
| X | X | O |
|---+---+---|
|   | X | O |`.slice(1);

const gridWithDiagonalLine = {
  1: 'O', 2: 'X', 3: ' ',
  4: 'X', 5: 'O', 6: ' ',
  7: ' ', 8: 'X', 9: 'O',
};
const renderedGridWithDiagonalLine = `
| O | X |   |
|---+---+---|
| X | O |   |
|---+---+---|
|   | X | O |`.slice(1);

const gridWithNoLine = {
  1: 'O', 2: ' ', 3: 'O',
  4: 'X', 5: ' ', 6: ' ',
  7: ' ', 8: 'X', 9: ' ',
};
const renderedGridWithNoLine = `
| O |   | O |
|---+---+---|
| X |   |   |
|---+---+---|
|   | X |   |`.slice(1);

const renderedEmptyGrid = `
|   |   |   |
|---+---+---|
|   |   |   |
|---+---+---|
|   |   |   |`.slice(1);

describe('grid', () => {
  describe('hasLine', () => {
    it('returns line value in case grid has a line', () => {
      assert.equal(grid.hasLine(gridWithHorizontalLine), 'X');
      assert.equal(grid.hasLine(gridWithVerticalLine), 'O');
      assert.equal(grid.hasLine(gridWithDiagonalLine), 'O');
    });

    it('returns false in case grid have a valid line', () => {
      assert.equal(grid.hasLine(gridWithNoLine), null);
      assert.equal(grid.hasLine(models.EmptyState), null);
    });
  });

  describe('render', () => {
    it('correctly renders different kinds of grids', () => {
      assert.equal(grid.render(gridWithHorizontalLine), renderedGridWithHorizontalLine);
      assert.equal(grid.render(gridWithVerticalLine), renderedGridWithVerticalLine);
      assert.equal(grid.render(gridWithDiagonalLine), renderedGridWithDiagonalLine);
      assert.equal(grid.render(gridWithNoLine), renderedGridWithNoLine);
      assert.equal(grid.render(models.EmptyState), renderedEmptyGrid);
    });
  });
});
