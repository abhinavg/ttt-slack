const bodyParser = require('body-parser');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');

const help = require('./help');

const app = express();
const port = process.env.PORT || 3000;
const slashTTTToken = process.env.SLASH_TTT_TOKEN || '';

app.use(helmet());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan('combined'));

function verifySlackToken(req, res, next) {
  if (req.body.token === slashTTTToken) {
    return next();
  }
  return res.status(400).send(`Invalid token "${req.body.token}"`);
}

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/slash/ttt', verifySlackToken, (req, res) => {
  console.log(`Request Body: ${JSON.stringify(req.body)}`);
  switch (req.body.command) {
    case '/ttt':
    case '/ttt help':
      res.json(help.HelpResponse);
      break;
    default:
      res.json(help.InvalidCmdResponse);
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});
