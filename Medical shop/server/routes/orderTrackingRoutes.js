const express = require("express");
const router = express.Router();

const {
  getAdminOrdersLiveTracking,
  getOrderTrackingByOrderId,
  updateOrderTrackingByAdmin,
  adminConfirmOrder,
  adminAssignRider,
  riderUpdateLocation,
  riderUpdateDeliveryStatus,
} = require("../controllers/orderTrackingController");

const { protect } = require("../middleware/authMiddleware");

// Admin page: all orders with delivery/non-delivery split support
router.get("/admin/orders/live-tracking", protect, getAdminOrdersLiveTracking);

// Single order tracking (supports public lookup by orderId)
router.get("/:orderId", getOrderTrackingByOrderId);

// Admin actions
router.put("/:orderId", protect, updateOrderTrackingByAdmin);
router.put("/:orderId/confirm", protect, adminConfirmOrder);
router.put("/:orderId/assign-rider", protect, adminAssignRider);

// Rider actions
router.put("/:orderId/rider-location", protect, riderUpdateLocation);
router.put("/:orderId/rider-status", protect, riderUpdateDeliveryStatus);

module.exports = router;