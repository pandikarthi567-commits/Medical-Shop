const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    customerId: {
      type: String,
      unique: true,
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
    customerType: {
      type: String,
      default: "Retail",
      trim: true,
    },
    location: {
      type: String,
      default: "Virudhunagar",
      trim: true,
    },
    totalPurchases: {
      type: Number,
      default: 0,
      min: 0,
    },
    ordersCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    bloodGroup: {
      type: String,
      default: "",
    },
    gender: {
      type: String,
      default: "",
    },
    age: {
      type: String,
      default: "",
    },
    emergencyContact: {
      type: String,
      default: "",
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
customerSchema.pre("save", async function () {
  if (!this.customerId) {
    let candidate = "";
    for (let attempts = 0; attempts < 50; attempts++) {
      const count = await mongoose.model("Customer").countDocuments();
      const testId = `CUST-${String(count + 1 + attempts).padStart(4, "0")}`;
      const exists = await mongoose.model("Customer").findOne({ customerId: testId });
      if (!exists) {
        candidate = testId;
        break;
      }
    }
    this.customerId = candidate || `CUST-${Date.now().toString().slice(-6)}`;
  }
});

module.exports = mongoose.model("Customer", customerSchema);
