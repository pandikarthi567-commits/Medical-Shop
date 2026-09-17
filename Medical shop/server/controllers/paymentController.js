// controllers/paymentController.js
const axios = require("axios");
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const User = require("../models/User");
const Medicine = require("../models/Medicine");
const { sendOrderMail } = require("../utils/sendEmail");

const CASHFREE_BASE_URL =
  process.env.CASHFREE_BASE_URL || "https://sandbox.cashfree.com/pg";

const normalizePhone = (phone = "") => String(phone).replace(/\D/g, "").slice(-10);

const generateOrderId = () => {
  return `MED_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
};

const calculateTotals = (items) => {
  const subtotal = items.reduce((sum, item) => sum + Number(item.subtotal || 0), 0);
  const shippingCharge = subtotal >= 500 ? 0 : 40;
  const tax = Number((subtotal * 0.05).toFixed(2));
  const totalAmount = Number((subtotal + shippingCharge + tax).toFixed(2));
  return { subtotal, shippingCharge, tax, totalAmount };
};

const cashfreeHeaders = () => ({
  "Content-Type": "application/json",
  Accept: "application/json",
  "x-api-version": "2023-08-01",
  "x-client-id": process.env.CASHFREE_APP_ID,
  "x-client-secret": process.env.CASHFREE_SECRET_KEY,
});

const cashfreeClient = axios.create({
  baseURL: CASHFREE_BASE_URL,
  timeout: 20000,
  validateStatus: () => true,
});

const getCashfreeErrorMessage = (responseOrError) => {
  const data = responseOrError?.data || responseOrError?.response?.data;

  return (
    data?.message ||
    data?.error_description ||
    data?.error ||
    responseOrError?.message ||
    "Cashfree request failed"
  );
};

const ensureTracking = (tracking = {}) => {
  return {
    courierName: tracking.courierName || "",
    trackingId: tracking.trackingId || "",
    trackingUrl: tracking.trackingUrl || "",
    expectedDeliveryDate: tracking.expectedDeliveryDate || null,
    confirmedAt: tracking.confirmedAt || null,
    processingAt: tracking.processingAt || null,
    packedAt: tracking.packedAt || null,
    shippedAt: tracking.shippedAt || null,
    outForDeliveryAt: tracking.outForDeliveryAt || null,
    deliveredAt: tracking.deliveredAt || null,
    cancelledAt: tracking.cancelledAt || null,
    nonDeliveredReason: tracking.nonDeliveredReason || "",
    etaMinutes: typeof tracking.etaMinutes === "number" ? tracking.etaMinutes : null,
    liveLocation: tracking.liveLocation || {
      lat: null,
      lng: null,
      accuracy: null,
      heading: null,
      speed: null,
      updatedAt: null,
    },
    rider: tracking.rider || {
      name: "",
      phone: "",
      vehicleNumber: "",
      riderId: null,
    },
    statusHistory:
      Array.isArray(tracking.statusHistory) && tracking.statusHistory.length > 0
        ? tracking.statusHistory
        : [{ status: "PLACED", updatedBy: "SYSTEM", timestamp: new Date() }],
  };
};

const buildAddress = (shippingAddress = {}) => ({
  fullName: String(shippingAddress.fullName || "").trim(),
  phone: normalizePhone(shippingAddress.phone),
  addressLine1: String(shippingAddress.addressLine1 || "").trim(),
  addressLine2: String(shippingAddress.addressLine2 || "").trim(),
  city: String(shippingAddress.city || "").trim(),
  state: String(shippingAddress.state || "").trim(),
  postalCode: String(shippingAddress.postalCode || "").trim(),
  country: String(shippingAddress.country || "India").trim(),
});

const isPaidStatus = (status = "") => String(status).toUpperCase() === "PAID";
const isPendingStatus = (status = "") =>
  ["ACTIVE", "PENDING", "INITIALIZED"].includes(String(status).toUpperCase());
const isFailedStatus = (status = "") =>
  ["FAILED", "EXPIRED", "TERMINATED", "CANCELLED"].includes(
    String(status).toUpperCase()
  );

const confirmPaidOrder = async (localOrder) => {
  if (!localOrder) return;

  if (localOrder.paymentStatus !== "PAID") {
    localOrder.paymentStatus = "PAID";
  }

  if (!localOrder.paymentVerifiedAt) {
    localOrder.paymentVerifiedAt = new Date();
  }

  if (localOrder.orderStatus === "PLACED") {
    localOrder.orderStatus = "CONFIRMED";
  }

  localOrder.tracking = ensureTracking(localOrder.tracking);

  const alreadyConfirmed = localOrder.tracking.statusHistory.some(
    (entry) => entry.status === "CONFIRMED"
  );

  if (!alreadyConfirmed) {
    localOrder.tracking.confirmedAt = localOrder.tracking.confirmedAt || new Date();
    localOrder.tracking.statusHistory.push({
      status: "CONFIRMED",
      note: "Payment verified successfully",
      updatedBy: "SYSTEM",
      timestamp: new Date(),
    });
  }

  if (!localOrder.stockDeducted) {
    for (const item of localOrder.items) {
      await Medicine.findByIdAndUpdate(item.productId, {
        $inc: { stock: -Number(item.quantity || 0) },
      });
    }
    localOrder.stockDeducted = true;
  }

  await Cart.findOneAndUpdate(
    { user: localOrder.user },
    { $set: { items: [] } },
    { returnDocument: "after" }
  );
};

const markFailedOrder = (localOrder, finalCashfreeStatus) => {
  if (!localOrder) return;

  if (localOrder.paymentStatus !== "PAID") {
    localOrder.paymentStatus = "FAILED";
  }

  if (localOrder.orderStatus === "PLACED") {
    localOrder.orderStatus = "CANCELLED";
  }

  localOrder.tracking = ensureTracking(localOrder.tracking);

  const alreadyCancelled = localOrder.tracking.statusHistory.some(
    (entry) => entry.status === "CANCELLED"
  );

  if (!alreadyCancelled) {
    localOrder.tracking.cancelledAt = localOrder.tracking.cancelledAt || new Date();
    localOrder.tracking.statusHistory.push({
      status: "CANCELLED",
      note: `Order marked cancelled because payment status is ${finalCashfreeStatus}`,
      updatedBy: "SYSTEM",
      timestamp: new Date(),
    });
  }
};

const sendOrderMailIfNeeded = async (localOrder) => {
  if (
    !localOrder ||
    localOrder.paymentStatus !== "PAID" ||
    !localOrder.customerEmail ||
    localOrder.emailSent
  ) {
    return;
  }

  const addressText = [
    localOrder.shippingAddress?.addressLine1,
    localOrder.shippingAddress?.addressLine2,
    localOrder.shippingAddress?.city,
    localOrder.shippingAddress?.state,
    localOrder.shippingAddress?.postalCode,
    localOrder.shippingAddress?.country,
  ]
    .filter(Boolean)
    .join(", ");

  await sendOrderMail({
    to: localOrder.customerEmail,
    customerName: localOrder.customerName,
    orderId: localOrder.orderId,
    orderDate: localOrder.createdAt,
    paymentMethod: localOrder.paymentMethod,
    paymentStatus: localOrder.paymentStatus,
    orderStatus: localOrder.orderStatus,
    deliveryStatus: localOrder.deliveryStatus,
    subtotal: localOrder.subtotal,
    shippingCharge: localOrder.shippingCharge,
    tax: localOrder.tax,
    totalAmount: localOrder.totalAmount,
    items: localOrder.items,
    shippingAddress: addressText,
    customerPhone: localOrder.customerPhone,
    trackingUrl: `${
      process.env.CLIENT_URL || "http://localhost:5173"
    }/track-order?order_id=${localOrder.orderId}`,
  });

  localOrder.emailSent = true;
};

const createCashfreeOrder = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!process.env.CASHFREE_APP_ID || !process.env.CASHFREE_SECRET_KEY) {
      return res.status(500).json({
        success: false,
        message: "Cashfree credentials are missing in environment variables",
      });
    }

    const { shippingAddress = {} } = req.body;

    if (
      !shippingAddress.fullName ||
      !shippingAddress.phone ||
      !shippingAddress.addressLine1 ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.postalCode
    ) {
      return res.status(400).json({
        success: false,
        message: "Complete shipping address is required",
      });
    }

    const user = await User.findById(userId).lean();
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const cart = await Cart.findOne({ user: userId }).populate("items.medicine");

    if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    const medicineIds = cart.items.map((item) => item.medicine?._id || item.medicine);
    const medicines = await Medicine.find({ _id: { $in: medicineIds } });
    const medicineMap = new Map(medicines.map((m) => [String(m._id), m]));

    const normalizedItems = [];

    for (const item of cart.items) {
      const medicineDoc = item.medicine;
      const medicineId = String(medicineDoc?._id || item.medicine || "");
      const medicine = medicineMap.get(medicineId);

      if (!medicine) {
        return res.status(404).json({
          success: false,
          message: "One of the products in the cart was not found",
        });
      }

      const quantity = Number(item.quantity || 1);

      if (!quantity || quantity < 1) {
        return res.status(400).json({
          success: false,
          message: `Invalid quantity for ${medicine.name}`,
        });
      }

      if (Number(medicine.stock || 0) < quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${medicine.name}`,
        });
      }

      const price = Number(medicine.price || 0);

      normalizedItems.push({
        productId: medicine._id,
        name: medicine.name,
        image: medicine.image || "",
        price,
        quantity,
        subtotal: Number((price * quantity).toFixed(2)),
      });
    }

    const { subtotal, shippingCharge, tax, totalAmount } = calculateTotals(normalizedItems);

    const orderId = generateOrderId();
    const customerName =
      String(user.name || "").trim() ||
      String(shippingAddress.fullName || "").trim() ||
      "Customer";
    const customerEmail = String(user.email || "").trim().toLowerCase();
    const customerPhone =
      normalizePhone(user.phone) ||
      normalizePhone(shippingAddress.phone) ||
      "9999999999";

    if (customerPhone.length !== 10) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer phone number",
      });
    }

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

    const payload = {
      order_id: orderId,
      order_amount: totalAmount,
      order_currency: "INR",
      customer_details: {
        customer_id: String(user._id),
        customer_name: customerName,
        customer_email: customerEmail || "customer@example.com",
        customer_phone: customerPhone,
      },
      order_meta: {
        return_url: `${clientUrl}/payment-return?order_id=${orderId}`,
      },
      order_note: `Medicine order ${orderId}`,
    };

    let cfOrder = null;
    let paymentSessionId = `session_sim_cf_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      const response = await cashfreeClient.post("/orders", payload, {
        headers: cashfreeHeaders(),
      });

      if (response.status >= 200 && response.status < 300) {
        cfOrder = response.data;
        paymentSessionId = cfOrder.payment_session_id || paymentSessionId;
      } else {
        console.warn("Cashfree live API returned status", response.status, "- using duplicate simulation mode.");
      }
    } catch (cfApiErr) {
      console.warn("Cashfree API network error, proceeding with duplicate simulation mode:", cfApiErr.message);
    }

    const createdOrder = await Order.create({
      orderId,
      cfOrderId: cfOrder?.cf_order_id || `cf_sim_${Date.now()}`,
      paymentSessionId,
      user: user._id,
      customerName,
      customerEmail,
      customerPhone,
      items: normalizedItems,
      shippingAddress: buildAddress(shippingAddress),
      subtotal,
      shippingCharge,
      tax,
      totalAmount,
      paymentMethod: "cashfree",
      paymentStatus: "PENDING",
      orderStatus: "PLACED",
      deliveryStatus: "PENDING",
      cashfreeOrderStatus: cfOrder?.order_status || "ACTIVE",
      emailSent: false,
      paymentVerifiedAt: null,
      stockDeducted: false,
      tracking: ensureTracking({}),
    });

    return res.status(201).json({
      success: true,
      message: "Cashfree order created successfully",
      order: createdOrder,
      cashfree: cfOrder || {
        order_id: orderId,
        order_status: "ACTIVE",
        payment_session_id: paymentSessionId,
      },
      orderId,
      paymentSessionId,
    });
  } catch (error) {
    console.error("Cashfree create order error:", error?.response?.data || error.message);

    return res.status(error?.response?.status || 500).json({
      success: false,
      message: getCashfreeErrorMessage(error),
      error: error?.response?.data || null,
    });
  }
};

const completeDuplicateCashfreePayment = async (req, res) => {
  try {
    const { orderId, paymentMethod = "UPI", transactionId } = req.body;
    const userId = req.user?._id || req.user?.id;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    const localOrder = await Order.findOne({ orderId });
    if (!localOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (String(localOrder.user) !== String(userId)) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized order access",
      });
    }

    const finalTxnId = transactionId || `CF_TXN_${Date.now()}`;
    localOrder.cashfreeOrderStatus = "PAID";
    localOrder.cashfreePaymentStatus = "PAID";
    localOrder.paymentStatus = "PAID";
    localOrder.paymentVerifiedAt = new Date();
    localOrder.paymentMethod = `cashfree_${String(paymentMethod).toLowerCase()}`;
    localOrder.cfTransactionId = finalTxnId;
    localOrder.transactionId = finalTxnId;
    localOrder.cashfreeReferenceId = finalTxnId;

    await confirmPaidOrder(localOrder);
    await localOrder.save();

    // Broadcast tracking update to real-time sockets
    try {
      const io = req.app.get("io");
      if (io) {
        const payload = {
          success: true,
          _id: localOrder._id,
          orderId: localOrder.orderId,
          orderStatus: localOrder.orderStatus,
          deliveryStatus: localOrder.deliveryStatus,
          paymentStatus: "PAID",
          paymentMethod: localOrder.paymentMethod,
          transactionId: finalTxnId,
          cashfreeReferenceId: finalTxnId,
          cashfreePaymentStatus: "PAID",
          totalAmount: localOrder.totalAmount,
          customerName: localOrder.customerName,
          customerPhone: localOrder.customerPhone,
          shippingAddress: localOrder.shippingAddress,
          tracking: localOrder.tracking,
          items: localOrder.items,
        };
        io.to(`order:${localOrder.orderId}`).emit("order-tracking-updated", payload);
        io.to("admin-room").emit("admin-order-updated", payload);
      }
    } catch (socketErr) {
      console.error("Socket emit error:", socketErr);
    }

    try {
      await sendOrderMailIfNeeded(localOrder);
      if (localOrder.isModified("emailSent")) {
        await localOrder.save();
      }
    } catch (mailErr) {
      console.error("Order email error:", mailErr.message);
    }

    return res.status(200).json({
      success: true,
      message: "Cashfree payment simulated and confirmed successfully",
      order: localOrder,
      transactionId: finalTxnId,
    });
  } catch (error) {
    console.error("Complete duplicate Cashfree payment error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to complete Cashfree payment",
    });
  }
};

const getCashfreeOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    const localOrder = await Order.findOne({ orderId });

    if (!localOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (String(localOrder.user) !== String(userId)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to access this order",
      });
    }

    let cfOrder = null;

    try {
      const cashfreeLookupId = localOrder.orderId;
      const response = await cashfreeClient.get(`/orders/${cashfreeLookupId}`, {
        headers: cashfreeHeaders(),
      });

      if (response.status >= 200 && response.status < 300) {
        cfOrder = response.data;
        localOrder.cashfreeOrderStatus =
          cfOrder.order_status || localOrder.cashfreeOrderStatus;
      } else {
        console.error("Cashfree fetch error:", response.data);
      }
    } catch (cfError) {
      console.error("Cashfree fetch error:", cfError?.response?.data || cfError.message);
    }

    const finalCashfreeStatus =
      String(cfOrder?.order_status || localOrder.cashfreeOrderStatus || "ACTIVE").toUpperCase();

    if (isPaidStatus(finalCashfreeStatus)) {
      await confirmPaidOrder(localOrder);
    } else if (isPendingStatus(finalCashfreeStatus)) {
      if (localOrder.paymentStatus !== "PAID") {
        localOrder.paymentStatus = "PENDING";
      }
    } else if (isFailedStatus(finalCashfreeStatus)) {
      markFailedOrder(localOrder, finalCashfreeStatus);
    }

    await localOrder.save();

    try {
      await sendOrderMailIfNeeded(localOrder);
      if (localOrder.isModified("emailSent")) {
        await localOrder.save();
      }
    } catch (mailError) {
      console.error("Order email failed:", mailError.message);
    }

    return res.status(200).json({
      success: true,
      message: "Order status fetched successfully",
      order: {
        _id: localOrder._id,
        orderId: localOrder.orderId,
        user: localOrder.user,
        customerName: localOrder.customerName,
        customerEmail: localOrder.customerEmail,
        customerPhone: localOrder.customerPhone,
        cfOrderId: localOrder.cfOrderId,
        paymentSessionId: localOrder.paymentSessionId,
        order_status: localOrder.cashfreeOrderStatus,
        payment_status: localOrder.paymentStatus,
        orderStatus: localOrder.orderStatus,
        deliveryStatus: localOrder.deliveryStatus,
        subtotal: localOrder.subtotal,
        shippingCharge: localOrder.shippingCharge,
        tax: localOrder.tax,
        totalAmount: localOrder.totalAmount,
        createdAt: localOrder.createdAt,
        paymentVerifiedAt: localOrder.paymentVerifiedAt,
        shippingAddress: localOrder.shippingAddress,
        items: localOrder.items,
        tracking: ensureTracking(localOrder.tracking),
      },
      cashfree: cfOrder,
    });
  } catch (error) {
    console.error("Cashfree order status error:", error?.response?.data || error.message);

    return res.status(error?.response?.status || 500).json({
      success: false,
      message: getCashfreeErrorMessage(error),
      error: error?.response?.data || null,
    });
  }
};

module.exports = {
  createCashfreeOrder,
  getCashfreeOrderStatus,
  completeDuplicateCashfreePayment,
};