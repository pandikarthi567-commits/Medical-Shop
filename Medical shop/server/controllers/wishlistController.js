const mongoose = require("mongoose");
const Wishlist = require("../models/Wishlist");
const Medicine = require("../models/Medicine");

const getMyWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    let wishlist = await Wishlist.findOne({ user: userId }).populate("medicines");

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: userId,
        medicines: [],
      });
    }

    return res.status(200).json({
      success: true,
      wishlist: wishlist.medicines,
    });
  } catch (error) {
    console.error("Get wishlist error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch wishlist",
    });
  }
};

const addToWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { medicineId } = req.body;

    if (!medicineId || !mongoose.Types.ObjectId.isValid(medicineId)) {
      return res.status(400).json({
        success: false,
        message: "Valid medicine ID is required",
      });
    }

    const medicine = await Medicine.findById(medicineId);
    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found",
      });
    }

    let wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: userId,
        medicines: [medicineId],
      });

      wishlist = await Wishlist.findById(wishlist._id).populate("medicines");

      return res.status(201).json({
        success: true,
        message: "Added to wishlist",
        wishlist: wishlist.medicines,
      });
    }

    const alreadyExists = wishlist.medicines.some(
      (id) => id.toString() === medicineId
    );

    if (alreadyExists) {
      wishlist = await Wishlist.findById(wishlist._id).populate("medicines");

      return res.status(200).json({
        success: true,
        message: "Medicine already in wishlist",
        wishlist: wishlist.medicines,
      });
    }

    wishlist.medicines.push(medicineId);
    await wishlist.save();

    wishlist = await Wishlist.findById(wishlist._id).populate("medicines");

    return res.status(200).json({
      success: true,
      message: "Added to wishlist",
      wishlist: wishlist.medicines,
    });
  } catch (error) {
    console.error("Add to wishlist error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add item to wishlist",
    });
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { medicineId } = req.params;

    if (!medicineId || !mongoose.Types.ObjectId.isValid(medicineId)) {
      return res.status(400).json({
        success: false,
        message: "Valid medicine ID is required",
      });
    }

    const wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found",
      });
    }

    wishlist.medicines = wishlist.medicines.filter(
      (id) => id.toString() !== medicineId
    );

    await wishlist.save();

    const updatedWishlist = await Wishlist.findById(wishlist._id).populate("medicines");

    return res.status(200).json({
      success: true,
      message: "Removed from wishlist",
      wishlist: updatedWishlist.medicines,
    });
  } catch (error) {
    console.error("Remove wishlist item error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to remove item from wishlist",
    });
  }
};

const isInWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { medicineId } = req.params;

    if (!medicineId || !mongoose.Types.ObjectId.isValid(medicineId)) {
      return res.status(400).json({
        success: false,
        message: "Valid medicine ID is required",
      });
    }

    const wishlist = await Wishlist.findOne({ user: userId });

    const exists =
      wishlist?.medicines?.some((id) => id.toString() === medicineId) || false;

    return res.status(200).json({
      success: true,
      exists,
    });
  } catch (error) {
    console.error("Check wishlist error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to check wishlist item",
    });
  }
};

module.exports = {
  getMyWishlist,
  addToWishlist,
  removeFromWishlist,
  isInWishlist,
};