const express = require("express");
const router = express.Router();

const {
  getCustomers,
  getCustomerById,
  addCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerLocations,
  importCustomers,
} = require("../controllers/customerController");

router.get("/locations/list", getCustomerLocations);
router.post("/import", importCustomers);

router.get("/", getCustomers);
router.post("/", addCustomer);
router.get("/:id", getCustomerById);
router.put("/:id", updateCustomer);
router.delete("/:id", deleteCustomer);

module.exports = router;
