db.games.createIndex({channel_id: 1, team_id: 1}, {unique: true, partialFilterExpression: {active: true}})
