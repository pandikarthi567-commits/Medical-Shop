const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema(
  {
    supplierId: {
      type: String,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    contactPerson: {
      type: String,
      default: "",
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      default: "",
      trim: true,
    },
    supplierType: {
      type: String,
      enum: ["Distributor", "Wholesaler", "Manufacturer"],
      default: "Distributor",
    },
    location: {
      type: String,
      default: "Chennai",
      trim: true,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    gstin: {
      type: String,
      default: "",
      trim: true,
    },
    address: {
      type: String,
      default: "",
      trim: true,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Auto-generate supplierId before saving if missing
supplierSchema.pre("save", async function () {
  if (!this.supplierId) {
    let candidate = "";
    for (let attempts = 0; attempts < 50; attempts++) {
      const count = await mongoose.model("Supplier").countDocuments();
      const testId = `SUP-${String(count + 1 + attempts).padStart(4, "0")}`;
      const exists = await mongoose.model("Supplier").findOne({ supplierId: testId });
      if (!exists) {
        candidate = testId;
        break;
      }
    }
    this.supplierId = candidate || `SUP-${Date.now().toString().slice(-6)}`;
  }
});

module.exports = mongoose.model("Supplier", supplierSchema);
