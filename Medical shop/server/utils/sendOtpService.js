const nodemailer = require("nodemailer");

// High-speed Pooled Nodemailer SMTP Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || process.env.SMTP_USER || process.env.MAIL_USER || "karthikp152005@gmail.com",
    pass: process.env.EMAIL_PASS || process.env.SMTP_PASS || process.env.MAIL_PASS || "cgznpsbvunutznwm",
  },
  pool: true, // Keep connections alive for instantaneous delivery
  maxConnections: 10,
  maxMessages: Infinity,
  rateDelta: 1000,
  rateLimit: 10,
  family: 4, // Force IPv4 to prevent 3-5s DNS resolution timeouts
  socketTimeout: 10000,
  connectionTimeout: 10000,
  tls: {
    rejectUnauthorized: false,
  },
});

// Warm up transporter connection in background
transporter.verify((error) => {
  if (error) {
    console.warn("[Email-OTP] SMTP Pre-warm notice:", error.message);
  } else {
    console.log("[Email-OTP] Fast SMTP Connection Pool is ready & verified.");
  }
});

/**
 * Send real-time OTP via Email with ultra-low latency
 */
const sendEmailOtp = async ({ email, otp, name = "Valued User" }) => {
  if (!email || !email.includes("@")) return false;

  const senderEmail =
    process.env.EMAIL_USER ||
    process.env.SMTP_USER ||
    process.env.MAIL_USER ||
    "karthikp152005@gmail.com";

  try {
    await transporter.sendMail({
      from: `"MediCare Security" <${senderEmail}>`,
      to: email,
      subject: `${otp} is your MediCare Verification Code`,
      priority: "high",
      headers: {
        "X-Priority": "1",
        "X-MSMail-Priority": "High",
        Importance: "high",
      },
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0f172a; padding: 30px 15px;">
            <tr>
              <td align="center">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 480px; background-color: #1e293b; border-radius: 20px; border: 1px solid #334155; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
                  
                  <!-- Top Header Banner -->
                  <tr>
                    <td style="padding: 28px 24px 20px; text-align: center; background: linear-gradient(135deg, #059669 0%, #0d9488 50%, #0284c7 100%);">
                      <div style="display: inline-block; background: rgba(255, 255, 255, 0.2); border-radius: 9999px; padding: 6px 16px; margin-bottom: 12px;">
                        <span style="color: #ffffff; font-size: 12px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;">Instant Verification</span>
                      </div>
                      <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">MediCare Pharmacy</h1>
                      <p style="color: #e2e8f0; font-size: 13px; margin: 6px 0 0 0; opacity: 0.9;">Fast & Secure Account Authentication</p>
                    </td>
                  </tr>

                  <!-- Main Content Body -->
                  <tr>
                    <td style="padding: 28px 24px 20px; text-align: center;">
                      <p style="color: #94a3b8; font-size: 14px; line-height: 1.5; margin: 0 0 20px 0;">
                        Hello <strong style="color: #f1f5f9;">${name || "User"}</strong>,<br>
                        Here is your one-time verification code to continue:
                      </p>

                      <!-- OTP Box -->
                      <div style="background-color: #0f172a; border: 2px dashed #059669; border-radius: 16px; padding: 20px; margin: 0 auto 20px auto; max-width: 340px;">
                        <div style="color: #34d399; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px;">
                          Verification Code
                        </div>
                        <div style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 900; letter-spacing: 10px; color: #10b981; padding: 4px 0; margin-left: 10px;">
                          ${otp}
                        </div>
                        <div style="color: #64748b; font-size: 11px; margin-top: 8px;">
                          Expires in <span style="color: #cbd5e1; font-weight: 600;">5 minutes</span>
                        </div>
                      </div>

                      <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin: 0 0 20px 0;">
                        Enter this code on your sign-in page to instantly verify your identity. Never share this code with anyone.
                      </p>

                      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-top: 1px solid #334155; margin-top: 20px; padding-top: 16px;">
                        <tr>
                          <td style="text-align: center; color: #475569; font-size: 11px;">
                            MediCare+ Secured Authentication &bull; Automated Fast Delivery
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });
    console.log(`[Email-OTP] Fast verification code ${otp} dispatched to ${email}`);
    return true;
  } catch (err) {
    console.warn(`[Email-OTP Error] Failed to send email to ${email}:`, err.message);
    return false;
  }
};

module.exports = {
  sendEmailOtp,
  transporter,
};
