const express = require("express");
const router = express.Router();

const {
  getAllReviews,
  createReview,
  deleteReview,
  clearAllReviews,
} = require("../controllers/reviewController");

router.get("/", getAllReviews);
router.post("/", createReview);
router.delete("/clear-all", clearAllReviews);
router.delete("/:id", deleteReview);

module.exports = router;
