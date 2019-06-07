const Telegraf = require('telegraf');
const session = require('telegraf/session');
const Stage = require('telegraf/stage');

const { enter, leave } = Stage;

const SocksAgent = require('socks5-https-client/lib/Agent');

const config = require('./config');
const mainScene = require('./scenes/main');
const giveScene = require('./scenes/give');
const getScene = require('./scenes/get');

const socksAgent = new SocksAgent({
  socksHost: `127.0.0.1`,
  socksPort: `9150`,
});

const bot = new Telegraf(config.BOT_TOKEN, {
  telegram: { agent: socksAgent }
});


const stage = new Stage([mainScene, giveScene, getScene]);
bot.use(session());
bot.use(stage.middleware());
bot.command('start', enter('main'));

bot.launch();
