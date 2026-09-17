const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    name: {
      type: String,
      required: [true, "Please provide your name"],
      trim: true,
    },
    role: {
      type: String,
      default: "Verified Patient Buyer",
      trim: true,
    },
    location: {
      type: String,
      default: "Tamil Nadu, India",
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Please provide review feedback"],
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      default: 5,
    },
    verifiedBadge: {
      type: String,
      default: "Verified Patient",
      trim: true,
    },
    avatarBg: {
      type: String,
      default: "bg-emerald-600",
    },
    initials: {
      type: String,
      default: "U",
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Review", reviewSchema);
