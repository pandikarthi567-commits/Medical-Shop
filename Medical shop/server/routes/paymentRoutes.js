// routes/paymentRoutes.js
const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const {
  createCashfreeOrder,
  getCashfreeOrderStatus,
} = require("../controllers/paymentController");

router.post("/cashfree/create-order", protect, createCashfreeOrder);
router.get("/cashfree/order-status/:orderId", protect, getCashfreeOrderStatus);

module.exports = router;