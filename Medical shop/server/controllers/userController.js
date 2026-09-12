const User = require("../models/User");

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name || "",
  email: user.email || "",
  phone: user.phone || "",
  location: user.location || "",
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

    return res.status(200).json({
      success: true,
      user: sanitizeUser(user),
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
    const { name, email, phone, location } = req.body;

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
          message: "Email already exists",
        });
      }

      user.email = cleanEmail;
    }

    if (!cleanEmail) {
      user.email = undefined;
    }

    if (cleanPhone && cleanPhone !== user.phone) {
      if (cleanPhone.length !== 10) {
        return res.status(400).json({
          success: false,
          message: "Phone number must be 10 digits",
        });
      }

      const existingPhone = await User.findOne({
        phone: cleanPhone,
        _id: { $ne: user._id },
      });

      if (existingPhone) {
        return res.status(400).json({
          success: false,
          message: "Phone already exists",
        });
      }

      user.phone = cleanPhone;
      user.isPhoneVerified = false;
    }

    if (cleanName) user.name = cleanName;
    user.location = cleanLocation;

    const updatedUser = await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: sanitizeUser(updatedUser),
    });
  } catch (error) {
    console.error("Update user profile error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update profile",
    });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
};