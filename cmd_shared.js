const grid = require('./grid');
const models = require('./models');

const NoActiveGameResponse = {
  text: `There is no active game in this channel. Challenge someone with \`/ttt ${models.Commands.Challenge} @username\``,
  response_type: models.ResponseTypes.Ephemeral,
};

function getRenderGameResponse(game, fallback) {
  const attachmentFields = [];
  let respTitle = 'Current Game';
  for (const user of game.users) {
    attachmentFields.push({
      title: user.value,
      value: user.username,
      short: true,
    });
  }
  attachmentFields.push({
    title: 'Board State',
    value: `\`\`\`${grid.render(game.state)}\`\`\``,
    short: true,
  });
  if (game.next_move_index != null) {
    attachmentFields.push({
      title: 'Next Move',
      value: game.users[game.next_move_index].username,
      short: true,
    });
  } else {
    respTitle = 'Game Over';
    let result = 'Draw';
    if (game.winner_index != null) {
      result = `${game.users[game.winner_index].username} Won!`;
    }
    attachmentFields.push({
      title: 'Result',
      value: result,
      short: true,
    });
  }
  return {
    attachments: [{
      title: respTitle,
      fields: attachmentFields,
      mrkdwn_in: ['fields'],
      fallback,
    }],
    response_type: models.ResponseTypes.InChannel,
  };
}

module.exports = {
  getRenderGameResponse,
  NoActiveGameResponse,
};
