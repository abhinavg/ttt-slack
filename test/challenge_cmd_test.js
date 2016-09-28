const assert = require('assert');
const sinon = require('sinon');

const challenge = require('../challenge_cmd');
const models = require('../models');

describe('Challenge command', () => {
  const testTeamID = 'testTeamID';
  const testChanID = 'test_channel_id';
  const testUser1 = '@user1';
  const testUser2 = '@user2';
  const testUsers = [
    { username: '@user1', value: models.Values.Cross },
    { username: '@user2', value: models.Values.Naught },
  ];

  describe('run', () => {
    it('returns response with command explanation if invalid input', (done) => {
      const db = {
        createGame: sinon.spy(),
      };
      const argv = ['challenge'];
      const cmd = new challenge.ChallengeCmd(db, testTeamID, testChanID, testUser1, argv);
      cmd.run((err, resp) => {
        assert.ifError(err);
        assert.equal(resp, challenge.InvalidChallengeResponse);
        assert.equal(db.createGame.called, false);
        done();
      });
    });

    it('returns an response with explanation if trying to challenge self', (done) => {
      const db = {
        createGame: sinon.spy(),
      };
      const argv = ['challenge', testUser1];
      const cmd = new challenge.ChallengeCmd(db, testTeamID, testChanID, testUser1, argv);
      cmd.run((err, resp) => {
        assert.ifError(err);
        assert.equal(resp, challenge.SelfChallengeResponse);
        assert.equal(db.createGame.called, false);
        done();
      });
    });

    it('returns an error if one received while creating game', (done) => {
      const testErr = new Error('test error');
      const db = {
        createGame: sinon.stub().yields(testErr),
      };
      const argv = ['challenge', testUser2];
      const cmd = new challenge.ChallengeCmd(db, testTeamID, testChanID, testUser1, argv);
      cmd.run((err) => {
        assert.equal(db.createGame.callCount, 1);
        const expectedArgs = [testTeamID, testChanID, testUsers, 1];
        assert.deepEqual(db.createGame.firstCall.args.slice(0, 4), expectedArgs);
        assert.equal(err, testErr);
        done();
      });
    });

    it('returns an in channel response with next player if game created', (done) => {
      const game = {
        users: testUsers,
        state: models.EmptyState,
        next_move_index: 1,
      };
      const db = {
        createGame: sinon.stub().yields(null, game),
      };
      const argv = ['challenge', testUser2];
      const cmd = new challenge.ChallengeCmd(db, testTeamID, testChanID, testUser1, argv);
      cmd.run((err, resp) => {
        assert.ifError(err);
        assert.equal(db.createGame.callCount, 1);
        const expectedArgs = [testTeamID, testChanID, testUsers, 1];
        assert.deepEqual(db.createGame.firstCall.args.slice(0, 4), expectedArgs);
        const expectedResp = {
          response_type: models.ResponseTypes.InChannel,
          attachments: [{
            fallback: 'Game created. @user2 to move',
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
            mrkdwn_in: ['fields'],
          }],
        };
        assert.deepEqual(resp, expectedResp);
        done();
      });
    });
  });
});
