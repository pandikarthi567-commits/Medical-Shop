const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const Medicine = require("../models/Medicine");
const Category = require("../models/Category");
const User = require("../models/User");
const cloudinary = require("../config/cloudinary");
const { Readable } = require("stream");
const {
  sendEmailAlert,
  sendWhatsAppAlert,
} = require("../utils/alertService");

const LOCAL_FALLBACK_IMAGE = "/images/healthcare.png";

const toNumber = (value, fallback = 0) => {
  if (value === undefined || value === null || value === "") return fallback;
  const num = Number(value);
  return Number.isNaN(num) ? fallback : num;
};

const toBoolean = (value, fallback = false) => {
  if (value === true || value === "true") return true;
  if (value === false || value === "false") return false;
  return fallback;
};

const isValidDate = (value) => {
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
};

const startOfToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

const isExpired = (expiryDate) => {
  const date = new Date(expiryDate);
  if (Number.isNaN(date.getTime())) return true;
  return date < startOfToday();
};

const isValidMongoId = (id) => {
  return (
    mongoose.Types.ObjectId.isValid(id) &&
    new mongoose.Types.ObjectId(id).toString() === id
  );
};

const escapeRegex = (value) => {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const sanitizeImageUrl = (value, fallback = "") => {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  if (!trimmed) return fallback;

  if (
    trimmed.includes("via.placeholder.com") ||
    trimmed.includes("placeholder.com")
  ) {
    return fallback || LOCAL_FALLBACK_IMAGE;
  }

  return trimmed;
};

const validateCategory = async (categoryName) => {
  if (!categoryName || !String(categoryName).trim()) return null;

  const normalized = String(categoryName).trim();

  let category = await Category.findOne({
    name: { $regex: new RegExp(`^${escapeRegex(normalized)}$`, "i") },
    isActive: true,
  });

  if (!category) {
    try {
      const slug = normalized
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

      category = await Category.create({
        name: normalized,
        slug: slug || `cat-${Date.now()}`,
        isActive: true,
      });
    } catch (e) {
      category = { name: normalized };
    }
  }

  return category;
};

const uploadBufferToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
      return reject(new Error("Cloudinary not configured"));
    }

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "medicines",
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    Readable.from(buffer).pipe(stream);
  });
};

const saveBufferLocally = async (file) => {
  try {
    const uploadsDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const filename = `med-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname || "image.png") || ".png"}`;
    const filePath = path.join(uploadsDir, filename);
    fs.writeFileSync(filePath, file.buffer);
    return `/uploads/${filename}`;
  } catch (err) {
    console.error("Local save error:", err);
    return `data:${file.mimetype || "image/png"};base64,${file.buffer.toString("base64")}`;
  }
};

const checkInventoryAlerts = async (medicine) => {
  if (!medicine) return;

  try {
    const threshold = medicine.lowStockThreshold ?? 10;

    if (medicine.stock < 5) {
      const msg = `CRITICAL STOCK: ${medicine.name} only ${medicine.stock} left`;
      await sendEmailAlert("CRITICAL STOCK ALERT", msg);
      await sendWhatsAppAlert(msg);
    } else if (medicine.stock <= threshold) {
      const msg = `LOW STOCK: ${medicine.name} stock is ${medicine.stock}`;
      await sendEmailAlert("LOW STOCK ALERT", msg);
    }
  } catch (error) {
    console.error("Inventory alert error:", error.message);
  }
};

const addMedicine = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      oldPrice,
      stock,
      category,
      prescriptionRequired,
      expiryDate,
      rating,
      reviewCount,
      badge,
      brand,
      batchNo,
      lowStockThreshold,
      image,
    } = req.body;

    if (
      !name ||
      price === undefined ||
      stock === undefined ||
      !category ||
      !expiryDate
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, price, stock, category and expiryDate are required",
      });
    }

    const existingCategory = await validateCategory(category);
    if (!existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Selected category could not be processed",
      });
    }

    if (!isValidDate(expiryDate) || isExpired(expiryDate)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired expiry date",
      });
    }

    const parsedPrice = toNumber(price, NaN);
    const parsedOldPrice =
      oldPrice === undefined || oldPrice === "" ? null : toNumber(oldPrice, NaN);
    const parsedStock = toNumber(stock, NaN);
    const parsedRating =
      rating === undefined || rating === "" ? 4 : toNumber(rating, NaN);
    const parsedReviewCount =
      reviewCount === undefined || reviewCount === ""
        ? 0
        : toNumber(reviewCount, NaN);
    const parsedThreshold =
      lowStockThreshold === undefined || lowStockThreshold === ""
        ? 10
        : toNumber(lowStockThreshold, NaN);

    if (
      Number.isNaN(parsedPrice) ||
      Number.isNaN(parsedStock) ||
      Number.isNaN(parsedRating) ||
      Number.isNaN(parsedReviewCount) ||
      Number.isNaN(parsedThreshold) ||
      (parsedOldPrice !== null && Number.isNaN(parsedOldPrice))
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid numeric values provided",
      });
    }

    if (parsedPrice < 0 || parsedStock < 0 || parsedThreshold < 0) {
      return res.status(400).json({
        success: false,
        message: "Price, stock and low stock threshold must be non-negative",
      });
    }

    if (parsedOldPrice !== null && parsedOldPrice < 0) {
      return res.status(400).json({
        success: false,
        message: "Old price must be non-negative",
      });
    }

    if (parsedRating < 0 || parsedRating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 0 and 5",
      });
    }

    if (parsedReviewCount < 0) {
      return res.status(400).json({
        success: false,
        message: "Review count must be non-negative",
      });
    }

    let imageUrl = "";

    if (req.file?.buffer) {
      try {
        const uploadedImage = await uploadBufferToCloudinary(req.file.buffer);
        imageUrl = uploadedImage.secure_url;
      } catch (cloudErr) {
        imageUrl = await saveBufferLocally(req.file);
      }
    } else if (typeof image === "string" && image.trim()) {
      imageUrl = sanitizeImageUrl(image, "");
    }

    const generatedBatch =
      typeof batchNo === "string" && batchNo.trim()
        ? batchNo.trim()
        : `BCH${Math.floor(100 + Math.random() * 900)}`;

    const medicine = await Medicine.create({
      name: String(name).trim(),
      description: typeof description === "string" ? description.trim() : "",
      price: parsedPrice,
      oldPrice: parsedOldPrice,
      stock: parsedStock,
      batchNo: generatedBatch,
      lowStockThreshold: parsedThreshold,
      category: existingCategory.name,
      prescriptionRequired: toBoolean(prescriptionRequired, false),
      expiryDate: new Date(expiryDate),
      image: imageUrl,
      rating: parsedRating,
      reviewCount: parsedReviewCount,
      badge: typeof badge === "string" ? badge.trim() : "",
      brand: typeof brand === "string" ? brand.trim() : "",
      inStock: parsedStock > 0,
    });

    await checkInventoryAlerts(medicine);

    return res.status(201).json({
      success: true,
      message: "Medicine added successfully",
      medicine,
    });
  } catch (error) {
    console.error("Add medicine error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while adding medicine",
    });
  }
};

const getMedicines = async (req, res) => {
  try {
    const page = Math.max(toNumber(req.query.page, 1), 1);
    const limit = Math.max(toNumber(req.query.limit, 8), 1);
    const skip = (page - 1) * limit;

    const {
      search,
      category,
      inStock,
      prescriptionRequired,
      minPrice,
      maxPrice,
      sort,
      includeExpired,
      lowStock,
    } = req.query;

    const query = {};

    if (includeExpired !== "true") {
      query.expiryDate = { $gte: startOfToday() };
    }

    if (search?.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: "i" } },
        { description: { $regex: search.trim(), $options: "i" } },
        { brand: { $regex: search.trim(), $options: "i" } },
      ];
    }

    if (category && category !== "All") {
      query.category = category;
    }

    if (inStock === "true") {
      query.stock = { ...(query.stock || {}), $gt: 0 };
    }

    if (lowStock === "true") {
      query.stock = { ...(query.stock || {}), $lte: 10 };
    }

    if (prescriptionRequired === "true") query.prescriptionRequired = true;
    if (prescriptionRequired === "false") query.prescriptionRequired = false;

    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined && minPrice !== "") {
        query.price.$gte = toNumber(minPrice, 0);
      }
      if (maxPrice !== undefined && maxPrice !== "") {
        query.price.$lte = toNumber(maxPrice, Number.MAX_SAFE_INTEGER);
      }
    }

    let sortOption = { createdAt: -1 };
    if (sort === "low") sortOption = { price: 1 };
    else if (sort === "high") sortOption = { price: -1 };
    else if (sort === "rating") sortOption = { rating: -1, reviewCount: -1 };
    else if (sort === "name-asc") sortOption = { name: 1 };
    else if (sort === "name-desc") sortOption = { name: -1 };
    else if (sort === "oldest") sortOption = { createdAt: 1 };
    else if (sort === "expiry") sortOption = { expiryDate: 1 };

    const medicines = await Medicine.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    const total = await Medicine.countDocuments(query);

    return res.status(200).json({
      success: true,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      count: medicines.length,
      medicines,
    });
  } catch (error) {
    console.error("Get medicines error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while fetching medicines",
    });
  }
};

const getAllMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.find({
      name: { $not: /\(Batch \d+\)/i },
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: medicines.length,
      medicines,
    });
  } catch (error) {
    console.error("Get all medicines error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while fetching all medicines",
    });
  }
};

const getMedicineById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidMongoId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid medicine ID",
      });
    }

    const medicine = await Medicine.findById(id);

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found",
      });
    }

    return res.status(200).json({
      success: true,
      medicine,
    });
  } catch (error) {
    console.error("Get medicine by id error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while fetching medicine",
    });
  }
};

const updateMedicine = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidMongoId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid medicine ID",
      });
    }

    const medicine = await Medicine.findById(id);

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found",
      });
    }

    const body = {
      ...req.body,
      name: typeof req.body.name === "string" ? req.body.name.trim() : req.body.name,
      category:
        typeof req.body.category === "string"
          ? req.body.category.trim()
          : req.body.category,
      description:
        typeof req.body.description === "string"
          ? req.body.description.trim()
          : req.body.description,
      image:
        typeof req.body.image === "string"
          ? req.body.image.trim()
          : req.body.image,
      badge:
        typeof req.body.badge === "string" ? req.body.badge.trim() : req.body.badge,
      brand:
        typeof req.body.brand === "string" ? req.body.brand.trim() : req.body.brand,
    };

    if (body.expiryDate !== undefined && body.expiryDate !== "") {
      if (!isValidDate(body.expiryDate) || isExpired(body.expiryDate)) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired expiry date",
        });
      }
    }

    let imageUrl = medicine.image;

    if (req.file?.buffer) {
      try {
        const uploadedImage = await uploadBufferToCloudinary(req.file.buffer);
        imageUrl = uploadedImage.secure_url;
      } catch (cloudErr) {
        imageUrl = await saveBufferLocally(req.file);
      }
    } else if (body.image !== undefined && body.image !== "") {
      imageUrl = sanitizeImageUrl(body.image, medicine.image || "");
    }

    if (body.name !== undefined) {
      if (!body.name) {
        return res.status(400).json({
          success: false,
          message: "Medicine name is required",
        });
      }
      medicine.name = body.name;
    }

    if (body.description !== undefined) {
      medicine.description = body.description || "";
    }

    if (body.category !== undefined) {
      if (!body.category) {
        return res.status(400).json({
          success: false,
          message: "Category is required",
        });
      }

      const existingCategory = await validateCategory(body.category);
      if (!existingCategory) {
        return res.status(400).json({
          success: false,
          message: "Selected category does not exist or is inactive",
        });
      }

      medicine.category = existingCategory.name;
    }

    if (body.badge !== undefined) {
      medicine.badge = body.badge || "";
    }

    if (body.brand !== undefined) {
      medicine.brand = body.brand || "";
    }

    if (body.batchNo !== undefined) {
      medicine.batchNo = String(body.batchNo).trim() || medicine.batchNo;
    }

    if (body.prescriptionRequired !== undefined) {
      medicine.prescriptionRequired = toBoolean(
        body.prescriptionRequired,
        medicine.prescriptionRequired
      );
    }

    if (body.price !== undefined) {
      if (body.price === "") {
        return res.status(400).json({
          success: false,
          message: "Price is required",
        });
      }

      const parsed = toNumber(body.price, NaN);
      if (Number.isNaN(parsed) || parsed < 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid price",
        });
      }
      medicine.price = parsed;
    }

    if (body.oldPrice !== undefined) {
      if (body.oldPrice === "" || body.oldPrice === null) {
        medicine.oldPrice = null;
      } else {
        const parsed = toNumber(body.oldPrice, NaN);
        if (Number.isNaN(parsed) || parsed < 0) {
          return res.status(400).json({
            success: false,
            message: "Invalid old price",
          });
        }
        medicine.oldPrice = parsed;
      }
    }

    if (body.stock !== undefined) {
      if (body.stock === "") {
        return res.status(400).json({
          success: false,
          message: "Stock is required",
        });
      }

      const parsed = toNumber(body.stock, NaN);
      if (Number.isNaN(parsed) || parsed < 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid stock",
        });
      }
      medicine.stock = parsed;
    }

    if (body.lowStockThreshold !== undefined) {
      if (body.lowStockThreshold === "") {
        medicine.lowStockThreshold = 10;
      } else {
        const parsed = toNumber(body.lowStockThreshold, NaN);
        if (Number.isNaN(parsed) || parsed < 0) {
          return res.status(400).json({
            success: false,
            message: "Invalid low stock threshold",
          });
        }
        medicine.lowStockThreshold = parsed;
      }
    }

    if (body.prescriptionRequired !== undefined) {
      medicine.prescriptionRequired = toBoolean(
        body.prescriptionRequired,
        medicine.prescriptionRequired
      );
    }

    if (body.expiryDate !== undefined) {
      if (body.expiryDate === "") {
        return res.status(400).json({
          success: false,
          message: "Expiry date is required",
        });
      }
      medicine.expiryDate = new Date(body.expiryDate);
    }

    if (body.rating !== undefined) {
      if (body.rating === "") {
        medicine.rating = 4;
      } else {
        const parsed = toNumber(body.rating, NaN);
        if (Number.isNaN(parsed) || parsed < 0 || parsed > 5) {
          return res.status(400).json({
            success: false,
            message: "Invalid rating",
          });
        }
        medicine.rating = parsed;
      }
    }

    if (body.reviewCount !== undefined) {
      if (body.reviewCount === "") {
        medicine.reviewCount = 0;
      } else {
        const parsed = toNumber(body.reviewCount, NaN);
        if (Number.isNaN(parsed) || parsed < 0) {
          return res.status(400).json({
            success: false,
            message: "Invalid review count",
          });
        }
        medicine.reviewCount = parsed;
      }
    }

    medicine.image = imageUrl;
    medicine.inStock = medicine.stock > 0;

    const updatedMedicine = await medicine.save();
    await checkInventoryAlerts(updatedMedicine);

    return res.status(200).json({
      success: true,
      message: "Medicine updated successfully",
      medicine: updatedMedicine,
    });
  } catch (error) {
    console.error("Update medicine error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while updating medicine",
    });
  }
};

const deleteMedicine = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidMongoId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid medicine ID",
      });
    }

    const medicine = await Medicine.findById(id);

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found",
      });
    }

    await medicine.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Medicine deleted successfully",
    });
  } catch (error) {
    console.error("Delete medicine error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while deleting medicine",
    });
  }
};

const clearAllMedicines = async (req, res) => {
  try {
    const result = await Medicine.deleteMany({});
    return res.status(200).json({
      success: true,
      message: `Cleared ${result.deletedCount} medicines from database.`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Clear all medicines error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while clearing medicines",
    });
  }
};

const getLowStockMedicines = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 10;

    const medicines = await Medicine.find({
      stock: { $lte: limit, $gt: 0 },
      expiryDate: { $gte: startOfToday() },
    }).sort({ stock: 1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: medicines.length,
      threshold: limit,
      medicines,
    });
  } catch (error) {
    console.error("Low stock fetch error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while fetching low stock medicines",
    });
  }
};

const getExpiringMedicines = async (req, res) => {
  try {
    const today = startOfToday();
    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const medicines = await Medicine.find({
      expiryDate: { $gte: today, $lte: nextMonth },
    }).sort({ expiryDate: 1 });

    return res.status(200).json({
      success: true,
      count: medicines.length,
      medicines,
    });
  } catch (error) {
    console.error("Expiring medicines fetch error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while fetching expiring medicines",
    });
  }
};

const getMedicineCategories = async (req, res) => {
  try {
    const today = startOfToday();
    const distinctCatNames = await Medicine.distinct("category", {
      expiryDate: { $gte: today },
    });

    const categoryList = distinctCatNames
      .filter((name) => Boolean(name && String(name).trim()))
      .map((name) => ({
        name: String(name).trim(),
        slug: String(name)
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, ""),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return res.status(200).json({
      success: true,
      categories: [{ name: "All", slug: "all" }, ...categoryList],
    });
  } catch (error) {
    console.error("Get medicine categories error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while fetching categories",
    });
  }
};

const getCategorySummary = async (req, res) => {
  try {
    const today = startOfToday();
    const search = typeof req.query.search === "string" ? req.query.search.trim().toLowerCase() : "";

    // 1. Get all distinct category names from active medicines
    const distinctCatNames = await Medicine.distinct("category", {
      expiryDate: { $gte: today },
    });

    const validCatNames = distinctCatNames.filter((name) => Boolean(name && String(name).trim()));

    // 2. Fetch category metadata if exists
    const categoryDocs = await Category.find({
      name: { $in: validCatNames },
      isActive: true,
    });

    const categoryMap = new Map();
    categoryDocs.forEach((c) => {
      if (c?.name) categoryMap.set(c.name.toLowerCase().trim(), c);
    });

    const colorPalettes = [
      "from-emerald-600 to-teal-600",
      "from-cyan-600 to-blue-600",
      "from-indigo-600 to-violet-600",
      "from-teal-600 to-emerald-700",
      "from-blue-600 to-cyan-600",
      "from-emerald-500 to-teal-500",
    ];

    const iconList = ["Pill", "HeartPulse", "Sparkles", "ShieldCheck", "LayoutGrid", "Baby", "Grid3X3"];

    // 3. Map over categories that actually contain medicines added by admin
    const summary = await Promise.all(
      validCatNames.map(async (rawCatName, index) => {
        const catName = String(rawCatName).trim();
        const catDoc = categoryMap.get(catName.toLowerCase());

        const totalMedicines = await Medicine.countDocuments({
          category: catName,
          expiryDate: { $gte: today },
        });

        if (totalMedicines === 0) return null;

        const inStockCount = await Medicine.countDocuments({
          category: catName,
          stock: { $gt: 0 },
          expiryDate: { $gte: today },
        });

        // Find a representative medicine image if category doesn't have an explicit image
        let sampleImage = catDoc?.image ? sanitizeImageUrl(catDoc.image) : "";
        if (!sampleImage || sampleImage === LOCAL_FALLBACK_IMAGE) {
          const sampleMed = await Medicine.findOne({
            category: catName,
            image: { $exists: true, $ne: "" },
            expiryDate: { $gte: today },
          }).select("image");

          if (sampleMed?.image) {
            sampleImage = sanitizeImageUrl(sampleMed.image);
          }
        }

        const slug =
          catDoc?.slug ||
          catName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");

        return {
          _id: catDoc?._id || `cat-${index}`,
          id: catDoc?._id || `cat-${index}`,
          name: catName,
          title: catName,
          slug: slug || "medicines",
          image: sampleImage || LOCAL_FALLBACK_IMAGE,
          description:
            catDoc?.description?.trim() ||
            `Explore verified, authentic ${catName} medicines and healthcare essentials with fast delivery.`,
          totalMedicines,
          inStockCount,
          itemCount: totalMedicines,
          highlight: inStockCount > 0 ? "In Stock" : "Limited Stock",
          color: colorPalettes[index % colorPalettes.length],
          icon: iconList[index % iconList.length],
        };
      })
    );

    const filteredSummary = summary.filter(Boolean);

    const finalResult = search
      ? filteredSummary.filter((cat) => {
          const name = cat.name ? cat.name.toLowerCase() : "";
          const description = cat.description ? cat.description.toLowerCase() : "";
          return name.includes(search) || description.includes(search);
        })
      : filteredSummary;

    return res.status(200).json({
      success: true,
      count: finalResult.length,
      categories: finalResult,
    });
  } catch (error) {
    console.error("Category summary error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while fetching category summary",
    });
  }
};

const getFeaturedMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.find({
      expiryDate: { $gte: startOfToday() },
      stock: { $gt: 0 },
      $or: [
        { badge: { $regex: /^featured$/i } },
        { badge: { $regex: /^best seller$/i } },
        { rating: { $gte: 4.5 } },
      ],
    })
      .sort({ rating: -1, reviewCount: -1, createdAt: -1 })
      .limit(12);

    const normalized = medicines.map((medicine) => ({
      ...medicine.toObject(),
      image: sanitizeImageUrl(medicine.image, LOCAL_FALLBACK_IMAGE),
      badge: medicine.badge || "Featured",
    }));

    return res.status(200).json({
      success: true,
      count: normalized.length,
      medicines: normalized,
    });
  } catch (error) {
    console.error("Featured medicines error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while fetching featured medicines",
    });
  }
};

const alertLowStock = async (req, res) => {
  try {
    const medicines = await Medicine.find({
      $expr: { $lte: ["$stock", "$lowStockThreshold"] },
      stock: { $gt: 0 },
      expiryDate: { $gte: startOfToday() },
    }).sort({ stock: 1 });

    if (!medicines.length) {
      return res.status(200).json({
        success: true,
        message: "No low stock medicines found",
        medicines: [],
      });
    }

    const messageBody = medicines
      .map(
        (m, index) =>
          `${index + 1}. ${m.name} | Stock: ${m.stock} | Threshold: ${m.lowStockThreshold}`
      )
      .join("\n");

    const fullMessage = `Low Stock Alert:\n${messageBody}`;

    const emailSent = await sendEmailAlert(
      "Low Stock Medicines Alert",
      fullMessage
    );
    const whatsappSent = await sendWhatsAppAlert(fullMessage);

    return res.status(200).json({
      success: true,
      message: "Low stock alert processed",
      emailSent,
      whatsappSent,
      count: medicines.length,
      medicines,
    });
  } catch (error) {
    console.error("Alert low stock error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while processing low stock alerts",
    });
  }
};

const getMedicineByIdForAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidMongoId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid medicine ID",
      });
    }

    const medicine = await Medicine.findById(id);

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found",
      });
    }

    return res.status(200).json({
      success: true,
      medicine,
    });
  } catch (error) {
    console.error("Get medicine by id for admin error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while fetching medicine",
    });
  }
};

const getMyWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("wishlist");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      wishlist: user.wishlist || [],
    });
  } catch (error) {
    console.error("Get wishlist error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch wishlist",
    });
  }
};

const getExpiryManagementData = async (req, res) => {
  try {
    const page = Math.max(toNumber(req.query.page, 1), 1);
    const limit = Math.max(toNumber(req.query.limit, 10), 1);

    const { search, status, category, brand, startDate, endDate } = req.query;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let allMedicines = await Medicine.find().sort({ expiryDate: 1 });

    let processed = allMedicines.map((item) => {
      const expDate = new Date(item.expiryDate);
      const diffTime = expDate.getTime() - today.getTime();
      const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let itemStatus = "Valid";
      if (daysLeft <= 0) {
        itemStatus = "Expired";
      } else if (daysLeft <= 30) {
        itemStatus = "Expiring Soon";
      }

      return {
        _id: item._id,
        name: item.name,
        brand: item.brand || "Generic",
        category: item.category || "General",
        batchNo: item.batchNo || "BCH001",
        expiryDate: item.expiryDate,
        daysLeft,
        stock: item.stock,
        price: item.price,
        oldPrice: item.oldPrice,
        status: itemStatus,
        description: item.description,
        prescriptionRequired: item.prescriptionRequired,
        image: item.image,
      };
    });

    const expiredTotalCount = processed.filter((m) => m.status === "Expired").length;
    const expiringSoonTotalCount = processed.filter((m) => m.status === "Expiring Soon").length;
    const validTotalCount = processed.filter((m) => m.status === "Valid").length;

    if (status && status !== "All") {
      processed = processed.filter(
        (m) => m.status.toLowerCase() === status.toLowerCase()
      );
    }

    if (category && category !== "All" && category !== "All Categories") {
      processed = processed.filter(
        (m) => m.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (brand && brand !== "All" && brand !== "All Brands") {
      processed = processed.filter(
        (m) => m.brand.toLowerCase() === brand.toLowerCase()
      );
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      processed = processed.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.batchNo.toLowerCase().includes(q) ||
          m.brand.toLowerCase().includes(q) ||
          m.category.toLowerCase().includes(q)
      );
    }

    if (startDate) {
      const sDate = new Date(startDate);
      if (!isNaN(sDate.getTime())) {
        processed = processed.filter((m) => new Date(m.expiryDate) >= sDate);
      }
    }
    if (endDate) {
      const eDate = new Date(endDate);
      if (!isNaN(eDate.getTime())) {
        eDate.setHours(23, 59, 59, 999);
        processed = processed.filter((m) => new Date(m.expiryDate) <= eDate);
      }
    }

    const total = processed.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const skip = (page - 1) * limit;
    const paginatedMedicines = processed.slice(skip, skip + limit);

    return res.status(200).json({
      success: true,
      total,
      totalPages,
      currentPage: page,
      limit,
      count: paginatedMedicines.length,
      expiredCount: expiredTotalCount,
      expiringSoonCount: expiringSoonTotalCount,
      validCount: validTotalCount,
      medicines: paginatedMedicines,
    });
  } catch (error) {
    console.error("Get expiry management data error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while fetching expiry management data",
    });
  }
};

const removeExpiredMedicines = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await Medicine.deleteMany({ expiryDate: { $lt: today } });

    return res.status(200).json({
      success: true,
      message: `Successfully removed ${result.deletedCount} expired medicines.`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Remove expired medicines error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while removing expired medicines",
    });
  }
};

const applyDiscountExpiringMedicines = async (req, res) => {
  try {
    const discountPercent = Number(req.body.discountPercent) || 20;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thirtyDaysLater = new Date(today);
    thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);

    const expiringMedicines = await Medicine.find({
      expiryDate: { $gte: today, $lte: thirtyDaysLater },
    });

    let updatedCount = 0;
    for (const med of expiringMedicines) {
      med.oldPrice = med.price;
      med.price = Math.max(1, Math.round(med.price * (1 - discountPercent / 100)));
      await med.save();
      updatedCount++;
    }

    return res.status(200).json({
      success: true,
      message: `Successfully applied ${discountPercent}% discount to ${updatedCount} expiring medicines.`,
      updatedCount,
    });
  } catch (error) {
    console.error("Apply discount error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while applying discount",
    });
  }
};

const sendExpiryAlert = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thirtyDaysLater = new Date(today);
    thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);

    const expiringOrExpired = await Medicine.find({
      expiryDate: { $lte: thirtyDaysLater },
    }).sort({ expiryDate: 1 });

    const messageLines = expiringOrExpired.map(
      (m, idx) =>
        `${idx + 1}. ${m.name} | Batch: ${m.batchNo || "N/A"} | Expiry: ${new Date(
          m.expiryDate
        ).toLocaleDateString()} | Stock: ${m.stock}`
    );

    const fullMessage = `Expiry Management Alert:\nTotal items near expiry/expired: ${
      expiringOrExpired.length
    }\n\n` + messageLines.join("\n");

    const emailSent = await sendEmailAlert("Medicine Expiry Alert", fullMessage);
    const whatsappSent = await sendWhatsAppAlert(fullMessage);

    return res.status(200).json({
      success: true,
      message: "Expiry alert sent successfully",
      count: expiringOrExpired.length,
      emailSent,
      whatsappSent,
    });
  } catch (error) {
    console.error("Send expiry alert error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while sending expiry alert",
    });
  }
};

const getMedicineBrands = async (req, res) => {
  try {
    const brands = await Medicine.distinct("brand");
    const validBrands = brands.filter((b) => b && b.trim()).sort();
    return res.status(200).json({
      success: true,
      brands: ["All Brands", ...validBrands],
    });
  } catch (error) {
    console.error("Get brands error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while fetching brands",
    });
  }
};

module.exports = {
  addMedicine,
  getAllMedicines,
  getMedicines,
  getMedicineById,
  getMedicineByIdForAdmin,
  updateMedicine,
  deleteMedicine,
  clearAllMedicines,
  getLowStockMedicines,
  getExpiringMedicines,
  getMedicineCategories,
  alertLowStock,
  getCategorySummary,
  getMyWishlist,
  getFeaturedMedicines,
  getExpiryManagementData,
  removeExpiredMedicines,
  applyDiscountExpiringMedicines,
  sendExpiryAlert,
  getMedicineBrands,
};