const Settings = require("../models/Settings");

const DEFAULT_SETTINGS_DATA = {
  shopName: "MediCare Medicals",
  ownerName: "Karthik Bairavan",
  address: "123, Anna Salai,\nChennai - 600 001",
  phone: "98765 43210",
  email: "medicare@gmail.com",
  gstNumber: "33ABCDE1234F1Z5",
  licenseNumber: "MDL/2026/001",
  defaultPurchaseTax: 5,
  defaultSaleTax: 5,
  currency: "INR (₹)",
  lowStockThreshold: 10,
  dateFormat: "dd MMM yyyy",
  timeFormat: "12 Hour (AM/PM)",
  enableExpiryAlerts: true,
  enableStockAlerts: true,
  allowNegativeStock: false,
  printInvoiceAutomatically: true,
  invoicePrefix: "INV",
  invoiceStartNumber: "000001",
  invoiceFormat: "A4 (Portrait)",
  itemsPerPage: 10,
  showCompanyLogo: true,
  showGstDetails: true,
  showThankYouMessage: true,
  showBarcodeOnInvoice: false,
};

// GET /api/settings
const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create(DEFAULT_SETTINGS_DATA);
    }
    return res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("Get settings error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while fetching settings",
    });
  }
};

// PUT /api/settings
const updateSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings(DEFAULT_SETTINGS_DATA);
    }

    Object.keys(req.body).forEach((key) => {
      if (req.body[key] !== undefined) {
        settings[key] = req.body[key];
      }
    });

    await settings.save();

    return res.status(200).json({
      success: true,
      message: "Settings updated successfully",
      settings,
    });
  } catch (error) {
    console.error("Update settings error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while updating settings",
    });
  }
};

// POST /api/settings/reset
const resetSettings = async (req, res) => {
  try {
    await Settings.deleteMany({});
    const settings = await Settings.create(DEFAULT_SETTINGS_DATA);
    return res.status(200).json({
      success: true,
      message: "Settings reset to default configuration",
      settings,
    });
  } catch (error) {
    console.error("Reset settings error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while resetting settings",
    });
  }
};

// POST /api/settings/backup
const backupData = async (req, res) => {
  try {
    const settings = await Settings.findOne();
    const backupObj = {
      timestamp: new Date(),
      version: "1.0.0",
      settings: settings || DEFAULT_SETTINGS_DATA,
    };

    return res.status(200).json({
      success: true,
      message: "Backup created successfully",
      backup: backupObj,
    });
  } catch (error) {
    console.error("Backup data error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while backing up data",
    });
  }
};

// POST /api/settings/clear-logs
const clearLogs = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "System logs cleared successfully",
      clearedAt: new Date(),
    });
  } catch (error) {
    console.error("Clear logs error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while clearing logs",
    });
  }
};

module.exports = {
  getSettings,
  updateSettings,
  resetSettings,
  backupData,
  clearLogs,
};
