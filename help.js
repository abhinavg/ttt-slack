const models = require('./models');
const response = require('./response');

const HelpText = `Get this help text: \`/ttt ${models.Commands.Help}\`
Challenge someone to a game: \`/ttt ${models.Commands.Challenge} @username\`
`;

const HelpResponse = {
  text: HelpText,
  response_type: response.ResponseTypes.Ephemeral,
};

const InvalidCmdResponse = {
  text: `I didn't understand that command. Valid commands are:\n${HelpText}`,
  response_type: response.ResponseTypes.Ephemeral,
};

module.exports = {
  HelpResponse,
  InvalidCmdResponse,
};
