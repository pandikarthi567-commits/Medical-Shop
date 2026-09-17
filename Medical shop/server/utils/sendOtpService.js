const nodemailer = require("nodemailer");

// Nodemailer SMTP Transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  service: process.env.MAIL_SERVICE || "gmail",
  auth: {
    user: process.env.SMTP_USER || process.env.MAIL_USER || process.env.EMAIL_USER,
    pass: process.env.SMTP_PASS || process.env.MAIL_PASS || process.env.EMAIL_PASS,
  },
});

/**
 * Send real-time OTP via Email
 */
const sendEmailOtp = async ({ email, otp, name = "Valued Patient" }) => {
  if (!email || !email.includes("@")) return false;

  try {
    await transporter.sendMail({
      from: `"MediCare Pharmacy" <${process.env.SMTP_USER || "karthikp152005@gmail.com"}>`,
      to: email,
      subject: `${otp} is your MediCare Verification Code`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background: #ffffff;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #059669; margin: 0;">MediCare Pharmacy</h2>
            <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Patient Portal Verification</p>
          </div>
          <div style="background: #f0fdf4; border: 1px dashed #86efac; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0;">
            <p style="color: #166534; font-size: 13px; font-weight: bold; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">Your Verification Code</p>
            <h1 style="font-size: 36px; letter-spacing: 6px; color: #047857; margin: 0; font-family: monospace;">${otp}</h1>
            <p style="color: #64748b; font-size: 12px; margin: 8px 0 0 0;">Valid for 5 minutes</p>
          </div>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">
            Hello ${name || "Valued Patient"}, use this verification code to securely access your MediCare medical account.
          </p>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 12px;">
            If you did not request this OTP, please ignore this email.
          </p>
        </div>
      `,
    });
    console.log(`[Email-OTP] Successfully sent verification code ${otp} to ${email}`);
    return true;
  } catch (err) {
    console.warn(`[Email-OTP Error] Failed to send email to ${email}:`, err.message);
    return false;
  }
};

module.exports = {
  sendEmailOtp,
};
