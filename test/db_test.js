const async = require('async');
const assert = require('assert');
const mongodb = require('mongodb');
const sinon = require('sinon');

const dbModule = require('../db');
const models = require('../models');

describe('DB class', () => {
  const dbConnString = 'mongodb://localhost:27017/db_test';
  const getDBClient = (cb) => {
    mongodb.MongoClient.connect(dbConnString, cb);
  };
  const clearDB = (cb) => {
    async.auto({
      db: getDBClient,
      clear: ['db', ({ db }, cbAuto) => {
        db.dropDatabase(cbAuto);
      }],
    }, cb);
  };
  const fakeClock = sinon.useFakeTimers(123456, 'Date');

  after(() => {
    fakeClock.restore();
  });

  describe('createGame', () => {
    beforeEach(clearDB);

    it('creates an active game with correct information set', (done) => {
      const testUsers = {
        user1: models.Naught,
        user2: models.Cross,
      };
      const testTeamID = 'test_team_id';
      const testChanID = 'testChanID';
      async.auto({
        dbClient: getDBClient,
        db: ['dbClient', ({ dbClient }, cbAuto) => {
          cbAuto(null, new dbModule.DB(dbClient));
        }],
        createGame: ['db', ({ db }, cbAuto) => {
          db.createGame(testTeamID, testChanID, testUsers, 'user1', cbAuto);
        }],
        getGame: ['db', 'createGame', ({ db }, cbAuto) => {
          db.gameByTeamAndChannel(testTeamID, testChanID, cbAuto);
        }],
      }, (err, { createGame, getGame }) => {
        assert.ifError(err);
        assert.equal(createGame.team_id, testTeamID);
        assert.equal(createGame.channel_id, testChanID);
        assert.deepEqual(createGame.users, testUsers);
        assert.equal(createGame.next_move, 'user1');
        assert.deepEqual(createGame.state, models.EmptyState);
        assert(createGame.active);
        assert.equal(createGame.start_time, 123456);
        assert.deepEqual(createGame, getGame);
        return done();
      });
    });
  });
});
