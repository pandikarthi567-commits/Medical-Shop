const Order = require("../models/Order");

const DELIVERY_TYPES = ["DELIVERY", "HOME_DELIVERY", "DOOR_DELIVERY"];
const NON_DELIVERY_TYPES = ["PICKUP", "TAKEAWAY", "DINE_IN", "SELF_PICKUP"];

const toNumberOrNull = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const toDateOrNull = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const normalizeDeliveryType = (order) => {
  const raw = String(
    order?.deliveryType ||
      order?.orderType ||
      order?.fulfillmentType ||
      order?.serviceType ||
      ""
  )
    .trim()
    .toUpperCase();

  if (DELIVERY_TYPES.includes(raw)) return "DELIVERY";
  if (NON_DELIVERY_TYPES.includes(raw)) return "NON_DELIVERY";

  if (order?.isDelivery === true) return "DELIVERY";
  if (order?.isDelivery === false) return "NON_DELIVERY";

  if (order?.shippingAddress && Object.keys(order.shippingAddress || {}).length > 0) {
    return "DELIVERY";
  }

  return "NON_DELIVERY";
};

const isDeliveryOrder = (order) => normalizeDeliveryType(order) === "DELIVERY";

const pushStatusHistory = (order, status, updatedBy = "SYSTEM", note = "") => {
  if (!status) return;

  if (!order.tracking) order.tracking = {};
  if (!Array.isArray(order.tracking.statusHistory)) {
    order.tracking.statusHistory = [];
  }

  const normalizedStatus = String(status).trim().toUpperCase();
  const lastEntry =
    order.tracking.statusHistory[order.tracking.statusHistory.length - 1];

  if (!lastEntry || String(lastEntry.status).trim().toUpperCase() !== normalizedStatus) {
    order.tracking.statusHistory.push({
      status: normalizedStatus,
      updatedBy,
      note,
      timestamp: new Date(),
    });
  }
};

const ensureTrackingDefaults = (order) => {
  if (!order.tracking) order.tracking = {};

  if (!order.tracking.rider) {
    order.tracking.rider = {
      riderId: null,
      name: "",
      phone: "",
      vehicleNumber: "",
      vehicleType: "",
      photo: "",
    };
  }

  if (!order.tracking.liveLocation) {
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

  if (order.tracking.etaMinutes === undefined) {
    order.tracking.etaMinutes = null;
  }
};

const buildTrackingPayload = (order) => {
  const deliveryType = normalizeDeliveryType(order);
  const isDelivery = deliveryType === "DELIVERY";

  return {
    success: true,
    _id: order._id,
    orderId: order.orderId,
    customerName:
      order.customerName || order?.user?.name || "N/A",
    customerPhone:
      order.customerPhone || order?.user?.phone || order?.phone || "N/A",
    totalAmount: order.totalAmount || 0,
    orderStatus: order.orderStatus || "N/A",
    deliveryStatus: order.deliveryStatus || "N/A",
    paymentStatus: order.paymentStatus || "N/A",
    deliveryType,
    isDelivery,
    shippingAddress: order.shippingAddress || {},
    createdAt: order.createdAt || null,
    updatedAt: order.updatedAt || new Date(),
    tracking: {
      courierName: order?.tracking?.courierName || "",
      trackingId: order?.tracking?.trackingId || "",
      trackingUrl: order?.tracking?.trackingUrl || "",
      expectedDeliveryDate: order?.tracking?.expectedDeliveryDate || null,
      nonDeliveredReason: order?.tracking?.nonDeliveredReason || "",
      etaMinutes:
        order?.tracking?.etaMinutes !== undefined
          ? order.tracking.etaMinutes
          : null,
      confirmedAt: order?.tracking?.confirmedAt || null,
      processingAt: order?.tracking?.processingAt || null,
      packedAt: order?.tracking?.packedAt || null,
      shippedAt: order?.tracking?.shippedAt || null,
      outForDeliveryAt: order?.tracking?.outForDeliveryAt || null,
      deliveredAt: order?.tracking?.deliveredAt || null,
      cancelledAt: order?.tracking?.cancelledAt || null,
      rider: {
        riderId: order?.tracking?.rider?.riderId || null,
        name: order?.tracking?.rider?.name || "",
        phone: order?.tracking?.rider?.phone || "",
        vehicleNumber: order?.tracking?.rider?.vehicleNumber || "",
        vehicleType: order?.tracking?.rider?.vehicleType || "",
        photo: order?.tracking?.rider?.photo || "",
      },
      liveLocation: {
        lat: toNumberOrNull(
          order?.tracking?.liveLocation?.lat ??
            order?.tracking?.liveLocation?.latitude
        ),
        lng: toNumberOrNull(
          order?.tracking?.liveLocation?.lng ??
            order?.tracking?.liveLocation?.lon ??
            order?.tracking?.liveLocation?.longitude
        ),
        accuracy: toNumberOrNull(order?.tracking?.liveLocation?.accuracy),
        heading: toNumberOrNull(order?.tracking?.liveLocation?.heading),
        speed: toNumberOrNull(order?.tracking?.liveLocation?.speed),
        updatedAt: order?.tracking?.liveLocation?.updatedAt || null,
      },
      statusHistory: Array.isArray(order?.tracking?.statusHistory)
        ? order.tracking.statusHistory
        : [],
    },
  };
};

const emitTrackingUpdate = (req, order) => {
  const io = req.app.get("io");
  if (!io) return;

  const payload = buildTrackingPayload(order);

  io.to(`order:${order.orderId}`).emit("order-tracking-updated", payload);
  io.to("admin-room").emit("admin-order-updated", payload);
  io.to("admin-room").emit("delivery-location-updated", payload);
};

const getAdminOrdersLiveTracking = async (req, res) => {
  try {
    const {
      search = "",
      type = "ALL",
      status,
      limit = 200,
    } = req.query;

    const query = {};
    const normalizedType = String(type).trim().toUpperCase();
    const normalizedStatus = status ? String(status).trim().toUpperCase() : "";

    if (normalizedStatus) {
      query.$or = [
        { orderStatus: normalizedStatus },
        { deliveryStatus: normalizedStatus },
      ];
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(Math.min(Number(limit) || 200, 500))
      .lean();

    let result = orders.map((order) => buildTrackingPayload(order));

    if (normalizedType === "DELIVERY") {
      result = result.filter((order) => order.isDelivery);
    } else if (normalizedType === "NON_DELIVERY") {
      result = result.filter((order) => !order.isDelivery);
    }

    const searchValue = String(search).trim().toLowerCase();
    if (searchValue) {
      result = result.filter((order) => {
        const haystack = [
          order._id,
          order.orderId,
          order.customerName,
          order.customerPhone,
          order.orderStatus,
          order.deliveryStatus,
          order.deliveryType,
          order?.tracking?.rider?.name,
          order?.tracking?.rider?.phone,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(searchValue);
      });
    }

    return res.status(200).json({
      success: true,
      counts: {
        all: orders.length,
        delivery: orders.filter((item) => isDeliveryOrder(item)).length,
        nonDelivery: orders.filter((item) => !isDeliveryOrder(item)).length,
      },
      orders: result,
    });
  } catch (error) {
    console.error("getAdminOrdersLiveTracking error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch admin live tracking orders",
    });
  }
};

const getOrderTrackingByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    const order = await Order.findOne({ orderId }).lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      order: {
        ...buildTrackingPayload(order),
        customerEmail: order.customerEmail || "",
        subtotal: order.subtotal || 0,
        shippingCharge: order.shippingCharge || 0,
        tax: order.tax || 0,
        paymentVerifiedAt: order.paymentVerifiedAt || null,
        items: Array.isArray(order.items) ? order.items : [],
      },
    });
  } catch (error) {
    console.error("getOrderTrackingByOrderId error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch tracking details",
    });
  }
};

const updateOrderTrackingByAdmin = async (req, res) => {
  try {
    const { orderId } = req.params;
    const {
      courierName,
      trackingId,
      trackingUrl,
      expectedDeliveryDate,
      nonDeliveredReason,
      rider,
      liveLocation,
      etaMinutes,
      orderStatus,
      deliveryStatus,
      note,
      deliveryType,
      isDelivery,
    } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    ensureTrackingDefaults(order);

    if (deliveryType !== undefined) {
      order.deliveryType = String(deliveryType || "").trim().toUpperCase() || null;
    }

    if (isDelivery !== undefined) {
      order.isDelivery = Boolean(isDelivery);
    }

    if (orderStatus !== undefined) {
      order.orderStatus = String(orderStatus).trim().toUpperCase();
      pushStatusHistory(order, order.orderStatus, "ADMIN", note || "");
    }

    if (deliveryStatus !== undefined) {
      order.deliveryStatus = String(deliveryStatus).trim().toUpperCase();
    }

    if (courierName !== undefined) order.tracking.courierName = courierName;
    if (trackingId !== undefined) order.tracking.trackingId = trackingId;
    if (trackingUrl !== undefined) order.tracking.trackingUrl = trackingUrl;
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
      order.tracking.liveLocation = {
        ...order.tracking.liveLocation,
        lat: toNumberOrNull(
          liveLocation.lat ?? order.tracking.liveLocation.lat
        ),
        lng: toNumberOrNull(
          liveLocation.lng ?? order.tracking.liveLocation.lng
        ),
        accuracy: toNumberOrNull(
          liveLocation.accuracy ?? order.tracking.liveLocation.accuracy
        ),
        heading: toNumberOrNull(
          liveLocation.heading ?? order.tracking.liveLocation.heading
        ),
        speed: toNumberOrNull(
          liveLocation.speed ?? order.tracking.liveLocation.speed
        ),
        updatedAt: toDateOrNull(liveLocation.updatedAt) || new Date(),
      };
    }

    if (order.orderStatus === "CONFIRMED" && !order.tracking.confirmedAt) {
      order.tracking.confirmedAt = new Date();
    }

    if (order.orderStatus === "PROCESSING" && !order.tracking.processingAt) {
      order.tracking.processingAt = new Date();
    }

    if (order.orderStatus === "PACKED" && !order.tracking.packedAt) {
      order.tracking.packedAt = new Date();
    }

    if (order.orderStatus === "SHIPPED" && !order.tracking.shippedAt) {
      order.tracking.shippedAt = new Date();
      if (!deliveryStatus) order.deliveryStatus = "SHIPPED";
    }

    if (
      order.orderStatus === "OUT_FOR_DELIVERY" &&
      !order.tracking.outForDeliveryAt
    ) {
      order.tracking.outForDeliveryAt = new Date();
      if (!deliveryStatus) order.deliveryStatus = "OUT_FOR_DELIVERY";
    }

    if (order.orderStatus === "DELIVERED" && !order.tracking.deliveredAt) {
      order.tracking.deliveredAt = new Date();
      order.deliveryStatus = "DELIVERED";
      order.tracking.etaMinutes = 0;
    }

    if (order.orderStatus === "CANCELLED" && !order.tracking.cancelledAt) {
      order.tracking.cancelledAt = new Date();
    }

    if (order.orderStatus === "NOT_DELIVERED") {
      order.deliveryStatus = "NOT_DELIVERED";
    }

    await order.save();
    emitTrackingUpdate(req, order);

    return res.status(200).json({
      success: true,
      message: "Tracking updated successfully",
      order: buildTrackingPayload(order),
    });
  } catch (error) {
    console.error("updateOrderTrackingByAdmin error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update tracking",
    });
  }
};

const adminConfirmOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    ensureTrackingDefaults(order);

    order.orderStatus = "CONFIRMED";
    if (!order.tracking.confirmedAt) order.tracking.confirmedAt = new Date();
    pushStatusHistory(order, "CONFIRMED", "ADMIN", "Order confirmed by admin");

    await order.save();
    emitTrackingUpdate(req, order);

    return res.status(200).json({
      success: true,
      message: "Order confirmed successfully",
      order: buildTrackingPayload(order),
    });
  } catch (error) {
    console.error("adminConfirmOrder error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to confirm order",
    });
  }
};

const adminAssignRider = async (req, res) => {
  try {
    const { orderId } = req.params;
    const {
      riderId,
      name,
      phone,
      vehicleNumber,
      vehicleType,
      photo,
      etaMinutes,
    } = req.body;

    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    ensureTrackingDefaults(order);

    if (!isDeliveryOrder(order)) {
      order.deliveryType = "DELIVERY";
      order.isDelivery = true;
    }

    order.tracking.rider = {
      riderId: riderId || null,
      name: name || "",
      phone: phone || "",
      vehicleNumber: vehicleNumber || "",
      vehicleType: vehicleType || "",
      photo: photo || "",
    };

    if (etaMinutes !== undefined) {
      order.tracking.etaMinutes = toNumberOrNull(etaMinutes);
    }

    order.deliveryStatus = "ASSIGNED";

    if (order.orderStatus === "PLACED") {
      order.orderStatus = "CONFIRMED";
      if (!order.tracking.confirmedAt) order.tracking.confirmedAt = new Date();
      pushStatusHistory(
        order,
        "CONFIRMED",
        "ADMIN",
        "Order auto-confirmed during rider assignment"
      );
    }

    pushStatusHistory(order, "ASSIGNED", "ADMIN", "Rider assigned by admin");

    await order.save();
    emitTrackingUpdate(req, order);

    return res.status(200).json({
      success: true,
      message: "Rider assigned successfully",
      order: buildTrackingPayload(order),
    });
  } catch (error) {
    console.error("adminAssignRider error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to assign rider",
    });
  }
};

const riderUpdateLocation = async (req, res) => {
  try {
    const { orderId } = req.params;
    const {
      lat,
      lng,
      accuracy,
      heading,
      speed,
      etaMinutes,
      riderName,
      riderPhone,
      vehicleNumber,
      vehicleType,
      photo,
      riderId,
    } = req.body;

    if (lat == null || lng == null) {
      return res.status(400).json({
        success: false,
        message: "lat and lng are required",
      });
    }

    const latitude = toNumberOrNull(lat);
    const longitude = toNumberOrNull(lng);

    if (latitude == null || longitude == null) {
      return res.status(400).json({
        success: false,
        message: "lat and lng must be valid numbers",
      });
    }

    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    ensureTrackingDefaults(order);

    if (!isDeliveryOrder(order)) {
      order.deliveryType = "DELIVERY";
      order.isDelivery = true;
    }

    if (riderId !== undefined) order.tracking.rider.riderId = riderId || null;
    if (riderName !== undefined) order.tracking.rider.name = riderName;
    if (riderPhone !== undefined) order.tracking.rider.phone = riderPhone;
    if (vehicleNumber !== undefined) {
      order.tracking.rider.vehicleNumber = vehicleNumber;
    }
    if (vehicleType !== undefined) {
      order.tracking.rider.vehicleType = vehicleType;
    }
    if (photo !== undefined) order.tracking.rider.photo = photo;

    order.tracking.liveLocation = {
      lat: latitude,
      lng: longitude,
      accuracy: toNumberOrNull(accuracy),
      heading: toNumberOrNull(heading),
      speed: toNumberOrNull(speed),
      updatedAt: new Date(),
    };

    if (etaMinutes !== undefined) {
      order.tracking.etaMinutes = toNumberOrNull(etaMinutes);
    }

    if (order.orderStatus !== "DELIVERED") {
      order.orderStatus = "OUT_FOR_DELIVERY";
      order.deliveryStatus = "IN_TRANSIT";

      if (!order.tracking.outForDeliveryAt) {
        order.tracking.outForDeliveryAt = new Date();
      }

      pushStatusHistory(
        order,
        "OUT_FOR_DELIVERY",
        "RIDER",
        "Rider started live tracking"
      );
    }

    await order.save();
    emitTrackingUpdate(req, order);

    return res.status(200).json({
      success: true,
      message: "Rider location updated successfully",
      order: buildTrackingPayload(order),
    });
  } catch (error) {
    console.error("riderUpdateLocation error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update rider location",
    });
  }
};

const riderUpdateDeliveryStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, note, nonDeliveredReason } = req.body;

    const normalizedStatus = String(status || "").trim().toUpperCase();

    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    ensureTrackingDefaults(order);

    if (normalizedStatus === "DELIVERED") {
      order.orderStatus = "DELIVERED";
      order.deliveryStatus = "DELIVERED";
      order.tracking.deliveredAt = new Date();
      order.tracking.etaMinutes = 0;
      pushStatusHistory(order, "DELIVERED", "RIDER", note || "Order delivered");
    } else if (normalizedStatus === "NOT_DELIVERED") {
      order.orderStatus = "NOT_DELIVERED";
      order.deliveryStatus = "NOT_DELIVERED";
      order.tracking.nonDeliveredReason = nonDeliveredReason || "";
      pushStatusHistory(
        order,
        "NOT_DELIVERED",
        "RIDER",
        note || nonDeliveredReason || "Delivery failed"
      );
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid rider delivery status",
      });
    }

    await order.save();
    emitTrackingUpdate(req, order);

    return res.status(200).json({
      success: true,
      message: "Delivery status updated successfully",
      order: buildTrackingPayload(order),
    });
  } catch (error) {
    console.error("riderUpdateDeliveryStatus error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update delivery status",
    });
  }
};

module.exports = {
  getAdminOrdersLiveTracking,
  getOrderTrackingByOrderId,
  updateOrderTrackingByAdmin,
  adminConfirmOrder,
  adminAssignRider,
  riderUpdateLocation,
  riderUpdateDeliveryStatus,
  emitTrackingUpdate,
  pushStatusHistory,
};