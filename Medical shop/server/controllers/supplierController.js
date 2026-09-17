const Supplier = require("../models/Supplier");

const toNumber = (val, fallback = 0) => {
  const n = Number(val);
  return isNaN(n) ? fallback : n;
};

// GET /api/suppliers
const getSuppliers = async (req, res) => {
  try {
    const page = Math.max(toNumber(req.query.page, 1), 1);
    const limit = Math.max(toNumber(req.query.limit, 10), 1);
    const { search, supplierType, location, status } = req.query;

    const query = {};

    // Search query
    if (search && search.trim()) {
      const q = search.trim();
      query.$or = [
        { name: { $regex: q, $options: "i" } },
        { contactPerson: { $regex: q, $options: "i" } },
        { phone: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
        { supplierId: { $regex: q, $options: "i" } },
        { location: { $regex: q, $options: "i" } },
      ];
    }

    // Supplier Type filter
    if (supplierType && supplierType !== "All" && supplierType !== "All Types") {
      query.supplierType = supplierType;
    }

    // Location filter
    if (location && location !== "All" && location !== "All Locations") {
      query.location = location;
    }

    // Status filter
    if (status && status !== "All" && status !== "All Status") {
      query.status = status;
    }

    const total = await Supplier.countDocuments(query);
    const totalPages = Math.ceil(total / limit) || 1;
    const skip = (page - 1) * limit;

    const suppliers = await Supplier.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const activeCount = await Supplier.countDocuments({ ...query, status: "Active" });
    const inactiveCount = await Supplier.countDocuments({ ...query, status: "Inactive" });

    return res.status(200).json({
      success: true,
      total,
      totalPages,
      currentPage: page,
      limit,
      count: suppliers.length,
      activeCount,
      inactiveCount,
      suppliers,
    });
  } catch (error) {
    console.error("Get suppliers error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while fetching suppliers",
    });
  }
};

// GET /api/suppliers/:id
const getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }
    return res.status(200).json({
      success: true,
      supplier,
    });
  } catch (error) {
    console.error("Get supplier by id error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while fetching supplier",
    });
  }
};

// POST /api/suppliers
const addSupplier = async (req, res) => {
  try {
    const { name, contactPerson, phone, email, supplierType, location, status, gstin, address, notes } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: "Supplier name and phone number are required",
      });
    }

    const supplier = await Supplier.create({
      name: name.trim(),
      contactPerson: contactPerson ? contactPerson.trim() : "",
      phone: phone.trim(),
      email: email ? email.trim() : "",
      supplierType: supplierType || "Distributor",
      location: location || "Chennai",
      status: status || "Active",
      gstin: gstin ? gstin.trim() : "",
      address: address ? address.trim() : "",
      notes: notes ? notes.trim() : "",
    });

    return res.status(201).json({
      success: true,
      message: "Supplier added successfully",
      supplier,
    });
  } catch (error) {
    console.error("Add supplier error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while adding supplier",
    });
  }
};

// PUT /api/suppliers/:id
const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const supplier = await Supplier.findById(id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    const fields = ["name", "contactPerson", "phone", "email", "supplierType", "location", "status", "gstin", "address", "notes"];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        supplier[field] = req.body[field];
      }
    });

    await supplier.save();

    return res.status(200).json({
      success: true,
      message: "Supplier updated successfully",
      supplier,
    });
  } catch (error) {
    console.error("Update supplier error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while updating supplier",
    });
  }
};

// DELETE /api/suppliers/:id
const deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const supplier = await Supplier.findById(id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    await supplier.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Supplier deleted successfully",
    });
  } catch (error) {
    console.error("Delete supplier error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while deleting supplier",
    });
  }
};

// GET /api/suppliers/locations/list
const getSupplierLocations = async (req, res) => {
  try {
    const locations = await Supplier.distinct("location");
    const validLocs = locations.filter((l) => l && l.trim()).sort();
    return res.status(200).json({
      success: true,
      locations: ["All Locations", ...validLocs],
    });
  } catch (error) {
    console.error("Get supplier locations error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while fetching locations",
    });
  }
};

// POST /api/suppliers/import
const importSuppliers = async (req, res) => {
  try {
    const { suppliersList } = req.body;
    if (!Array.isArray(suppliersList) || suppliersList.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid list of suppliers to import",
      });
    }

    let importedCount = 0;
    for (const item of suppliersList) {
      if (item.name && item.phone) {
        await Supplier.create({
          name: item.name,
          contactPerson: item.contactPerson || "",
          phone: item.phone,
          email: item.email || "",
          supplierType: item.supplierType || "Distributor",
          location: item.location || "Chennai",
          status: item.status || "Active",
        });
        importedCount++;
      }
    }

    return res.status(200).json({
      success: true,
      message: `Successfully imported ${importedCount} suppliers`,
      importedCount,
    });
  } catch (error) {
    console.error("Import suppliers error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while importing suppliers",
    });
  }
};

// DELETE /api/suppliers/clear/all
const clearAllSuppliers = async (req, res) => {
  try {
    const result = await Supplier.deleteMany({});
    return res.status(200).json({
      success: true,
      message: `Cleared ${result.deletedCount} suppliers successfully`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Clear suppliers error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while clearing suppliers",
    });
  }
};

module.exports = {
  getSuppliers,
  getSupplierById,
  addSupplier,
  updateSupplier,
  deleteSupplier,
  getSupplierLocations,
  importSuppliers,
  clearAllSuppliers,
};

