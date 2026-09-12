// models/Rider.js
import mongoose from "mongoose";

const riderSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    vehicleNumber: String,
    active: { type: Boolean, default: true },
    currentLocation: {
      lat: Number,
      lng: Number,
      updatedAt: Date
    }
  },
  { timestamps: true }
);

export default mongoose.model("Rider", riderSchema);