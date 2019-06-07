const Markup = require('telegraf/markup');
const session = require('telegraf/session');
const Scene = require('telegraf/scenes/base');
const WizardScene = require('telegraf/scenes/wizard');
const Stage = require('telegraf/stage');
const { enter } = Stage;
const User = require('../models/user');

const mainKeyboard = Markup.keyboard([
  ['Дать', 'Взять'],
  ['Текущие', 'Архив']
]).oneTime().resize().extra();

const mainScene = new Scene('main');
mainScene.enter((ctx) => {
  ctx.replyWithMarkdown('Выберите действие', mainKeyboard);
  User.countDocuments({ chat_id: ctx.from.id}, function (err, count) {
    if (!count) {
      const newUser = new User({
        chat_id: ctx.from.id,
        username: ctx.from.username,
        name: ctx.from.first_name + ' ' + ctx.from.last_name
      });
      newUser.save().then(res => console.log('new user create'));
    }
  });
});
mainScene.hears('Взять', enter('get'));
mainScene.hears('Дать', enter('give'));

module.exports = mainScene;
