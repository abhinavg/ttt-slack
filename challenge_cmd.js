const cmdShared = require('./cmd_shared');
const models = require('./models');

const InvalidChallengeResponse = {
  text: `I didn't understand that command. Challenge a user using \`/ttt ${models.Commands.Challenge} @username\``,
  response_type: models.ResponseTypes.Ephemeral,
};

const SelfChallengeResponse = {
  text: 'Nice try, but you can\'t challenge yourself. Please pick someone else.',
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
    if (this.challenged === this.challenger) {
      return setImmediate(cb, null, SelfChallengeResponse);
    }
    const users = [
      { username: this.challenger, value: models.Values.Cross },
      { username: this.challenged, value: models.Values.Naught },
    ];
    // TODO: Handle the case when an active game exists.
    return this.db.createGame(this.teamID, this.channelID, users, 1, (err, game) => {
      if (err) {
        return cb(err);
      }
      return cb(null, cmdShared.getRenderGameResponse(game));
    });
  }
}

module.exports = {
  InvalidChallengeResponse,
  SelfChallengeResponse,
  ChallengeCmd,
};
