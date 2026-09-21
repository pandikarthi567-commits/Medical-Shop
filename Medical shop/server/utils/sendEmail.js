const nodemailer = require("nodemailer");
const https = require("https");

const brevoApiKey =
  process.env.BREVO_API_KEY ||
  "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";

const sendViaBrevo = async ({ to, subject, html, text, senderName = "MediCare+ Store" }) => {
  if (!brevoApiKey) return false;
  const senderEmail = process.env.EMAIL_USER || "karthikp152005@gmail.com";

  return new Promise((resolve) => {
    const postData = JSON.stringify({
      sender: {
        name: senderName,
        email: senderEmail,
      },
      to: [{ email: to }],
      subject: subject,
      htmlContent: html,
      textContent: text,
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
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`[Brevo-API] Email '${subject}' sent successfully to ${to}`);
          resolve(true);
        } else {
          console.warn(`[Brevo-API Warning] Status ${res.statusCode}: ${data}`);
          resolve(false);
        }
      });
    });

    req.on("error", (err) => {
      console.warn("[Brevo-API Error]:", err.message);
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

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || process.env.SMTP_USER || process.env.MAIL_USER || "karthikp152005@gmail.com",
    pass: process.env.EMAIL_PASS || process.env.SMTP_PASS || process.env.MAIL_PASS || "cgznpsbvunutznwm",
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const formatCurrency = (value = 0) => `₹${Number(value).toFixed(2)}`;

const buildItemsRows = (items = []) => {
  return items
    .map(
      (item) => `
        <tr>
          <td style="padding:10px;border:1px solid #e5e7eb;">${item.name}</td>
          <td style="padding:10px;border:1px solid #e5e7eb;text-align:center;">${item.quantity}</td>
          <td style="padding:10px;border:1px solid #e5e7eb;text-align:right;">${formatCurrency(item.price)}</td>
          <td style="padding:10px;border:1px solid #e5e7eb;text-align:right;">${formatCurrency(item.subtotal)}</td>
        </tr>
      `
    )
    .join("");
};

const sendOrderMail = async ({
  to,
  customerName,
  orderId,
  orderDate,
  paymentMethod,
  paymentStatus,
  orderStatus,
  deliveryStatus,
  subtotal,
  shippingCharge,
  tax,
  totalAmount,
  items = [],
  shippingAddress,
  customerPhone,
  trackingUrl,
}) => {
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:700px;margin:0 auto;padding:20px;background:#f8fafc;">
      <div style="background:#10b981;color:#ffffff;padding:24px;border-radius:16px 16px 0 0;">
        <h2 style="margin:0;">Order Confirmation</h2>
        <p style="margin:8px 0 0;">Hello ${customerName || "Customer"}, your order has been placed successfully.</p>
      </div>

      <div style="background:#ffffff;padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 16px 16px;">
        <h3 style="margin-top:0;color:#111827;">Order Details</h3>

        <p><strong>Order ID:</strong> ${orderId}</p>
        <p><strong>Order Date:</strong> ${
          orderDate ? new Date(orderDate).toLocaleString("en-IN") : "N/A"
        }</p>
        <p><strong>Payment Method:</strong> ${paymentMethod || "N/A"}</p>
        <p><strong>Payment Status:</strong> ${paymentStatus || "N/A"}</p>
        <p><strong>Order Status:</strong> ${orderStatus || "N/A"}</p>
        <p><strong>Delivery Status:</strong> ${deliveryStatus || "N/A"}</p>

        <h3 style="margin-top:24px;color:#111827;">Customer Information</h3>
        <p><strong>Name:</strong> ${customerName || "N/A"}</p>
        <p><strong>Email:</strong> ${to || "N/A"}</p>
        <p><strong>Phone:</strong> ${customerPhone || "N/A"}</p>

        <h3 style="margin-top:24px;color:#111827;">Shipping Address</h3>
        <p style="line-height:1.7;">${shippingAddress || "N/A"}</p>

        <h3 style="margin-top:24px;color:#111827;">Items Ordered</h3>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <thead>
            <tr style="background:#f3f4f6;">
              <th style="padding:10px;border:1px solid #e5e7eb;text-align:left;">Product</th>
              <th style="padding:10px;border:1px solid #e5e7eb;text-align:center;">Qty</th>
              <th style="padding:10px;border:1px solid #e5e7eb;text-align:right;">Price</th>
              <th style="padding:10px;border:1px solid #e5e7eb;text-align:right;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${buildItemsRows(items)}
          </tbody>
        </table>

        <h3 style="margin-top:24px;color:#111827;">Payment Summary</h3>
        <p><strong>Subtotal:</strong> ${formatCurrency(subtotal)}</p>
        <p><strong>Shipping Charge:</strong> ${formatCurrency(shippingCharge)}</p>
        <p><strong>Tax:</strong> ${formatCurrency(tax)}</p>
        <p><strong>Total Amount:</strong> ${formatCurrency(totalAmount)}</p>

        <div style="margin-top:28px;">
          <a
            href="${trackingUrl}"
            style="display:inline-block;background:#10b981;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:10px;font-weight:600;"
          >
            Track Your Order
          </a>
        </div>

        <p style="margin-top:28px;color:#6b7280;font-size:14px;">
          Thank you for shopping with us.
        </p>
      </div>
    </div>
  `;

  const text = `
Order Confirmation

Hello ${customerName || "Customer"},

Your order has been placed successfully.

Order ID: ${orderId}
Order Date: ${orderDate ? new Date(orderDate).toLocaleString("en-IN") : "N/A"}
Payment Method: ${paymentMethod || "N/A"}
Payment Status: ${paymentStatus || "N/A"}
Order Status: ${orderStatus || "N/A"}
Delivery Status: ${deliveryStatus || "N/A"}

Customer Name: ${customerName || "N/A"}
Email: ${to || "N/A"}
Phone: ${customerPhone || "N/A"}

Shipping Address:
${shippingAddress || "N/A"}

Items:
${items
  .map(
    (item) =>
      `- ${item.name} | Qty: ${item.quantity} | Price: ${formatCurrency(
        item.price
      )} | Subtotal: ${formatCurrency(item.subtotal)}`
  )
  .join("\n")}

Subtotal: ${formatCurrency(subtotal)}
Shipping Charge: ${formatCurrency(shippingCharge)}
Tax: ${formatCurrency(tax)}
Total Amount: ${formatCurrency(totalAmount)}

Track Order:
${trackingUrl}
`;

  const senderEmail = process.env.EMAIL_USER || process.env.SMTP_USER || process.env.MAIL_USER || "karthikp152005@gmail.com";

  // Try Brevo API first
  const brevoSuccess = await sendViaBrevo({
    to,
    subject: `Order Confirmation - ${orderId}`,
    html,
    text,
    senderName: "MediCare+ Store",
  });
  if (brevoSuccess) return true;

  // Fallback to Gmail SMTP
  try {
    return await transporter.sendMail({
      from: `"MediCare+ Store" <${senderEmail}>`,
      to,
      subject: `Order Confirmation - ${orderId}`,
      html,
      text,
    });
  } catch (err) {
    console.error("[Order Mail Error]:", err.message);
  }
};

const sendAdminLoginMail = async ({ to, name }) => {
  const loginTime = new Date().toLocaleString("en-IN", {
    dateStyle: "full",
    timeStyle: "medium",
  });

  const targetEmail = to || process.env.ADMIN_EMAIL || "pandikarthi567@gmail.com";
  const adminName = name || "Admin";

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#f8fafc;">
      <div style="background:#00bba7;color:#ffffff;padding:24px;border-radius:16px 16px 0 0;text-align:center;">
        <h1 style="margin:0;font-size:24px;">MediCare+ Admin Portal</h1>
        <p style="margin:6px 0 0;font-size:14px;opacity:0.9;">Security & Login Alert</p>
      </div>

      <div style="background:#ffffff;padding:28px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 16px 16px;">
        <h2 style="margin-top:0;color:#0f172a;font-size:20px;">Successful Admin Login</h2>

        <p style="color:#334155;font-size:15px;line-height:1.6;">
          Hello <strong>${adminName}</strong>,
        </p>

        <p style="color:#334155;font-size:15px;line-height:1.6;">
          You have successfully logged into the <strong>MediCare+ Medical Shop Admin Panel</strong>.
        </p>

        <div style="background:#e6f7f5;border:1px solid #b2edd3;padding:16px;border-radius:12px;margin:20px 0;">
          <p style="margin:0 0 8px;color:#0f172a;font-size:14px;"><strong>Login Details:</strong></p>
          <p style="margin:4px 0;color:#334155;font-size:13px;"><strong>Admin Email:</strong> ${targetEmail}</p>
          <p style="margin:4px 0;color:#334155;font-size:13px;"><strong>Login Time:</strong> ${loginTime}</p>
          <p style="margin:4px 0;color:#334155;font-size:13px;"><strong>Access Granted:</strong> Full Administrator Rights</p>
        </div>

        <p style="color:#64748b;font-size:13px;line-height:1.6;">
          If this was you, no further action is required. If you did not perform this login, please immediately contact system administration or change your admin password.
        </p>

        <hr style="border:none;border-top:1px solid #f1f5f9;margin:24px 0;" />

        <p style="margin:0;color:#94a3b8;font-size:12px;text-align:center;">
          MediCare+ Medical Shop Systems &copy; 2026. Automated Security Notification.
        </p>
      </div>
    </div>
  `;

  const text = `
MediCare+ Admin Login Alert

Hello ${adminName},

You have successfully logged into the MediCare+ Medical Shop Admin Panel.

Admin Email: ${targetEmail}
Login Time: ${loginTime}

If this was not you, please secure your account immediately.
`;

  const senderEmail = process.env.EMAIL_USER || process.env.SMTP_USER || process.env.MAIL_USER || "karthikp152005@gmail.com";

  const brevoSuccess = await sendViaBrevo({
    to: targetEmail,
    subject: "🔔 MediCare+ Admin Login Alert Notification",
    html,
    text,
    senderName: "MediCare+ Security",
  });
  if (brevoSuccess) return true;

  try {
    return await transporter.sendMail({
      from: `"MediCare+ Security" <${senderEmail}>`,
      to: targetEmail,
      subject: "🔔 MediCare+ Admin Login Alert Notification",
      html,
      text,
    });
  } catch (err) {
    console.error("[Admin Login Mail Error]:", err.message);
  }
};

module.exports = {
  sendOrderMail,
  sendAdminLoginMail,
};