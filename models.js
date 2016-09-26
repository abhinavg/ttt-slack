const Values = {
  Naught: 'O',
  Cross: 'X',
  Empty: null,
};

const Positions = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

const EmptyState = {};
for (const postion of Positions) {
  EmptyState[postion] = Values.Empty;
}

const Commands = {
  Help: 'help',
  Challenge: 'challenge',
};

module.exports = {
  Commands,
  EmptyState,
  Positions,
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
