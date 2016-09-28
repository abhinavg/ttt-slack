const grid = require('./grid');
const models = require('./models');

const NoActiveGameResponse = {
  text: `There is no active game in this channel. Challenge a user using \`/ttt ${models.Commands.Challenge} @username\``,
  response_type: models.ResponseTypes.Ephemeral,
};

const InvalidCurrentResponse = {
  text: 'I didn\'t understand that. Did you mean to see current state using `/ttt current`?',
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

  static currentGameResponse(game) {
    const attachmentFields = [];
    for (const username in game.users) {
      attachmentFields.push({
        title: game.users[username],
        value: username,
        short: true,
      });
    }
    attachmentFields.push({
      title: 'Board State',
      value: `\`\`\`${grid.render(game.state)}\`\`\``,
      short: true,
    }, {
      title: 'Next Move',
      value: game.next_move,
      short: true,
    });
    return {
      text: 'Current Game',
      attachments: [
        { fields: attachmentFields },
      ],
      response_type: models.ResponseTypes.InChannel,
    };
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
        return cb(null, NoActiveGameResponse);
      }
      return cb(null, CurrentCmd.currentGameResponse(game));
    });
  }
}

module.exports = {
  InvalidCurrentResponse,
  NoActiveGameResponse,
  CurrentCmd,
};
