const User = require("../models/User");
const Order = require("../models/Order");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const generateOtp = require("../utils/generateOtp");

const normalizePhone = (phone = "") => String(phone).replace(/\D/g, "").slice(-10);
const normalizeOtp = (otp = "") => String(otp).replace(/\D/g, "");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "100d" });
};

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name || "",
  email: user.email || "",
  phone: user.phone || "",
  location: user.location || "",
  isPhoneVerified: user.isPhoneVerified,
  joinedDate: user.createdAt,
});

const findUserByPhone = async (phone) => {
  const rawPhone = String(phone || "").trim();
  const cleanPhone = normalizePhone(rawPhone);

  if (!cleanPhone) return null;

  return await User.findOne({
    $or: [
      { phone: rawPhone },
      { phone: cleanPhone },
      { phone: `+91${cleanPhone}` },
      { phone: `91${cleanPhone}` },
    ],
  });
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, location } = req.body;

    const cleanName = String(name || "").trim();
    const cleanEmail = String(email || "").trim().toLowerCase();
    const cleanPassword = String(password || "");
    const cleanPhone = normalizePhone(phone);
    const cleanLocation = String(location || "").trim();

    if (!cleanName || !cleanEmail || !cleanPassword || !cleanPhone) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password and phone are required",
      });
    }

    if (cleanPhone.length !== 10) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid 10-digit phone number",
      });
    }

    const emailExists = await User.findOne({ email: cleanEmail });
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    const phoneExists = await findUserByPhone(cleanPhone);
    if (phoneExists) {
      return res.status(400).json({
        success: false,
        message: "Phone already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(cleanPassword, 10);

    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      password: hashedPassword,
      phone: cleanPhone,
      location: cleanLocation,
      isPhoneVerified: false,
      otp: null,
      otpExpiresAt: null,
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("Register user error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while registering user",
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const cleanEmail = String(req.body.email || "").trim().toLowerCase();
    const cleanPassword = String(req.body.password || "");

    if (!cleanEmail || !cleanPassword) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email: cleanEmail });

    if (!user || !user.password) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(cleanPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("Login user error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while logging in",
    });
  }
};

const sendOtp = async (req, res) => {
  try {
    const rawPhone = String(req.body.phone || "").trim();
    const cleanPhone = normalizePhone(rawPhone);

    if (!cleanPhone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    if (cleanPhone.length !== 10) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid 10-digit phone number",
      });
    }

    let user = await findUserByPhone(cleanPhone);
    let isNewUser = false;

    if (!user) {
      user = await User.create({
        name: "",
        phone: cleanPhone,
        isPhoneVerified: false,
        otp: null,
        otpExpiresAt: null,
      });
      isNewUser = true;
    }

    const otp = String(generateOtp()).padStart(6, "0");

    user.phone = cleanPhone;
    user.otp = otp;
    user.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await user.save();

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      otpForTesting: otp,
      isNewUser,
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while sending OTP",
    });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const rawPhone = String(req.body.phone || "").trim();
    const cleanPhone = normalizePhone(rawPhone);
    const cleanOtp = normalizeOtp(req.body.otp);

    if (!cleanPhone || !cleanOtp) {
      return res.status(400).json({
        success: false,
        message: "Phone and OTP are required",
      });
    }

    if (cleanPhone.length !== 10) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid 10-digit phone number",
      });
    }

    if (cleanOtp.length !== 6) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid 6-digit OTP",
      });
    }

    const user = await findUserByPhone(cleanPhone);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.otp) {
      return res.status(400).json({
        success: false,
        message: "No OTP found. Please request a new OTP",
      });
    }

    if (!user.otpExpiresAt || new Date(user.otpExpiresAt) < new Date()) {
      user.otp = null;
      user.otpExpiresAt = null;
      await user.save();

      return res.status(400).json({
        success: false,
        message: "OTP expired. Please request a new OTP",
      });
    }

    if (String(user.otp).trim() !== String(cleanOtp).trim()) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    user.phone = cleanPhone;
    user.isPhoneVerified = true;
    user.otp = null;
    user.otpExpiresAt = null;

    await user.save();

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while verifying OTP",
    });
  }
};

const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password -otp -otpExpiresAt")
      .populate("wishlist");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      profile: sanitizeUser(user),
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch profile",
    });
  }
};

const getMyPurchases = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate({
        path: "medicines.medicine",
        select: "name price image category",
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      purchases: orders,
    });
  } catch (error) {
    console.error("Get purchases error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch purchase details",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  sendOtp,
  verifyOtp,
  getMyProfile,
  getMyPurchases,
};