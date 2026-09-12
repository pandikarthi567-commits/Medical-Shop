const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  sendOtp,
  verifyOtp,
  getMyProfile,
  getMyPurchases,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

router.get("/me", protect, getMyProfile);
router.get("/my-purchases", protect, getMyPurchases);

module.exports = router;