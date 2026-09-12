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
supplierSchema.pre("save", async function (next) {
  if (!this.supplierId) {
    const count = await mongoose.model("Supplier").countDocuments();
    this.supplierId = `SUP-${String(count + 1).padStart(4, "0")}`;
  }
  next();
});

module.exports = mongoose.model("Supplier", supplierSchema);
