const nodemailer = require("nodemailer");
const https = require("https");
const twilio = require("twilio");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "karthikp152005@gmail.com",
    pass: process.env.EMAIL_PASS || "cgznpsbvunutznwm",
  },
});

const client = twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// EMAIL ORDER NOTIFICATION
const sendOrderEmail = async (email, orderId) => {
  const brevoApiKey =
    process.env.BREVO_API_KEY ||
    "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";

  if (brevoApiKey) {
    try {
      const postData = JSON.stringify({
        sender: { name: "MediCare+ Pharmacy", email: process.env.EMAIL_USER || "karthikp152005@gmail.com" },
        to: [{ email }],
        subject: "Order Confirmed",
        textContent: `Your order ${orderId} has been placed successfully.`,
      });

      const options = {
        hostname: "api.brevo.com",
        port: 443,
        path: "/v3/smtp/email",
        method: "POST",
        headers: {
          accept: "application/json",
          "api-key": brevoApiKey,
          "content-type": "application/json",
          "content-length": Buffer.byteLength(postData),
        },
      };

      await new Promise((resolve) => {
        const req = https.request(options, (res) => resolve(res.statusCode >= 200 && res.statusCode < 300));
        req.on("error", () => resolve(false));
        req.write(postData);
        req.end();
      });
      return;
    } catch (err) {
      console.warn("Brevo order email fallback:", err.message);
    }
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER || "karthikp152005@gmail.com",
      to: email,
      subject: "Order Confirmed",
      text: `Your order ${orderId} has been placed successfully.`,
    });
  } catch (err) {
    console.error("Order notification email error:", err.message);
  }
};

// WHATSAPP ORDER NOTIFICATION
const sendOrderWhatsApp = async (phone, orderId) => {
  try {
    await client.messages.create({
      from: `whatsapp:${process.env.TWILIO_PHONE}`,
      to: `whatsapp:${phone}`,
      body: `Your order ${orderId} is confirmed.`,
    });
  } catch (err) {
    console.error("WhatsApp notification error:", err.message);
  }
};

module.exports = {
  sendOrderEmail,
  sendOrderWhatsApp,
};