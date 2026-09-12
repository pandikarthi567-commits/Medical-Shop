const Medicine = require("../models/Medicine");
const Category = require("../models/Category");

const BASELINE_MEDICINES = [
  {
    name: "Paracetamol 500mg",
    brand: "Crocin",
    category: "Pain Relief",
    batchNo: "BCH001",
    expiryDate: new Date("2026-09-15"),
    stock: 5,
    price: 12.5,
    description: "Effective for fever and mild to moderate pain.",
  },
  {
    name: "Amoxicillin 250mg",
    brand: "Alkem",
    category: "Antibiotics",
    batchNo: "BCH002",
    expiryDate: new Date("2026-09-22"),
    stock: 8,
    price: 25.0,
    description: "Broad-spectrum antibiotic for bacterial infections.",
  },
  {
    name: "Cetirizine 10mg",
    brand: "Zyrtec",
    category: "Allergy Care",
    batchNo: "BCH003",
    expiryDate: new Date("2026-09-30"),
    stock: 3,
    price: 18.0,
    description: "Relieves allergy symptoms like sneezing and runny nose.",
  },
  {
    name: "Pantoprazole 40mg",
    brand: "Pantocid",
    category: "Gastro Care",
    batchNo: "BCH004",
    expiryDate: new Date("2026-10-05"),
    stock: 6,
    price: 22.0,
    description: "Reduces stomach acid for reflux and heartburn relief.",
  },
  {
    name: "Azithromycin 500mg",
    brand: "Zithro",
    category: "Antibiotics",
    batchNo: "BCH005",
    expiryDate: new Date("2026-10-12"),
    stock: 4,
    price: 32.0,
    description: "Used to treat various respiratory and skin infections.",
  },
  {
    name: "Metformin 500mg",
    brand: "Glycomet",
    category: "Diabetes Care",
    batchNo: "BCH006",
    expiryDate: new Date("2026-12-18"),
    stock: 210,
    price: 10.0,
    description: "First-line medication for type 2 diabetes management.",
  },
  {
    name: "Amlodipine 5mg",
    brand: "Amlong",
    category: "Cardiac Care",
    batchNo: "BCH007",
    expiryDate: new Date("2027-01-25"),
    stock: 145,
    price: 15.0,
    description: "Calcium channel blocker for hypertension and chest pain.",
  },
  {
    name: "Ibuprofen 400mg",
    brand: "Ibugesic",
    category: "Pain Relief",
    batchNo: "BCH008",
    expiryDate: new Date("2027-02-10"),
    stock: 75,
    price: 14.0,
    description: "NSAID for pain, inflammation, and fever reduction.",
  },
  {
    name: "ORS Powder",
    brand: "Electral",
    category: "Wellness",
    batchNo: "BCH009",
    expiryDate: new Date("2027-02-28"),
    stock: 60,
    price: 20.0,
    description: "Oral rehydration salts to restore essential fluids and electrolytes.",
  },
  {
    name: "Vitamin D3 60000 IU",
    brand: "Uprise D3",
    category: "Vitamins",
    batchNo: "BCH010",
    expiryDate: new Date("2027-03-15"),
    stock: 32,
    price: 85.0,
    description: "High potency Vitamin D3 supplement for bone health.",
  },
];

// Extended medicines generator to ensure 146 entries as shown in reference image
const generateExtraMedicines = () => {
  const extraCategories = [
    "Pain Relief",
    "Antibiotics",
    "Allergy Care",
    "Gastro Care",
    "Diabetes Care",
    "Cardiac Care",
    "Wellness",
    "Vitamins",
    "Skin Care",
    "Eye Care",
  ];
  const extraBrands = [
    "Cipla",
    "Sun Pharma",
    "Dr Reddy",
    "Lupin",
    "Mankind",
    "Torrent",
    "Zydus",
    "Abbott",
    "Glenmark",
    "AstraZeneca",
  ];
  const sampleNames = [
    "Dolo 650mg",
    "Atorvastatin 10mg",
    "Telmisartan 40mg",
    "Montelukast 10mg",
    "Omeprazole 20mg",
    "Losartan 50mg",
    "Ranitidine 150mg",
    "Clopidogrel 75mg",
    "Levocetirizine 5mg",
    "Ciprofloxacin 500mg",
    "Metoprolol 25mg",
    "Multivitamin Zinc",
    "Calcium 500mg",
    "Diclofenac Gel",
    "Betadine Ointment",
    "Thyronorm 50mcg",
    "B-Complex Syrup",
    "Cough Syrup 100ml",
    "Salbutamol Inhaler",
    "Iron Folic Acid",
  ];

  const items = [];
  for (let i = 11; i <= 146; i++) {
    const padIndex = String(i).padStart(3, "0");
    const nameIdx = (i - 11) % sampleNames.length;
    const catIdx = (i - 11) % extraCategories.length;
    const brandIdx = (i - 11) % extraBrands.length;

    // Randomize expiry between 2026-09-01 and 2027-12-31
    const baseDate = new Date("2026-09-01");
    const addedDays = Math.floor((i / 146) * 450);
    const expiry = new Date(baseDate.getTime() + addedDays * 24 * 60 * 60 * 1000);

    items.push({
      name: `${sampleNames[nameIdx]} (Batch ${padIndex})`,
      brand: extraBrands[brandIdx],
      category: extraCategories[catIdx],
      batchNo: `BCH${padIndex}`,
      expiryDate: expiry,
      stock: Math.floor(Math.random() * 200) + 2,
      price: Math.floor(Math.random() * 150) + 10,
      description: `Quality pharmaceutical product batch ${padIndex}`,
    });
  }
  return items;
};

const autoSeedMedicines = async () => {
  try {
    const count = await Medicine.countDocuments();
    if (count < 10) {
      // Clear incomplete test items if any
      await Medicine.deleteMany({ batchNo: { $exists: false } });

      const allItems = [...BASELINE_MEDICINES, ...generateExtraMedicines()];

      for (const item of allItems) {
        const existing = await Medicine.findOne({ batchNo: item.batchNo });
        if (!existing) {
          await Medicine.create({
            ...item,
            inStock: item.stock > 0,
            lowStockThreshold: 10,
          });
        }
      }
      console.log(`[Medicine Seeder] Successfully seeded ${allItems.length} medicines.`);
    } else {
      // Ensure baseline 10 medicines exist with exact batchNos
      for (const item of BASELINE_MEDICINES) {
        const existing = await Medicine.findOne({ batchNo: item.batchNo });
        if (!existing) {
          await Medicine.create({
            ...item,
            inStock: item.stock > 0,
            lowStockThreshold: 10,
          });
        }
      }
      console.log(`[Medicine Seeder] Verified baseline expiry medicines in database.`);
    }

    // Ensure Categories exist for filter dropdowns
    const categories = [
      "Pain Relief",
      "Antibiotics",
      "Allergy Care",
      "Gastro Care",
      "Diabetes Care",
      "Cardiac Care",
      "Wellness",
      "Vitamins",
      "Skin Care",
      "Eye Care",
    ];

    for (const catName of categories) {
      const slug = catName.toLowerCase().replace(/\s+/g, "-");
      const exists = await Category.findOne({ name: catName });
      if (!exists) {
        await Category.create({ name: catName, slug, isActive: true });
      }
    }
  } catch (error) {
    console.error("[Medicine Seeder] Error seeding medicines:", error.message);
  }
};

module.exports = autoSeedMedicines;
