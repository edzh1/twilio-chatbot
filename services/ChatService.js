const servicePhone = process.env.SERVICE_NUMBER;
const serviceError = `An error occurred. Please, try again later.`;
const errorText = 'Please, reply with correct sms.';

const TwilioService = require('../services/TwilioService');
const DropboxService = require('../services/DropboxService');
const MailingService = require('../services/MailingService');
const User = require('../models/User');

class ChatService {
  async proceedMessage(messageData) {
    const { From: from, Body: body } = messageData;
    const messageType = TwilioService.getMessageType(messageData);
    const user = await User.get(from);
    const step = user.step || 0;


    switch (step) {
      default:
      case 0: {
        try {
          const newUser = new User(from, messageType);
          const replyText = 'Thank you for your message. What is your first and last name?';

          await TwilioService.reply(from, replyText);

          if (messageType === 'sms') {
            await User.update({ ...newUser, step: 1, firstMessage: body });
          }

          if (messageType === 'mms') {
            const files = TwilioService.parseMMSMedia(body);
            const links = await DropboxService.uploadFiles(files, `${newUser.id}_${newUser.phone}`);
            await User.update({ ...newUser, step: 1, firstMessage: links.join(', ') });
          }
        } catch (error) {
          console.log(error);
          await TwilioService.reply(from, serviceError);
        }

        break;
      }
      case 1: {
        const replyText = 'And what is your address?';

        if (messageType !== 'sms') {
          await TwilioService.reply(from, errorText);
          throw new Error();
        }

        try {
          await TwilioService.reply(from, replyText);
          await User.update({ ...user, step: 2, fullname: body });
        } catch (error) {
          await TwilioService.reply(from, serviceError);
        }

        break;
      }
      case 2: {
        const smsReplyText = 'Thanks, your message will be sent to city council. Reply with a photo or selfie and we’ll send that too. Or tell us why you would think it’s important that this promenade will be protected.';
        const mmsReplyText = 'Thanks, it will be sent to city council. We can also forward a short message to city council. Why do you want City Council to save the promenade view?';

        if (messageType !== 'sms') {
          await TwilioService.reply(from, errorText);
          throw new Error();
        }

        try {
          await TwilioService.reply(from, user.branch === 'sms' ? smsReplyText : mmsReplyText);
          await User.update({ ...user, step: 3, address: body });
        } catch (error) {
          await TwilioService.reply(from, serviceError);
        }

        break;
      }
      case 3: {
        const smsReplyText = `Thanks. Your message will be sent. Tell your friends to text ${servicePhone} to send a message to city council to Save the Harconstd Avenue Promenade.`;
        const mmsReplyText = `Thanks. Your message will be sent. Tell your friends to text ${servicePhone} to send a message to city council to Save the Promenade.`;

        if (user.branch === 'mms' && messageType === 'mms') {
          await TwilioService.reply(from, errorText);
          throw new Error();
        }

        try {
          await TwilioService.reply(from, user.branch === 'sms' ? smsReplyText : mmsReplyText);

          if (messageType === 'sms') {
            await User.update({ ...user, step: 4, reason: body });
          }

          if (user.branch === 'sms' && messageType === 'mms') {
            const files = TwilioService.parseMMSMedia(body);
            const links = await DropboxService.uploadFiles(files, `${user.id}_${user.phone}`);
            await User.update({ ...user, step: 4, reason: links.join(', ') });
          }


          const updatedUser = await User.get(from);
          const { id, phone, fullname, address, firstMessage, reason } = updatedUser;
          MailingService.send(process.env.SEND_MAIL_TO, { id, phone, fullname, address, firstMessage, reason });

        } catch (error) {
          await TwilioService.reply(from, serviceError);
        }

        break;
      }
    }
  }
}

module.exports = new ChatService();