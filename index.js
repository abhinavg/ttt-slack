const bodyParser = require('body-parser');
const express = require('express');
const helmet = require('helmet');

const app = express();
const port = process.env.PORT || 3000;
const slashTTTToken = process.env.SLASH_TTT_TOKEN || '';

app.use(helmet());
app.use(bodyParser.urlencoded({ extended: false }));

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
  res.json({ text: 'This is WIP Tic-Tac-Toe implementation' });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});
