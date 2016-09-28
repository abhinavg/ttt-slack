const assert = require('assert');
const lodash = require('lodash');

const cmdShared = require('../cmd_shared');
const models = require('../models');

describe('cmd_shared', () => {
  const testGame = {
    team_id: 'testTeamID',
    channel_id: 'test_channel_id',
    users: [
      { username: '@user1', value: models.Values.Cross },
      { username: '@user2', value: models.Values.Naught },
    ],
    state: models.EmptyState,
    next_move_index: 1,
  };

  describe('getRenderGameResponse', () => {
    it('returns correct response for in progress game', () => {
      const game = lodash.cloneDeep(testGame);
      game.state['1'] = models.Values.Naught;
      game.next_move_index = 0;
      const expectedResp = {
        response_type: models.ResponseTypes.InChannel,
        attachments: [{
          title: 'Current Game',
          fields: [
            { title: 'X', value: '@user1', short: true },
            { title: 'O', value: '@user2', short: true },
            {
              title: 'Board State',
              value: `\`\`\`| O |   |   |
|---+---+---|
|   |   |   |
|---+---+---|
|   |   |   |\`\`\``,
              short: true,
            },
            {
              title: 'Next Move',
              value: '@user1',
              short: true,
            },
          ],
          mrkdwn_in: ['fields'],
          fallback: 'fallback',
        }],
      };
      assert.deepEqual(cmdShared.getRenderGameResponse(game, 'fallback'), expectedResp);
    });

    it('returns correct response for a won game', () => {
      const game = lodash.cloneDeep(testGame);
      game.state = {
        1: 'O', 2: ' ', 3: 'O',
        4: 'X', 5: 'X', 6: 'X',
        7: 'O', 8: ' ', 9: ' ',
      };
      game.next_move_index = null;
      game.winner_index = 0;
      game.active = false;
      const expectedResp = {
        response_type: models.ResponseTypes.InChannel,
        attachments: [{
          title: 'Game Over',
          fields: [
            { title: 'X', value: '@user1', short: true },
            { title: 'O', value: '@user2', short: true },
            {
              title: 'Board State',
              value: `\`\`\`| O |   | O |
|---+---+---|
| X | X | X |
|---+---+---|
| O |   |   |\`\`\``,
              short: true,
            },
            {
              title: 'Result',
              value: '@user1 Won!',
              short: true,
            },
          ],
          mrkdwn_in: ['fields'],
          fallback: 'fallback',
        }],
      };
      assert.deepEqual(cmdShared.getRenderGameResponse(game, 'fallback'), expectedResp);
    });

    it('returns correct response for a drawn game', () => {
      const game = lodash.cloneDeep(testGame);
      game.state = {
        1: 'O', 2: 'X', 3: 'O',
        4: 'X', 5: 'O', 6: 'X',
        7: 'X', 8: 'O', 9: 'O',
      };
      game.next_move_index = null;
      game.active = false;
      const expectedResp = {
        response_type: models.ResponseTypes.InChannel,
        attachments: [{
          title: 'Game Over',
          fields: [
            { title: 'X', value: '@user1', short: true },
            { title: 'O', value: '@user2', short: true },
            {
              title: 'Board State',
              value: `\`\`\`| O | X | O |
|---+---+---|
| X | O | X |
|---+---+---|
| X | O | O |\`\`\``,
              short: true,
            },
            {
              title: 'Result',
              value: 'Draw',
              short: true,
            },
          ],
          mrkdwn_in: ['fields'],
          fallback: 'fallback',
        }],
      };
      assert.deepEqual(cmdShared.getRenderGameResponse(game, 'fallback'), expectedResp);
    });
  });
});
