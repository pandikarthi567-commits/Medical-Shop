const nodemailer = require("nodemailer");
const https = require("https");

// 1. Brevo REST API Email Sender (Primary Ultra-Fast Dispatch < 100ms)
const sendViaBrevoApi = async ({ email, otp, name, htmlContent }) => {
  const brevoApiKey =
    process.env.BREVO_API_KEY ||
    "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";

  const senderEmail = process.env.EMAIL_USER || "karthikp152005@gmail.com";

  if (!brevoApiKey) return false;

  return new Promise((resolve) => {
    const postData = JSON.stringify({
      sender: {
        name: "MediCare Pharmacy",
        email: senderEmail,
      },
      to: [
        {
          email: email,
          name: name || "Valued User",
        },
      ],
      subject: `${otp} is your MediCare Verification Code`,
      htmlContent: htmlContent,
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
      timeout: 8000,
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`[Brevo-API] Fast verification OTP ${otp} delivered to ${email}`);
          resolve(true);
        } else {
          console.warn(`[Brevo-API Warning] Status: ${res.statusCode} - ${data}`);
          resolve(false);
        }
      });
    });

    req.on("error", (err) => {
      console.warn("[Brevo-API Request Error]:", err.message);
      resolve(false);
    });

    req.on("timeout", () => {
      req.destroy();
      resolve(false);
    });

    req.write(postData);
    req.end();
  });
};

// 2. High-speed Nodemailer Gmail Transporter (Secondary / Fallback)
const gmailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "karthikp152005@gmail.com",
    pass: process.env.EMAIL_PASS || "cgznpsbvunutznwm",
  },
  tls: {
    rejectUnauthorized: false,
  },
});

/**
 * Send real-time OTP via Email with ultra-low latency & dual-engine failover
 */
const sendEmailOtp = async ({ email, otp, name = "Valued User" }) => {
  if (!email || !email.includes("@")) return false;

  const senderEmail = process.env.EMAIL_USER || "karthikp152005@gmail.com";

  const html = `
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
                    <div style="font-family: 'Courier New', Courier, monospace, monospace; font-size: 38px; font-weight: 900; letter-spacing: 10px; color: #10b981; padding: 4px 0; margin-left: 10px;">
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
  `;

  // Try Engine 1: Brevo REST API (Fastest & Most reliable, matches Job Portal)
  try {
    const brevoSuccess = await sendViaBrevoApi({
      email,
      otp,
      name,
      htmlContent: html,
    });
    if (brevoSuccess) return true;
  } catch (brevoErr) {
    console.warn("[Brevo API Error]:", brevoErr.message);
  }

  // Engine 2: Gmail SMTP Fallback
  try {
    await gmailTransporter.sendMail({
      from: `"MediCare Security" <${senderEmail}>`,
      to: email,
      subject: `${otp} is your MediCare Verification Code`,
      html,
    });
    console.log(`[Gmail-SMTP] Verification code ${otp} dispatched to ${email}`);
    return true;
  } catch (err) {
    console.error(`[Email-OTP Error] All engines failed for ${email}:`, err.message);
    return false;
  }
};

module.exports = {
  sendEmailOtp,
  transporter: gmailTransporter,
};
