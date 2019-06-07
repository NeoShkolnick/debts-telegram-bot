const Markup = require('telegraf/markup');
const session = require('telegraf/session');
const Scene = require('telegraf/scenes/base');
const WizardScene = require('telegraf/scenes/wizard');
const Stage = require('telegraf/stage');
const { enter } = Stage;

const mainKeyboard = Markup.keyboard([
  ['Дать', 'Взять'],
  ['Текущие', 'Архив']
]).oneTime().resize().extra();

const mainScene = new Scene('main');
mainScene.enter((ctx) => ctx.replyWithMarkdown('Выберите действие', mainKeyboard));
mainScene.hears('Взять', enter('get'));
mainScene.hears('Дать', enter('give'));

module.exports = mainScene;
