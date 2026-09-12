const mongoose = require("mongoose");

const purchaseItemSchema = new mongoose.Schema({
  medicineId: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine", default: null },
  name: { type: String, required: true, trim: true },
  brand: { type: String, default: "", trim: true },
  category: { type: String, default: "", trim: true },
  batchNo: { type: String, default: "", trim: true },
  expiryDate: { type: Date, default: null },
  unitCost: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1 },
  subtotal: { type: Number, required: true, min: 0 },
});

const purchaseSchema = new mongoose.Schema(
  {
    purchaseId: {
      type: String,
      unique: true,
      trim: true,
    },
    supplierName: {
      type: String,
      required: true,
      trim: true,
    },
    supplierPhone: {
      type: String,
      default: "",
      trim: true,
    },
    supplierEmail: {
      type: String,
      default: "",
      trim: true,
    },
    invoiceNo: {
      type: String,
      default: "",
      trim: true,
    },
    items: [purchaseItemSchema],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      default: "Cash",
      trim: true,
    },
    paymentStatus: {
      type: String,
      enum: ["PAID", "PENDING", "PARTIAL"],
      default: "PAID",
    },
    purchaseStatus: {
      type: String,
      enum: ["RECEIVED", "PENDING", "CANCELLED"],
      default: "RECEIVED",
    },
    note: {
      type: String,
      default: "",
      trim: true,
    },
    purchasedBy: {
      type: String,
      default: "Admin",
      trim: true,
    },
  },
  { timestamps: true }
);

// Auto-generate purchaseId before saving
purchaseSchema.pre("save", async function (next) {
  if (!this.purchaseId) {
    const count = await mongoose.model("Purchase").countDocuments();
    this.purchaseId = `PUR-${String(count + 1).padStart(5, "0")}`;
  }
  next();
});

module.exports = mongoose.model("Purchase", purchaseSchema);
