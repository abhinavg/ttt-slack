// Value - O, X, null

// GameUser
// {id: string, value: Value}

// State: [postion: Value] * 9

// Game
// {
//   id,
//   users: GameUser[],
//   channel_id,
//   team_id,
//   state: current state of board,
//   next_move: user_id,
//   ended: bool,
//   result: {outcome: draw|win, winner: user_id}
//   start_time
//   end_time
// }

// Move - game, index, position, user_id, value
