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
 * Fallback static medicine catalog
 */
const fallbackMedicines = [
  {
    name: "Paracetamol 500mg Tablet",
    brand: "Cipla",
    category: "Fever, Cold & Pain Relief",
    price: 25.0,
    stock: 250,
    dosage: "500mg tablet",
    rx: "No (OTC)",
    description: "Standard antipyretic for reducing fever, headache, body ache, and viral cold.",
  },
  {
    name: "Dolo 650 Tablet",
    brand: "Micro Labs Ltd",
    category: "Fever, Cold & Pain Relief",
    price: 32.5,
    stock: 180,
    dosage: "650mg tablet",
    rx: "No (OTC)",
    description: "Fast-acting Paracetamol 650mg for viral fever, high temperature, and dental pain.",
  },
  {
    name: "Pantocid 40 Tablet",
    brand: "Sun Pharma",
    category: "Acidity, Gas & Gastro Care",
    price: 155.0,
    stock: 120,
    dosage: "40mg gastro-resistant",
    rx: "No (OTC)",
    description: "Proton Pump Inhibitor (Pantoprazole) for acidity, GERD, sour burps, and stomach burning.",
  },
  {
    name: "Combiflam Tablet",
    brand: "Sanofi India",
    category: "Fever, Cold & Pain Relief",
    price: 45.0,
    stock: 140,
    dosage: "Ibuprofen + Paracetamol",
    rx: "No (OTC)",
    description: "Dual-action analgesic for intense headache, toothache, and muscle spasms.",
  },
  {
    name: "Azithromycin 500mg (Azee 500)",
    brand: "Cipla",
    category: "Antibiotics & Anti-Infectives",
    price: 118.0,
    stock: 75,
    dosage: "500mg once daily",
    rx: "Yes (Schedule H)",
    description: "Broad-spectrum macrolide antibiotic for throat infections, pneumonia, and sinusitis.",
  },
  {
    name: "Cetirizine 10mg (Cetzine)",
    brand: "Dr. Reddy's",
    category: "Allergy & Respiratory Care",
    price: 18.0,
    stock: 200,
    dosage: "10mg tablet",
    rx: "No (OTC)",
    description: "Non-drowsy antihistamine for runny nose, sneezing, allergy, and hives.",
  },
];

function buildMarkdownTable(meds, heading = "Available Medicines") {
  let table = `### 📋 ${heading}\n\n`;
  table += `| Medicine Name | Brand | Dosage | Price | Stock Status | Prescription |\n`;
  table += `| :--- | :--- | :--- | :--- | :--- | :--- |\n`;
  for (const m of meds) {
    table += `| **${m.name}** | ${m.brand} | ${m.dosage} | **₹${m.price}** | ✅ In Stock (${m.stock}) | ${m.rx} |\n`;
  }
  table += `\n**Key Information:**\n`;
  for (const m of meds.slice(0, 3)) {
    table += `- **${m.name}**: ${m.description}\n`;
  }
  table += `\n💡 *All medicines on MediCare RX are 100% genuine and eligible for express 60-120 mins doorstep delivery.*`;
  return table;
}

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
        timeout: 4000,
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
      { timeout: 4500 }
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

  // 3. Smart local medical & OpenAI format responder (Client-side offline)
  const lower = question.toLowerCase().trim();

  // Check prefix match (e.g. "para la start pannura")
  const prefixMatch =
    lower.match(/\b([a-z0-9]+)\s*(?:la|le)\s*(?:start\s*pannura|start\s*aagura|start|arambikura|arambikkira|la\s*start)\b/i) ||
    lower.match(/\b(?:starts?\s*with|starting\s*with|starts?\s*from)\s*([a-z0-9]+)\b/i) ||
    lower.match(/\b([a-z0-9]+)\s*starts?\s*with\b/i);

  if (prefixMatch && prefixMatch[1] && !["the", "all", "any", "la", "medicine"].includes(prefixMatch[1])) {
    const pfx = prefixMatch[1].toLowerCase();
    const matched = fallbackMedicines.filter((m) =>
      m.name.toLowerCase().startsWith(pfx) ||
      m.description.toLowerCase().includes(pfx)
    );
    if (matched.length > 0) {
      return {
        answer:
          `👋 **Here are the medicines starting with or containing "${pfx.toUpperCase()}":**\n\n` +
          buildMarkdownTable(matched, `Medicines matching "${pfx}"`),
        source: "client_nlp_matcher",
        success: true,
      };
    }
  }

  let fallbackAnswer = cannedResponses.default;

  if (lower.includes("categor") || lower.includes("types of medicine") || lower.includes("department")) {
    fallbackAnswer =
      "🏥 **MediCare RX - Medicine Categories & Healthcare Specialties**\n\n" +
      "Here are the categories available on our platform:\n\n" +
      "1. 🌡️ **Fever, Cold & Pain Relief** (Dolo 650, Paracetamol, Combiflam)\n" +
      "2. 💊 **Antibiotics** *(Prescription Required)* (Azithromycin 500, Augmentin 625)\n" +
      "3. 🧪 **Acidity & Gastro Care** (Pantocid 40, Omeprazole, Digene)\n" +
      "4. 🤧 **Allergy & Respiratory** (Cetirizine 10mg, Montair-LC, Allegra)\n" +
      "5. ⚡ **Vitamins & Supplements** (Limcee Vitamin C, Shelcal 500 Calcium)\n" +
      "6. 🩸 **Diabetes & Chronic Care** (Metformin 500, Glimepiride)\n" +
      "7. ❤️ **Cardiac & Blood Pressure** (Amlodipine, Telmisartan)\n" +
      "8. 🩺 **Medical Devices** (BP Monitors, Glucometers, Pulse Oximeters, Nebulizers)\n" +
      "9. 👶 **Baby Care & Nutrition**\n\n" +
      "*Would you like details or pricing for any specific category?*";
  } else if (lower.includes("dolo") || lower.includes("fever") || lower.includes("paracetamol")) {
    const matched = fallbackMedicines.filter((m) =>
      m.name.toLowerCase().includes("paracetamol") || m.name.toLowerCase().includes("dolo")
    );
    fallbackAnswer =
      `🌡️ **Fever & Pain Relief Medicines**\n\n` +
      buildMarkdownTable(matched, "Fever & Pain Relief");
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
  } else {
    fallbackAnswer =
      `🤖 **Dr. MediBot (Universal AI Assistant)**\n\n` +
      `Regarding: *"**${question}**"*\n\n` +
      `Here is helpful guidance:\n` +
      `- **Website Details**: On MediCare RX, you can browse all medicine categories, check stock & prices (e.g. *Dolo 650*, *Pantocid*), upload prescriptions, or track orders live.\n` +
      `- **General Health**: For wellness, maintain balanced nutrition, adequate hydration, and regular exercise.\n\n` +
      `*How can I assist you with your health or medicines today?*`;
  }

  return {
    answer: fallbackAnswer,
    source: "local_pharmacist_fallback",
    success: true,
  };
};
