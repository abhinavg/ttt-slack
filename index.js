const bodyParser = require('body-parser');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');

const help = require('./help');
const models = require('./models');

const verifySlackToken = token => (req, res, next) => {
  if (req.body.token === token) {
    return next();
  }
  return res.status(400).send(`Invalid token "${req.body.token}"`);
};

function verifyCommand(req, res, next) {
  if (req.body.command === '/ttt') {
    return next();
  }
  return res.status(400).send(`Invalid command "${req.body.token}"`);
}

function initServer(port, token) {
  const app = express();
  app.use(helmet());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(morgan('combined'));

  app.get('/', (req, res) => {
    res.send('Hello World!');
  });

  const verifySlashTTTReq = [verifySlackToken(token), verifyCommand];
  app.post('/slash/ttt', ...verifySlashTTTReq, (req, res) => {
    console.log(`Request Body: ${JSON.stringify(req.body)}`);
    const splitText = (req.body.text || '').split(' ');
    switch (splitText[0]) {
      case '':
      case models.Commands.Help:
        res.json(help.HelpResponse);
        break;
      default:
        res.json(help.InvalidCmdResponse);
        break;
    }
  });

  app.listen(port, () => {
    console.log(`Example app listening on port ${port}!`);
  });
}

if (require.main === module) {
  const port = process.env.PORT || 3000;
  const slashTTTToken = process.env.SLASH_TTT_TOKEN || '';
  initServer(port, slashTTTToken);
}
