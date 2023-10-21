require('dotenv').config();
const nodemailer = require('nodemailer');

const sendMail = async (options) => {
  // 1.) create a transporter
  const transporter = nodemailer.createTransport({
    // host: process.env.EMAIL_HOST,
    // port: process.env.EMAIL_PORT,
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  //
  // 2.) Define the email option
  const mailOptions = {
    from: 'Manish Mehta <sheshbahaduryadav2017@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  await transporter.sendMail(mailOptions);
};

module.exports = sendMail;
