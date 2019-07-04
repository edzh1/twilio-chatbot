const nodemailer = require("nodemailer");

class MailingService {
  async send(to, data) {
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const htmlBody = Object.keys(data).reduce((acc, cur) => acc + `<p>${cur}: ${data[cur]}</p>`, '');

    let info = await transporter.sendMail({
      from: 'Neighborhood association service',
      to,
      subject: "User report",
      text: JSON.stringify(data),
      html: `<h2>New report received</h2> ${htmlBody}`
    });
  }
}

module.exports = new MailingService();