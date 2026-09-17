const express = require("express");
const router = express.Router();

const {
  getSuppliers,
  getSupplierById,
  addSupplier,
  updateSupplier,
  deleteSupplier,
  getSupplierLocations,
  importSuppliers,
  clearAllSuppliers,
} = require("../controllers/supplierController");

router.get("/locations/list", getSupplierLocations);
router.post("/import", importSuppliers);
router.delete("/clear/all", clearAllSuppliers);

router.get("/", getSuppliers);
router.post("/", addSupplier);
router.get("/:id", getSupplierById);
router.put("/:id", updateSupplier);
router.delete("/:id", deleteSupplier);

module.exports = router;
