import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Save,
  ImagePlus,
  PackageSearch,
  Sparkles,
  Pill,
  IndianRupee,
  Boxes,
  FileText,
  CalendarDays,
  ShieldCheck,
  ShieldAlert,
  Star,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Tags,
  Building,
  Hash,
  Eye,
  RefreshCw,
} from "lucide-react";
import API from "../api/axios";
import { getAdminToken, clearAdminSession } from "../utils/auth";
import { pageVariants, itemVariants, buttonMotion } from "./components/pageMotion";

const DEFAULT_CATEGORIES = [
  "Pain Relief",
  "Antibiotics",
  "Allergy Care",
  "Gastro Care",
  "Diabetes Care",
  "Cardiac Care",
  "Vitamins",
  "Skin Care",
  "Ayurvedic",
  "Baby Care",
  "Wellness",
  "First Aid",
];

const PRESET_BADGES = [
  "Best Seller",
  "10% OFF",
  "20% OFF",
  "Trending",
  "Hot Deal",
  "Doctor Recommended",
  "New Arrival",
];

const formatDateForInput = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().split("T")[0];
};

export default function EditMedicine() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const previewUrlRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    category: "Pain Relief",
    customCategory: "",
    batchNo: "",
    price: "",
    oldPrice: "",
    stock: "",
    lowStockThreshold: "10",
    expiryDate: "",
    prescriptionRequired: false,
    badge: "",
    rating: "4.5",
    description: "",
    image: "",
  });

  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch Medicine Data & Category Options
  useEffect(() => {
    if (!id || id.length !== 24) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    const token = getAdminToken();

    const fetchMedicineData = async () => {
      try {
        setLoading(true);
        setNotFound(false);

        // Fetch medicine by admin endpoint, fallback to public endpoint if needed
        let medData = null;
        try {
          const res = await API.get(`/medicines/admin/${id}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
          medData = res.data?.medicine || res.data;
        } catch (adminFetchErr) {
          const fallbackRes = await API.get(`/medicines/${id}`);
          medData = fallbackRes.data?.medicine || fallbackRes.data;
        }

        if (!medData || !medData._id) {
          setNotFound(true);
          return;
        }

        // Fetch categories
        let fetchedCategories = DEFAULT_CATEGORIES;
        try {
          const catRes = await API.get("/medicines/categories/list");
          const list = (catRes?.data?.categories || [])
            .map((c) => (typeof c === "string" ? c : c?.name))
            .filter((name) => name && name !== "All");

          if (list.length > 0) {
            fetchedCategories = Array.from(new Set([...DEFAULT_CATEGORIES, ...list]));
          }
        } catch (catErr) {
          console.warn("Could not load categories list", catErr);
        }

        const isKnownCat = fetchedCategories.includes(medData.category);
        if (!isKnownCat && medData.category) {
          fetchedCategories = [medData.category, ...fetchedCategories];
        }

        setCategories(fetchedCategories);

        setFormData({
          name: medData.name || "",
          brand: medData.brand || "",
          category: medData.category || "Pain Relief",
          customCategory: "",
          batchNo: medData.batchNo || `BCH${Math.floor(100 + Math.random() * 900)}`,
          price: medData.price !== undefined ? String(medData.price) : "",
          oldPrice: medData.oldPrice !== undefined && medData.oldPrice !== null ? String(medData.oldPrice) : "",
          stock: medData.stock !== undefined ? String(medData.stock) : "",
          lowStockThreshold: medData.lowStockThreshold !== undefined ? String(medData.lowStockThreshold) : "10",
          expiryDate: formatDateForInput(medData.expiryDate),
          prescriptionRequired: Boolean(medData.prescriptionRequired),
          badge: medData.badge || "",
          rating: medData.rating !== undefined ? String(medData.rating) : "4.5",
          description: medData.description || "",
          image: medData.image || "",
        });

        setPreviewImage(medData.image || "");
      } catch (err) {
        console.error("Failed to load medicine for editing:", err);
        if (err.response?.status === 401) {
          clearAdminSession();
          navigate("/admin/login");
          return;
        }
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchMedicineData();
  }, [id, navigate]);

  // Clean up blob URLs
  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (name === "category") {
      if (value === "__custom__") {
        setIsCustomCategory(true);
      } else {
        setIsCustomCategory(false);
      }
    }

    if (name === "image" && !imageFile) {
      setPreviewImage(value);
    }
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }

    if (!file) {
      setImageFile(null);
      setPreviewImage(formData.image || "");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    previewUrlRef.current = objectUrl;
    setImageFile(file);
    setPreviewImage(objectUrl);
  };

  const handleClearImage = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setImageFile(null);
    setPreviewImage("");
    setFormData((prev) => ({ ...prev, image: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const generateNewBatch = () => {
    setFormData((prev) => ({
      ...prev,
      batchNo: `BCH${Math.floor(100 + Math.random() * 900)}`,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    // Validation
    if (!formData.name.trim()) {
      setErrorMessage("Medicine name is required");
      return;
    }

    const finalCategory = isCustomCategory
      ? formData.customCategory.trim()
      : formData.category.trim();

    if (!finalCategory) {
      setErrorMessage("Please select or enter a valid category");
      return;
    }

    if (formData.price === "" || Number(formData.price) <= 0) {
      setErrorMessage("Please enter a valid selling price greater than 0");
      return;
    }

    if (formData.stock === "" || Number(formData.stock) < 0) {
      setErrorMessage("Please enter a valid stock quantity");
      return;
    }

    if (!formData.expiryDate) {
      setErrorMessage("Please select an expiry date");
      return;
    }

    try {
      setSubmitting(true);
      const token = getAdminToken();

      const payload = new FormData();
      payload.append("name", formData.name.trim());
      payload.append("brand", formData.brand.trim());
      payload.append("category", finalCategory);
      payload.append("batchNo", formData.batchNo.trim());
      payload.append("price", String(formData.price).trim());
      if (formData.oldPrice) {
        payload.append("oldPrice", String(formData.oldPrice).trim());
      } else {
        payload.append("oldPrice", "");
      }
      payload.append("stock", String(formData.stock).trim());
      payload.append("lowStockThreshold", String(formData.lowStockThreshold || 10));
      payload.append("expiryDate", formData.expiryDate);
      payload.append("prescriptionRequired", String(formData.prescriptionRequired));
      payload.append("badge", formData.badge.trim());
      payload.append("rating", String(formData.rating || 4.5));
      payload.append("description", formData.description.trim());

      if (imageFile) {
        payload.append("image", imageFile);
      } else if (formData.image?.trim()) {
        payload.append("image", formData.image.trim());
      }

      const res = await API.put(`/medicines/admin/${id}`, payload, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccessMessage(res.data?.message || "Medicine updated successfully!");

      // Update categories if newly added
      if (isCustomCategory && !categories.includes(finalCategory)) {
        setCategories((prev) => [...prev, finalCategory]);
      }

      // Smooth delay before redirecting to Inventory
      setTimeout(() => {
        navigate("/admin/medicines");
      }, 1200);
    } catch (err) {
      console.error("Error updating medicine:", err);
      if (err.response?.status === 401) {
        clearAdminSession();
        navigate("/admin/login");
        return;
      }
      setErrorMessage(
        err.response?.data?.message ||
          "Failed to update medicine. Please verify the details and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Preview Calculations
  const calculatedDiscount =
    formData.oldPrice && Number(formData.oldPrice) > Number(formData.price)
      ? Math.round(
          ((Number(formData.oldPrice) - Number(formData.price)) /
            Number(formData.oldPrice)) *
            100
        )
      : null;

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl rounded-3xl border border-slate-200/80 bg-white p-12 text-center shadow-sm">
        <Loader2 className="mx-auto h-10 w-10 animate-spin text-emerald-600" />
        <h3 className="mt-4 text-lg font-bold text-slate-900">Loading Medicine Details...</h3>
        <p className="text-xs text-slate-500 mt-1">Fetching live inventory record from database.</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="mx-auto max-w-2xl rounded-3xl border border-rose-200 bg-rose-50/70 p-8 text-center shadow-sm space-y-4">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600">
          <AlertCircle size={28} />
        </div>
        <h2 className="text-xl font-bold text-rose-900">Medicine Not Found</h2>
        <p className="text-xs sm:text-sm text-rose-700 max-w-md mx-auto">
          The requested medicine record could not be found or has been removed from inventory.
        </p>
        <div className="pt-2">
          <Link
            to="/admin/medicines"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition shadow-sm"
          >
            <ArrowLeft size={16} /> Return to Inventory List
          </Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="mx-auto max-w-6xl space-y-6 pb-12"
    >
      {/* ── Top Header ── */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-4">
          <Link
            to="/admin/medicines"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900">Edit Medicine</h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                <Sparkles size={12} /> ID: {id?.slice(-6)}
              </span>
            </div>
            <p className="mt-0.5 text-sm text-slate-500">
              Update pricing, stock levels, expiry date, prescription rules, and images.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/medicines"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <Boxes size={16} /> View Inventory
          </Link>
        </div>
      </motion.div>

      {/* ── Status Messages ── */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 text-emerald-800 shadow-sm"
          >
            <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold">{successMessage}</p>
              <p className="text-xs text-emerald-700">
                Changes have been saved to the database. Redirecting to inventory...
              </p>
            </div>
          </motion.div>
        )}

        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800 shadow-sm"
          >
            <AlertCircle className="h-6 w-6 text-rose-600 shrink-0" />
            <p className="text-sm font-semibold">{errorMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Form + Live Preview Grid ── */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left 8 cols: Form Inputs */}
        <div className="space-y-6 lg:col-span-8">
          {/* Section 1: Basic Details */}
          <motion.div
            variants={itemVariants}
            className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-5"
          >
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Pill className="text-emerald-600" size={20} />
              <h2 className="text-base font-bold text-slate-900">1. Basic Information</h2>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Name */}
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Medicine Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Paracetamol 500mg, Amoxicillin 250mg"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 transition"
                />
              </div>

              {/* Brand */}
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Brand / Manufacturer
                </label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-3 text-slate-400" size={16} />
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    placeholder="e.g. Cipla, Sun Pharma, Crocin"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 transition"
                  />
                </div>
              </div>

              {/* Batch Number */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Batch Number
                  </label>
                  <button
                    type="button"
                    onClick={generateNewBatch}
                    className="text-[11px] font-semibold text-emerald-600 hover:underline cursor-pointer"
                  >
                    Auto-Generate
                  </button>
                </div>
                <div className="relative">
                  <Hash className="absolute left-3.5 top-3 text-slate-400" size={16} />
                  <input
                    type="text"
                    name="batchNo"
                    value={formData.batchNo}
                    onChange={handleChange}
                    placeholder="e.g. BCH102"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 transition"
                  />
                </div>
              </div>

              {/* Category */}
              <div className={isCustomCategory ? "sm:col-span-1" : "sm:col-span-2"}>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  name="category"
                  value={isCustomCategory ? "__custom__" : formData.category}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-semibold text-slate-800 focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 transition"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  <option value="__custom__">+ Add Custom Category...</option>
                </select>
              </div>

              {/* Custom Category Input */}
              {isCustomCategory && (
                <div className="sm:col-span-1">
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Enter New Category Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="customCategory"
                    value={formData.customCategory}
                    onChange={handleChange}
                    placeholder="e.g. Orthopedic, Eye Care"
                    required={isCustomCategory}
                    className="w-full rounded-xl border border-emerald-300 bg-emerald-50/30 px-4 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 transition"
                  />
                </div>
              )}
            </div>
          </motion.div>

          {/* Section 2: Pricing & Stock */}
          <motion.div
            variants={itemVariants}
            className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-5"
          >
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <IndianRupee className="text-emerald-600" size={20} />
              <h2 className="text-base font-bold text-slate-900">2. Pricing & Stock</h2>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Selling Price */}
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Selling Price (₹) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-sm font-bold text-slate-500">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="0.00"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-8 pr-4 py-2.5 text-sm font-bold text-slate-800 placeholder-slate-400 focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 transition"
                  />
                </div>
              </div>

              {/* Old Price / MRP */}
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
                  MRP / Old Price (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-sm font-bold text-slate-500">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name="oldPrice"
                    value={formData.oldPrice}
                    onChange={handleChange}
                    placeholder="Optional"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-8 pr-4 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 transition"
                  />
                </div>
              </div>

              {/* Stock */}
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Stock Units <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Boxes className="absolute left-3.5 top-3 text-slate-400" size={16} />
                  <input
                    type="number"
                    min="0"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    placeholder="e.g. 100"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-sm font-bold text-slate-800 placeholder-slate-400 focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 transition"
                  />
                </div>
              </div>

              {/* Low Stock Threshold */}
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Low Stock Alert
                </label>
                <input
                  type="number"
                  min="0"
                  name="lowStockThreshold"
                  value={formData.lowStockThreshold}
                  onChange={handleChange}
                  placeholder="10"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 transition"
                />
              </div>
            </div>
          </motion.div>

          {/* Section 3: Attributes & Safety */}
          <motion.div
            variants={itemVariants}
            className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-5"
          >
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <CalendarDays className="text-emerald-600" size={20} />
              <h2 className="text-base font-bold text-slate-900">3. Expiry, Prescription & Badges</h2>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {/* Expiry Date */}
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Expiry Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-medium text-slate-800 focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 transition"
                />
              </div>

              {/* Promotional Badge */}
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Product Badge
                </label>
                <input
                  type="text"
                  name="badge"
                  list="badge-options"
                  value={formData.badge}
                  onChange={handleChange}
                  placeholder="e.g. Best Seller, 15% OFF"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 transition"
                />
                <datalist id="badge-options">
                  {PRESET_BADGES.map((b) => (
                    <option key={b} value={b} />
                  ))}
                </datalist>
              </div>

              {/* Initial Rating */}
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Customer Rating (1 - 5)
                </label>
                <div className="relative">
                  <Star className="absolute left-3.5 top-3 text-amber-400 fill-amber-400" size={16} />
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    name="rating"
                    value={formData.rating}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-sm font-semibold text-slate-800 focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 transition"
                  />
                </div>
              </div>
            </div>

            {/* Prescription Toggle */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    formData.prescriptionRequired
                      ? "bg-amber-100 text-amber-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {formData.prescriptionRequired ? <ShieldAlert size={20} /> : <ShieldCheck size={20} />}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {formData.prescriptionRequired
                      ? "Rx Prescription Required"
                      : "Over-the-Counter (OTC)"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formData.prescriptionRequired
                      ? "Customers will be prompted to upload a doctor prescription at checkout."
                      : "Customers can purchase this item directly without a prescription."}
                  </p>
                </div>
              </div>

              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  name="prescriptionRequired"
                  checked={formData.prescriptionRequired}
                  onChange={handleChange}
                  className="peer sr-only"
                />
                <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-600 peer-checked:after:translate-x-full peer-focus:outline-none"></div>
              </label>
            </div>
          </motion.div>

          {/* Section 4: Image & Description */}
          <motion.div
            variants={itemVariants}
            className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-5"
          >
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <ImagePlus className="text-emerald-600" size={20} />
              <h2 className="text-base font-bold text-slate-900">4. Product Image & Description</h2>
            </div>

            {/* Image Upload or URL */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Upload New Image File
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2 text-xs text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-900 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-slate-800 transition"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Or Image Web URL
                </label>
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="https://example.com/images/medicine.png"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 transition"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
                Description / Usage Instructions
              </label>
              <textarea
                rows={4}
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Provide details about active ingredients, dosage indications, benefits, precautions..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 transition"
              />
            </div>
          </motion.div>

          {/* Submit Button Bar */}
          <motion.div variants={itemVariants} className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate("/admin/medicines")}
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <motion.button
              {...buttonMotion}
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Updating Database...
                </>
              ) : (
                <>
                  <Save size={18} /> Save & Update Medicine
                </>
              )}
            </motion.button>
          </motion.div>
        </div>

        {/* Right 4 cols: Live Store Card Preview */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Eye size={14} className="text-emerald-600" /> Live Store Preview
              </h3>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                Interactive
              </span>
            </div>

            <motion.div
              variants={itemVariants}
              className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xl shadow-slate-200/50"
            >
              {/* Image Preview Container */}
              <div className="relative aspect-square w-full bg-slate-100/70 p-6 flex items-center justify-center border-b border-slate-100">
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt={formData.name || "Preview"}
                    className="max-h-full max-w-full object-contain transition-transform duration-300 hover:scale-105"
                    onError={() => setPreviewImage("/images/healthcare.png")}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <PackageSearch size={48} className="stroke-[1.2]" />
                    <span className="mt-2 text-xs font-medium">No Image Provided</span>
                  </div>
                )}

                {/* Top Badges */}
                <div className="absolute top-3.5 left-3.5 flex flex-col gap-1.5">
                  {formData.badge && (
                    <span className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-sm">
                      {formData.badge}
                    </span>
                  )}
                  {calculatedDiscount && (
                    <span className="rounded-lg bg-rose-500 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-sm">
                      {calculatedDiscount}% OFF
                    </span>
                  )}
                </div>

                {formData.prescriptionRequired && (
                  <span className="absolute top-3.5 right-3.5 rounded-lg bg-amber-500 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-sm flex items-center gap-1">
                    <ShieldAlert size={11} /> Rx Required
                  </span>
                )}
              </div>

              {/* Card Details Body */}
              <div className="p-5 space-y-3.5">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span className="font-semibold uppercase text-emerald-700 tracking-wider">
                      {isCustomCategory
                        ? formData.customCategory || "Category"
                        : formData.category}
                    </span>
                    {formData.brand && (
                      <span className="font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                        {formData.brand}
                      </span>
                    )}
                  </div>
                  <h4 className="text-base font-extrabold text-slate-900 line-clamp-1">
                    {formData.name || "Medicine Title"}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                    {formData.description || "Active clinical formulation and dosage directions."}
                  </p>
                </div>

                {/* Rating & Expiry Strip */}
                <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1 font-bold text-slate-800">
                    <Star size={13} className="text-amber-400 fill-amber-400" />
                    <span>{formData.rating || "4.5"}</span>
                    <span className="text-slate-400 font-normal">(Verified)</span>
                  </div>

                  <div className="text-[11px] font-medium text-slate-500">
                    Exp: {formData.expiryDate || "YYYY-MM-DD"}
                  </div>
                </div>

                {/* Price & Stock Pill */}
                <div className="flex items-end justify-between pt-1">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 block uppercase">
                      Selling Price
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-black text-slate-900">
                        ₹{formData.price || "0"}
                      </span>
                      {formData.oldPrice && Number(formData.oldPrice) > Number(formData.price) && (
                        <span className="text-xs font-semibold text-slate-400 line-through">
                          ₹{formData.oldPrice}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                        Number(formData.stock) > 0
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          Number(formData.stock) > 0 ? "bg-emerald-500" : "bg-rose-500"
                        }`}
                      />
                      {Number(formData.stock) > 0
                        ? `${formData.stock} in Stock`
                        : "Out of Stock"}
                    </span>
                  </div>
                </div>

                {/* Batch No & Low stock alert */}
                <div className="rounded-xl bg-slate-50 p-2.5 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Batch: <strong className="text-slate-700">{formData.batchNo || "N/A"}</strong></span>
                  <span>Alert at: <strong className="text-slate-700">&lt; {formData.lowStockThreshold || 10} units</strong></span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </form>
    </motion.div>
  );
}