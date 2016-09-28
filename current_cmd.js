const cmdShared = require('./cmd_shared');
const grid = require('./grid');
const models = require('./models');

const InvalidCurrentResponse = {
  text: 'I didn\'t understand that. Did you mean to see current game using `/ttt current`?',
  response_type: models.ResponseTypes.Ephemeral,
};

class CurrentCmd {
  constructor(db, teamID, channelID, argv) {
    this.db = db;
    this.teamID = teamID;
    this.channelID = channelID;
    this.argv = argv;
    this.isValidCmd = this.isValidCmd.bind(this);
    this.run = this.run.bind(this);
  }

  isValidCmd() {
    if (this.argv.length === 1) {
      return true;
    }
    return false;
  }

  run(cb) {
    if (!this.isValidCmd()) {
      return setImmediate(cb, null, InvalidCurrentResponse);
    }
    return this.db.getActiveGame(this.teamID, this.channelID, (err, game) => {
      if (err) {
        return cb(err);
      }
      if (!game) {
        return cb(null, cmdShared.NoActiveGameResponse);
      }
      const fallback = `${game.users[game.next_move_index].username} to move.`;
      return cb(null, cmdShared.getRenderGameResponse(game, fallback));
    });
  }
}

module.exports = {
  InvalidCurrentResponse,
  CurrentCmd,
};
