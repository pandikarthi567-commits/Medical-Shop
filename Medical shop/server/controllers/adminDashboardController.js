const Order = require("../models/Order");

const getAdminDashboard = async (req, res) => {
  try {
    const [summaryAgg] = await Order.aggregate([
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
              $cond: [
                { $eq: ["$paymentStatus", "PAID"] },
                "$totalAmount",
                0,
              ],
            },
          },
        },
      },
    ]);

    const paidOrderDetails = await Order.find({ paymentStatus: "PAID" })
      .populate("user", "name email phone")
      .sort({ paymentVerifiedAt: -1, createdAt: -1 })
      .select(
        "orderId customerName customerEmail customerPhone totalAmount subtotal shippingCharge tax paymentStatus paymentVerifiedAt createdAt orderStatus deliveryStatus"
      );

    const dailyRevenue = await Order.aggregate([
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
          totalAmount: { $sum: "$totalAmount" },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 30 },
    ]);

    const weeklyRevenue = await Order.aggregate([
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
          totalAmount: { $sum: "$totalAmount" },
        },
      },
      { $sort: { _id: -1 } },
      {
        $project: {
          _id: 0,
          weekStart: "$_id",
          revenue: 1,
          paidOrders: 1,
          totalAmount: 1,
        },
      },
      { $limit: 12 },
    ]);

    const monthlyRevenue = await Order.aggregate([
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
          totalAmount: { $sum: "$totalAmount" },
        },
      },
      { $sort: { _id: -1 } },
      {
        $project: {
          _id: 0,
          monthStart: "$_id",
          revenue: 1,
          paidOrders: 1,
          totalAmount: 1,
        },
      },
      { $limit: 12 },
    ]);

    return res.status(200).json({
      success: true,
      revenue: summaryAgg?.revenue || 0,
      totalAmount: summaryAgg?.totalAmount || 0,
      paidOrders: summaryAgg?.paidOrders || 0,
      unpaidOrders: summaryAgg?.unpaidOrders || 0,
      totalOrders: summaryAgg?.totalOrders || 0,
      paidOrderDetails,
      dailyRevenue,
      weeklyRevenue,
      monthlyRevenue,
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to load dashboard data",
    });
  }
};

module.exports = { getAdminDashboard };