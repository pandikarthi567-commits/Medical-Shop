const mongoose = require("mongoose");

const riderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Rider name is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    vehicleType: {
      type: String,
      default: "Motorcycle",
      trim: true,
    },
    vehicleNumber: {
      type: String,
      default: "",
      trim: true,
    },
    area: {
      type: String,
      default: "Virudhunagar & Madurai Hub",
      trim: true,
    },
    status: {
      type: String,
      enum: ["AVAILABLE", "ON_DELIVERY", "OFFLINE"],
      default: "AVAILABLE",
    },
    active: {
      type: Boolean,
      default: true,
    },
    totalDeliveries: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 4.8,
    },
    currentLocation: {
      lat: { type: Number, default: 9.5820 },
      lng: { type: Number, default: 77.9580 },
      updatedAt: { type: Date, default: Date.now },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Rider", riderSchema);