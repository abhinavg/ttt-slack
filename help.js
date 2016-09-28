const models = require('./models');

const HelpText = `Get this help text: \`/ttt ${models.Commands.Help}\`
Challenge someone to a game: \`/ttt ${models.Commands.Challenge} @username\`
See the current game status: \`/ttt current\`
Place your move: \`/ttt move [1-9]\``;
const HelpResponse = {
  text: HelpText,
  response_type: models.ResponseTypes.Ephemeral,
};
const InvalidCmdResponse = {
  text: `I didn't understand that command. Valid commands are:\n${HelpText}`,
  response_type: models.ResponseTypes.Ephemeral,
};

class HelpCmd {
  static run(cb) {
    cb(null, HelpResponse);
  }
}

class InvalidCmd {
  static run(cb) {
    cb(null, InvalidCmdResponse);
  }
}

module.exports = {
  HelpCmd,
  InvalidCmd,
};
