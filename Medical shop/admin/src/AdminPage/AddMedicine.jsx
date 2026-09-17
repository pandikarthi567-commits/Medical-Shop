import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Plus,
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

export default function AddMedicine() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const previewUrlRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    category: "Pain Relief",
    customCategory: "",
    batchNo: `BCH${Math.floor(100 + Math.random() * 900)}`,
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
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Set default expiry date to 1 year from today
  useEffect(() => {
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    const yyyy = nextYear.getFullYear();
    const mm = String(nextYear.getMonth() + 1).padStart(2, "0");
    const dd = String(nextYear.getDate()).padStart(2, "0");
    setFormData((prev) => ({ ...prev, expiryDate: `${yyyy}-${mm}-${dd}` }));
  }, []);

  // Fetch Categories from Backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const { data } = await API.get("/medicines/categories/list");
        const list = (data?.categories || [])
          .map((c) => (typeof c === "string" ? c : c?.name))
          .filter((name) => name && name !== "All");

        if (list.length > 0) {
          const combined = Array.from(new Set([...DEFAULT_CATEGORIES, ...list]));
          setCategories(combined);
        }
      } catch (err) {
        console.warn("Could not fetch categories from server, using defaults", err);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

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

    // Validate Required Fields
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

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(formData.expiryDate) <= today) {
      setErrorMessage("Expiry date must be in the future");
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
      } else if (formData.image.trim()) {
        payload.append("image", formData.image.trim());
      }

      const res = await API.post("/medicines/admin/add", payload, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccessMessage(res.data?.message || "Medicine successfully added to inventory!");

      // Update categories if newly added
      if (isCustomCategory && !categories.includes(finalCategory)) {
        setCategories((prev) => [...prev, finalCategory]);
      }
    } catch (err) {
      console.error("Error adding medicine:", err);
      if (err.response?.status === 401) {
        clearAdminSession();
        navigate("/admin/login");
        return;
      }
      setErrorMessage(
        err.response?.data?.message ||
          "Failed to add medicine. Please verify the details and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetForm = () => {
    handleClearImage();
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    const yyyy = nextYear.getFullYear();
    const mm = String(nextYear.getMonth() + 1).padStart(2, "0");
    const dd = String(nextYear.getDate()).padStart(2, "0");

    setFormData({
      name: "",
      brand: "",
      category: "Pain Relief",
      customCategory: "",
      batchNo: `BCH${Math.floor(100 + Math.random() * 900)}`,
      price: "",
      oldPrice: "",
      stock: "",
      lowStockThreshold: "10",
      expiryDate: `${yyyy}-${mm}-${dd}`,
      prescriptionRequired: false,
      badge: "",
      rating: "4.5",
      description: "",
      image: "",
    });
    setIsCustomCategory(false);
    setSuccessMessage("");
    setErrorMessage("");
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
              <h1 className="text-2xl font-black text-slate-900">Add New Medicine</h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                <Sparkles size={12} /> Live Sync
              </span>
            </div>
            <p className="mt-0.5 text-sm text-slate-500">
              Add medicine details to save in database and show across the store catalog.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleResetForm}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <RefreshCw size={15} /> Reset Form
          </button>
          <Link
            to="/admin/medicines"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition"
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
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 text-emerald-800 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold">{successMessage}</p>
                <p className="text-xs text-emerald-700">
                  Data has been saved to the database and is immediately live on the client side.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetForm}
                className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-emerald-700 shadow-xs hover:bg-emerald-100 transition"
              >
                + Add Another
              </button>
              <button
                type="button"
                onClick={() => navigate("/admin/medicines")}
                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition"
              >
                Go to Inventory
              </button>
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
              <Pill className="text-[#00a884]" size={20} />
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
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:border-[#00a884] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00a884]/20 transition"
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
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:border-[#00a884] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00a884]/20 transition"
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
                    className="text-[11px] font-semibold text-[#00a884] hover:underline"
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
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:border-[#00a884] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00a884]/20 transition"
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
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-semibold text-slate-800 focus:border-[#00a884] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00a884]/20 transition"
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
                    className="w-full rounded-xl border border-emerald-300 bg-emerald-50/30 px-4 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:border-[#00a884] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00a884]/20 transition"
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
              <IndianRupee className="text-[#00a884]" size={20} />
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
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-8 pr-4 py-2.5 text-sm font-bold text-slate-800 placeholder-slate-400 focus:border-[#00a884] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00a884]/20 transition"
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
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-8 pr-4 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:border-[#00a884] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00a884]/20 transition"
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
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-sm font-bold text-slate-800 placeholder-slate-400 focus:border-[#00a884] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00a884]/20 transition"
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
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:border-[#00a884] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00a884]/20 transition"
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
              <CalendarDays className="text-[#00a884]" size={20} />
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
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-medium text-slate-800 focus:border-[#00a884] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00a884]/20 transition"
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
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:border-[#00a884] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00a884]/20 transition"
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
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-sm font-semibold text-slate-800 focus:border-[#00a884] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00a884]/20 transition"
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
                <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#00a884] peer-checked:after:translate-x-full peer-focus:outline-none"></div>
              </label>
            </div>
          </motion.div>

          {/* Section 4: Image & Description */}
          <motion.div
            variants={itemVariants}
            className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-5"
          >
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <ImagePlus className="text-[#00a884]" size={20} />
              <h2 className="text-base font-bold text-slate-900">4. Product Image & Description</h2>
            </div>

            {/* Image Upload or URL */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Upload Image File
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
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:border-[#00a884] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00a884]/20 transition"
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
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:border-[#00a884] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00a884]/20 transition"
              />
            </div>
          </motion.div>

          {/* Submit Button Bar */}
          <motion.div variants={itemVariants} className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate("/admin/medicines")}
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <motion.button
              {...buttonMotion}
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-[#00a884] hover:bg-[#009272] px-7 py-3 text-sm font-bold text-white shadow-md disabled:opacity-50 transition cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Saving to Database...
                </>
              ) : (
                <>
                  <Plus size={18} strokeWidth={2.5} />
                  Save & Publish Medicine
                </>
              )}
            </motion.button>
          </motion.div>
        </div>

        {/* Right 4 cols: Live Preview Card */}
        <div className="space-y-6 lg:col-span-4">
          <motion.div
            variants={itemVariants}
            className="sticky top-6 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Eye size={16} className="text-[#00a884]" />
                <h3>Live Store Card Preview</h3>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
                Customer View
              </span>
            </div>

            {/* Rendered Preview Card resembling Client Store */}
            <div className="group overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm transition hover:shadow-md">
              <div className="relative p-5">
                {/* Badge */}
                {(formData.badge || calculatedDiscount) && (
                  <div className="absolute left-4 top-4 z-10 flex flex-col gap-1">
                    {formData.badge && (
                      <span className="inline-flex items-center rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-bold text-rose-600 border border-rose-100 shadow-xs">
                        {formData.badge}
                      </span>
                    )}
                    {calculatedDiscount && !formData.badge && (
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-100 shadow-xs">
                        {calculatedDiscount}% OFF
                      </span>
                    )}
                  </div>
                )}

                {/* Prescription requirement badge */}
                {formData.prescriptionRequired && (
                  <div className="absolute right-4 top-4 z-10">
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200">
                      Rx
                    </span>
                  </div>
                )}

                {/* Image Container */}
                <div className="flex h-44 w-full items-center justify-center rounded-2xl bg-slate-50 overflow-hidden p-3 mt-4">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="h-full w-full object-contain mix-blend-multiply"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/images/healthcare.png";
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <PackageSearch size={40} className="stroke-[1.5]" />
                      <span className="mt-1 text-xs font-medium">Image Preview</span>
                    </div>
                  )}
                </div>

                {/* Body details */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                      {isCustomCategory
                        ? formData.customCategory || "Category"
                        : formData.category || "Category"}
                    </span>
                    <div className="flex items-center gap-1 text-xs font-bold text-slate-700">
                      <Star size={13} className="text-amber-400 fill-amber-400" />
                      <span>{formData.rating || "4.5"}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 line-clamp-1">
                      {formData.name || "Medicine Title Name"}
                    </h4>
                    {formData.brand && (
                      <p className="text-xs text-slate-500 font-medium">{formData.brand}</p>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2">
                    {formData.description ||
                      "Short descriptive text about medicinal uses, directions, and health benefits..."}
                  </p>

                  <div className="pt-2 flex items-baseline justify-between border-t border-slate-100">
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-black text-slate-900">
                        ₹{formData.price ? Number(formData.price).toFixed(2) : "0.00"}
                      </span>
                      {formData.oldPrice && Number(formData.oldPrice) > Number(formData.price) && (
                        <span className="text-xs font-semibold text-slate-400 line-through">
                          ₹{Number(formData.oldPrice).toFixed(2)}
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-xs font-bold ${
                        Number(formData.stock) > 0 ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {Number(formData.stock) > 0
                        ? `In Stock (${formData.stock || 0})`
                        : "Out of Stock"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Metadata Recap */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span className="font-medium">Batch:</span>
                <span className="font-bold text-slate-900">{formData.batchNo}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span className="font-medium">Expiry:</span>
                <span className="font-bold text-slate-900">
                  {formData.expiryDate || "Not set"}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span className="font-medium">Threshold:</span>
                <span className="font-bold text-slate-900">
                  {formData.lowStockThreshold || 10} units
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </form>
    </motion.div>
  );
}
