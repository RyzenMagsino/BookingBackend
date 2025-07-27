const nodemailer = require('nodemailer');

const sendEmail = async (to, message) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Quote App" <${process.env.EMAIL_USER}>`,
      to,
      subject: 'OTP Verification - Quote App',
      text: message,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}`);
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error);
    throw error;
  }
};

module.exports = sendEmail;
