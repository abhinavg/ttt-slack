const help = require('./help');
const models = require('./models');

class TTTServer {
  constructor(app, db, token) {
    this.token = token;
    this.app = app;
    this.db = db;
    this.verifySlackToken = this.verifySlackToken.bind(this);
    this.setupRoutes = this.setupRoutes.bind(this);
    this.listen = this.listen.bind(this);
  }

  static verifyCommand(req, res, next) {
    if (req.body.command === '/ttt') {
      return next();
    }
    return res.status(400).send(`Invalid command "${req.body.command}"`);
  }

  verifySlackToken(req, res, next) {
    if (req.body.token === this.token) {
      return next();
    }
    return res.status(400).send(`Invalid token "${req.body.token}"`);
  }

  setupRoutes() {
    const verifySlashTTTReq = [this.verifySlackToken, TTTServer.verifyCommand];
    this.app.post('/slash/ttt', ...verifySlashTTTReq, (req, res) => {
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
  }

  listen(port) {
    this.app.listen(port, () => {
      console.log(`Example app listening on port ${port}!`);
    });
  }
}

module.exports = {
  TTTServer,
};
