const Telegraf = require('telegraf');
const session = require('telegraf/session');
const Stage = require('telegraf/stage');

const mongoose = require('mongoose');

const mainScene = require('./scenes/main');
const giveScene = require('./scenes/give');
const getScene = require('./scenes/get');
const returnScene = require('./scenes/return');
const asyncWrapper = require('./utll/error-handler');

mongoose.connect(`mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@bdfortelegrambot-ftbxu.azure.mongodb.net/test?retryWrites=true&w=majority`, {
  useNewUrlParser: true,
  useCreateIndex: true
});

mongoose.connection.on('error', err => {
  console.error(`Error occured during an attempt to establish connection with the database: %O`, err);
  process.exit(1);
});

mongoose.connection.on('open', () => {
  const bot = new Telegraf(process.env.BOT_TOKEN);
  const stage = new Stage([mainScene, giveScene, getScene, returnScene]);
  bot.use(session());
  bot.use(stage.middleware());
  bot.start(asyncWrapper(async ctx => ctx.scene.enter('main')));

  bot.launch();
});
