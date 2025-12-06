import nodemailer from "nodemailer";

export const sendOTP = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.USER_PASS,
    },
  });

  const info = await transporter.sendMail({
    from: `"StreamChat Support" <${process.env.MAIL_USER}>`,
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP is: ${otp}`,
    html: `<h2>Your OTP is: <b>${otp}</b></h2>`,
  });
  return info;
};
