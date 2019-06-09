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
  ctx.reply('Введите имя нового контакта');
});
stepContact.on('text', ctx => {
  if (ctx.session.isNewContact) {
    const newContact = new Contact({
      name: ctx.message.text,
      user: ctx.session.user._id
    });
    newContact.save().then(res => console.log('new contact create'));
    ctx.session.contact = newContact;
    ctx.session.isNewContact = false;
    ctx.reply('Сумма долга?');
    ctx.wizard.next();
  } else {
    const contact = ctx.session.contacts.find(contact => ctx.message.text === contact.name);
    if (contact) {
      ctx.session.contact = contact;
      ctx.reply('Сумма долга?');
      ctx.wizard.next();
    } else {
      ctx.replyWithMarkdown('Данный контакт не существует', getContactKeyboard(ctx.session.contacts));
    }
  }
});

const giveScene = new WizardScene('give',
  (ctx) => {
    User.findOne({ chat_id: ctx.from.id }, function (err, user) {
      ctx.session.user = user;
      Contact.find({ user: user._id }, function (err, contacts) {
        ctx.session.contacts = contacts;
        ctx.replyWithMarkdown('Кому вы дали в долг?', getContactKeyboard(ctx.session.contacts));
      });
    });
    return ctx.wizard.next();
  },
  stepContact,
  (ctx) => {
    ctx.session.debt = {
      value: Number(ctx.message.text),
      contact: ctx.session.contact._id,
      isContactDebtor: true
    };
    ctx.reply('Комментарий к долгу');
    return ctx.wizard.next();
  },
  (ctx) => {
    ctx.session.debt.comment = ctx.message.text;
    new Debt(ctx.session.debt).save().then(res => console.log('new debt create'));
    ctx.reply('Долг создан!');
    return ctx.scene.enter('main');
  }
);

module.exports = giveScene;
