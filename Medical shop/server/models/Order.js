const mongoose = require("mongoose");

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

const TRACKING_UPDATED_BY = ["SYSTEM", "ADMIN", "PHARMACIST", "RIDER", "CUSTOMER"];

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.Mixed,
      ref: "Medicine",
      default: null,
    },
    name: {
      type: String,
      default: "Healthcare Item",
      trim: true,
    },
    image: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
    subtotal: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: false }
);

const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, default: "", trim: true },
    phone: { type: String, default: "", trim: true },
    addressLine1: { type: String, default: "", trim: true },
    addressLine2: { type: String, default: "", trim: true },
    city: { type: String, default: "", trim: true },
    state: { type: String, default: "", trim: true },
    postalCode: { type: String, default: "", trim: true },
    country: { type: String, default: "India", trim: true },
  },
  { _id: false }
);

const trackingEventSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
      trim: true,
    },
    note: {
      type: String,
      default: "",
      trim: true,
    },
    updatedBy: {
      type: String,
      default: "SYSTEM",
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const liveLocationSchema = new mongoose.Schema(
  {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
    accuracy: { type: Number, default: null },
    heading: { type: Number, default: null },
    speed: { type: Number, default: null },
    updatedAt: { type: Date, default: null },
  },
  { _id: false }
);

const riderSchema = new mongoose.Schema(
  {
    riderId: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    name: { type: String, default: "", trim: true },
    phone: { type: String, default: "", trim: true },
    vehicleNumber: { type: String, default: "", trim: true },
    vehicleType: { type: String, default: "", trim: true },
    photo: { type: String, default: "", trim: true },
  },
  { _id: false }
);

const trackingSchema = new mongoose.Schema(
  {
    courierName: { type: String, default: "", trim: true },
    trackingId: { type: String, default: "", trim: true },
    trackingUrl: { type: String, default: "", trim: true },
    expectedDeliveryDate: { type: Date, default: null },
    confirmedAt: { type: Date, default: null },
    processingAt: { type: Date, default: null },
    packedAt: { type: Date, default: null },
    shippedAt: { type: Date, default: null },
    outForDeliveryAt: { type: Date, default: null },
    deliveredAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
    nonDeliveredReason: { type: String, default: "", trim: true },
    etaMinutes: { type: Number, default: null, min: 0 },
    liveLocation: {
      type: liveLocationSchema,
      default: () => ({
        lat: null,
        lng: null,
        accuracy: null,
        heading: null,
        speed: null,
        updatedAt: null,
      }),
    },
    rider: {
      type: riderSchema,
      default: () => ({
        riderId: null,
        name: "",
        phone: "",
        vehicleNumber: "",
        vehicleType: "",
        photo: "",
      }),
    },
    statusHistory: {
      type: [trackingEventSchema],
      default: () => [
        {
          status: "PLACED",
          updatedBy: "SYSTEM",
          note: "Order placed successfully",
          timestamp: new Date(),
        },
      ],
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    cfOrderId: {
      type: String,
      default: "",
      index: true,
    },
    paymentSessionId: {
      type: String,
      default: "",
    },
    user: {
      type: mongoose.Schema.Types.Mixed,
      ref: "User",
      default: null,
      index: true,
    },
    customerName: {
      type: String,
      default: "Valued Customer",
      trim: true,
    },
    customerEmail: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
    customerPhone: {
      type: String,
      default: "",
      trim: true,
    },
    items: {
      type: [orderItemSchema],
      default: () => [],
    },
    medicines: {
      type: Array,
      default: undefined,
    },
    shippingAddress: {
      type: shippingAddressSchema,
      default: () => ({}),
    },
    subtotal: {
      type: Number,
      default: 0,
      min: 0,
    },
    shippingCharge: {
      type: Number,
      default: 0,
      min: 0,
    },
    tax: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    paymentMethod: {
      type: String,
      default: "cashfree",
      trim: true,
    },
    cfTransactionId: {
      type: String,
      default: "",
    },
    transactionId: {
      type: String,
      default: "",
    },
    cashfreeReferenceId: {
      type: String,
      default: "",
    },
    cashfreePaymentStatus: {
      type: String,
      default: "",
    },
    paymentStatus: {
      type: String,
      default: "PENDING",
      index: true,
    },
    paymentVerifiedAt: {
      type: Date,
      default: null,
    },
    orderStatus: {
      type: String,
      default: "PLACED",
      index: true,
    },
    deliveryStatus: {
      type: String,
      default: "PENDING",
      index: true,
    },
    deliveryType: {
      type: String,
      default: "DELIVERY",
    },
    isDelivery: {
      type: Boolean,
      default: true,
    },
    stockDeducted: {
      type: Boolean,
      default: false,
    },
    cashfreeOrderStatus: {
      type: String,
      default: "ACTIVE",
    },
    emailSent: {
      type: Boolean,
      default: false,
    },
    tracking: {
      type: trackingSchema,
      default: () => ({
        rider: {},
        liveLocation: {},
      }),
    },
  },
  {
    timestamps: true,
    minimize: false,
    strict: false,
  }
);

module.exports = mongoose.model("Order", orderSchema);