const mongoose = require("mongoose");
const Order = require("../models/Order");
const { sendOrderMail } = require("../utils/sendEmail");

const ORDER_STATUSES = [
  "PLACED",
  "CONFIRMED",
  "PROCESSING",
  "PACKED",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
  "NOT_DELIVERED",
];

const DELIVERY_STATUSES = [
  "PENDING",
  "ASSIGNED",
  "SHIPPED",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "NOT_DELIVERED",
  "FAILED",
];

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const toNumberOrNull = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const toDateOrNull = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const ensureTrackingObjects = (order) => {
  if (!order.tracking || typeof order.tracking !== "object") {
    order.tracking = {};
  }

  if (!order.tracking.rider || typeof order.tracking.rider !== "object") {
    order.tracking.rider = {
      riderId: null,
      name: "",
      phone: "",
      vehicleNumber: "",
      vehicleType: "",
      photo: "",
    };
  }

  if (!order.tracking.liveLocation || typeof order.tracking.liveLocation !== "object") {
    order.tracking.liveLocation = {
      lat: null,
      lng: null,
      accuracy: null,
      heading: null,
      speed: null,
      updatedAt: null,
    };
  }

  if (!Array.isArray(order.tracking.statusHistory)) {
    order.tracking.statusHistory = [];
  }
};

const pushStatusHistory = (order, status, updatedBy = "ADMIN", note = "") => {
  ensureTrackingObjects(order);

  const lastEntry =
    order.tracking.statusHistory[order.tracking.statusHistory.length - 1];

  if (!lastEntry || lastEntry.status !== status || lastEntry.note !== note) {
    order.tracking.statusHistory.push({
      status,
      updatedBy,
      note,
      timestamp: new Date(),
    });
  }
};

const applyOrderStatusTimestamps = (
  order,
  status,
  deliveryStatusWasPassed = false
) => {
  ensureTrackingObjects(order);

  if (status === "CONFIRMED" && !order.tracking.confirmedAt) {
    order.tracking.confirmedAt = new Date();
  }

  if (status === "PROCESSING" && !order.tracking.processingAt) {
    order.tracking.processingAt = new Date();
  }

  if (status === "PACKED" && !order.tracking.packedAt) {
    order.tracking.packedAt = new Date();
  }

  if (status === "SHIPPED" && !order.tracking.shippedAt) {
    order.tracking.shippedAt = new Date();
    if (!deliveryStatusWasPassed) order.deliveryStatus = "SHIPPED";
  }

  if (status === "OUT_FOR_DELIVERY" && !order.tracking.outForDeliveryAt) {
    order.tracking.outForDeliveryAt = new Date();
    if (!deliveryStatusWasPassed) order.deliveryStatus = "OUT_FOR_DELIVERY";
  }

  if (status === "DELIVERED" && !order.tracking.deliveredAt) {
    order.tracking.deliveredAt = new Date();
    order.deliveryStatus = "DELIVERED";
    order.tracking.etaMinutes = 0;
  }

  if (status === "CANCELLED" && !order.tracking.cancelledAt) {
    order.tracking.cancelledAt = new Date();
  }

  if (status === "NOT_DELIVERED") {
    order.deliveryStatus = "NOT_DELIVERED";
  }
};

const emitTrackingUpdate = (req, order) => {
  try {
    const io = req.app.get("io");
    if (!io) return;

    const payload = {
      success: true,
      _id: order._id,
      orderId: order.orderId,
      orderStatus: order.orderStatus,
      deliveryStatus: order.deliveryStatus,
      tracking: order.tracking,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      totalAmount: order.totalAmount,
      updatedAt: new Date(),
    };

    io.to(`order:${order.orderId}`).emit("order-tracking-updated", payload);
    io.to("admin-room").emit("admin-order-updated", payload);
  } catch (socketError) {
    console.error("Socket emit tracking update error:", socketError.message);
  }
};

const formatAdminOrder = (order) => {
  const tracking = order?.tracking || {};
  const rider = tracking?.rider || {};
  const liveLocation = tracking?.liveLocation || {};

  return {
    _id: order?._id || null,
    orderId: order?.orderId || "",
    cfOrderId: order?.cfOrderId || "",
    paymentSessionId: order?.paymentSessionId || "",
    user: order?.user || null,
    customerName: order?.customerName || "",
    customerEmail: order?.customerEmail || "",
    customerPhone: order?.customerPhone || "",
    totalAmount: order?.totalAmount ?? 0,
    subtotal: order?.subtotal ?? 0,
    shippingCharge: order?.shippingCharge ?? 0,
    tax: order?.tax ?? 0,
    paymentMethod: order?.paymentMethod || "",
    paymentStatus: order?.paymentStatus || "",
    paymentVerifiedAt: order?.paymentVerifiedAt || null,
    cashfreeOrderStatus: order?.cashfreeOrderStatus || "",
    emailSent: order?.emailSent ?? false,
    orderStatus: order?.orderStatus || "PLACED",
    deliveryStatus: order?.deliveryStatus || "PENDING",
    createdAt: order?.createdAt || null,
    updatedAt: order?.updatedAt || null,
    shippingAddress: {
      fullName: order?.shippingAddress?.fullName || "",
      phone: order?.shippingAddress?.phone || "",
      addressLine1: order?.shippingAddress?.addressLine1 || "",
      addressLine2: order?.shippingAddress?.addressLine2 || "",
      landmark: order?.shippingAddress?.landmark || "",
      city: order?.shippingAddress?.city || "",
      state: order?.shippingAddress?.state || "",
      postalCode: order?.shippingAddress?.postalCode || "",
      country: order?.shippingAddress?.country || "",
    },
    items: Array.isArray(order?.items) ? order.items : [],
    tracking: {
      courierName: tracking?.courierName || "",
      trackingId: tracking?.trackingId || "",
      trackingUrl: tracking?.trackingUrl || "",
      expectedDeliveryDate: tracking?.expectedDeliveryDate || null,
      confirmedAt: tracking?.confirmedAt || null,
      processingAt: tracking?.processingAt || null,
      packedAt: tracking?.packedAt || null,
      shippedAt: tracking?.shippedAt || null,
      outForDeliveryAt: tracking?.outForDeliveryAt || null,
      deliveredAt: tracking?.deliveredAt || null,
      cancelledAt: tracking?.cancelledAt || null,
      nonDeliveredReason: tracking?.nonDeliveredReason || "",
      etaMinutes: tracking?.etaMinutes ?? null,
      rider: {
        riderId: rider?.riderId || null,
        name: rider?.name || "",
        phone: rider?.phone || "",
        vehicleNumber: rider?.vehicleNumber || "",
        vehicleType: rider?.vehicleType || "",
        photo: rider?.photo || "",
      },
      liveLocation: {
        lat: liveLocation?.lat ?? null,
        lng: liveLocation?.lng ?? null,
        accuracy: liveLocation?.accuracy ?? null,
        heading: liveLocation?.heading ?? null,
        speed: liveLocation?.speed ?? null,
        updatedAt: liveLocation?.updatedAt ?? null,
      },
      statusHistory: Array.isArray(tracking?.statusHistory)
        ? tracking.statusHistory
        : [],
    },
  };
};

const sendTrackingMailSafe = async (order) => {
  try {
    if (!order?.customerEmail) return;

    const addressText = [
      order.shippingAddress?.addressLine1,
      order.shippingAddress?.addressLine2,
      order.shippingAddress?.city,
      order.shippingAddress?.state,
      order.shippingAddress?.postalCode,
      order.shippingAddress?.country,
    ]
      .filter(Boolean)
      .join(", ");

    await sendOrderMail({
      to: order.customerEmail,
      customerName: order.customerName,
      orderId: order.orderId,
      orderDate: order.createdAt,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      deliveryStatus: order.deliveryStatus,
      subtotal: order.subtotal,
      shippingCharge: order.shippingCharge,
      tax: order.tax,
      totalAmount: order.totalAmount,
      items: order.items,
      shippingAddress: addressText,
      customerPhone: order.customerPhone,
      trackingUrl:
        order.tracking?.trackingUrl ||
        `${process.env.CLIENT_URL || "http://localhost:5173"}/track-order?order_id=${order.orderId}`,
    });
  } catch (mailError) {
    console.error("Tracking update email failed:", mailError.message);
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("user", "name email phone")
      .populate("items.productId", "name image price category brand")
      .populate("tracking.rider.riderId", "name email phone")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders: orders.map(formatAdminOrder),
    });
  } catch (error) {
    console.error("Get all orders error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

const getOrderByIdForAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order id",
      });
    }

    const order = await Order.findById(id)
      .populate("user", "name email phone")
      .populate("items.productId", "name image price category brand")
      .populate("tracking.rider.riderId", "name email phone")
      .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      order: formatAdminOrder(order),
    });
  } catch (error) {
    console.error("Get order by id error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch order details",
      error: error.message,
    });
  }
};

const getOrdersWithLiveTracking = async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [
        { orderStatus: { $in: ["SHIPPED", "OUT_FOR_DELIVERY"] } },
        { deliveryStatus: { $in: ["SHIPPED", "IN_TRANSIT", "OUT_FOR_DELIVERY"] } },
        { "tracking.liveLocation.lat": { $ne: null } },
        { "tracking.rider.riderId": { $ne: null } },
      ],
    })
      .populate("user", "name email phone")
      .populate("items.productId", "name image price category brand")
      .populate("tracking.rider.riderId", "name email phone")
      .sort({ updatedAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders: orders.map(formatAdminOrder),
    });
  } catch (error) {
    console.error("Get live tracking orders error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch live tracking orders",
      error: error.message,
    });
  }
};

const getPaidOrders = async (req, res) => {
  try {
    const orders = await Order.find({ paymentStatus: "PAID" })
      .populate("user", "name email phone")
      .populate("items.productId", "name image price category brand")
      .populate("tracking.rider.riderId", "name email phone")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders: orders.map(formatAdminOrder),
    });
  } catch (error) {
    console.error("Get paid orders error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch paid orders",
      error: error.message,
    });
  }
};

const getUnpaidOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      paymentStatus: { $in: ["PENDING", "FAILED"] },
    })
      .populate("user", "name email phone")
      .populate("items.productId", "name image price category brand")
      .populate("tracking.rider.riderId", "name email phone")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders: orders.map(formatAdminOrder),
    });
  } catch (error) {
    console.error("Get unpaid orders error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch unpaid orders",
      error: error.message,
    });
  }
};

const updateDeliveryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order id",
      });
    }

    if (!status || !ORDER_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    ensureTrackingObjects(order);

    order.orderStatus = status;
    pushStatusHistory(order, status, "ADMIN", note || "Status updated by admin");
    applyOrderStatusTimestamps(order, status, false);

    await order.save();
    emitTrackingUpdate(req, order);

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order: formatAdminOrder(order.toObject()),
    });
  } catch (error) {
    console.error("Update delivery status error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to update delivery status",
      error: error.message,
    });
  }
};

const updateOrderTracking = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      orderStatus,
      deliveryStatus,
      courierName,
      trackingId,
      trackingUrl,
      expectedDeliveryDate,
      nonDeliveredReason,
      etaMinutes,
      note,
      rider,
      liveLocation,
    } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order id",
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    ensureTrackingObjects(order);

    if (orderStatus) {
      if (!ORDER_STATUSES.includes(orderStatus)) {
        return res.status(400).json({
          success: false,
          message: "Invalid order status",
        });
      }

      order.orderStatus = orderStatus;
      pushStatusHistory(order, orderStatus, "ADMIN", note || "");
    }

    if (deliveryStatus) {
      if (!DELIVERY_STATUSES.includes(deliveryStatus)) {
        return res.status(400).json({
          success: false,
          message: "Invalid delivery status",
        });
      }

      order.deliveryStatus = deliveryStatus;
    }

    if (courierName !== undefined) order.tracking.courierName = courierName || "";
    if (trackingId !== undefined) order.tracking.trackingId = trackingId || "";
    if (trackingUrl !== undefined) order.tracking.trackingUrl = trackingUrl || "";

    if (expectedDeliveryDate !== undefined) {
      order.tracking.expectedDeliveryDate = toDateOrNull(expectedDeliveryDate);
    }

    if (nonDeliveredReason !== undefined) {
      order.tracking.nonDeliveredReason = nonDeliveredReason || "";
    }

    if (etaMinutes !== undefined) {
      order.tracking.etaMinutes = toNumberOrNull(etaMinutes);
    }

    if (rider && typeof rider === "object") {
      order.tracking.rider = {
        ...order.tracking.rider,
        riderId: rider.riderId ?? order.tracking.rider.riderId ?? null,
        name: rider.name ?? order.tracking.rider.name ?? "",
        phone: rider.phone ?? order.tracking.rider.phone ?? "",
        vehicleNumber:
          rider.vehicleNumber ?? order.tracking.rider.vehicleNumber ?? "",
        vehicleType: rider.vehicleType ?? order.tracking.rider.vehicleType ?? "",
        photo: rider.photo ?? order.tracking.rider.photo ?? "",
      };
    }

    if (liveLocation && typeof liveLocation === "object") {
      const parsedLat = toNumberOrNull(liveLocation.lat);
      const parsedLng = toNumberOrNull(liveLocation.lng);
      const parsedAccuracy = toNumberOrNull(liveLocation.accuracy);
      const parsedHeading = toNumberOrNull(liveLocation.heading);
      const parsedSpeed = toNumberOrNull(liveLocation.speed);

      order.tracking.liveLocation = {
        ...order.tracking.liveLocation,
        lat: parsedLat !== null ? parsedLat : order.tracking.liveLocation.lat ?? null,
        lng: parsedLng !== null ? parsedLng : order.tracking.liveLocation.lng ?? null,
        accuracy:
          parsedAccuracy !== null
            ? parsedAccuracy
            : order.tracking.liveLocation.accuracy ?? null,
        heading:
          parsedHeading !== null
            ? parsedHeading
            : order.tracking.liveLocation.heading ?? null,
        speed:
          parsedSpeed !== null
            ? parsedSpeed
            : order.tracking.liveLocation.speed ?? null,
        updatedAt: toDateOrNull(liveLocation.updatedAt) || new Date(),
      };
    }

    if (orderStatus) {
      applyOrderStatusTimestamps(order, orderStatus, Boolean(deliveryStatus));
    }

    if (deliveryStatus === "DELIVERED" && !order.tracking.deliveredAt) {
      order.tracking.deliveredAt = new Date();
      order.orderStatus = "DELIVERED";
      order.tracking.etaMinutes = 0;
      pushStatusHistory(order, "DELIVERED", "ADMIN", note || "Delivered");
    }

    if (deliveryStatus === "OUT_FOR_DELIVERY" && !order.tracking.outForDeliveryAt) {
      order.tracking.outForDeliveryAt = new Date();
      if (order.orderStatus !== "DELIVERED") {
        order.orderStatus = "OUT_FOR_DELIVERY";
      }
      pushStatusHistory(
        order,
        "OUT_FOR_DELIVERY",
        "ADMIN",
        note || "Out for delivery"
      );
    }

    if (
      deliveryStatus === "NOT_DELIVERED" ||
      deliveryStatus === "FAILED"
    ) {
      if (nonDeliveredReason !== undefined) {
        order.tracking.nonDeliveredReason = nonDeliveredReason || "";
      }
    }

    await order.save();
    emitTrackingUpdate(req, order);
    await sendTrackingMailSafe(order);

    return res.status(200).json({
      success: true,
      message: "Tracking updated successfully",
      order: formatAdminOrder(order.toObject()),
    });
  } catch (error) {
    console.error("Update tracking error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to update tracking",
      error: error.message,
    });
  }
};

module.exports = {
  getAllOrders,
  getOrderByIdForAdmin,
  getOrdersWithLiveTracking,
  updateDeliveryStatus,
  updateOrderTracking,
  getPaidOrders,
  getUnpaidOrders,
  emitTrackingUpdate,
  pushStatusHistory,
  ensureTrackingObjects,
};