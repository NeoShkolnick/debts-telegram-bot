const Markup = require('telegraf/markup');
const Stage = require('telegraf/stage');
const session = require('telegraf/session');
const Scene = require('telegraf/scenes/base');
const WizardScene = require('telegraf/scenes/wizard');

const { enter } = Stage;
const User = require('../models/user');

const mainKeyboard = Markup.keyboard([
  ['Дать', 'Взять'],
  ['Вам вернули', 'Вернуть']
]).oneTime().resize().extra();

const mainScene = new Scene('main');
mainScene.enter(async (ctx) => {
  const count = await User.countDocuments({ chat_id: ctx.from.id });
  if (!count) {
    const newUser = new User({
      chat_id: ctx.from.id,
      username: ctx.from.username,
      name: ctx.from.first_name + ' ' + ctx.from.last_name
    });
    await newUser.save();
  }
  await ctx.replyWithMarkdown('Выберите действие', mainKeyboard);
});
mainScene.hears('Взять', async ctx => await ctx.scene.enter('get'));
mainScene.hears('Дать', async ctx => await ctx.scene.enter('give'));
mainScene.hears('Вернуть', async ctx => {
  ctx.session.isUserDebtor = true;
  await ctx.scene.enter('return');
});
mainScene.hears('Вам вернули', async ctx => {
  ctx.session.isUserDebtor = false;
  await ctx.scene.enter('return');
});

module.exports = mainScene;
