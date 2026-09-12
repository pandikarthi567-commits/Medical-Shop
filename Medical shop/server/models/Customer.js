const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    customerId: {
      type: String,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
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
    customerType: {
      type: String,
      enum: ["Retail", "Hospital", "Clinic", "Wholesale"],
      default: "Retail",
    },
    location: {
      type: String,
      default: "Chennai",
      trim: true,
    },
    totalPurchases: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastPurchase: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    address: {
      type: String,
      default: "",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Auto-generate customerId before saving if missing
customerSchema.pre("save", async function (next) {
  if (!this.customerId) {
    const count = await mongoose.model("Customer").countDocuments();
    this.customerId = `CUST-${String(count + 1).padStart(4, "0")}`;
  }
  next();
});

module.exports = mongoose.model("Customer", customerSchema);
