const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const User = require("../models/User");
const Order = require("../models/Order");
const Medicine = require("../models/Medicine");
const Offer = require("../models/Offer");
const { sendAdminLoginMail } = require("../utils/sendEmail");

const generateToken = (id) => {
  return jwt.sign({ id, type: "admin" }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const registerAdmin = async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "").trim();

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: "Admin already exists with this email",
      });
    }

    const admin = await Admin.create({
      name,
      email,
      password,
    });

    return res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error("Register admin error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while registering admin",
    });
  }
};

const loginAdmin = async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "").trim();

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Direct, indexed database lookup from MongoDB
    const admin = await Admin.findOne({ email }).select("+password").exec();

    if (!admin) {
      return res.status(400).json({
        success: false,
        message: "Invalid admin email or password",
      });
    }

    // High-speed bcrypt password verification against stored database hash
    const isMatch = await admin.matchPassword(password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid admin email or password",
      });
    }

    console.log(`[DB Auth] Admin credentials successfully fetched & verified from MongoDB for: ${admin.email}`);

    const token = generateToken(admin._id);

    // Send email notification asynchronously in background
    setImmediate(() => {
      sendAdminLoginMail({
        to: admin.email,
        name: admin.name,
      }).catch((err) => {
        console.error("Admin login email notification error:", err.message);
      });
    });

    return res.status(200).json({
      success: true,
      message: "Admin login successful",
      token,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: "admin",
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while logging in admin",
    });
  }
};

const getAdminDashboard = async (req, res) => {
  try {
    const now = new Date();

    const [
      totalUsers,
      totalOrders,
      totalMedicines,
      totalOffers,
      lowStock,
      expired,
      paymentSummary,
      recentOrders,
      activeDeliveries,
      dailyRevenue,
      weeklyRevenue,
      monthlyRevenue,
    ] = await Promise.all([
      User.countDocuments(),
      Order.countDocuments(),
      Medicine.countDocuments(),
      Offer.countDocuments(),
      Medicine.countDocuments({ stock: { $lte: 10 } }),
      Medicine.countDocuments({ expiryDate: { $lt: now } }),
      Order.aggregate([
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$totalAmount" },
            totalOrders: { $sum: 1 },
            paidOrders: {
              $sum: {
                $cond: [{ $eq: ["$paymentStatus", "PAID"] }, 1, 0],
              },
            },
            unpaidOrders: {
              $sum: {
                $cond: [{ $ne: ["$paymentStatus", "PAID"] }, 1, 0],
              },
            },
            revenue: {
              $sum: {
                $cond: [{ $eq: ["$paymentStatus", "PAID"] }, "$totalAmount", 0],
              },
            },
          },
        },
      ]),
      Order.find()
        .populate("user", "name email phone")
        .sort({ createdAt: -1 })
        .limit(10)
        .select(
          "orderId customerName customerEmail customerPhone totalAmount paymentStatus paymentVerifiedAt createdAt orderStatus deliveryStatus tracking"
        ),
      Order.find({
        orderStatus: { $in: ["SHIPPED", "OUT_FOR_DELIVERY"] },
      })
        .populate("user", "name email phone")
        .sort({ updatedAt: -1 })
        .select(
          "orderId customerName customerEmail customerPhone totalAmount orderStatus deliveryStatus tracking shippingAddress"
        ),
      Order.aggregate([
        { $match: { paymentStatus: "PAID", paymentVerifiedAt: { $ne: null } } },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$paymentVerifiedAt",
              },
            },
            revenue: { $sum: "$totalAmount" },
            paidOrders: { $sum: 1 },
          },
        },
        { $sort: { _id: -1 } },
        { $limit: 30 },
      ]),
      Order.aggregate([
        { $match: { paymentStatus: "PAID", paymentVerifiedAt: { $ne: null } } },
        {
          $group: {
            _id: {
              $dateTrunc: {
                date: "$paymentVerifiedAt",
                unit: "week",
              },
            },
            revenue: { $sum: "$totalAmount" },
            paidOrders: { $sum: 1 },
          },
        },
        { $sort: { _id: -1 } },
        {
          $project: {
            _id: 0,
            weekStart: "$_id",
            revenue: 1,
            paidOrders: 1,
          },
        },
        { $limit: 12 },
      ]),
      Order.aggregate([
        { $match: { paymentStatus: "PAID", paymentVerifiedAt: { $ne: null } } },
        {
          $group: {
            _id: {
              $dateTrunc: {
                date: "$paymentVerifiedAt",
                unit: "month",
              },
            },
            revenue: { $sum: "$totalAmount" },
            paidOrders: { $sum: 1 },
          },
        },
        { $sort: { _id: -1 } },
        {
          $project: {
            _id: 0,
            monthStart: "$_id",
            revenue: 1,
            paidOrders: 1,
          },
        },
        { $limit: 12 },
      ]),
    ]);

    const summary = paymentSummary?.[0] || {
      revenue: 0,
      totalAmount: 0,
      paidOrders: 0,
      unpaidOrders: 0,
      totalOrders: 0,
    };

    return res.status(200).json({
      success: true,
      totalUsers,
      totalOrders,
      totalMedicines,
      totalOffers,
      lowStock,
      expired,
      revenue: summary.revenue || 0,
      totalAmount: summary.totalAmount || 0,
      paidOrders: summary.paidOrders || 0,
      unpaidOrders: summary.unpaidOrders || 0,
      recentOrders,
      activeDeliveries,
      dailyRevenue,
      weeklyRevenue,
      monthlyRevenue,
      admin: {
        id: req.admin?._id,
        name: req.admin?.name,
        email: req.admin?.email,
      },
    });
  } catch (error) {
    console.error("Get admin dashboard error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch admin dashboard",
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select("-password -otp -otpExpiresAt")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Get all users error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch users",
    });
  }
};

const getAllPaymentDetails = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });

    const summary = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: {
              $cond: [{ $eq: ["$paymentStatus", "PAID"] }, "$totalAmount", 0],
            },
          },
          paidOrders: {
            $sum: {
              $cond: [{ $eq: ["$paymentStatus", "PAID"] }, 1, 0],
            },
          },
          unpaidOrders: {
            $sum: {
              $cond: [{ $ne: ["$paymentStatus", "PAID"] }, 1, 0],
            },
          },
          totalOrders: { $sum: 1 },
          totalAmount: { $sum: "$totalAmount" },
        },
      },
    ]);

    const totals = summary[0] || {
      totalRevenue: 0,
      paidOrders: 0,
      unpaidOrders: 0,
      totalOrders: 0,
      totalAmount: 0,
    };

    return res.status(200).json({
      success: true,
      totals: {
        revenue: totals.totalRevenue || 0,
        totalAmount: totals.totalAmount || 0,
        paidOrders: totals.paidOrders || 0,
        unpaidOrders: totals.unpaidOrders || 0,
        totalOrders: totals.totalOrders || 0,
      },
      orders,
    });
  } catch (error) {
    console.error("Get all payment details error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch payment details",
    });
  }
};

const getUserByIdForAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password -otp -otpExpiresAt");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get user by id error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch user details",
    });
  }
};

module.exports = {
  registerAdmin,
  loginAdmin,
  getAdminDashboard,
  getAllUsers,
  getAllPaymentDetails,
  getUserByIdForAdmin,
};