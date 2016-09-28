const async = require('async');
const lodash = require('lodash');

const grid = require('./grid');
const models = require('./models');

class DB {

  constructor(client) {
    this.db = client;
    this.gamesCollection = client.collection('games');
    this.movesCollection = client.collection('moves');
  }

  // Somewhat brittle, but there isn't anything in the driver to tell which error comes from a dup.
  static isDupErr(err) {
    return err.code && err.code === 11000;
  }

  static computeUpdatedGame(game, userIndex, position, now) {
    const updatedGame = lodash.cloneDeep(game);
    const value = game.users[userIndex].value;
    updatedGame.state[position] = value;
    if (grid.hasLine(updatedGame.state, value)) {
      updatedGame.winner_index = userIndex;
      updatedGame.active = false;
      updatedGame.end_time = now;
      updatedGame.next_move_index = null;
    } else if (grid.allPositionsFilled(updatedGame.state)) {
      updatedGame.winner_index = null;
      updatedGame.active = false;
      updatedGame.end_time = now;
      updatedGame.next_move_index = null;
    } else {
      updatedGame.next_move_index = (userIndex + 1) % game.users.length;
    }
    return updatedGame;
  }

  // Filters out inactive games.
  getActiveGame(teamID, channelID, cb) {
    const query = {
      team_id: teamID,
      channel_id: channelID,
      active: true,
    };
    this.gamesCollection.findOne(query, cb);
  }

  // A unique index on the underlying table ensures that we never have more than 1 active game in
  // a channel. In these cases, createGame will throw an error which can then be checked using the
  // isDupErr method.
  createGame(teamID, channelID, users, nextMoveIndex, cb) {
    const game = {
      active: true,
      channel_id: channelID,
      state: models.EmptyState,
      start_time: Date.now(),
      next_move_index: nextMoveIndex,
      team_id: teamID,
      users,
    };
    this.gamesCollection.insertOne(game, (err, results) => {
      if (err) {
        return cb(err);
      }
      game._id = results.insertedId;
      return cb(null, game);
    });
  }

  makeMove(game, position, cb) {
    const now = Date.now();
    const userIndex = game.next_move_index;
    const updatedGame = DB.computeUpdatedGame(game, userIndex, position, now);
    async.auto({
      updateGame: cbAuto => {
        this.gamesCollection.updateOne({ _id: game._id }, updatedGame, cbAuto);
      },
      recordMove: ['updateGame', (results, cbAuto) => {
        this.movesCollection.insertOne({
          game_id: game._id,
          username: game.users[userIndex].username,
          value: game.users[userIndex].value,
          position,
          timestamp: now,
        }, cbAuto);
      }],
    }, (err) => {
      if (err) {
        return cb(err);
      }
      return cb(null, updatedGame);
    });
  }
}

module.exports = {
  DB,
};
