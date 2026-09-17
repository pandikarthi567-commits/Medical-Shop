// routes/paymentRoutes.js
const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const {
  createCashfreeOrder,
  getCashfreeOrderStatus,
  completeDuplicateCashfreePayment,
} = require("../controllers/paymentController");

router.post("/cashfree/create-order", protect, createCashfreeOrder);
router.post("/cashfree/complete-duplicate", protect, completeDuplicateCashfreePayment);
router.get("/cashfree/order-status/:orderId", protect, getCashfreeOrderStatus);

module.exports = router;