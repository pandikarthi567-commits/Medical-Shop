// controllers/prescriptionController.js
const Prescription = require("../models/Prescription");

const uploadPrescription = async (req, res) => {
  try {
    const { fullName, phone, medicineDetails, notes } = req.body;

    if (!fullName || !phone || !medicineDetails) {
      return res.status(400).json({
        success: false,
        message: "Full name, phone, and medicine details are required",
      });
    }

    const cleanPhone = String(phone).replace(/\D/g, "").slice(-10);

    if (!/^\d{10}$/.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: "Phone number must be 10 digits",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Prescription file is required",
      });
    }

    const prescription = await Prescription.create({
      user: req.user?._id || null,
      fullName: String(fullName).trim(),
      phone: cleanPhone,
      medicineDetails: String(medicineDetails).trim(),
      notes: String(notes || "").trim(),
      fileUrl: `/uploads/prescriptions/${req.file.filename}`,
      fileName: req.file.originalname,
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Prescription uploaded successfully and sent to admin dashboard",
      prescription,
    });
  } catch (error) {
    console.error("Upload prescription error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to upload prescription",
    });
  }
};

const getAllPrescriptionsForAdmin = async (req, res) => {
  try {
    const prescriptions = await Prescription.find()
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: prescriptions.length,
      prescriptions,
    });
  } catch (error) {
    console.error("Get prescriptions error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch prescriptions",
    });
  }
};

module.exports = {
  uploadPrescription,
  getAllPrescriptionsForAdmin,
};