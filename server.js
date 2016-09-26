const challenge = require('./challenge_cmd');
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
    this.postRoute = this.postRoute.bind(this);
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

  postRoute(req, res, next) {
    console.log(`Request Body: ${JSON.stringify(req.body)}`);
    const splitText = (req.body.text || '').split(' ');
    let cmd;
    switch (splitText[0]) {
      case '':
      case models.Commands.Help:
        cmd = help.HelpCmd;
        break;
      case models.Commands.Challenge:
        cmd = new challenge.ChallengeCmd(this.db, req.body.team_id, req.body.channel_id,
          req.body.user_name, splitText);
        break;
      default:
        cmd = help.InvalidCmd;
        break;
    }
    cmd.run((err, response) => {
      if (err) {
        return next(err);
      }
      return res.json(response);
    });
  }

  setupRoutes() {
    const verifySlashTTTReq = [this.verifySlackToken, TTTServer.verifyCommand];
    this.app.post('/slash/ttt', ...verifySlashTTTReq, this.postRoute);
  }

  listen(port) {
    this.app.listen(port, () => {
      console.log(`TTT server listening on port ${port}!`);
    });
  }
}

module.exports = {
  TTTServer,
};
