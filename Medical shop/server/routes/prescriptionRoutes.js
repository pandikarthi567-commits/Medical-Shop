// routes/prescriptionRoutes.js
const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const uploadPrescriptionMiddleware = require("../middleware/uploadPrescription");
const {
  uploadPrescription,
  getMyPrescriptions,
  getAllPrescriptionsForAdmin,
} = require("../controllers/prescriptionController");

router.post(
  "/upload",
  protect,
  uploadPrescriptionMiddleware.single("prescription"),
  uploadPrescription
);

router.get("/my-prescriptions", protect, getMyPrescriptions);
router.get("/admin/all", protect, getAllPrescriptionsForAdmin);

module.exports = router;