const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const autoSeedAdmin = require("./config/seedAdmin");
const Order = require("./models/Order");

dotenv.config();
connectDB().then(async () => {
  autoSeedAdmin();
  try {
    const User = require("./models/User");
    try {
      await User.collection.dropIndex("phone_1");
      console.log("[DB Index] Dropped legacy phone_1 index on users collection.");
    } catch (e) {
      // index not present or already dropped
    }

    const Medicine = require("./models/Medicine");
    const purged = await Medicine.deleteMany({
      $or: [
        { name: { $regex: /\(Batch \d+\)/i } },
        { batchNo: { $regex: /^BCH\d+/i } },
      ],
    });
    if (purged.deletedCount > 0) {
      console.log(`[DB Clean] Removed ${purged.deletedCount} old dummy batch medicines from MongoDB.`);
    }

    const Order = require("./models/Order");
    const purgedOrders = await Order.deleteMany({
      $or: [
        { orderId: { $regex: /^INV-/i } },
        { "tracking.rider.name": { $regex: /murugan/i } },
        { customerName: { $regex: /walk-in/i } },
      ],
    });
    const { syncRegisteredUsersToCustomers } = require("./controllers/customerController");
    await syncRegisteredUsersToCustomers();
    console.log("[Customer Sync] Successfully synchronized registered users into Customers collection.");
  } catch (err) {
    console.error("Auto clean/sync error:", err.message);
  }
});

const app = express();
const server = http.createServer(app);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, or Postman)
    if (!origin) return callback(null, true);

    // Allow localhost, 127.0.0.1, Vercel, Render, Netlify, or any configured frontend
    return callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
  ],
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/prescriptions", require("./routes/prescriptionRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/customers", require("./routes/customerRoutes"));
app.use("/api/suppliers", require("./routes/supplierRoutes"));
app.use("/api/settings", require("./routes/settingsRoutes"));
app.use("/api/medicines", require("./routes/medicineRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/admin", require("./routes/adminOrderRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/wishlist", require("./routes/wishlistRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/tracking", require("./routes/orderTrackingRoutes"));
app.use("/api/riders", require("./routes/riderRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/purchases", require("./routes/purchaseRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));
app.use("/api/offers", require("./routes/offerRoute"));
app.use("/api/medical_shop", require("./routes/medicalShopApiRoutes"));
app.use("/api/chatbot", require("./routes/chatbotProxyRoutes"));

app.get("/", (req, res) => {
  res.send("API is running...");
});

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => callback(null, true),
    credentials: true,
    methods: ["GET", "POST"],
  },
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("join-order-room", ({ orderId }) => {
    if (!orderId) {
      return socket.emit("tracking-error", { message: "Order ID is required" });
    }

    socket.join(`order:${orderId}`);
    socket.emit("joined-order-room", {
      success: true,
      room: `order:${orderId}`,
      orderId,
    });
  });

  socket.on("join-admin-room", () => {
    socket.join("admin-room");
    socket.emit("joined-admin-room", {
      success: true,
      room: "admin-room",
    });
  });

  socket.on("leave-order-room", ({ orderId }) => {
    if (!orderId) return;
    socket.leave(`order:${orderId}`);
  });

  socket.on("rider-location-update", async (payload) => {
    try {
      const {
        orderId,
        lat,
        lng,
        accuracy = null,
        heading = null,
        speed = null,
        riderName = "",
        riderPhone = "",
        vehicleNumber = "",
        etaMinutes = null,
      } = payload || {};

      if (!orderId || lat == null || lng == null) {
        return socket.emit("tracking-error", {
          message: "orderId, lat and lng are required",
        });
      }

      const order = await Order.findOne({ orderId });

      if (!order) {
        return socket.emit("tracking-error", {
          message: "Order not found",
        });
      }

      if (!order.tracking) order.tracking = {};
      if (!order.tracking.rider) order.tracking.rider = {};
      if (!order.tracking.liveLocation) order.tracking.liveLocation = {};
      if (!Array.isArray(order.tracking.statusHistory)) {
        order.tracking.statusHistory = [];
      }

      order.deliveryStatus = "IN_TRANSIT";

      if (order.orderStatus !== "DELIVERED") {
        order.orderStatus = "OUT_FOR_DELIVERY";
      }

      order.tracking.rider = {
        ...order.tracking.rider,
        name: riderName || order.tracking.rider.name || "",
        phone: riderPhone || order.tracking.rider.phone || "",
        vehicleNumber: vehicleNumber || order.tracking.rider.vehicleNumber || "",
      };

      order.tracking.liveLocation = {
        lat: Number(lat),
        lng: Number(lng),
        accuracy: accuracy != null ? Number(accuracy) : null,
        heading: heading != null ? Number(heading) : null,
        speed: speed != null ? Number(speed) : null,
        updatedAt: new Date(),
      };

      order.tracking.etaMinutes =
        etaMinutes != null ? Number(etaMinutes) : order.tracking.etaMinutes ?? null;

      order.tracking.outForDeliveryAt =
        order.tracking.outForDeliveryAt || new Date();

      const exists = order.tracking.statusHistory.some(
        (entry) => entry.status === "OUT_FOR_DELIVERY"
      );

      if (!exists) {
        order.tracking.statusHistory.push({
          status: "OUT_FOR_DELIVERY",
          updatedBy: "RIDER",
          note: "Rider started live location sharing",
          timestamp: new Date(),
        });
      }

      await order.save();

      io.to(`order:${orderId}`).emit("order-tracking-updated", {
        success: true,
        orderId,
        orderStatus: order.orderStatus,
        deliveryStatus: order.deliveryStatus,
        tracking: order.tracking,
        updatedAt: new Date(),
      });

      io.to("admin-room").emit("admin-order-updated", {
        success: true,
        orderId,
        orderStatus: order.orderStatus,
        deliveryStatus: order.deliveryStatus,
        tracking: order.tracking,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        totalAmount: order.totalAmount,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("rider-location-update error:", error.message);
      socket.emit("tracking-error", {
        message: "Failed to update rider location",
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});