const Markup = require('telegraf/markup');
const session = require('telegraf/session');
const Scene = require('telegraf/scenes/base');
const WizardScene = require('telegraf/scenes/wizard');
const Stage = require('telegraf/stage');
const { enter } = Stage;

const giveScene = new WizardScene('give',
  (ctx) => {
    ctx.reply('Кому вы дали в долг?');
    return ctx.wizard.next();
  },
  (ctx) => {
    console.log(ctx.message.text);
    ctx.reply('Сумму долга');
    return ctx.wizard.next();
  },
  (ctx) => {
    console.log(ctx.message.text);
    ctx.reply('Комментарий к долгу');
    return ctx.wizard.next();
  },
  (ctx) => {
    console.log(ctx.message.text);
    ctx.reply('Долг создан!');
    return ctx.scene.enter('main');
  }
);

module.exports = giveScene;
