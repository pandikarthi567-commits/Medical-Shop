const Customer = require("../models/Customer");
const User = require("../models/User");
const Order = require("../models/Order");

const toNumber = (val, fallback = 0) => {
  const n = Number(val);
  return isNaN(n) ? fallback : n;
};

// Helper to sync a single user to Customer database
const syncSingleUserToCustomer = async (userId) => {
  try {
    const user = await User.findById(userId).lean();
    if (!user) return null;

    const cleanEmail = String(user.email || "").trim().toLowerCase();
    const cleanPhone = String(user.phone || "").trim();

    const userOrders = await Order.find({ user: user._id }).lean();
    const totalSpend = userOrders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
    const lastOrder = userOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

    const conditions = [{ user: user._id }];
    if (cleanEmail) conditions.push({ email: cleanEmail });
    if (cleanPhone && cleanPhone !== "-") conditions.push({ phone: cleanPhone });

    let customer = await Customer.findOne({ $or: conditions });

    const customerLocation =
      user.location ||
      (user.address ? user.address.split(",")?.[0]?.trim() : "") ||
      "Virudhunagar";

    const displayName =
      user.name && user.name.trim()
        ? user.name.trim()
        : cleanEmail
        ? cleanEmail.split("@")[0]
        : "Registered Customer";

    if (customer) {
      customer.user = user._id;
      if (!customer.name || customer.name === "Customer" || customer.name === "Verified Patient") {
        customer.name = displayName;
      }
      if (cleanEmail) customer.email = cleanEmail;
      if (cleanPhone && (!customer.phone || customer.phone === "-")) customer.phone = cleanPhone;
      if (customerLocation) customer.location = customerLocation;
      customer.totalPurchases = totalSpend;
      customer.ordersCount = userOrders.length;
      if (user.bloodGroup) customer.bloodGroup = user.bloodGroup;
      if (user.gender) customer.gender = user.gender;
      if (user.age) customer.age = user.age;
      if (user.emergencyContact) customer.emergencyContact = user.emergencyContact;
      if (user.address) customer.address = user.address;
      if (lastOrder) customer.lastPurchase = lastOrder.createdAt;
      await customer.save();
      return customer;
    } else {
      let newCustomerId = "";
      for (let attempts = 0; attempts < 50; attempts++) {
        const count = await Customer.countDocuments();
        const testId = `CUST-${String(count + 1 + attempts).padStart(4, "0")}`;
        const exists = await Customer.findOne({ customerId: testId });
        if (!exists) {
          newCustomerId = testId;
          break;
        }
      }

      return await Customer.create({
        customerId: newCustomerId || `CUST-${Date.now().toString().slice(-6)}`,
        user: user._id,
        name: displayName,
        phone: cleanPhone || "-",
        email: cleanEmail || "",
        customerType: "Retail",
        location: customerLocation,
        totalPurchases: totalSpend,
        ordersCount: userOrders.length,
        bloodGroup: user.bloodGroup || "",
        gender: user.gender || "",
        age: user.age || "",
        emergencyContact: user.emergencyContact || "",
        lastPurchase: lastOrder ? lastOrder.createdAt : user.createdAt,
        status: "Active",
        address: user.address || "",
        notes: "Registered web customer account",
      });
    }
  } catch (err) {
    console.error("syncSingleUserToCustomer error:", err);
    return null;
  }
};

// Helper to auto-sync registered store users into Customer database
const syncRegisteredUsersToCustomers = async () => {
  try {
    const users = await User.find({}).lean();
    if (!users || users.length === 0) return;

    for (const user of users) {
      await syncSingleUserToCustomer(user._id);
    }
  } catch (syncErr) {
    console.error("Auto sync users to customers error:", syncErr);
  }
};

// GET /api/customers
const getCustomers = async (req, res) => {
  try {
    // Automatically sync registered users into Customers collection on fetch
    await syncRegisteredUsersToCustomers();

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
        { address: { $regex: q, $options: "i" } },
      ];
    }

    // Customer Type filter
    if (customerType && customerType !== "All" && customerType !== "All Types") {
      query.customerType = customerType;
    }

    // Location filter
    if (location && location !== "All" && location !== "All Locations") {
      query.location = { $regex: location.trim(), $options: "i" };
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
    const customer = await Customer.findById(req.params.id).populate("user");
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // Fetch customer's order history
    let customerOrders = [];
    if (customer.user) {
      customerOrders = await Order.find({ user: customer.user }).sort({ createdAt: -1 }).limit(10);
    } else if (customer.email || customer.phone) {
      customerOrders = await Order.find({
        $or: [
          ...(customer.email ? [{ customerEmail: customer.email }] : []),
          ...(customer.phone ? [{ customerPhone: customer.phone }] : []),
        ],
      }).sort({ createdAt: -1 }).limit(10);
    }

    return res.status(200).json({
      success: true,
      customer,
      orders: customerOrders,
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
    const {
      name,
      phone,
      email,
      customerType,
      location,
      totalPurchases,
      status,
      address,
      notes,
      bloodGroup,
      gender,
      age,
      emergencyContact,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Customer name is required",
      });
    }

    const cleanEmail = String(email || "").trim().toLowerCase();
    const cleanPhone = String(phone || "").trim();

    const customer = await Customer.create({
      name: name.trim(),
      phone: cleanPhone || "-",
      email: cleanEmail || "",
      customerType: customerType || "Retail",
      location: location || "Virudhunagar",
      totalPurchases: toNumber(totalPurchases, 0),
      lastPurchase: new Date(),
      status: status || "Active",
      address: address || "",
      notes: notes || "",
      bloodGroup: bloodGroup || "",
      gender: gender || "",
      age: age || "",
      emergencyContact: emergencyContact || "",
    });

    return res.status(201).json({
      success: true,
      message: "Customer created successfully",
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

    const fields = [
      "name",
      "phone",
      "email",
      "customerType",
      "location",
      "totalPurchases",
      "status",
      "address",
      "notes",
      "bloodGroup",
      "gender",
      "age",
      "emergencyContact",
    ];

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
      if (item.name) {
        await Customer.create({
          name: item.name,
          phone: item.phone || "-",
          email: item.email || "",
          customerType: item.customerType || "Retail",
          location: item.location || "Virudhunagar",
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
  syncSingleUserToCustomer,
  syncRegisteredUsersToCustomers,
};
