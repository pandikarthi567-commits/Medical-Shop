const express = require("express");
const router = express.Router();
const {
  getAllRiders,
  createRider,
  updateRider,
  deleteRider,
} = require("../controllers/riderController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", getAllRiders);
router.post("/", protect, createRider);
router.put("/:id", protect, updateRider);
router.delete("/:id", protect, deleteRider);

module.exports = router;
