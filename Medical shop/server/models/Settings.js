const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    // Shop Information
    shopName: { type: String, default: "MediCare Medicals", trim: true },
    ownerName: { type: String, default: "Karthik Bairavan", trim: true },
    address: { type: String, default: "123, Anna Salai,\nChennai - 600 001", trim: true },
    phone: { type: String, default: "98765 43210", trim: true },
    email: { type: String, default: "medicare@gmail.com", trim: true },
    gstNumber: { type: String, default: "33ABCDE1234F1Z5", trim: true },
    licenseNumber: { type: String, default: "MDL/2026/001", trim: true },

    // Preferences
    defaultPurchaseTax: { type: Number, default: 5 },
    defaultSaleTax: { type: Number, default: 5 },
    currency: { type: String, default: "INR (₹)" },
    lowStockThreshold: { type: Number, default: 10 },
    dateFormat: { type: String, default: "dd MMM yyyy" },
    timeFormat: { type: String, default: "12 Hour (AM/PM)" },
    enableExpiryAlerts: { type: Boolean, default: true },
    enableStockAlerts: { type: Boolean, default: true },
    allowNegativeStock: { type: Boolean, default: false },
    printInvoiceAutomatically: { type: Boolean, default: true },

    // Invoice Settings
    invoicePrefix: { type: String, default: "INV" },
    invoiceStartNumber: { type: String, default: "000001" },
    invoiceFormat: { type: String, default: "A4 (Portrait)" },
    itemsPerPage: { type: Number, default: 10 },
    showCompanyLogo: { type: Boolean, default: true },
    showGstDetails: { type: Boolean, default: true },
    showThankYouMessage: { type: Boolean, default: true },
    showBarcodeOnInvoice: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Settings", settingsSchema);
