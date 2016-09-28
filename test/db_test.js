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
  const testUsers = [
    { username: '@user1', value: models.Values.Naught },
    { username: '@user2', value: models.Values.Cross },
  ];
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
          db.createGame(testTeamID, testChanID, testUsers, 1, cbAuto);
        },
        getGame: ['createGame', (results, cbAuto) => {
          db.getActiveGame(testTeamID, testChanID, cbAuto);
        }],
      }, (err, { createGame, getGame }) => {
        assert.ifError(err);
        assert.equal(createGame.team_id, testTeamID);
        assert.equal(createGame.channel_id, testChanID);
        assert.deepEqual(createGame.users, testUsers);
        assert.equal(createGame.next_move_index, 1);
        assert.deepEqual(createGame.state, models.EmptyState);
        assert(createGame.active);
        assert.equal(createGame.start_time, 123456);
        assert.deepEqual(createGame, getGame);
        return done();
      });
    });
  });

  describe('getActiveGame', () => {
    beforeEach(clearDB);

    it('calls cb with null game and no error if no active game found', (done) => {
      async.auto({
        insertGame: (cbAuto) => {
          db.gamesCollection.insertOne({
            team_id: testTeamID,
            channel_id: testChanID,
            active: false,
          }, cbAuto);
        },
        getGame: ['insertGame', (results, cbAuto) => {
          db.getActiveGame(testTeamID, testChanID, cbAuto);
        }],
      }, (err, { getGame }) => {
        assert.ifError(err);
        assert.equal(getGame, null);
        done();
      });
    });
  });

  describe('makeMove', () => {
    beforeEach(clearDB);

    it('correctly updates games and moves collections when game not finished', (done) => {
      async.auto({
        createGame: (cbAuto) => {
          db.createGame(testTeamID, testChanID, testUsers, 1, cbAuto);
        },
        makeMove: ['createGame', ({ createGame }, cbAuto) => {
          db.makeMove(createGame, 1, '3', cbAuto);
        }],
        getGame: ['makeMove', (results, cbAuto) => {
          db.getActiveGame(testTeamID, testChanID, cbAuto);
        }],
        getMove: ['makeMove', ({ makeMove }, cbAuto) => {
          db.movesCollection.findOne({ game_id: makeMove._id }, cbAuto);
        }],
      }, (err, results) => {
        assert.ifError(err);
        assert.deepEqual(results.makeMove, results.getGame);
        assert.equal(results.makeMove.next_move_index, 0);
        assert.equal(results.makeMove.state['3'], testUsers[1].value);
        delete results.getMove._id;
        assert.deepEqual(results.getMove, {
          game_id: results.makeMove._id,
          username: testUsers[1].username,
          value: testUsers[1].value,
          position: '3',
          timestamp: 123456,
        });
        done();
      });
    });
  });
});
