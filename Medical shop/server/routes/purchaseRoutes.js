const express = require("express");
const router = express.Router();
const Purchase = require("../models/Purchase");
const Medicine = require("../models/Medicine");

// GET /api/purchases - Get all purchases with optional filters
router.get("/", async (req, res) => {
  try {
    const { supplier, status, paymentStatus, startDate, endDate, search } = req.query;
    const filter = {};

    if (supplier && supplier !== "All Suppliers") {
      filter.supplierName = { $regex: supplier, $options: "i" };
    }
    if (status && status !== "All Status") {
      filter.purchaseStatus = status.toUpperCase();
    }
    if (paymentStatus && paymentStatus !== "All Payments") {
      filter.paymentStatus = paymentStatus.toUpperCase();
    }
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate + "T23:59:59"),
      };
    }
    if (search) {
      filter.$or = [
        { purchaseId: { $regex: search, $options: "i" } },
        { supplierName: { $regex: search, $options: "i" } },
        { invoiceNo: { $regex: search, $options: "i" } },
        { "items.name": { $regex: search, $options: "i" } },
      ];
    }

    const purchases = await Purchase.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, purchases });
  } catch (err) {
    console.error("Get purchases error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch purchases" });
  }
});

// GET /api/purchases/:id - Get single purchase
router.get("/:id", async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);
    if (!purchase) {
      return res.status(404).json({ success: false, message: "Purchase not found" });
    }
    res.json({ success: true, purchase });
  } catch (err) {
    console.error("Get purchase error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch purchase" });
  }
});

// POST /api/purchases - Create new purchase
router.post("/", async (req, res) => {
  try {
    const {
      supplierName,
      supplierPhone,
      supplierEmail,
      invoiceNo,
      items,
      paymentMethod,
      paymentStatus,
      purchaseStatus,
      note,
      purchasedBy,
    } = req.body;

    if (!supplierName || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Supplier name and at least one item are required",
      });
    }

    // Calculate items subtotals & total
    const processedItems = items.map((item) => ({
      ...item,
      subtotal: Number(item.unitCost) * Number(item.quantity),
    }));
    const totalAmount = processedItems.reduce((sum, i) => sum + i.subtotal, 0);

    const purchase = new Purchase({
      supplierName: supplierName.trim(),
      supplierPhone: (supplierPhone || "").trim(),
      supplierEmail: (supplierEmail || "").trim(),
      invoiceNo: (invoiceNo || "").trim(),
      items: processedItems,
      totalAmount,
      paymentMethod: paymentMethod || "Cash",
      paymentStatus: paymentStatus || "PAID",
      purchaseStatus: purchaseStatus || "RECEIVED",
      note: (note || "").trim(),
      purchasedBy: purchasedBy || "Admin",
    });

    await purchase.save();

    // If status is RECEIVED, update medicine stock in the database
    if (purchase.purchaseStatus === "RECEIVED") {
      for (const item of processedItems) {
        if (item.medicineId) {
          await Medicine.findByIdAndUpdate(item.medicineId, {
            $inc: { stock: Number(item.quantity) },
            inStock: true,
          });
        }
      }
    }

    res.status(201).json({ success: true, purchase });
  } catch (err) {
    console.error("Create purchase error:", err);
    res.status(500).json({ success: false, message: err.message || "Failed to create purchase" });
  }
});

// PUT /api/purchases/:id - Update purchase status
router.put("/:id", async (req, res) => {
  try {
    const { purchaseStatus, paymentStatus, note } = req.body;
    const purchase = await Purchase.findByIdAndUpdate(
      req.params.id,
      { purchaseStatus, paymentStatus, note },
      { new: true }
    );
    if (!purchase) {
      return res.status(404).json({ success: false, message: "Purchase not found" });
    }
    res.json({ success: true, purchase });
  } catch (err) {
    console.error("Update purchase error:", err);
    res.status(500).json({ success: false, message: "Failed to update purchase" });
  }
});

// DELETE /api/purchases/:id - Delete purchase
router.delete("/:id", async (req, res) => {
  try {
    const purchase = await Purchase.findByIdAndDelete(req.params.id);
    if (!purchase) {
      return res.status(404).json({ success: false, message: "Purchase not found" });
    }
    res.json({ success: true, message: "Purchase deleted successfully" });
  } catch (err) {
    console.error("Delete purchase error:", err);
    res.status(500).json({ success: false, message: "Failed to delete purchase" });
  }
});

module.exports = router;
