const config = require('./config');
const Telegraf = require('telegraf');
const SocksAgent = require('socks5-https-client/lib/Agent');

const socksAgent = new SocksAgent({
  socksHost: `127.0.0.1`,
  socksPort: `9150`,
});

const bot = new Telegraf(config.BOT_TOKEN, {
  telegram: { agent: socksAgent }
});

bot.start((ctx) => ctx.reply('Welcome'));
bot.help((ctx) => ctx.reply('Send me a sticker'));
bot.on('sticker', (ctx) => ctx.reply('👍'));
bot.hears('hi', (ctx) => ctx.reply('Hey there'));
bot.launch();
