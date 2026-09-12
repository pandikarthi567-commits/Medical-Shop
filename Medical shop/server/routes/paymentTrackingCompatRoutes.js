const express = require("express");
const router = express.Router();
const { getTracking } = require("../controllers/orderTrackingController");

router.get("/tracking/:orderId", getTracking);

module.exports = router;