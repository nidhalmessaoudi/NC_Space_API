import nodemailer from "nodemailer";

const sendEmail = (options) => {
  // CREATE A TRANSPORTER
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // DEFINE EMAIL OPTIONS
  const mailOptions = {
    from: "Nidhal Messaoudi <contactme.nidhal@gmail.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // SEND EMAIL
  return transporter.sendMail(mailOptions);
};

export default sendEmail;
