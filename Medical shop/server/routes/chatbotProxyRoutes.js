const express = require("express");
const axios = require("axios");
const router = express.Router();
const Medicine = require("../models/Medicine");

const UNIVERSAL_CHATBOT_URL =
  process.env.UNIVERSAL_CHATBOT_URL || "http://localhost:8000";
const UNIVERSAL_API_KEY =
  process.env.UNIVERSAL_CHATBOT_API_KEY ||
  "key_d332990df6792ccb95398fb574adaa3196c670fcfa9a5c649e46bbe5f1f2cdb7";
const UNIVERSAL_BEARER_TOKEN =
  process.env.UNIVERSAL_CHATBOT_BEARER_TOKEN ||
  "bearer_57536986f7303c1bd6ba51f791078f7b25869834110a1821d41a1604fc37447b";
const PROJECT_CODE = process.env.UNIVERSAL_PROJECT_CODE || "MEDICAL_SHOP";

/**
 * Local fallback responder if Universal Chatbot service is offline
 */
async function localFallbackResponse(question) {
  const lower = (question || "").toLowerCase();

  // Search if user asks about a specific medicine
  try {
    const medicines = await Medicine.find({}).lean();
    for (const med of medicines) {
      if (lower.includes(med.name.toLowerCase())) {
        const inStock = med.stock > 0 ? `Yes, in stock (${med.stock} units available)` : "Currently out of stock";
        return `💊 **${med.name}** is available at MediCare RX!\n- **Price**: ₹${med.price}\n- **Availability**: ${inStock}\n- **Prescription Required**: ${med.prescriptionRequired ? "Yes" : "No"}\n- **Category**: ${med.category}\n\nWould you like to add it to your cart or need dosage guidance?`;
      }
    }
  } catch (e) {
    // DB offline fallback
  }

  if (lower.includes("dolo") || lower.includes("paracetamol") || lower.includes("fever")) {
    return "💊 **Dolo 650 Tablet** is in stock! Price is ₹32.50 per strip. Recommended for fever and mild to moderate pain relief. No prescription required.";
  }
  if (lower.includes("order") || lower.includes("track") || lower.includes("status")) {
    return "📦 You can track your active orders under **Profile > My Orders** or check the **Track Order** page for real-time live GPS delivery updates.";
  }
  if (lower.includes("prescription") || lower.includes("upload") || lower.includes("rx")) {
    return "📄 You can upload your doctor's prescription directly via the **Upload Prescription** page. Our certified pharmacists verify it within 15 minutes!";
  }
  if (lower.includes("refund") || lower.includes("cancel") || lower.includes("payment")) {
    return "💳 Payments are securely processed via Cashfree (UPI, Cards, NetBanking). For cancelled orders, refunds are credited back to your account within 24-48 hours.";
  }

  return "Hello! I am Dr. MediBot from MediCare RX. How can I help you with your medicines, prescriptions, or order delivery today?";
}

/**
 * POST /api/chatbot/ask
 * Proxies user questions to the Universal Chatbot Engine and returns AI response.
 */
router.post("/ask", async (req, res) => {
  const { question, session_id } = req.body;

  if (!question || !question.trim()) {
    return res.status(400).json({ error: "question is required" });
  }

  const sessionId = (session_id || "session-" + Date.now()).slice(0, 120);

  // 1. Attempt Universal Chatbot API Call
  try {
    const response = await axios.post(
      `${UNIVERSAL_CHATBOT_URL}/api/chat/ask`,
      {
        project_code: PROJECT_CODE,
        session_id: sessionId,
        question: question.trim(),
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": UNIVERSAL_API_KEY,
          Authorization: `Bearer ${UNIVERSAL_BEARER_TOKEN}`,
        },
        timeout: 8000,
      }
    );

    if (response.data && response.data.answer) {
      return res.json({
        success: true,
        answer: response.data.answer,
        source: response.data.source || "universal_chatbot",
        response_type: response.data.response_type,
        data: response.data.data,
      });
    }
  } catch (error) {
    console.warn(
      `[Universal Chatbot Proxy] Upstream API call to ${UNIVERSAL_CHATBOT_URL} failed (${error.message}). Falling back to local responder.`
    );
  }

  // 2. Intelligent local fallback if Universal Chatbot is offline
  const fallbackAnswer = await localFallbackResponse(question);
  return res.json({
    success: true,
    answer: fallbackAnswer,
    source: "local_pharmacist_ai",
  });
});

module.exports = router;
