const Markup = require('telegraf/markup');
const Stage = require('telegraf/stage');
const WizardScene = require('telegraf/scenes/wizard');
const Composer = require('telegraf/composer');
const session = require('telegraf/session');
const { enter } = Stage;

const User = require('../models/user');
const Contact = require('../models/contact');
const Debt = require('../models/debt');

const getContactKeyboard = contacts => {
  return Markup.keyboard(
    [...contacts.map(contact => contact.name), 'Добавить']
  ).oneTime().resize().extra();
};

const stepContact = new Composer();
stepContact.hears('Добавить', ctx => {
  ctx.session.isNewContact = true;
  ctx.reply('Введите имя нового контакта', Markup.removeKeyboard().extra());
});
stepContact.on('text', async ctx => {
  const contact = ctx.session.contacts.find(contact => ctx.message.text === contact.name);
  if (ctx.session.isNewContact && !contact) {
    const newContact = new Contact({
      name: ctx.message.text,
      user: ctx.session.user._id
    });
    await newContact.save();
    ctx.session.contact = newContact;
    ctx.session.isNewContact = false;
    await ctx.reply('Сумма долга?', Markup.removeKeyboard().extra());
    return ctx.wizard.next();
  }
  if (contact) {
    ctx.session.contact = contact;
    await ctx.reply('Сумма долга?', Markup.removeKeyboard().extra());
    return ctx.wizard.next();
  } else {
    await ctx.replyWithMarkdown('Данный контакт не существует', getContactKeyboard(ctx.session.contacts));
  }
});

const giveScene = new WizardScene('give',
  async ctx => {
    const user = await User.findOne({ chat_id: ctx.from.id });
    ctx.session.user = user;
    const contacts = await Contact.find({ user: user._id });
    ctx.session.contacts = contacts;
    await ctx.replyWithMarkdown('Кому вы дали в долг?', getContactKeyboard(ctx.session.contacts));
    return ctx.wizard.next();
  },
  stepContact,
  async ctx => {
    const value = parseInt(ctx.message.text);
    if (!value || value <= 0) {
      return ctx.reply('Введите корректное число');
    }
    ctx.session.debt = {
      value: value,
      contact: ctx.session.contact._id,
      isContactDebtor: true
    };
    await ctx.reply('Комментарий к долгу');
    return ctx.wizard.next();
  },
  async ctx => {
    if (ctx.message.text.indexOf('|') !== -1) {
      return ctx.reply('Комментарий не может содержать |');
    }
    ctx.session.debt.comment = ctx.message.text;
    const newDebt = new Debt(ctx.session.debt);
    await newDebt.save();
    ctx.session.contact.debts.push(newDebt._id);
    await ctx.session.contact.save();
    await ctx.reply('Долг создан!');
    return ctx.scene.enter('main');
  }
);
giveScene.command('start', ctx => ctx.scene.enter('main'));

module.exports = giveScene;
