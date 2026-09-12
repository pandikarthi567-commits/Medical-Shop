const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Medicine = require("../models/Medicine");
const User = require("../models/User");

const createOrder = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - Please log in",
      });
    }

    const user = await User.findById(userId).lean();
    const rawAddress = req.body.shippingAddress || {};

    const shippingAddress = {
      fullName: String(rawAddress.fullName || user?.name || "Valued Customer").trim(),
      phone: String(rawAddress.phone || user?.phone || "9999999999").replace(/\D/g, "").slice(-10) || "9999999999",
      addressLine1: String(rawAddress.addressLine1 || "Primary Delivery Address").trim(),
      addressLine2: String(rawAddress.addressLine2 || "").trim(),
      city: String(rawAddress.city || "Chennai").trim(),
      state: String(rawAddress.state || "Tamil Nadu").trim(),
      postalCode: String(rawAddress.postalCode || "600001").trim(),
      country: String(rawAddress.country || "India").trim(),
    };

    let orderItems = [];

    // 1. Process items from request body if passed
    if (Array.isArray(req.body.items) && req.body.items.length > 0) {
      for (const it of req.body.items) {
        const medId = it.productId || it.medicineId || it._id || it.id;
        let name = it.name;
        let price = Number(it.price || 0);
        let image = it.image || "";
        let quantity = Number(it.quantity || it.qty || 1);

        if (medId) {
          try {
            const med = await Medicine.findById(medId);
            if (med) {
              name = name || med.name;
              price = price || Number(med.price || 0);
              image = image || med.image || "";
              // Deduct medicine stock
              med.stock = Math.max(0, (med.stock || 0) - quantity);
              if (med.stock === 0) med.inStock = false;
              await med.save();
            }
          } catch (e) {
            console.warn("Medicine lookup notice:", medId, e.message);
          }
        }

        orderItems.push({
          productId: medId,
          name: name || "Healthcare Item",
          image: image || "",
          price,
          quantity,
          subtotal: Number((price * quantity).toFixed(2)),
        });
      }
    }

    // 2. Fallback to user's MongoDB cart if request items array is empty
    if (orderItems.length === 0) {
      const cart = await Cart.findOne({ user: userId }).populate("items.medicine");
      if (cart && Array.isArray(cart.items) && cart.items.length > 0) {
        for (const item of cart.items) {
          const med = item.medicine;
          if (!med) continue;
          const quantity = Number(item.quantity || 1);
          const price = Number(med.price || 0);

          med.stock = Math.max(0, (med.stock || 0) - quantity);
          if (med.stock === 0) med.inStock = false;
          await med.save();

          orderItems.push({
            productId: med._id,
            name: med.name,
            image: med.image || "",
            price,
            quantity,
            subtotal: Number((price * quantity).toFixed(2)),
          });
        }
      }
    }

    if (orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No items to checkout. Cart is empty.",
      });
    }

    const subtotal = Number(orderItems.reduce((sum, it) => sum + it.subtotal, 0).toFixed(2));
    const shippingCharge = subtotal >= 500 ? 0 : 40;
    const tax = Number((subtotal * 0.05).toFixed(2));
    const totalAmount = Number((subtotal + shippingCharge + tax).toFixed(2));

    const orderId = `MED_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder = new Order({
      orderId,
      user: userId,
      customerName: shippingAddress.fullName,
      customerEmail: String(user?.email || "").trim().toLowerCase(),
      customerPhone: shippingAddress.phone,
      items: orderItems,
      shippingAddress,
      subtotal,
      shippingCharge,
      tax,
      totalAmount,
      paymentMethod: "COD",
      paymentStatus: "PENDING",
      orderStatus: "PLACED",
      deliveryStatus: "PENDING",
      cashfreeOrderStatus: "DIRECT_CONFIRMED",
      tracking: {
        statusHistory: [
          {
            status: "PLACED",
            note: "Order placed directly in database (Cash on Delivery / Direct)",
            updatedBy: "SYSTEM",
            timestamp: new Date(),
          },
        ],
      },
    });

    const savedOrder = await newOrder.save();

    // Empty the user's cart in DB
    await Cart.findOneAndUpdate(
      { user: userId },
      { $set: { items: [] } }
    );

    // Notify connected Admin dashboard via socket.io if available
    const io = req.app?.get("io");
    if (io) {
      io.to("admin-room").emit("admin-new-order", {
        success: true,
        order: savedOrder,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Order placed successfully in database",
      order: savedOrder,
    });
  } catch (error) {
    console.error("Create order error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to place order in database",
    });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .select(
        "orderId totalAmount paymentStatus orderStatus deliveryStatus tracking createdAt items cashfreeOrderStatus customerEmail customerPhone shippingAddress subtotal shippingCharge tax paymentSessionId cfOrderId"
      );

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Get my orders error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};

const getMyOrderById = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const order = await Order.findOne({
      _id: req.params.id,
      user: userId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get order details error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch order details",
    });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getMyOrderById,
};