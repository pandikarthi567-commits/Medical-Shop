const Category = require("../models/Category");

const autoSeedMedicines = async () => {
  try {
    // Only ensure standard categories exist for dropdowns
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
      "Ayurvedic",
      "Baby Care",
      "First Aid",
    ];

    for (const catName of categories) {
      const slug = catName.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");
      const exists = await Category.findOne({ name: catName });
      if (!exists) {
        await Category.create({ name: catName, slug, isActive: true });
      }
    }
  } catch (error) {
    console.error("[Medicine Seeder] Error seeding categories:", error.message);
  }
};

module.exports = autoSeedMedicines;
