const Review = require("../models/Review");

const AVATAR_BG_COLORS = [
  "bg-emerald-600",
  "bg-teal-600",
  "bg-cyan-700",
  "bg-blue-600",
  "bg-indigo-600",
  "bg-violet-600",
  "bg-amber-600",
  "bg-slate-800",
];

const getInitials = (name) => {
  if (!name) return "U";
  const parts = String(name).trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const getRandomAvatarBg = () => {
  const index = Math.floor(Math.random() * AVATAR_BG_COLORS.length);
  return AVATAR_BG_COLORS[index];
};

const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ isApproved: true })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    console.error("Get reviews error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
      error: error.message,
    });
  }
};

const createReview = async (req, res) => {
  try {
    const { name, role, location, content, rating, verifiedBadge } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide your name",
      });
    }

    if (!content || !String(content).trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide your review content / feedback",
      });
    }

    const numericRating = Math.max(1, Math.min(5, Number(rating) || 5));
    const cleanName = String(name).trim();
    const initials = getInitials(cleanName);
    const avatarBg = getRandomAvatarBg();

    const newReview = new Review({
      user: req.user?._id || req.user?.id || null,
      name: cleanName,
      role: role?.trim() || "Verified Patient",
      location: location?.trim() || "Tamil Nadu, India",
      content: String(content).trim(),
      rating: numericRating,
      verifiedBadge: verifiedBadge?.trim() || "Verified Patient Buyer",
      avatarBg,
      initials,
      isApproved: true,
    });

    const savedReview = await newReview.save();

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      review: savedReview,
    });
  } catch (error) {
    console.error("Create review error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit review",
      error: error.message,
    });
  }
};

const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findByIdAndDelete(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Delete review error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete review",
      error: error.message,
    });
  }
};

const clearAllReviews = async (req, res) => {
  try {
    const result = await Review.deleteMany({});
    return res.status(200).json({
      success: true,
      message: `Cleared ${result.deletedCount} reviews`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Clear reviews error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to clear reviews",
      error: error.message,
    });
  }
};

module.exports = {
  getAllReviews,
  createReview,
  deleteReview,
  clearAllReviews,
};
