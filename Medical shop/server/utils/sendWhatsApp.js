const twilio = require("twilio");

const sendWhatsApp = async (to, body) => {
  try {
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: `whatsapp:+${to}`,
      body,
    });

    return true;
  } catch (error) {
    console.error("WhatsApp sending error:", error.message);
    return false;
  }
};

module.exports = sendWhatsApp;