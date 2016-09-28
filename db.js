const models = require('./models');

class DB {

  constructor(client) {
    this.db = client;
    this.gamesCollection = client.collection('games');
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

  updateGame(updatedGame, cb) {
    this.gamesCollection.updateOne({ _id: updatedGame._id }, updatedGame, err => cb(err));
  }
}

module.exports = {
  DB,
};
