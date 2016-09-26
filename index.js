const bodyParser = require('body-parser');
const express = require('express');
const helmet = require('helmet');
const mongodb = require('mongodb');
const morgan = require('morgan');

const dbModule = require('./db');
const server = require('./server');

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ttt-slack';
const port = process.env.PORT || 3000;
const slashTTTToken = process.env.SLASH_TTT_TOKEN || '';

const app = express();
app.use(helmet());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan('combined'));

mongodb.MongoClient.connect(mongoURI, (err, client) => {
  if (err) {
    console.log('Error initializing mongo client:', err);
    return process.exit(1);
  }
  const db = new dbModule.DB(client);
  const tttServer = new server.TTTServer(app, db, slashTTTToken);
  tttServer.setupRoutes();
  return tttServer.listen(port);
});
