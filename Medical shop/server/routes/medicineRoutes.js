const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");

const {
  addMedicine,
  getAllMedicines,
  getMedicines,
  getMedicineById,
  getMedicineByIdForAdmin,
  updateMedicine,
  deleteMedicine,
  clearAllMedicines,
  getLowStockMedicines,
  getMyWishlist,
  getExpiringMedicines,
  getMedicineCategories,
  alertLowStock,
  getCategorySummary,
  getFeaturedMedicines,
  getExpiryManagementData,
  removeExpiredMedicines,
  applyDiscountExpiringMedicines,
  sendExpiryAlert,
  getMedicineBrands,
} = require("../controllers/medicineController");

// Expiry Management & Brand routes
router.get("/expiry-management", getExpiryManagementData);
router.get("/brands/list", getMedicineBrands);
router.post("/admin/expiry/remove-expired", removeExpiredMedicines);
router.post("/admin/expiry/apply-discount", applyDiscountExpiringMedicines);
router.post("/admin/expiry/send-alert", sendExpiryAlert);

// Public / general routes
router.get("/", getMedicines);
router.get("/all", getAllMedicines);
router.get("/low-stock", getLowStockMedicines);
router.get("/expired", getExpiringMedicines);
router.get("/categories/list", getMedicineCategories);
router.get("/categories/summary", getCategorySummary);
router.get("/featured", getFeaturedMedicines);
router.get("/featured/list", getFeaturedMedicines);

// Admin routes
router.get("/admin/all", getAllMedicines);
router.post("/admin/add", upload.single("image"), addMedicine);
router.post("/admin/low-stock/alert", alertLowStock);
router.delete("/admin/clear-all", clearAllMedicines);
router.get("/admin/:id", getMedicineByIdForAdmin);
router.put("/admin/:id", upload.single("image"), updateMedicine);
router.delete("/admin/:id", deleteMedicine);

// User route
router.get("/wishlist/my", getMyWishlist);

// Public dynamic route last
router.get("/:id", getMedicineById);

module.exports = router;