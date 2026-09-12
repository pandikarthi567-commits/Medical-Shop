const express = require("express");
const router = express.Router();

const { protectAdmin } = require("../middleware/adminMiddleware");
const {
  getAllOrders,
  updateDeliveryStatus,
  updateOrderTracking,
  getPaidOrders,
  getUnpaidOrders,
  getOrderByIdForAdmin,
  getOrdersWithLiveTracking,
} = require("../controllers/adminOrderController");

router.get("/orders", protectAdmin, getAllOrders);
router.get("/orders/paid", protectAdmin, getPaidOrders);
router.get("/orders/unpaid", protectAdmin, getUnpaidOrders);
router.get("/orders/live-tracking", protectAdmin, getOrdersWithLiveTracking);
router.get("/orders/:id", protectAdmin, getOrderByIdForAdmin);
router.put("/orders/:id/status", protectAdmin, updateDeliveryStatus);
router.put("/orders/:id/tracking", protectAdmin, updateOrderTracking);

module.exports = router;