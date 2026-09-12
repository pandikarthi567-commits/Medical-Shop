const nodemailer = require("nodemailer");
const twilio = require("twilio");

// EMAIL CONFIG
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// TWILIO CONFIG
const client = twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// EMAIL ALERT
const sendEmailAlert = async (subject, text) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject,
      text,
    });
  } catch (error) {
    console.error("Email alert failed:", error.message);
  }
};

// WHATSAPP ALERT
const sendWhatsAppAlert = async (message) => {
  try {
    await client.messages.create({
      from: `whatsapp:${process.env.TWILIO_PHONE}`,
      to: `whatsapp:${process.env.ADMIN_PHONE}`,
      body: message,
    });
  } catch (error) {
    console.error("WhatsApp alert failed:", error.message);
  }
};

module.exports = {
  sendEmailAlert,
  sendWhatsAppAlert,
};