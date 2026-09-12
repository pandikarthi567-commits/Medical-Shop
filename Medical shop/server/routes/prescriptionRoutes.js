// routes/prescriptionRoutes.js
const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const uploadPrescriptionMiddleware = require("../middleware/uploadPrescription");
const {
  uploadPrescription,
  getAllPrescriptionsForAdmin,
} = require("../controllers/prescriptionController");

router.post(
  "/upload",
  protect,
  uploadPrescriptionMiddleware.single("prescription"),
  uploadPrescription
);

router.get("/admin/all", protect, getAllPrescriptionsForAdmin);

module.exports = router;