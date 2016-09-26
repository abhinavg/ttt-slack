const models = require('./models');

const InvalidChallengeResponse = {
  text: `I didn't understand that command. Challenge a user using \`/ttt ${models.Commands.Challenge} @username\``,
  response_type: models.ResponseTypes.Ephemeral,
};

class ChallengeCmd {
  constructor(db, teamID, channelID, username, argv) {
    this.db = db;
    this.teamID = teamID;
    this.channelID = channelID;
    this.challenger = username;
    this.challenged = '';
    if (argv.length === 2) {
      this.challenged = argv[1];
    }
    this.isValidCmd = this.isValidCmd.bind(this);
    this.run = this.run.bind(this);
  }

  isValidCmd() {
    if (this.challenged.startsWith('@')) {
      return true;
    }
    return false;
  }

  run(cb) {
    if (!this.isValidCmd()) {
      return setImmediate(cb, null, InvalidChallengeResponse);
    }
    const users = {};
    users[this.challenger] = models.Values.Cross;
    users[this.challenged] = models.Values.Naught;
    // TODO: Handle the case when an active game exists.
    return this.db.createGame(this.teamID, this.channelID, users, this.challenged, (err, game) => {
      if (err) {
        return cb(err);
      }
      const validResponse = {
        text: `Game created. ${game.next_move} has first turn.`,
        response_type: models.ResponseTypes.InChannel,
      };
      return cb(null, validResponse);
    });
  }
}

module.exports = {
  InvalidChallengeResponse,
  ChallengeCmd,
};
