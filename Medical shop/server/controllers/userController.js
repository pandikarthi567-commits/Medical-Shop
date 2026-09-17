const User = require("../models/User");
const Order = require("../models/Order");
const Prescription = require("../models/Prescription");

const sanitizeUser = (user) => ({
  id: user._id,
  _id: user._id,
  name: user.name || "",
  email: user.email || "",
  avatar: user.avatar || "",
  phone: user.phone || "",
  location: user.location || "",
  address: user.address || "",
  pincode: user.pincode || "",
  bloodGroup: user.bloodGroup || "",
  gender: user.gender || "",
  age: user.age || "",
  emergencyContact: user.emergencyContact || "",
  allergies: user.allergies || "",
  isPhoneVerified: user.isPhoneVerified,
  joinedDate: user.createdAt,
});

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "-password -otp -otpExpiresAt"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const [ordersCount, prescriptionsCount] = await Promise.all([
      Order.countDocuments({ user: req.user._id }),
      Prescription.countDocuments({ user: req.user._id }),
    ]);

    return res.status(200).json({
      success: true,
      user: sanitizeUser(user),
      profile: sanitizeUser(user),
      stats: {
        ordersCount,
        prescriptionsCount,
        wishlistCount: Array.isArray(user.wishlist) ? user.wishlist.length : 0,
      },
    });
  } catch (error) {
    console.error("Get user profile error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch user profile",
    });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      location,
      address,
      pincode,
      bloodGroup,
      gender,
      age,
      emergencyContact,
      allergies,
    } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const cleanName = String(name || "").trim();
    const cleanEmail = String(email || "").trim().toLowerCase();
    const cleanPhone = String(phone || "").replace(/\D/g, "").slice(-10);
    const cleanLocation = String(location || "").trim();

    if (cleanEmail && cleanEmail !== user.email) {
      const existingEmail = await User.findOne({
        email: cleanEmail,
        _id: { $ne: user._id },
      });

      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: "An account with this email already exists",
        });
      }

      user.email = cleanEmail;
    }

    if (cleanPhone && cleanPhone !== user.phone) {
      user.phone = cleanPhone;
      user.isPhoneVerified = false;
    } else if (phone === "" || phone === null) {
      user.phone = "";
    }

    if (cleanName) user.name = cleanName;
    user.location = cleanLocation;
    if (address !== undefined) user.address = String(address || "").trim();
    if (pincode !== undefined) user.pincode = String(pincode || "").trim();
    if (bloodGroup !== undefined) user.bloodGroup = String(bloodGroup || "").trim();
    if (gender !== undefined) user.gender = String(gender || "").trim();
    if (age !== undefined) user.age = String(age || "").trim();
    if (emergencyContact !== undefined) user.emergencyContact = String(emergencyContact || "").trim();
    if (allergies !== undefined) user.allergies = String(allergies || "").trim();
    if (req.body.avatar !== undefined) user.avatar = String(req.body.avatar || "").trim();

    const updatedUser = await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: sanitizeUser(updatedUser),
      profile: sanitizeUser(updatedUser),
    });
  } catch (error) {
    console.error("Update user profile error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update profile",
    });
  }
};

const uploadUserAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No avatar image file uploaded",
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    user.avatar = avatarUrl;
    const updatedUser = await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile picture updated successfully",
      avatarUrl,
      user: sanitizeUser(updatedUser),
      profile: sanitizeUser(updatedUser),
    });
  } catch (error) {
    console.error("Upload user avatar error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to upload profile picture",
    });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  uploadUserAvatar,
};