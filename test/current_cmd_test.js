const assert = require('assert');
const sinon = require('sinon');

const current = require('../current_cmd');
const models = require('../models');

describe('Current command', () => {
  const testGame = {
    team_id: 'testTeamID',
    channel_id: 'test_channel_id',
    users: { '@user1': models.Values.Cross, '@user2': models.Values.Naught },
    state: models.EmptyState,
    next_move: '@user2',
  };

  describe('run', () => {
    it('returns response with command explanation if invalid input', (done) => {
      const db = {
        getActiveGame: sinon.spy(),
      };
      const argv = ['current', 'foo'];
      const cmd = new current.CurrentCmd(db, testGame.team_id, testGame.channel_id, argv);
      cmd.run((err, resp) => {
        assert.ifError(err);
        assert.equal(resp, current.InvalidCurrentResponse);
        assert.equal(db.getActiveGame.called, false);
        done();
      });
    });

    it('returns an response with challenge instructions no active game', (done) => {
      const db = {
        getActiveGame: sinon.stub().yields(null, null),
      };
      const argv = ['current'];
      const cmd = new current.CurrentCmd(db, testGame.team_id, testGame.channel_id, argv);
      cmd.run((err, resp) => {
        assert.ifError(err);
        assert.equal(resp, current.NoActiveGameResponse);
        assert.equal(db.getActiveGame.callCount, 1);
        const expectedArgs = [testGame.team_id, testGame.channel_id];
        assert.deepEqual(db.getActiveGame.firstCall.args.slice(0, 2), expectedArgs);
        done();
      });
    });

    it('returns an error if one received while creating game', (done) => {
      const testErr = new Error('test error');
      const db = {
        getActiveGame: sinon.stub().yields(testErr),
      };
      const argv = ['current'];
      const cmd = new current.CurrentCmd(db, testGame.team_id, testGame.channel_id, argv);
      cmd.run((err) => {
        assert.equal(db.getActiveGame.callCount, 1);
        const expectedArgs = [testGame.team_id, testGame.channel_id];
        assert.deepEqual(db.getActiveGame.firstCall.args.slice(0, 2), expectedArgs);
        assert.equal(err, testErr);
        done();
      });
    });

    it('returns an in channel response with current game state if found', (done) => {
      const db = {
        getActiveGame: sinon.stub().yields(null, testGame),
      };
      const argv = ['current'];
      const cmd = new current.CurrentCmd(db, testGame.team_id, testGame.channel_id, argv);
      cmd.run((err, resp) => {
        assert.ifError(err);
        assert.equal(db.getActiveGame.callCount, 1);
        const expectedArgs = [testGame.team_id, testGame.channel_id];
        assert.deepEqual(db.getActiveGame.firstCall.args.slice(0, 2), expectedArgs);
        const expectedResp = {
          response_type: models.ResponseTypes.InChannel,
          attachments: [{
            title: 'Current Game',
            fields: [
              { title: 'X', value: '@user1', short: true },
              { title: 'O', value: '@user2', short: true },
              {
                title: 'Board State',
                value: `\`\`\`|   |   |   |
|---+---+---|
|   |   |   |
|---+---+---|
|   |   |   |\`\`\``,
                short: true,
              },
              {
                title: 'Next Move',
                value: '@user2',
                short: true,
              },
            ],
            fallback: '@user2 has the next move',
            mrkdwn_in: ['fields'],
          }],
        };
        assert.deepEqual(resp, expectedResp);
        done();
      });
    });
  });
});
