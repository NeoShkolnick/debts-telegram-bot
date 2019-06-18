const Telegraf = require('telegraf');
const session = require('telegraf/session');
const Stage = require('telegraf/stage');

const mongoose = require('mongoose');
const SocksAgent = require('socks5-https-client/lib/Agent');

const config = require('./config');
const mainScene = require('./scenes/main');
const giveScene = require('./scenes/give');
const getScene = require('./scenes/get');
const returnScene = require('./scenes/return');
const asyncWrapper = require('./utll/error-handler');

const socksAgent = new SocksAgent({
  socksHost: `127.0.0.1`,
  socksPort: `9150`,
});


mongoose.connect(`mongodb+srv://${config.MONGODB_USER}:${config.MONGODB_PASSWORD}@bdfortelegrambot-ftbxu.azure.mongodb.net/test?retryWrites=true&w=majority`, {
  useNewUrlParser: true,
  useCreateIndex: true
});

mongoose.connection.on('error', err => {
  console.error(`Error occured during an attempt to establish connection with the database: %O`, err);
  process.exit(1);
});

mongoose.connection.on('open', () => {
  const bot = new Telegraf(config.BOT_TOKEN, {
    telegram: { agent: socksAgent }
  });
  const stage = new Stage([mainScene, giveScene, getScene, returnScene]);
  bot.use(session());
  bot.use(stage.middleware());
  bot.start(asyncWrapper(async ctx => ctx.scene.enter('main')));

  bot.launch();
});
