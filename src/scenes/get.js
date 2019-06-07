const Markup = require('telegraf/markup');
const session = require('telegraf/session');
const Scene = require('telegraf/scenes/base');
const WizardScene = require('telegraf/scenes/wizard');
const Stage = require('telegraf/stage');
const { enter } = Stage;

const getScene = new WizardScene('get',
  (ctx) => {
    ctx.reply('У кого вы взяли в долг?');
    return ctx.wizard.next();
  },
  (ctx) => {
    console.log(ctx.message.text);
    ctx.reply('Cумма долга?');
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

module.exports = getScene;
