const Order = require("../models/Order");


// UPDATE DELIVERY STATUS
const updateDeliveryStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        orderStatus: status,
      },
      { new: true }
    );

    res.json({
      success: true,
      order,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = { updateDeliveryStatus };