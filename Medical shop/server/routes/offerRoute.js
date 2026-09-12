const express = require("express");
const router = express.Router();

const { protectAdmin } = require("../middleware/adminMiddleware");
const {
  getAllOffers,
  getOfferById,
  addOffer,
  updateOffer,
  deleteOffer,
  getPublicOffers,
} = require("../controllers/offerController");

router.get("/public", getPublicOffers);

router.get("/", protectAdmin, getAllOffers);
router.get("/:id", protectAdmin, getOfferById);
router.post("/", protectAdmin, addOffer);
router.put("/:id", protectAdmin, updateOffer);
router.delete("/:id", protectAdmin, deleteOffer);

module.exports = router;