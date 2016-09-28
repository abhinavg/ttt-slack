const lodash = require('lodash');

const cmdShared = require('./cmd_shared');
const grid = require('./grid');
const models = require('./models');

const InvalidMoveResponse = {
  text: 'I didn\'t understand that. Make your move using `/ttt move [1-9]`?',
  response_type: models.ResponseTypes.Ephemeral,
};
const InvalidTurnResponse = {
  text: 'You do not have the turn to move. Please wait for others to finish their turn(s)',
  response_type: models.ResponseTypes.Ephemeral,
};
const NonEmptyPositionResponse = {
  text: 'That position is already taken. Please pick another',
  response_type: models.ResponseTypes.Ephemeral,
};
const UnknownUserResponse = {
  text: 'You are not part of the current game. Please wait for it to finish or start a new one ' +
  'in another channel',
  response_type: models.ResponseTypes.Ephemeral,
};

class MoveCmd {
  constructor(db, teamID, channelID, user, argv) {
    this.db = db;
    this.teamID = teamID;
    this.channelID = channelID;
    this.user = user;
    this.argv = argv;
    if (argv.length === 2) {
      this.position = argv[1];
    }
    this.isValidCmd = this.isValidCmd.bind(this);
    this.run = this.run.bind(this);
  }

  moveResponse(game) {
    const attachmentFields = cmdShared.getAttachmentFields(game);
    return {
      attachments: [{
        title: 'Current Game',
        fallback: `${this.user} made a move`,
        fields: attachmentFields,
        mrkdwn_in: ['fields'],
      }],
      response_type: models.ResponseTypes.InChannel,
    };
  }

  isValidCmd() {
    if ((this.argv.length === 2) && (models.Positions.indexOf(this.position) > -1)) {
      return true;
    }
    return false;
  }

  run(cb) {
    if (!this.isValidCmd()) {
      return setImmediate(cb, null, InvalidMoveResponse);
    }
    return this.db.getActiveGame(this.teamID, this.channelID, (err, game) => {
      if (err) {
        return cb(err);
      }
      if (!game) {
        return cb(null, cmdShared.NoActiveGameResponse);
      }
      const userIndex = lodash.findIndex(game.users, user => user.username === this.user);
      if (userIndex === -1) {
        return cb(null, UnknownUserResponse);
      }
      if (game.next_move_index !== userIndex) {
        return cb(null, InvalidTurnResponse);
      }
      if (game.state[this.position] !== models.Values.Empty) {
        return cb(null, NonEmptyPositionResponse);
      }
      this.db.makeMove(game, userIndex, this.position, (updateErr, updatedGame) => {
        if (updateErr) {
          return cb(updateErr);
        }
        return cmdShared.getRenderGameResponse(updatedGame);
      });
      return null;
    });
  }
}

module.exports = {
  InvalidMoveResponse,
  MoveCmd,
};
