const express = require("express");
const router = express.Router();

const {
  registerAdmin,
  loginAdmin,
  getAdminDashboard,
  getAllUsers,
  getAllPaymentDetails,
  getUserByIdForAdmin,
} = require("../controllers/adminController");

const { protectAdmin } = require("../middleware/adminMiddleware");

router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.get("/dashboard", protectAdmin, getAdminDashboard);
router.get("/users", protectAdmin, getAllUsers);
router.get("/payments", protectAdmin, getAllPaymentDetails);
router.get("/users/:id", protectAdmin, getUserByIdForAdmin);

module.exports = router;