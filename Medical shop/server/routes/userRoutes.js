const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const uploadAvatar = require("../middleware/uploadAvatar");
const {
  getUserProfile,
  updateUserProfile,
  uploadUserAvatar,
} = require("../controllers/userController");

router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);
router.post("/avatar", protect, uploadAvatar.single("avatar"), uploadUserAvatar);

module.exports = router;