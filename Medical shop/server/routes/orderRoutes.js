const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { createOrder, getMyOrders, getMyOrderById } = require("../controllers/orderController");

router.post("/", protect, createOrder);
router.get("/my-orders", protect, getMyOrders);
router.get("/my-orders/:id", protect, getMyOrderById);

module.exports = router;