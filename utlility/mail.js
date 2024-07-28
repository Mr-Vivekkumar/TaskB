const nodemailer = require('nodemailer');
require('dotenv').config();
let transporter = nodemailer.createTransport({
  service: 'hotmail', 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
const sendMail = (to, subject, text) => {
  let mailOptions = {
    from: process.env.EMAIL_USER,
    to: to, 
    subject: subject,
    html: text,
    // html: '<b>Hello world?</b>'
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  });
};

module.exports ={
    sendMail
}