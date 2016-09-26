const bodyParser = require('body-parser');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');

const server = require('./server');

if (require.main === module) {
  const port = process.env.PORT || 3000;
  const slashTTTToken = process.env.SLASH_TTT_TOKEN || '';
  const app = express();
  app.use(helmet());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(morgan('combined'));
  const tttServer = new server.TTTServer(app, slashTTTToken);
  tttServer.setupRoutes();
  tttServer.listen(port);
}
