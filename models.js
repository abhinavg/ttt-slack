const Values = {
  Naught: 'O',
  Cross: 'X',
  Empty: ' ',
};

const Positions = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

const HorizontalLines = [
  [Positions[0], Positions[1], Positions[2]],
  [Positions[3], Positions[4], Positions[5]],
  [Positions[6], Positions[7], Positions[8]],
];

const AllLines = HorizontalLines.concat([
  [Positions[0], Positions[3], Positions[6]],
  [Positions[1], Positions[4], Positions[7]],
  [Positions[2], Positions[5], Positions[8]],
  [Positions[0], Positions[4], Positions[8]],
  [Positions[2], Positions[4], Positions[6]],
]);

const EmptyState = {};
for (const postion of Positions) {
  EmptyState[postion] = Values.Empty;
}

const Commands = {
  Help: 'help',
  Challenge: 'challenge',
};

const ResponseTypes = {
  Ephemeral: 'ephemeral',
  InChannel: 'in_channel',
};

module.exports = {
  AllLines,
  Commands,
  EmptyState,
  HorizontalLines,
  Positions,
  ResponseTypes,
  Values,
};

// Game
// {
//   id,
//   users: GameUser[],
//   channel_id,
//   team_id,
//   state: current state of board,
//   next_move: user_id,
//   active: bool,
//   result: {outcome: draw|win, winner: user_id}
//   start_time
//   end_time
// }

// Move - id, game, index, position, user_id, value, timestamp
