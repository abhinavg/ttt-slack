const async = require('async');
const assert = require('assert');
const mongodb = require('mongodb');
const sinon = require('sinon');

const dbModule = require('../db');
const models = require('../models');

describe('DB class', () => {
  const dbConnString = 'mongodb://localhost:27017/db_test';
  let db = null;
  const clearDB = cb => db.gamesCollection.deleteMany({}, cb);
  const fakeClock = sinon.useFakeTimers(123456, 'Date');
  const testUsers = {
    user1: models.Naught,
    user2: models.Cross,
  };
  const testTeamID = 'test_team_id';
  const testChanID = 'testChanID';

  before((done) => {
    async.auto({
      dbClient: cbAuto => mongodb.MongoClient.connect(dbConnString, cbAuto),
      dbObj: ['dbClient', ({ dbClient }, cbAuto) => {
        cbAuto(null, new dbModule.DB(dbClient));
      }],
      createIndex: ['dbObj', ({ dbObj }, cbAuto) => {
        dbObj.gamesCollection.createIndex({
          team_id: 1, channel_id: 1,
        }, {
          unique: true,
          partialFilterExpression: { active: true },
        }, cbAuto);
      }],
    }, (err, results) => {
      db = results.dbObj;
      done(err);
    });
  });

  after(() => {
    fakeClock.restore();
  });

  describe('createGame', () => {
    beforeEach(clearDB);

    it('creates an active game with correct information set', (done) => {
      async.auto({
        createGame: (cbAuto) => {
          db.createGame(testTeamID, testChanID, testUsers, 'user1', cbAuto);
        },
        getGame: ['createGame', (results, cbAuto) => {
          db.getActiveGame(testTeamID, testChanID, cbAuto);
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
