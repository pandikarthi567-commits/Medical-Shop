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

// Comprehensive default catalog
const defaultMedicines = [
  {
    name: "Paracetamol 500mg Tablet",
    brand: "Cipla",
    category: "Fever, Cold & Pain Relief",
    price: 25.0,
    stock: 250,
    dosage: "500mg tablet (1 tablet every 6 hours)",
    prescriptionRequired: false,
    description: "Standard antipyretic for reducing fever, headache, body ache, and viral cold.",
    active_salt: "Paracetamol",
  },
  {
    name: "Dolo 650 Tablet",
    brand: "Micro Labs Ltd",
    category: "Fever, Cold & Pain Relief",
    price: 32.5,
    stock: 180,
    dosage: "650mg tablet (1 tablet after food)",
    prescriptionRequired: false,
    description: "Fast-acting Paracetamol 650mg formulation for viral fever, high temperature, and dental pain.",
    active_salt: "Paracetamol",
  },
  {
    name: "Pantocid 40 Tablet",
    brand: "Sun Pharma",
    category: "Acidity, Gas & Gastro Care",
    price: 155.0,
    stock: 120,
    dosage: "40mg gastro-resistant (once daily before breakfast)",
    prescriptionRequired: false,
    description: "Proton Pump Inhibitor (Pantoprazole) for acidity, GERD, sour burps, and stomach burning.",
    active_salt: "Pantoprazole",
  },
  {
    name: "Combiflam Tablet",
    brand: "Sanofi India",
    category: "Fever, Cold & Pain Relief",
    price: 45.0,
    stock: 140,
    dosage: "Ibuprofen 400mg + Paracetamol 325mg",
    prescriptionRequired: false,
    description: "Dual-action analgesic for intense headache, toothache, muscle spasms, and joint inflammation.",
    active_salt: "Ibuprofen + Paracetamol",
  },
  {
    name: "Azithromycin 500mg (Azee 500)",
    brand: "Cipla",
    category: "Antibiotics & Anti-Infectives",
    price: 118.0,
    stock: 75,
    dosage: "500mg once daily for 3 to 5 days",
    prescriptionRequired: true,
    description: "Broad-spectrum macrolide antibiotic for throat infections, pneumonia, bronchitis, and sinusitis.",
    active_salt: "Azithromycin",
  },
  {
    name: "Cetirizine 10mg (Cetzine)",
    brand: "Dr. Reddy's",
    category: "Allergy & Respiratory Care",
    price: 18.0,
    stock: 200,
    dosage: "10mg tablet once daily at bedtime",
    prescriptionRequired: false,
    description: "Non-drowsy antihistamine for runny nose, sneezing, pollen allergy, hives, and skin itching.",
    active_salt: "Cetirizine",
  },
  {
    name: "Augmentin 625 Duo Tablet",
    brand: "GSK",
    category: "Antibiotics & Anti-Infectives",
    price: 205.0,
    stock: 60,
    dosage: "Amoxicillin 500mg + Clavulanic Acid 125mg twice daily",
    prescriptionRequired: true,
    description: "Powerful antibiotic combination for resistant bacterial infections, dental abscesses, and ENT care.",
    active_salt: "Amoxicillin + Clavulanic Acid",
  },
  {
    name: "Vitamin C 500mg (Limcee)",
    brand: "Abbott",
    category: "Vitamins & Daily Supplements",
    price: 25.0,
    stock: 300,
    dosage: "500mg chewable tablet daily",
    prescriptionRequired: false,
    description: "Chewable orange-flavored ascorbic acid for immune system boost, wound healing, and collagen synthesis.",
    active_salt: "Ascorbic Acid (Vitamin C)",
  },
];

/**
 * Format medicines into clean OpenAI Markdown Table
 */
function formatMedicineTable(medicines, heading = "Available Medicines") {
  if (!medicines || medicines.length === 0) {
    return "No matching medicines found in our pharmacy database.";
  }

  let table = `### 📋 ${heading}\n\n`;
  table += `| Medicine Name | Brand | Dosage | Price | Stock Status | Prescription |\n`;
  table += `| :--- | :--- | :--- | :--- | :--- | :--- |\n`;

  for (const m of medicines) {
    const rx = m.prescriptionRequired || m.prescription_required === "Yes" ? "Yes (Rx)" : "No (OTC)";
    const price = `₹${m.price}`;
    const stock = m.stock > 0 ? `✅ In Stock (${m.stock})` : `❌ Out of Stock`;
    table += `| **${m.name}** | ${m.brand || "MediCare RX"} | ${m.dosage || "Standard"} | **${price}** | ${stock} | ${rx} |\n`;
  }

  table += `\n**Clinical Details & Guidance:**\n`;
  for (const m of medicines.slice(0, 4)) {
    table += `- **${m.name}**: ${m.description || `Active ingredient: ${m.active_salt || m.name}. Consult pharmacist for proper dosage.`}\n`;
  }

  table += `\n💡 *All medicines on MediCare RX are 100% genuine and eligible for express 60-120 mins doorstep delivery.*\n`;
  table += `*Would you like to place an order or require dosage instructions?*`;
  return table;
}

/**
 * Intelligent Responder for Medical Shop Website details & OpenAI style general queries
 */
async function generateSmartResponse(question) {
  const lower = (question || "").toLowerCase().trim();

  // 1. NLP Pattern: Tanglish / English prefix search (e.g. "THE PARA LA START PANNURA MEDICINE DETAILS")
  const prefixPatterns = [
    /\b([a-z0-9]+)\s*(?:la|le)\s*(?:start\s*pannura|start\s*aagura|start|arambikura|arambikkira|la\s*start)\b/i,
    /\b(?:starts?\s*with|starting\s*with|starts?\s*from|begins?\s*with)\s*([a-z0-9]+)\b/i,
    /\b([a-z0-9]+)\s*starts?\s*with\b/i,
    /\b([a-z0-9]+)\s*la\s*start\b/i,
  ];

  let detectedPrefix = null;
  for (const pat of prefixPatterns) {
    const m = lower.match(pat);
    if (m && m[1]) {
      const candidate = m[1].trim();
      if (!["the", "all", "any", "la", "medicine", "tablet"].includes(candidate)) {
        detectedPrefix = candidate;
        break;
      }
    }
  }

  // Load live DB medicines or fallback to default
  let allMeds = defaultMedicines;
  try {
    const dbMeds = await Medicine.find({}).lean();
    if (Array.isArray(dbMeds) && dbMeds.length > 0) {
      allMeds = dbMeds;
    }
  } catch (e) {}

  if (detectedPrefix) {
    const pfx = detectedPrefix.toLowerCase();
    const matched = allMeds.filter((m) => {
      const name = (m.name || "").toLowerCase();
      const salt = (m.active_salt || m.generic_name || "").toLowerCase();
      const desc = (m.description || "").toLowerCase();
      return name.startsWith(pfx) || salt.startsWith(pfx) || name.includes(pfx) || salt.includes(pfx) || desc.includes(pfx);
    });

    if (matched.length > 0) {
      return (
        `👋 **Here are the medicines starting with or containing "${detectedPrefix.toUpperCase()}":**\n\n` +
        formatMedicineTable(matched, `Medicines matching "${detectedPrefix}"`)
      );
    }
  }

  // 2. Category details (e.g., "I need the medicine Category details")
  if (
    lower.includes("categor") ||
    lower.includes("types of medicine") ||
    lower.includes("what products") ||
    lower.includes("departments")
  ) {
    return (
      "🏥 **MediCare RX - Medicine Categories & Healthcare Specialties**\n\n" +
      "Here are all the verified medicine categories available on our website:\n\n" +
      "1. 🌡️ **Fever, Cold & Pain Relief**\n" +
      "   - Antipyretics, analgesics, headache & body pain tablets (e.g. *Dolo 650, Paracetamol 500mg, Combiflam*)\n\n" +
      "2. 💊 **Antibiotics & Anti-Infectives** *(Prescription Required)*\n" +
      "   - Broad-spectrum antibiotics for bacterial infections (e.g. *Azithromycin / Azee 500, Augmentin 625 Duo, Amoxicillin*)\n\n" +
      "3. 🧪 **Acidity, Gas & Gastro Care**\n" +
      "   - Antacids & PPIs for GERD, gas, and stomach ulcers (e.g. *Pantocid 40, Omeprazole 20mg, Digene, Gelusil*)\n\n" +
      "4. 🤧 **Allergy & Respiratory Care**\n" +
      "   - Antihistamines, allergy relief & cough syrups (e.g. *Cetirizine 10mg / Cetzine, Montair-LC, Allegra 120mg*)\n\n" +
      "5. ⚡ **Vitamins & Daily Immunity Supplements**\n" +
      "   - Multivitamins, calcium, iron & bone health (e.g. *Limcee Vitamin C 500mg, Shelcal 500 Calcium, Becosules, Neurobion*)\n\n" +
      "6. 🩸 **Diabetes & Chronic Care** *(Prescription Required)*\n" +
      "   - Blood sugar control tablets (e.g. *Metformin / Glycomet 500mg, Glimepiride, Januvia*)\n\n" +
      "7. ❤️ **Cardiac & Blood Pressure**\n" +
      "   - Hypertension regulation & heart wellness (e.g. *Amlodipine 5mg, Telmisartan 40mg*)\n\n" +
      "8. 🩺 **Medical Devices & Diagnostics**\n" +
      "   - Digital BP Monitors, Pulse Oximeters, Glucometers, Nebulizers & Digital Thermometers.\n\n" +
      "9. 👶 **Baby & Mother Care**\n" +
      "   - Baby skin essentials, pediatric drops & nutrition.\n\n" +
      "*Would you like to check stock or prices for any specific medicine in these categories?*"
    );
  }

  // 3. Specific medicine lookup
  for (const med of allMeds) {
    if (lower.includes((med.name || "").toLowerCase())) {
      const inStock =
        med.stock > 0
          ? `✅ In Stock (${med.stock} units available)`
          : "❌ Currently Out of Stock";
      return (
        `💊 **${med.name}**\n\n` +
        `- **Brand / Manufacturer**: ${med.brand || "MediCare RX"}\n` +
        `- **Category**: ${med.category}\n` +
        `- **Price**: ₹${med.price} ${med.oldPrice || med.old_price ? `*(MRP: ₹${med.oldPrice || med.old_price})*` : ""}\n` +
        `- **Stock Status**: ${inStock}\n` +
        `- **Prescription Required**: ${med.prescriptionRequired || med.prescription_required === "Yes" ? "Yes (Rx)" : "No (OTC)"}\n` +
        `- **Dosage Info**: ${med.dosage || "Standard"}\n` +
        `- **Description**: ${med.description || `${med.name} available at MediCare RX.`}\n\n` +
        `*You can add this to your cart or order directly with express 60-120 mins delivery!*`
      );
    }
  }

  // 4. Common Ailments / OTC
  if (lower.includes("dolo") || lower.includes("paracetamol") || lower.includes("fever")) {
    const matched = allMeds.filter((m) =>
      `${m.name} ${m.category} ${m.description}`.toLowerCase().includes("fever") ||
      `${m.name} ${m.category}`.toLowerCase().includes("paracetamol") ||
      `${m.name}`.toLowerCase().includes("dolo")
    );
    return (
      `🌡️ **Fever & Pain Relief Medicines:**\n\n` +
      formatMedicineTable(matched, "Fever & Pain Relief")
    );
  }

  if (lower.includes("pantocid") || lower.includes("acidity") || lower.includes("gas") || lower.includes("acid")) {
    const matched = allMeds.filter((m) =>
      `${m.name} ${m.category} ${m.description}`.toLowerCase().includes("acidity") ||
      `${m.name}`.toLowerCase().includes("pantocid")
    );
    return (
      `🧪 **Acidity & Gastro Care Medicines:**\n\n` +
      formatMedicineTable(matched, "Acidity & Gastro Care")
    );
  }

  // 5. Order tracking & Delivery
  if (lower.includes("order") || lower.includes("track") || lower.includes("delivery") || lower.includes("shipping") || lower.includes("rider") || /\beta\b/i.test(lower)) {
    return (
      "📦 **Order Tracking & Delivery Services**:\n\n" +
      "- **Express Delivery**: Orders within city limits are delivered in **60 to 120 minutes**.\n" +
      "- **Live GPS Tracking**: Once dispatched, track your assigned delivery rider in real-time under **Profile > My Orders** or the **Track Order** page.\n" +
      "- **Standard Shipping**: 24-48 hours across Tamil Nadu and other regions.\n" +
      "- **Free Delivery**: On all medicine orders above ₹499!"
    );
  }

  // 6. Prescription guidelines
  if (lower.includes("prescription") || lower.includes("upload") || lower.includes("doctor") || lower.includes("rx")) {
    return (
      "📄 **Prescription Upload & Verification Process**:\n\n" +
      "1. Navigate to the **Upload Prescription** page in the top menu or during checkout.\n" +
      "2. Upload a clear photo or scan of your doctor's prescription (JPG, PNG, or PDF).\n" +
      "3. Our certified pharmacists verify your prescription within **10 to 15 minutes**.\n" +
      "4. Once verified, the prescribed medicines are automatically packaged and dispatched!"
    );
  }

  // 7. Payment, Offers & Refunds
  if (lower.includes("payment") || lower.includes("offer") || lower.includes("discount") || lower.includes("refund") || lower.includes("cancel") || lower.includes("cashfree") || lower.includes("upi")) {
    return (
      "💳 **Payment, Offers & Refunds Policy**:\n\n" +
      "- **Payment Modes**: Powered by secure Cashfree gateway: UPI (Google Pay, PhonePe, Paytm), Credit/Debit cards, NetBanking, and Cash on Delivery (COD).\n" +
      "- **Current Offers**: Use promo code **FIRST20** to get **20% OFF** on your first medicine order.\n" +
      "- **Refund Timelines**: Cancelled orders or verified returns are refunded 100% within **24 to 48 hours** directly to your original payment account."
    );
  }

  // 8. General conversational OpenAI format
  return (
    `🤖 **Dr. MediBot (Universal AI Assistant)**\n\n` +
    `Regarding: *"**${question}**"*\n\n` +
    `### 📋 Summary & Helpful Guidance:\n` +
    `- **Store Context**: On **MediCare RX**, you can ask about medicine categories, stock availability (e.g. *Dolo 650, Paracetamol, Pantocid*), express delivery, or prescription verification.\n` +
    `- **General Wellness**: For symptoms, stay hydrated, maintain proper nutrition, and get adequate rest.\n\n` +
    `*How can I assist you with your medicine or healthcare needs today?*`
  );
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

  // 1. Attempt Universal Chatbot API Call (:8000)
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
        timeout: 4000,
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
      `[Universal Chatbot Proxy] Upstream API call to ${UNIVERSAL_CHATBOT_URL} failed (${error.message}). Generating intelligent responder.`
    );
  }

  // 2. Fallback to smart local medical & OpenAI responder
  try {
    const smartAnswer = await generateSmartResponse(question);
    return res.json({
      success: true,
      answer: smartAnswer,
      source: "local_smart_responder",
      response_type: "SMART_LOCAL",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      answer: "I am having trouble answering right now. Please try again.",
      error: err.message,
    });
  }
});

module.exports = router;
