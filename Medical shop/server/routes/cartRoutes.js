const express = require("express");
const router = express.Router();
const  {
  addToCart,
  getMyCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
} = require("../controllers/cartController.js");
const { protect } = require("../middleware/authMiddleware.js");

router.get("/my", protect, getMyCart);
router.post("/add", protect, addToCart);
router.put("/update/:medicineId", protect, updateCartItemQuantity);
router.delete("/remove/:medicineId", protect, removeFromCart);
router.delete("/clear", protect, clearCart);

module.exports = router;