const twilio = require('twilio');
const servicePhone = process.env.SERVICE_NUMBER;

class TwilioService {
  constructor() {
    this.client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }

  getMessageType(body) {
    if (parseInt(body.NumMedia) === 0) return 'sms';

    return 'mms';
  }

  reply(to, content) {
    return this.client.messages
      .create({
        body: content,
        from: servicePhone,
        to
      })
  }

  async parseMMSMedia(body) {
    const { NumMedia } = body;
    const mediaItems = [];

    for (const i = 0; i < NumMedia; i++) {
      const mediaUrl = body[`MediaUrl${i}`];
      const contentType = body[`MediaContentType${i}`];
      const extension = extName.mime(contentType)[0].ext;

      mediaItems.push({ mediaUrl, extension });
    }

    return mediaItems;
  }


  deleteMediaItem(mediaItem) {
    return this.client
      .api.accounts(process.env.TWILIO_ACCOUNT_SID)
      .messages(mediaItem.MessageSid)
      .media(mediaItem.mediaSid).remove();
  }
}

module.exports = new TwilioService();