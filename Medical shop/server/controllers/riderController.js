const Rider = require("../models/Rider");
const Order = require("../models/Order");

// GET /api/riders - Get all real delivery boys added by Admin
const getAllRiders = async (req, res) => {
  try {
    try {
      await Rider.deleteMany({
        name: {
          $in: [
            "Murugan K.",
            "Suresh Kumar",
            "Karthik Raja",
            "Praveen V.",
            "Senthil Nathan",
          ],
        },
      });
    } catch (e) {
      // ignore
    }

    const riders = await Rider.find().sort({ active: -1, createdAt: -1 }).lean();

    // Attach active assigned order count for each rider
    const activeOrders = await Order.find({
      "tracking.rider.name": { $exists: true, $ne: "" },
      deliveryStatus: { $in: ["ASSIGNED", "SHIPPED", "IN_TRANSIT", "OUT_FOR_DELIVERY"] },
    })
      .select("orderId customerName customerPhone totalAmount deliveryStatus tracking")
      .lean();

    const result = riders.map((rider) => {
      const assigned = activeOrders.filter(
        (o) =>
          String(o?.tracking?.rider?.name || "").toLowerCase().trim() ===
          String(rider.name).toLowerCase().trim()
      );

      return {
        ...rider,
        activeOrdersCount: assigned.length,
        assignedOrders: assigned,
        status: assigned.length > 0 ? "ON_DELIVERY" : (rider.active ? "AVAILABLE" : "OFFLINE"),
      };
    });

    return res.status(200).json({
      success: true,
      count: result.length,
      riders: result,
    });
  } catch (error) {
    console.error("getAllRiders error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch delivery boys",
    });
  }
};

// POST /api/riders - Add a new delivery boy
const createRider = async (req, res) => {
  try {
    const {
      name,
      phone,
      vehicleType = "Motorcycle",
      vehicleNumber = "",
      area = "Virudhunagar Central",
      rating = 5.0,
    } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: "Delivery boy name and phone number are required",
      });
    }

    const newRider = await Rider.create({
      name: name.trim(),
      phone: phone.trim(),
      vehicleType: vehicleType.trim(),
      vehicleNumber: vehicleNumber.trim(),
      area: area.trim(),
      rating: Number(rating) || 5.0,
      status: "AVAILABLE",
      active: true,
    });

    return res.status(201).json({
      success: true,
      message: "Delivery boy registered successfully",
      rider: newRider,
    });
  } catch (error) {
    console.error("createRider error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create delivery boy",
    });
  }
};

// PUT /api/riders/:id - Update delivery boy details or toggle active status
const updateRider = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, vehicleType, vehicleNumber, area, active, status } = req.body;

    const rider = await Rider.findById(id);
    if (!rider) {
      return res.status(404).json({
        success: false,
        message: "Delivery boy not found",
      });
    }

    if (name) rider.name = name.trim();
    if (phone) rider.phone = phone.trim();
    if (vehicleType) rider.vehicleType = vehicleType.trim();
    if (vehicleNumber !== undefined) rider.vehicleNumber = vehicleNumber.trim();
    if (area) rider.area = area.trim();
    if (active !== undefined) rider.active = Boolean(active);
    if (status) rider.status = status;

    await rider.save();

    return res.status(200).json({
      success: true,
      message: "Delivery boy updated successfully",
      rider,
    });
  } catch (error) {
    console.error("updateRider error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update delivery boy",
    });
  }
};

// DELETE /api/riders/:id - Delete a delivery boy
const deleteRider = async (req, res) => {
  try {
    const { id } = req.params;
    const rider = await Rider.findByIdAndDelete(id);

    if (!rider) {
      return res.status(404).json({
        success: false,
        message: "Delivery boy not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Delivery boy deleted successfully",
    });
  } catch (error) {
    console.error("deleteRider error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete delivery boy",
    });
  }
};

module.exports = {
  getAllRiders,
  createRider,
  updateRider,
  deleteRider,
};
