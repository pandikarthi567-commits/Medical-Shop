const User = require("../models/User");
const Order = require("../models/Order");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const generateOtp = require("../utils/generateOtp");
const { sendEmailOtp } = require("../utils/sendOtpService");

const normalizePhone = (phone = "") => String(phone).replace(/\D/g, "").slice(-10);
const normalizeEmail = (email = "") => String(email).trim().toLowerCase();
const normalizeOtp = (otp = "") => String(otp).replace(/\D/g, "");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "medicare_secret_key_123", {
    expiresIn: "100d",
  });
};

const sanitizeUser = (user) => ({
  id: user._id,
  _id: user._id,
  name: user.name || "",
  email: user.email || "",
  phone: user.phone || "",
  location: user.location || "",
  isPhoneVerified: user.isPhoneVerified,
  joinedDate: user.createdAt,
});

const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, location } = req.body;

    const cleanName = String(name || "").trim();
    const cleanEmail = normalizeEmail(email);
    const cleanPassword = String(password || "");
    const cleanPhone = normalizePhone(phone);
    const cleanLocation = String(location || "").trim();

    if (!cleanName || !cleanEmail || !cleanPassword) {
      return res.status(400).json({
        success: false,
        message: "Full name, email address, and password are required",
      });
    }

    const emailExists = await User.findOne({ email: cleanEmail });
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists. Please sign in.",
      });
    }

    const hashedPassword = await bcrypt.hash(cleanPassword, 10);

    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      password: hashedPassword,
      phone: cleanPhone || "",
      location: cleanLocation,
      isPhoneVerified: false,
      otp: null,
      otpExpiresAt: null,
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("Register user error:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "An account with this email address already exists. Please sign in.",
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while creating account",
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const cleanEmail = normalizeEmail(req.body.email || req.body.username);
    const cleanPassword = String(req.body.password || "");

    if (!cleanEmail || !cleanPassword) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "No account found with this email. Please register first.",
      });
    }

    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: "Password not set. Please use Email Verification Code to sign in.",
      });
    }

    const isMatch = await bcrypt.compare(cleanPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password. Please try again.",
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
    const cleanEmail = normalizeEmail(req.body.email);
    const rawPhone = String(req.body.phone || "").trim();
    const cleanPhone = normalizePhone(rawPhone);

    if (!cleanEmail && !cleanPhone) {
      return res.status(400).json({
        success: false,
        message: "Please provide your email address to receive verification code",
      });
    }

    let user = null;
    let identifier = cleanEmail;

    if (cleanEmail) {
      user = await User.findOne({ email: cleanEmail });
      if (!user) {
        user = await User.create({
          name: cleanEmail.split("@")[0],
          email: cleanEmail,
          phone: cleanPhone || "",
          isPhoneVerified: false,
          otp: null,
          otpExpiresAt: null,
        });
      }
    } else {
      user = await User.findOne({ phone: cleanPhone });
      identifier = cleanPhone;
      if (!user) {
        user = await User.create({
          name: "",
          phone: cleanPhone,
          isPhoneVerified: false,
          otp: null,
          otpExpiresAt: null,
        });
      }
    }

    const otp = String(generateOtp()).padStart(6, "0");

    user.otp = otp;
    user.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    // Send verification code directly to email via Gmail SMTP
    let emailSent = false;
    if (user.email) {
      emailSent = await sendEmailOtp({
        email: user.email,
        otp,
        name: user.name || "Valued Patient",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Verification code sent directly to ${user.email || identifier}. Please check your inbox.`,
      email: user.email,
      emailSent,
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while sending verification code",
    });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const cleanEmail = normalizeEmail(req.body.email);
    const rawPhone = String(req.body.phone || "").trim();
    const cleanPhone = normalizePhone(rawPhone);
    const cleanOtp = normalizeOtp(req.body.otp);

    if (!cleanOtp) {
      return res.status(400).json({
        success: false,
        message: "Verification code is required",
      });
    }

    let user = null;
    if (cleanEmail) {
      user = await User.findOne({ email: cleanEmail });
    } else if (cleanPhone) {
      user = await User.findOne({
        $or: [
          { phone: cleanPhone },
          { phone: `+91${cleanPhone}` },
          { phone: rawPhone },
        ],
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found. Please request a new verification code.",
      });
    }

    // Allow generated OTP or master bypass (123456 / 000000)
    const isMasterBypass = cleanOtp === "123456" || cleanOtp === "000000";
    const isMatch = user.otp && String(user.otp).trim() === cleanOtp;

    if (!isMasterBypass && !isMatch) {
      if (user.otpExpiresAt && new Date() > new Date(user.otpExpiresAt)) {
        return res.status(400).json({
          success: false,
          message: "Verification code expired. Please request a new code.",
        });
      }

      return res.status(400).json({
        success: false,
        message: "Invalid verification code. Please check your email or enter 123456.",
      });
    }

    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Verification successful",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while verifying code",
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