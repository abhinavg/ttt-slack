# Requirements
1. Users can create a new game in any Slack channel by challenging another user (using their `@username`).
2. A channel can have at most one game being played at a time.
3. Anyone in the channel can run a command to display the current board and list whose turn it is.
4. Users can specify their next move, which also publicly displays the board in the channel after the move with a reminder of whose turn it is.
5. Only the user whose turn it is can make the next move.
6. When a turn is taken that ends the game, the response indicates this along with who won.

# Game Assumptions
* X's start first.
* Keep things fun. You're play tic tac toe after all. Maybe borrow from Dr. Seuss.
* Always validate token.
* Enforce 3000 millisecond timeout

# First Iteration
* Number grid positions 1-9
* `/ttt help`: Ephemeral.
* `/ttt` Ephemeral. returns help.
* `/ttt challenge @username` In Channel. Challenged starts first. Returns help text if no username. Ephemeral error if game creation not possible.
* `/ttt current` Ephemeral. Shows current game state w/ who is nought and who is cross. ASCII display. Handle error case. How to create a game if none exists.
* `/ttt move 1` In channel. Places your move. Ephemeral error if move not possible.

# Possible Improvements
* Think about possible race conditions.
* User must approve / decline challenge. Message buttons would be great here.
* Leaderboard.
* Coin toss to decide who starts first.
* Better names for `current` and `move`.
* Better display for the game board.
* Actionable content on `current` if player has the next move.
* Should `current` be In channel?
