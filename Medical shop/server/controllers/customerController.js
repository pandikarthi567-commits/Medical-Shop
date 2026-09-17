const Customer = require("../models/Customer");

const toNumber = (val, fallback = 0) => {
  const n = Number(val);
  return isNaN(n) ? fallback : n;
};

// GET /api/customers
const getCustomers = async (req, res) => {
  try {
    const page = Math.max(toNumber(req.query.page, 1), 1);
    const limit = Math.max(toNumber(req.query.limit, 10), 1);
    const { search, customerType, location, status } = req.query;

    const query = {};

    // Search query
    if (search && search.trim()) {
      const q = search.trim();
      query.$or = [
        { name: { $regex: q, $options: "i" } },
        { phone: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
        { customerId: { $regex: q, $options: "i" } },
        { location: { $regex: q, $options: "i" } },
      ];
    }

    // Customer Type filter
    if (customerType && customerType !== "All" && customerType !== "All Types") {
      query.customerType = customerType;
    }

    // Location filter
    if (location && location !== "All" && location !== "All Locations") {
      query.location = location;
    }

    // Status filter
    if (status && status !== "All" && status !== "All Status") {
      query.status = status;
    }

    const total = await Customer.countDocuments(query);
    const totalPages = Math.ceil(total / limit) || 1;
    const skip = (page - 1) * limit;

    const customers = await Customer.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const activeCount = await Customer.countDocuments({ ...query, status: "Active" });
    const inactiveCount = await Customer.countDocuments({ ...query, status: "Inactive" });

    return res.status(200).json({
      success: true,
      total,
      totalPages,
      currentPage: page,
      limit,
      count: customers.length,
      activeCount,
      inactiveCount,
      customers,
    });
  } catch (error) {
    console.error("Get customers error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while fetching customers",
    });
  }
};

// GET /api/customers/:id
const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }
    return res.status(200).json({
      success: true,
      customer,
    });
  } catch (error) {
    console.error("Get customer by id error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while fetching customer",
    });
  }
};

// POST /api/customers
const addCustomer = async (req, res) => {
  try {
    const { name, phone, email, customerType, location, totalPurchases, status, address, notes } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: "Customer name and phone number are required",
      });
    }

    const customer = await Customer.create({
      name: name.trim(),
      phone: phone.trim(),
      email: email ? email.trim() : "",
      customerType: customerType || "Retail",
      location: location || "Chennai",
      totalPurchases: toNumber(totalPurchases, 0),
      lastPurchase: new Date(),
      status: status || "Active",
      address: address || "",
      notes: notes || "",
    });

    return res.status(201).json({
      success: true,
      message: "Customer added successfully",
      customer,
    });
  } catch (error) {
    console.error("Add customer error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while adding customer",
    });
  }
};

// PUT /api/customers/:id
const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await Customer.findById(id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const fields = ["name", "phone", "email", "customerType", "location", "totalPurchases", "status", "address", "notes"];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        customer[field] = req.body[field];
      }
    });

    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Customer updated successfully",
      customer,
    });
  } catch (error) {
    console.error("Update customer error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while updating customer",
    });
  }
};

// DELETE /api/customers/:id
const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await Customer.findById(id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    await customer.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error) {
    console.error("Delete customer error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while deleting customer",
    });
  }
};

// GET /api/customers/locations/list
const getCustomerLocations = async (req, res) => {
  try {
    const locations = await Customer.distinct("location");
    const validLocs = locations.filter((l) => l && l.trim()).sort();
    return res.status(200).json({
      success: true,
      locations: ["All Locations", ...validLocs],
    });
  } catch (error) {
    console.error("Get customer locations error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while fetching locations",
    });
  }
};

// POST /api/customers/import
const importCustomers = async (req, res) => {
  try {
    const { customersList } = req.body;
    if (!Array.isArray(customersList) || customersList.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid list of customers to import",
      });
    }

    let importedCount = 0;
    for (const item of customersList) {
      if (item.name && item.phone) {
        await Customer.create({
          name: item.name,
          phone: item.phone,
          email: item.email || "",
          customerType: item.customerType || "Retail",
          location: item.location || "Chennai",
          totalPurchases: toNumber(item.totalPurchases, 0),
          status: item.status || "Active",
        });
        importedCount++;
      }
    }

    return res.status(200).json({
      success: true,
      message: `Successfully imported ${importedCount} customers`,
      importedCount,
    });
  } catch (error) {
    console.error("Import customers error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while importing customers",
    });
  }
};

// DELETE /api/customers/clear/all
const clearAllCustomers = async (req, res) => {
  try {
    const result = await Customer.deleteMany({});
    return res.status(200).json({
      success: true,
      message: `Cleared ${result.deletedCount} customers successfully`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Clear customers error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while clearing customers",
    });
  }
};

module.exports = {
  getCustomers,
  getCustomerById,
  addCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerLocations,
  importCustomers,
  clearAllCustomers,
};

