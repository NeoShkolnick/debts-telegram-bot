const Markup = require('telegraf/markup');
const Stage = require('telegraf/stage');
const Scene = require('telegraf/scenes/base');
const WizardScene = require('telegraf/scenes/wizard');
const Composer = require('telegraf/composer');

const { enter } = Stage;

const User = require('../models/user');
const Contact = require('../models/contact');
const Debt = require('../models/debt');

const getDebtsKeyboard = (contacts, isUserDebtor) => {
  const debts = contacts.reduce((acc, contact) => {
    const debts = contact.debts.filter(debt => debt.isContactDebtor !== isUserDebtor);
    return [...acc, ...debts.map(debt => `${contact.name}|${debt.value}|${debt.comment}`)];
  }, []);
  return Markup.keyboard(
    [...debts, 'Назад']
  ).resize().extra();
};

const getDebtKeyboard = () => {
  return Markup.keyboard(
    ['Да, долг возращён полностью', 'Назад']
  ).resize().extra();
};

const stepDebts = new Composer();
stepDebts.hears('Назад', (ctx) => {
  return ctx.scene.enter('main');
});
stepDebts.on('text', ctx => {
  const keyboard = getDebtsKeyboard(ctx.session.contacts, ctx.session.isUserDebtor);
  if (keyboard.reply_markup.keyboard.flat().includes(ctx.message.text)) {
    const msg = ctx.message.text.split('|');
    Contact.findOne({ user: ctx.session.user._id, name: msg[0] }, function (err, contact) {
      Debt.findOne({ contact: contact._id, value: Number(msg[1]),
        isContactDebtor: !ctx.session.isUserDebtor, comment: msg[2]}, function (err, debt) {
        ctx.session.debt = debt;
        ctx.replyWithMarkdown('Долг возращён полностью? Если частично введите сумму.', getDebtKeyboard());
        return ctx.wizard.next();
      });
    });
    return ctx.reply('Выбран долг!');
  }
  return ctx.reply('Такого долга не существует');
});

const stepDebt = new Composer();
stepDebt.hears('Назад', (ctx) => {
  return ctx.scene.enter('return');
});
stepDebt.hears('Да, долг возращён полностью', ctx => {
  const debt = ctx.session.debt;
  Contact.findOne({ _id: debt.contact }, function (err, contact) {
    contact.debts.pull(debt._id);
    contact.save();
    Debt.deleteOne({ _id: debt._id });
    ctx.reply('Долг удалён');
  });
  return ctx.scene.enter('main');
});
stepDebt.on('text', ctx => {
  const debt = ctx.session.debt;
  const newValue = parseInt(ctx.message.text);
  if (!newValue) {
    return ctx.replyWithMarkdown('Введите коррекное число', getDebtKeyboard());
  }
  if (newValue > debt.value) {
    return ctx.replyWithMarkdown(`Число больше ${debt.value}`, getDebtKeyboard());
  }
  debt.value -= newValue;
  debt.save();
  ctx.reply('Долг обновлён');
  return ctx.scene.enter('main');
});

const returnScene = new WizardScene('return',
  (ctx) => {
    User.findOne({ chat_id: ctx.from.id }, function (err, user) {
      ctx.session.user = user;
      Contact.find({ user: user._id }).populate('debts').exec(function (err, contacts) {
        ctx.session.contacts = contacts;
        const numOfDebts = contacts.reduce((acc, contact) => acc + contact.debts.length, 0);
        if (numOfDebts) {
          const keyboard = getDebtsKeyboard(ctx.session.contacts, ctx.session.isUserDebtor);
          ctx.replyWithMarkdown(`Какой долг ${ctx.session.isUserDebtor ? 'вы' : 'вам'} вернули?`, keyboard);
          return ctx.wizard.next();
        }
        ctx.reply('Долги отсутствуют');
        return ctx.scene.enter('main');
      });
    });
  },
  stepDebts,
  stepDebt
);


module.exports = returnScene;
