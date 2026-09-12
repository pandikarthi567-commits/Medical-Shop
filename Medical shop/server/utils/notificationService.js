const nodemailer = require("nodemailer");
const twilio = require("twilio");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const client = twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH_TOKEN
);


// EMAIL ORDER NOTIFICATION
const sendOrderEmail = async (email, orderId) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Order Confirmed",
    text: `Your order ${orderId} has been placed successfully.`,
  });
};


// WHATSAPP ORDER NOTIFICATION
const sendOrderWhatsApp = async (phone, orderId) => {
  await client.messages.create({
    from: `whatsapp:${process.env.TWILIO_PHONE}`,
    to: `whatsapp:${phone}`,
    body: `Your order ${orderId} is confirmed.`,
  });
};

module.exports = {
  sendOrderEmail,
  sendOrderWhatsApp,
};