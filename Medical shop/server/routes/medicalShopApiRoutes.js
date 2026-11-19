const express = require("express");
const router = express.Router();
const Medicine = require("../models/Medicine");
const Category = require("../models/Category");
const Offer = require("../models/Offer");

// Standard fallback medicines if MongoDB collection is empty
const defaultMedicines = [
  {
    id: "MED-001",
    name: "Dolo 650 Tablet",
    brand: "Micro Labs",
    category: "Fever & Pain Relief",
    price: 32.5,
    old_price: 35.0,
    stock: 180,
    dosage: "650mg",
    prescription_required: "No",
    in_stock: "Yes",
    description: "Paracetamol 650mg tablet for fever, headache, body pain, and viral fever relief.",
    manufacturer: "Micro Labs Ltd",
    expiry_date: "2027-12-31",
  },
  {
    id: "MED-002",
    name: "Paracetamol 500mg",
    brand: "Cipla",
    category: "Fever & Pain Relief",
    price: 20.0,
    old_price: 24.0,
    stock: 250,
    dosage: "500mg",
    prescription_required: "No",
    in_stock: "Yes",
    description: "Standard antipyretic and analgesic tablet for mild to moderate fever and pain relief.",
    manufacturer: "Cipla Pharmaceuticals",
    expiry_date: "2027-10-15",
  },
  {
    id: "MED-003",
    name: "Azithromycin 500mg (Azee 500)",
    brand: "Cipla",
    category: "Antibiotics",
    price: 118.0,
    old_price: 130.0,
    stock: 75,
    dosage: "500mg",
    prescription_required: "Yes",
    in_stock: "Yes",
    description: "Broad-spectrum macrolide antibiotic for respiratory, throat, ear, and skin infections.",
    manufacturer: "Cipla Ltd",
    expiry_date: "2026-08-30",
  },
  {
    id: "MED-004",
    name: "Pantocid 40 Tablet",
    brand: "Sun Pharma",
    category: "Acidity & Gas Relief",
    price: 155.0,
    old_price: 170.0,
    stock: 120,
    dosage: "40mg",
    prescription_required: "No",
    in_stock: "Yes",
    description: "Pantoprazole gastro-resistant tablet for acidity, heartburn, GERD, and stomach ulcers.",
    manufacturer: "Sun Pharma Industries",
    expiry_date: "2027-05-20",
  },
  {
    id: "MED-005",
    name: "Cetirizine 10mg (Cetzine)",
    brand: "Dr. Reddy's",
    category: "Allergy & Cold",
    price: 18.0,
    old_price: 22.0,
    stock: 200,
    dosage: "10mg",
    prescription_required: "No",
    in_stock: "Yes",
    description: "Non-drowsy antihistamine for runny nose, sneezing, pollen allergy, and skin rashes.",
    manufacturer: "Dr. Reddy's Laboratories",
    expiry_date: "2027-11-10",
  },
  {
    id: "MED-006",
    name: "Augmentin 625 Duo Tablet",
    brand: "GSK",
    category: "Antibiotics",
    price: 205.0,
    old_price: 225.0,
    stock: 60,
    dosage: "625mg",
    prescription_required: "Yes",
    in_stock: "Yes",
    description: "Amoxicillin and Potassium Clavulanate antibiotic for bacterial infections and ENT care.",
    manufacturer: "GlaxoSmithKline",
    expiry_date: "2026-11-25",
  },
  {
    id: "MED-007",
    name: "Vitamin C 500mg (Limcee)",
    brand: "Abbott",
    category: "Vitamins & Supplements",
    price: 25.0,
    old_price: 30.0,
    stock: 300,
    dosage: "500mg",
    prescription_required: "No",
    in_stock: "Yes",
    description: "Orange flavored chewable Vitamin C tablet for daily immunity booster and skin health.",
    manufacturer: "Abbott Healthcare",
    expiry_date: "2028-01-15",
  },
  {
    id: "MED-008",
    name: "Shelcal 500 Calcium Tablet",
    brand: "Torrent",
    category: "Vitamins & Supplements",
    price: 132.0,
    old_price: 145.0,
    stock: 110,
    dosage: "500mg + Vit D3",
    prescription_required: "No",
    in_stock: "Yes",
    description: "Calcium and Vitamin D3 dietary supplement for strong bones, joints, and osteoporosis care.",
    manufacturer: "Torrent Pharmaceuticals",
    expiry_date: "2027-09-30",
  },
  {
    id: "MED-009",
    name: "Combiflam Tablet",
    brand: "Sanofi",
    category: "Fever & Pain Relief",
    price: 45.0,
    old_price: 50.0,
    stock: 140,
    dosage: "Ibuprofen + Paracetamol",
    prescription_required: "No",
    in_stock: "Yes",
    description: "Dual action pain relief and fever reducer for dental pain, muscle cramps, and joint aches.",
    manufacturer: "Sanofi India Ltd",
    expiry_date: "2027-04-12",
  },
  {
    id: "MED-010",
    name: "Metformin 500mg (Glycomet)",
    brand: "USV",
    category: "Diabetes Care",
    price: 42.0,
    old_price: 48.0,
    stock: 95,
    dosage: "500mg",
    prescription_required: "Yes",
    in_stock: "Yes",
    description: "First-line oral anti-diabetic medicine to manage blood glucose levels in Type-2 Diabetes.",
    manufacturer: "USV Private Limited",
    expiry_date: "2027-06-18",
  },
];

/**
 * GET /api/medical_shop
 * Primary endpoint for Universal Chatbot integration (Mode B Direct API).
 * Returns an array of medicines and shop data matching Universal Chatbot Executor contract.
 */
router.get("/", async (req, res) => {
  try {
    let medicinesList = [];

    // 1. Attempt to fetch real medicines from MongoDB
    try {
      const dbMedicines = await Medicine.find({}).lean();
      if (dbMedicines && dbMedicines.length > 0) {
        medicinesList = dbMedicines.map((m) => ({
          id: m._id ? String(m._id) : m.id || "MED",
          name: m.name || "",
          brand: m.brand || "MediCare RX",
          category: m.category || "General Health",
          price: Number(m.price) || 0,
          old_price: m.oldPrice ? Number(m.oldPrice) : null,
          stock: Number(m.stock) || 0,
          dosage: m.dosage || m.batchNo || "Standard",
          prescription_required: m.prescriptionRequired ? "Yes" : "No",
          in_stock: Number(m.stock) > 0 ? "Yes" : "No",
          description: m.description || `${m.name} available at MediCare RX online pharmacy.`,
          manufacturer: m.brand || "Certified Pharma",
          expiry_date: m.expiryDate
            ? new Date(m.expiryDate).toISOString().split("T")[0]
            : "2027-12-31",
        }));
      }
    } catch (dbErr) {
      console.warn("[Medical_Shop API] DB fetch warning:", dbErr.message);
    }

    // 2. If DB is empty, use the rich default medicines catalogue
    if (medicinesList.length === 0) {
      medicinesList = defaultMedicines;
    }

    // 3. Optional filtering by query params
    const { search, q, name, category, format } = req.query;
    const queryTerm = (search || q || name || "").toLowerCase().trim();

    if (queryTerm) {
      medicinesList = medicinesList.filter(
        (m) =>
          m.name.toLowerCase().includes(queryTerm) ||
          m.brand.toLowerCase().includes(queryTerm) ||
          m.category.toLowerCase().includes(queryTerm) ||
          m.description.toLowerCase().includes(queryTerm)
      );
    }

    if (category) {
      const catTerm = category.toLowerCase().trim();
      medicinesList = medicinesList.filter((m) =>
        m.category.toLowerCase().includes(catTerm)
      );
    }

    // 4. Return as JSON array for Universal Chatbot Executor
    // (Universal Chatbot runApi checks: if (!Array.isArray(data)) throw Error('Endpoint must return an array'))
    if (format === "object" || format === "wrapped") {
      return res.json({
        success: true,
        count: medicinesList.length,
        shop: {
          name: "MediCare RX",
          tagline: "Online Pharmacy & Healthcare",
          phone: "+91 98765 43210",
          address: "Madurai, Tamil Nadu 625020",
          delivery_timeline: "Express 60-120 minutes delivery",
          prescription_verification: "Pharmacist verification within 15 minutes",
          support_hours: "24/7 Service",
        },
        medicines: medicinesList,
      });
    }

    return res.json(medicinesList);
  } catch (error) {
    console.error("[Medical_Shop API] Error:", error);
    return res.status(500).json({
      error: "Internal server error fetching medical shop data",
      detail: error.message,
    });
  }
});

/**
 * GET /api/medical_shop/info
 * Overview information about the medical shop, services, and policies
 */
router.get("/info", (req, res) => {
  res.json({
    shop_name: "MediCare RX",
    business_type: "Licensed Chemist & Govt. Certified Online Pharmacy",
    contact_phone: "+91 98765 43210",
    support_email: "support@medicarerx.com",
    address: "Madurai, Tamil Nadu 625020",
    hours: "Open 24 Hours / 7 Days a week",
    delivery_zones: ["Madurai", "Chennai", "Coimbatore", "Trichy", "Salem", "Tirunelveli"],
    delivery_time: "Express 60-120 minutes in city limits; 24h standard shipping",
    prescription_policy:
      "Valid doctor prescription required for Schedule H and H1 medicines. Verified by licensed pharmacists in 15 mins.",
    payment_methods: ["UPI", "Google Pay", "PhonePe", "Credit/Debit Cards", "NetBanking", "Cash on Delivery (COD)"],
    refund_policy: "100% refund processed within 24-48 hours for cancelled or returned unopened medicine orders.",
  });
});

module.exports = router;
