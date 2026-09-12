const mongoose = require("mongoose");
const Cart = require("../models/Cart.js");
const Medicine = require("../models/Medicine.js");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const buildCartResponse = async (userId) => {
  const cart = await Cart.findOne({ user: userId }).populate({
    path: "items.medicine",
    select:
      "name price oldPrice image category inStock stock description rating reviewCount",
  });

  if (!cart) {
    return {
      _id: null,
      user: userId,
      items: [],
      subtotal: 0,
      delivery: 0,
      total: 0,
    };
  }

  const normalizedItems = cart.items
    .filter((item) => item.medicine)
    .map((item) => {
      const medicine = item.medicine;
      const price = Number(medicine.price || 0);
      const quantity = Number(item.quantity || 1);

      return {
        _id: item._id,
        medicineId: medicine._id,
        quantity,
        price,
        total: price * quantity,
        medicine,
      };
    });

  const subtotal = normalizedItems.reduce((sum, item) => sum + item.total, 0);
  const delivery = normalizedItems.length > 0 ? 40 : 0;
  const total = subtotal + delivery;

  return {
    _id: cart._id,
    user: cart.user,
    items: normalizedItems,
    subtotal,
    delivery,
    total,
  };
};

const getMyCart = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const cart = await buildCartResponse(userId);

    return res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    console.error("Get cart error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch cart",
    });
  }
};

const addToCart = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { medicineId, quantity = 1 } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!medicineId || !isValidObjectId(medicineId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid medicine ID",
      });
    }

    const parsedQty = Number(quantity);

    if (Number.isNaN(parsedQty) || parsedQty < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    const medicine = await Medicine.findById(medicineId);

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found",
      });
    }

    if (!(medicine.stock > 0 || medicine.inStock)) {
      return res.status(400).json({
        success: false,
        message: "Item is out of stock",
      });
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [],
      });
    }

    const existingItemIndex = cart.items.findIndex(
      (item) => item.medicine.toString() === medicineId
    );

    if (existingItemIndex > -1) {
      const nextQty = cart.items[existingItemIndex].quantity + parsedQty;

      if (medicine.stock && nextQty > medicine.stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${medicine.stock} item(s) available in stock`,
        });
      }

      cart.items[existingItemIndex].quantity = nextQty;
    } else {
      if (medicine.stock && parsedQty > medicine.stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${medicine.stock} item(s) available in stock`,
        });
      }

      cart.items.push({
        medicine: medicineId,
        quantity: parsedQty,
      });
    }

    await cart.save();

    const updatedCart = await buildCartResponse(userId);

    return res.status(200).json({
      success: true,
      message: "Item added to cart successfully",
      cart: updatedCart,
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to add item to cart",
    });
  }
};

const updateCartItemQuantity = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { medicineId } = req.params;
    const { quantity } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!medicineId || !isValidObjectId(medicineId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid medicine ID",
      });
    }

    const parsedQty = Number(quantity);

    if (Number.isNaN(parsedQty) || parsedQty < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    const medicine = await Medicine.findById(medicineId);

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found",
      });
    }

    if (medicine.stock && parsedQty > medicine.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${medicine.stock} item(s) available in stock`,
      });
    }

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.medicine.toString() === medicineId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      });
    }

    cart.items[itemIndex].quantity = parsedQty;
    await cart.save();

    const updatedCart = await buildCartResponse(userId);

    return res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      cart: updatedCart,
    });
  } catch (error) {
    console.error("Update cart quantity error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update cart item",
    });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { medicineId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!medicineId || !isValidObjectId(medicineId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid medicine ID",
      });
    }

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    cart.items = cart.items.filter(
      (item) => item.medicine.toString() !== medicineId
    );

    await cart.save();

    const updatedCart = await buildCartResponse(userId);

    return res.status(200).json({
      success: true,
      message: "Item removed from cart successfully",
      cart: updatedCart,
    });
  } catch (error) {
    console.error("Remove from cart error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to remove cart item",
    });
  }
};

const clearCart = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    await Cart.findOneAndUpdate(
      { user: userId },
      { $set: { items: [] } },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      cart: {
        items: [],
        subtotal: 0,
        delivery: 0,
        total: 0,
      },
    });
  } catch (error) {
    console.error("Clear cart error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to clear cart",
    });
  }
};

module.exports = {
  getMyCart,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
};