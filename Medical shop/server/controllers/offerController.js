const Offer = require("../models/Offer");

const getAllOffers = async (req, res) => {
  try {
    const offers = await Offer.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: offers.length,
      offers,
    });
  } catch (error) {
    console.error("Get all offers error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch offers",
    });
  }
};

const getOfferById = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    return res.status(200).json({
      success: true,
      offer,
    });
  } catch (error) {
    console.error("Get offer by id error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch offer",
    });
  }
};

const addOffer = async (req, res) => {
  try {
    const {
      title,
      description,
      code,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscount,
      validFrom,
      validTill,
      isActive,
    } = req.body;

    const cleanTitle = String(title || "").trim();
    const cleanDescription = String(description || "").trim();
    const cleanCode = String(code || "").trim().toUpperCase();

    if (
      !cleanTitle ||
      !cleanCode ||
      !discountType ||
      discountValue === undefined ||
      !validFrom ||
      !validTill
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Title, code, discount type, discount value, valid from and valid till are required",
      });
    }

    if (!["percentage", "flat"].includes(discountType)) {
      return res.status(400).json({
        success: false,
        message: "Discount type must be percentage or flat",
      });
    }

    const existingOffer = await Offer.findOne({ code: cleanCode });

    if (existingOffer) {
      return res.status(400).json({
        success: false,
        message: "Offer code already exists",
      });
    }

    const offer = await Offer.create({
      title: cleanTitle,
      description: cleanDescription,
      code: cleanCode,
      discountType,
      discountValue: Number(discountValue),
      minOrderAmount: Number(minOrderAmount || 0),
      maxDiscount: Number(maxDiscount || 0),
      validFrom: new Date(validFrom),
      validTill: new Date(validTill),
      isActive: isActive !== undefined ? isActive : true,
    });

    return res.status(201).json({
      success: true,
      message: "Offer added successfully",
      offer,
    });
  } catch (error) {
    console.error("Add offer error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to add offer",
    });
  }
};

const updateOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    if (req.body.code !== undefined) {
      const newCode = String(req.body.code || "").trim().toUpperCase();

      if (!newCode) {
        return res.status(400).json({
          success: false,
          message: "Offer code cannot be empty",
        });
      }

      if (newCode !== offer.code) {
        const existing = await Offer.findOne({
          code: newCode,
          _id: { $ne: offer._id },
        });

        if (existing) {
          return res.status(400).json({
            success: false,
            message: "Offer code already exists",
          });
        }

        offer.code = newCode;
      }
    }

    if (req.body.title !== undefined) offer.title = String(req.body.title).trim();
    if (req.body.description !== undefined) offer.description = String(req.body.description).trim();
    if (req.body.discountType !== undefined) offer.discountType = req.body.discountType;
    if (req.body.discountValue !== undefined) offer.discountValue = Number(req.body.discountValue);
    if (req.body.minOrderAmount !== undefined) offer.minOrderAmount = Number(req.body.minOrderAmount);
    if (req.body.maxDiscount !== undefined) offer.maxDiscount = Number(req.body.maxDiscount);
    if (req.body.validFrom !== undefined) offer.validFrom = new Date(req.body.validFrom);
    if (req.body.validTill !== undefined) offer.validTill = new Date(req.body.validTill);
    if (req.body.isActive !== undefined) offer.isActive = req.body.isActive;

    const updatedOffer = await offer.save();

    return res.status(200).json({
      success: true,
      message: "Offer updated successfully",
      offer: updatedOffer,
    });
  } catch (error) {
    console.error("Update offer error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update offer",
    });
  }
};

const deleteOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    await offer.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Offer deleted successfully",
    });
  } catch (error) {
    console.error("Delete offer error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete offer",
    });
  }
};

const getPublicOffers = async (req, res) => {
  try {
    const now = new Date();

    const offers = await Offer.find({
      isActive: true,
      validFrom: { $lte: now },
      validTill: { $gte: now },
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: offers.length,
      offers,
    });
  } catch (error) {
    console.error("Get public offers error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch offers",
    });
  }
};

module.exports = {
  getAllOffers,
  getOfferById,
  addOffer,
  updateOffer,
  deleteOffer,
  getPublicOffers,
};