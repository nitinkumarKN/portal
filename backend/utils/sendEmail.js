import nodemailer from 'nodemailer';

export const sendEmail = async ({ to, subject, text }) => {
  try {
    const transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `Placement Portal <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text
    });

    console.log('Email sent successfully');
  } catch (error) {
    console.error('Email error:', error);
  }
};
