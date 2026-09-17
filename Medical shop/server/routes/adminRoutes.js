const express = require("express");
const router = express.Router();

const {
  registerAdmin,
  loginAdmin,
  sendAdminOtp,
  verifyAdminOtp,
  getAdminDashboard,
  getAllUsers,
  getAllPaymentDetails,
  getUserByIdForAdmin,
  purgeAllMockData,
} = require("../controllers/adminController");

const { protectAdmin } = require("../middleware/adminMiddleware");

router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.post("/send-otp", sendAdminOtp);
router.post("/verify-otp", verifyAdminOtp);
router.get("/dashboard", protectAdmin, getAdminDashboard);
router.get("/users", protectAdmin, getAllUsers);
router.get("/payments", protectAdmin, getAllPaymentDetails);
router.get("/users/:id", protectAdmin, getUserByIdForAdmin);
router.post("/purge-all-data", purgeAllMockData);
router.delete("/purge-all-data", purgeAllMockData);
router.post("/reset-database", purgeAllMockData);

module.exports = router;