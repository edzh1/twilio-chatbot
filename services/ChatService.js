const servicePhone = process.env.SERVICE_NUMBER;
const serviceError = `An error occurred. Please, try again later.`;
const errorText = 'Please, reply with correct sms.';

const TwilioService = require('../services/TwilioService');
const DropboxService = require('../services/DropboxService');
const MailingService = require('../services/MailingService');
const User = require('../models/User');

const createUser = async (message) => {
  const { From: from, Body: body } = message;
  const messageType = TwilioService.getMessageType(message);
  const newUser = new User(from, messageType);
  const replyText = 'Thank you for your message. What is your first and last name?';

  await TwilioService.reply(from, replyText);

  if (messageType === 'sms') {
    await User.update({ ...newUser, step: 1, firstMessage: body });
  }

  if (messageType === 'mms') {
    const files = TwilioService.parseMMSMedia(message);
    const links = await DropboxService.uploadFiles(files, `${newUser.id}_${newUser.phone}`);
    await User.update({ ...newUser, step: 1, firstMessage: links.join(', ') });
  }

}

const getAddress = async (message, user) => {
  const { From: from, Body: body } = message;
  const messageType = TwilioService.getMessageType(message);

  const replyText = 'And what is your address?';

  if (messageType !== 'sms') {
    await TwilioService.reply(from, errorText);
    throw new Error();
  }

  await TwilioService.reply(from, replyText);
  await User.update({ ...user, step: 2, fullname: body });
}

const getReport = async (message, user) => {
  const { From: from, Body: body } = message;
  const messageType = TwilioService.getMessageType(message);

  const smsReplyText = 'Thanks, your message will be sent to city council. Reply with a photo or selfie and we’ll send that too. Or tell us why you would think it’s important that this promenade will be protected.';
  const mmsReplyText = 'Thanks, it will be sent to city council. We can also forward a short message to city council. Why do you want City Council to save the promenade view?';

  if (messageType !== 'sms') {
    await TwilioService.reply(from, errorText);
    throw new Error();
  }

  await TwilioService.reply(from, user.branch === 'sms' ? smsReplyText : mmsReplyText);
  await User.update({ ...user, step: 3, address: body });
}

const finishConversation = async (message, user) => {
  const { From: from, Body: body } = message;
  const messageType = TwilioService.getMessageType(message);

  const smsReplyText = `Thanks. Your message will be sent. Tell your friends to text ${servicePhone} to send a message to city council to Save the Harconstd Avenue Promenade.`;
  const mmsReplyText = `Thanks. Your message will be sent. Tell your friends to text ${servicePhone} to send a message to city council to Save the Promenade.`;

  if (user.branch === 'mms' && messageType === 'mms') {
    await TwilioService.reply(from, errorText);
    throw new Error();
  }

  await TwilioService.reply(from, user.branch === 'sms' ? smsReplyText : mmsReplyText);

  if (messageType === 'sms') {
    await User.update({ ...user, step: 4, reason: body });
  }

  if (user.branch === 'sms' && messageType === 'mms') {
    const files = TwilioService.parseMMSMedia(messageBody);
    const links = await DropboxService.uploadFiles(files, `${user.id}_${user.phone}`);
    await User.update({ ...user, step: 4, reason: links.join(', ') });
  }

  const updatedUser = await User.get(from);
  const { id, phone, fullname, address, firstMessage, reason } = updatedUser;
  MailingService.send(process.env.SEND_MAIL_TO, { id, phone, fullname, address, firstMessage, reason });
}

const steps = [createUser, getAddress, getReport, finishConversation];

class ChatService {
  constructor(actionsArray) {
    this.actions = actionsArray;
  }

  async proceedMessage(message) {
    const { From: from } = message;
    const user = await User.get(from);
    const step = user.step < this.actions.length ? user.step : 0;

    try {
      await this.actions[step](message, user);
    } catch (error) {
      await TwilioService.reply(from, serviceError);
    }
  }
}

module.exports = new ChatService(steps);