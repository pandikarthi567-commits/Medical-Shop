const express = require("express");
const router = express.Router();

const {
  getMyWishlist,
  addToWishlist,
  removeFromWishlist,
  isInWishlist,
} = require("../controllers/wishlistController");

const { protect } = require("../middleware/authMiddleware");

router.get("/my", protect, getMyWishlist);
router.post("/add", protect, addToWishlist);
router.delete("/remove/:medicineId", protect, removeFromWishlist);
router.get("/check/:medicineId", protect, isInWishlist);

module.exports = router;