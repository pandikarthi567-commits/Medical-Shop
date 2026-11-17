// Mock data and FAQ knowledgebase for the Chatbot Widget
export const quickLinks = [
  {
    id: "pwd",
    title: "Reset Your Password",
    category: "Security",
    action: "article",
    articleId: "art-pwd",
  },
  {
    id: "cluster",
    title: "Connecting to an Atlas Cluster",
    category: "Atlas FAQ",
    action: "article",
    articleId: "art-cluster",
  },
  {
    id: "track-order",
    title: "Track Your Medicine Order",
    category: "Orders",
    action: "chat",
    prompt: "I want to track my order status",
  },
  {
    id: "prescription-help",
    title: "Upload & Verify Doctor Prescription",
    category: "Prescriptions",
    action: "chat",
    prompt: "How do I upload and verify my prescription?",
  },
  {
    id: "refund-support",
    title: "Payment, Refunds & Cashfree Support",
    category: "Billing",
    action: "article",
    articleId: "art-refund",
  },
];

export const helpCollections = [
  {
    id: "col-atlas",
    title: "Atlas Frequently Asked Questions",
    description: "Get started, clusters, drivers and connection string guides",
    articlesCount: 46,
    icon: "database",
    articles: [
      {
        id: "art-cluster",
        title: "Connecting to an Atlas Cluster",
        summary: "Step-by-step instructions to whitelist your IP and connect via MongoDB driver or Compass.",
        content:
          "To connect to your cluster, navigate to the Database Deployment page, click Connect, add your current IP address to the IP Access List, create a database user, and choose your preferred connection method (Compass, Shell, or Application code).",
      },
      {
        id: "art-perf",
        title: "Optimizing Query Performance & Indexes",
        summary: "How to use Explain Plans and create compound indexes for fast lookups.",
        content:
          "Use the Atlas Performance Advisor to monitor slow queries. Ensure high-frequency queries have appropriate ESR (Equality, Sort, Range) compound indexes.",
      },
      {
        id: "art-backup",
        title: "Atlas Cloud Backups & Point-in-time Restores",
        summary: "Continuous cloud backups and snapshot schedules.",
        content:
          "Atlas provides continuous cloud backup snapshots with retention policies from 7 days to 1 year, including point-in-time restore capability.",
      },
    ],
  },
  {
    id: "col-security",
    title: "Security",
    subtitle: "MongoDB Atlas Security Features",
    description: "Role-based access control, encryption at rest, network peering and VPC security.",
    articlesCount: 24,
    icon: "shield",
    articles: [
      {
        id: "art-pwd",
        title: "Reset Your Password",
        summary: "How to reset your account password or database user credentials.",
        content:
          "To reset your account password, click on 'Forgot Password' on the login screen or go to Account Settings > Security. For database users, update credentials in the Database Access panel.",
      },
      {
        id: "art-2fa",
        title: "Enabling Multi-Factor Authentication (MFA / 2FA)",
        summary: "Secure your account using TOTP authenticator apps or SMS.",
        content:
          "Go to Account Settings > Security > Two-Factor Authentication. We recommend using Google Authenticator or an equivalent TOTP application for maximum security.",
      },
      {
        id: "art-encryption",
        title: "End-to-End Encryption & HIPAA Compliance",
        summary: "Patient medical data protection and TLS 1.3 standards.",
        content:
          "All medical shop database clusters and user prescriptions are encrypted at rest using AES-256 and in transit via TLS 1.3 with automated key rotation.",
      },
    ],
  },
  {
    id: "col-billing",
    title: "Billing Questions",
    description: "Invoicing, payment gateways, Cashfree, UPI and credit cards.",
    articlesCount: 5,
    icon: "credit-card",
    articles: [
      {
        id: "art-refund",
        title: "Refunds & Cancelled Orders Policy",
        summary: "Refund timelines for failed or returned transactions.",
        content:
          "Refunds for cancelled or returned orders are credited directly to your original payment method (UPI/NetBanking/Card) within 3-5 business days.",
      },
      {
        id: "art-cashfree",
        title: "Payment Methods Supported",
        summary: "UPI, Google Pay, PhonePe, Credit/Debit cards and NetBanking.",
        content:
          "We accept all major Indian payment methods through our secure Cashfree payment gateway, including UPI QR, RuPay, Visa, MasterCard, and Cash on Delivery (COD).",
      },
    ],
  },
  {
    id: "col-orders",
    title: "Orders & Express Delivery",
    subtitle: "Medical Shop Delivery Timelines",
    description: "Track riders, delivery zones, packaging and urgent medicine requests.",
    articlesCount: 18,
    icon: "truck",
    articles: [
      {
        id: "art-track",
        title: "How to Track Your Live Order",
        summary: "Real-time GPS tracking for assigned delivery riders.",
        content:
          "Once your prescription is verified and the pharmacist packages your medicine, a delivery rider is assigned. You can track their live location in 'Track Order' or via your SMS/WhatsApp link.",
      },
      {
        id: "art-delivery-time",
        title: "Delivery Timelines & Express Shipping",
        summary: "Get emergency medicines delivered in 60-120 minutes.",
        content:
          "Orders placed within city limits are eligible for express 2-hour delivery. Standard delivery takes 12-24 hours depending on pharmacy operating hours.",
      },
    ],
  },
  {
    id: "col-prescription",
    title: "Prescriptions & Pharmacist Verification",
    description: "Prescription requirements, schedule H/H1 medicines, and doctor approval.",
    articlesCount: 12,
    icon: "file-text",
    articles: [
      {
        id: "art-valid-rx",
        title: "What is a Valid Doctor Prescription?",
        summary: "Doctor details, clinic stamp, patient name, and date requirements.",
        content:
          "A valid prescription must show: Doctor's Name & Registration Number, Patient Name & Age, Date of consultation (less than 6 months old), Medicine Name with Dosage, and Doctor's Signature/Stamp.",
      },
      {
        id: "art-rx-upload",
        title: "How to Upload Your Prescription",
        summary: "Accepted file formats (JPG, PNG, PDF) and verification turnaround time.",
        content:
          "Click on 'Upload Prescription' in the header or checkout. Take a clear, well-lit photo of your prescription. Our certified pharmacists verify it within 10-15 minutes.",
      },
    ],
  },
];

export const cannedResponses = {
  order:
    "📦 You can track your medicine orders under **Profile > My Orders** or check the **Track Order** page. If an order has been dispatched, you can view the live rider location in real-time!",
  prescription:
    "📄 To upload a prescription, go to the **Prescription** section. Our registered pharmacists verify valid doctor prescriptions within 15 minutes and prepare your medicine order.",
  password:
    "🔑 You can reset your password anytime from the login page by clicking **Forgot Password** or in your Profile Security settings. We will send a secure OTP to your registered phone or email.",
  doctor:
    "👨‍⚕️ Need medical guidance? Our certified pharmacists and tele-consultation doctors are available 9:00 AM - 10:00 PM every day to review your dosage and advice.",
  cluster:
    "⚡ For database & Atlas cluster connection: Go to Database Deployments > Click 'Connect' > Whitelist your IP > Copy your connection string into your `.env` file.",
  refund:
    "💳 For refund inquiries, refunds are typically processed back to your original payment method (Cashfree/UPI) within 24 to 48 hours after cancellation.",
  default:
    "Thank you for contacting us! A member of our support team has received your message and will respond shortly. You can also explore our Help articles or ask about orders, prescriptions, and medicines.",
};
