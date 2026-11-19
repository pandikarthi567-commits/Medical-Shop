import axios from "axios";
import { cannedResponses } from "./chatbotData";

// Universal Chatbot credentials provided for Medical_Shop
export const UNIVERSAL_CONFIG = {
  apiUrl: "http://localhost:8000/api/chat/ask",
  projectCode: "MEDICAL_SHOP",
  apiKey: "key_d332990df6792ccb95398fb574adaa3196c670fcfa9a5c649e46bbe5f1f2cdb7",
  bearerToken: "bearer_57536986f7303c1bd6ba51f791078f7b25869834110a1821d41a1604fc37447b",
  localProxyUrl: "http://localhost:5001/api/chatbot/ask",
};

/**
 * Get or create persistent session id for chatbot conversations
 */
export const getSessionId = () => {
  try {
    let sid = sessionStorage.getItem("medicare_chat_session_id");
    if (!sid) {
      sid = "session_" + Math.random().toString(36).substring(2, 12) + "_" + Date.now();
      sessionStorage.setItem("medicare_chat_session_id", sid);
    }
    return sid;
  } catch {
    return "session_" + Date.now();
  }
};

/**
 * Send user question to Universal Chatbot API with fallback
 */
export const askUniversalChatbot = async (question) => {
  const sessionId = getSessionId();

  // 1. Direct call to Universal Chatbot Engine (:8000)
  try {
    const res = await axios.post(
      UNIVERSAL_CONFIG.apiUrl,
      {
        project_code: UNIVERSAL_CONFIG.projectCode,
        session_id: sessionId,
        question: question.trim(),
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": UNIVERSAL_CONFIG.apiKey,
          Authorization: `Bearer ${UNIVERSAL_CONFIG.bearerToken}`,
        },
        timeout: 9000,
      }
    );

    if (res.data && res.data.answer) {
      return {
        answer: res.data.answer,
        source: res.data.source || "universal_chatbot",
        data: res.data.data || null,
        success: true,
      };
    }
  } catch (err) {
    console.warn("[Universal Chatbot Direct API] Call failed:", err.message);
  }

  // 2. Call Medical Shop Server Backend Proxy (:5001)
  try {
    const proxyRes = await axios.post(
      UNIVERSAL_CONFIG.localProxyUrl,
      {
        question: question.trim(),
        session_id: sessionId,
      },
      { timeout: 7000 }
    );

    if (proxyRes.data && proxyRes.data.answer) {
      return {
        answer: proxyRes.data.answer,
        source: proxyRes.data.source || "server_proxy",
        data: proxyRes.data.data || null,
        success: true,
      };
    }
  } catch (proxyErr) {
    console.warn("[Medical Shop Server Proxy] Call failed:", proxyErr.message);
  }

  // 3. Smart local medical fallback responder
  const lower = question.toLowerCase();
  let fallbackAnswer = cannedResponses.default;

  if (lower.includes("dolo") || lower.includes("fever") || lower.includes("paracetamol")) {
    fallbackAnswer =
      "💊 **Dolo 650 Tablet** is currently in stock at MediCare RX! Price is ₹32.50. Indicated for fever and mild to moderate pain relief. No prescription required.";
  } else if (lower.includes("order") || lower.includes("track") || lower.includes("delivery")) {
    fallbackAnswer = cannedResponses.order;
  } else if (lower.includes("prescription") || lower.includes("doctor") || lower.includes("rx")) {
    fallbackAnswer = cannedResponses.prescription;
  } else if (lower.includes("password") || lower.includes("login") || lower.includes("reset")) {
    fallbackAnswer = cannedResponses.password;
  } else if (lower.includes("refund") || lower.includes("cancel") || lower.includes("payment")) {
    fallbackAnswer = cannedResponses.refund;
  } else if (lower.includes("consult") || lower.includes("pharmacist") || lower.includes("doctor")) {
    fallbackAnswer = cannedResponses.doctor;
  }

  return {
    answer: fallbackAnswer,
    source: "local_pharmacist_fallback",
    success: true,
  };
};
