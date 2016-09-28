# ttt-slack
Slash command to play tic tac toe in Slack

# Architecture

The server is a basic express app with mongoDB as a backing datastore.

## MongoDB
We have two collections where data is stored:
### Games
This stores information about all the games including the state of the board and the names
of the users. It's used throughout the codebase to provide the appropriate response it a user command.

We create a unique partial index on this collection to enforce the constraint of having at most one
active game in a channel. See `setup_db.js` for exact syntax.


### Moves
This is not used in the user flows right now. Instead, it gives a historical record of
actions performed by the users which can be used for debugging and analytics.

## Code Organization

The code starts of at a basic `index.js` file which just parses environment variables and sets up
dependencies. From there, a `server.js` file handles the routing logic and some verification on
the incoming requests.

Each user command is represented as a class defined in its own `*_cmd.js` module. All commands expose
a `run` method which just returns `error` and `JSON response`. The routing and request parsing logic
is abstracted out of the classes.

In addition, there is a `db.js` module which provides a layer of abstraction over the database access.

There are tests for most of the modules in a separate `test` directory.

## Possible Improvements
Some possible improvements that could be made to the command down the line.

### Product
* User must approve / decline challenge. Message buttons would be great here.
* Have a leaderboard to further gamifying the interaction.
* Randomize the decision on who starts first.
* Better display for the Tic-Tac-Toe grid.

### Technical
* Handle more race conditions. The index guarantees no race conditions while creating a game.
However, unexpected things might happen if we see near-simultaneous requests from the same user on
the same game.

* Use stable identifiers for users instead of username. This is tricky because when a user is
challenged, we only get their username and not the ID. So we can never be 100% sure but still,
preferring the stable identifier when available can mitigate the case of unintended consequences
in case of switch.

* Move files into separate package. This is low hanging fruit but the code is about at the border of
where it would be useful to group modules from a logical standpoint.

* Better handling on internal errors. Right now, we just rely on the default express handler.
