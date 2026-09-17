import React, { useEffect, useMemo, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  RotateCcw,
  Eye,
  Pencil,
  Trash2,
  X,
  AlertCircle,
  Loader2,
  LayoutGrid,
  List,
  Pill,
  ShieldCheck,
  ShieldAlert,
  Star,
  CheckCircle2,
  Boxes,
  CalendarDays,
  IndianRupee,
  Building,
  Hash,
  ArrowUpDown,
  Filter,
  PackageSearch,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  RefreshCw,
} from "lucide-react";
import API from "../api/axios";
import { clearAdminSession, getAdminToken } from "../utils/auth";
import { formatImageUrl } from "../utils/imageUrl";
import {
  pageVariants,
  containerVariants,
  itemVariants,
  buttonMotion,
  modalVariants,
  tableRowVariants,
} from "./components/pageMotion";

const formatDate = (dateVal) => {
  if (!dateVal) return "N/A";
  const d = new Date(dateVal);
  if (Number.isNaN(d.getTime())) return "N/A";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateForInput = (dateVal) => {
  if (!dateVal) return "";
  const d = new Date(dateVal);
  if (Number.isNaN(d.getTime())) return "";
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split("T")[0];
};

export default function ManageMedicinesPage() {
  const navigate = useNavigate();

  // State
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  // Filters & Controls
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [stockFilter, setStockFilter] = useState("All");
  const [prescriptionFilter, setPrescriptionFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'grid'

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals
  const [viewModalItem, setViewModalItem] = useState(null);
  const [editModalItem, setEditModalItem] = useState(null);
  const [deleteModalItem, setDeleteModalItem] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Edit Form State
  const [editForm, setEditForm] = useState({
    name: "",
    brand: "",
    category: "",
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
  const [editImageFile, setEditImageFile] = useState(null);
  const [editPreviewImage, setEditPreviewImage] = useState("");
  const fileInputRef = useRef(null);

  // Fetch all medicines from DB
  const fetchMedicines = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError("");

      const token = getAdminToken();
      const res = await API.get("/medicines/admin/all", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
        .catch(() => API.get("/medicines/all"))
        .catch(() => API.get("/medicines"));

      const rawData =
        res.data?.medicines ||
        res.data?.data ||
        (Array.isArray(res.data) ? res.data : []);

      const cleanData = rawData.filter((m) => {
        const name = (m.name || "").toLowerCase();
        return !name.includes("(batch ") && !m.batchNo?.toLowerCase().startsWith("bch1");
      });

      setMedicines(cleanData);
    } catch (err) {
      console.error("Fetch medicines error:", err);
      if (err.response?.status === 401) {
        clearAdminSession();
        navigate("/admin/login");
        return;
      }
      setError("Failed to fetch medicines from database.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  // Show toast utility
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 4000);
  };

  // Categories list
  const categoriesList = useMemo(() => {
    const set = new Set(medicines.map((m) => m.category).filter(Boolean));
    return ["All", ...Array.from(set).sort()];
  }, [medicines]);

  // Statistics
  const stats = useMemo(() => {
    const total = medicines.length;
    const inStock = medicines.filter((m) => Number(m.stock) > 0).length;
    const lowStock = medicines.filter(
      (m) => Number(m.stock) > 0 && Number(m.stock) <= (m.lowStockThreshold || 10)
    ).length;
    const outOfStock = medicines.filter((m) => Number(m.stock) <= 0).length;
    const prescriptionCount = medicines.filter((m) => m.prescriptionRequired).length;

    return { total, inStock, lowStock, outOfStock, prescriptionCount };
  }, [medicines]);

  // Filtered & Sorted list
  const filteredMedicines = useMemo(() => {
    return medicines
      .filter((med) => {
        // Search
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchName = med.name?.toLowerCase().includes(q);
          const matchBrand = med.brand?.toLowerCase().includes(q);
          const matchCat = med.category?.toLowerCase().includes(q);
          const matchBatch = med.batchNo?.toLowerCase().includes(q);
          if (!matchName && !matchBrand && !matchCat && !matchBatch) return false;
        }

        // Category
        if (selectedCategory !== "All" && med.category !== selectedCategory) {
          return false;
        }

        // Stock filter
        if (stockFilter === "inStock" && Number(med.stock) <= 0) return false;
        if (
          stockFilter === "lowStock" &&
          (Number(med.stock) <= 0 || Number(med.stock) > (med.lowStockThreshold || 10))
        )
          return false;
        if (stockFilter === "outOfStock" && Number(med.stock) > 0) return false;

        // Prescription filter
        if (prescriptionFilter === "rx" && !med.prescriptionRequired) return false;
        if (prescriptionFilter === "otc" && med.prescriptionRequired) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "newest") return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        if (sortBy === "name-asc") return (a.name || "").localeCompare(b.name || "");
        if (sortBy === "name-desc") return (b.name || "").localeCompare(a.name || "");
        if (sortBy === "price-low") return Number(a.price) - Number(b.price);
        if (sortBy === "price-high") return Number(b.price) - Number(a.price);
        if (sortBy === "stock-low") return Number(a.stock) - Number(b.stock);
        if (sortBy === "stock-high") return Number(b.stock) - Number(a.stock);
        if (sortBy === "expiry") return new Date(a.expiryDate || 0) - new Date(b.expiryDate || 0);
        return 0;
      });
  }, [medicines, searchTerm, selectedCategory, stockFilter, prescriptionFilter, sortBy]);

  // Pagination slice
  const totalPages = Math.ceil(filteredMedicines.length / pageSize) || 1;
  const paginatedMedicines = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredMedicines.slice(start, start + pageSize);
  }, [filteredMedicines, currentPage, pageSize]);

  // Handle Edit Click
  const handleOpenEdit = (medicine) => {
    setEditModalItem(medicine);
    setEditForm({
      name: medicine.name || "",
      brand: medicine.brand || "",
      category: medicine.category || "",
      batchNo: medicine.batchNo || "",
      price: medicine.price ?? "",
      oldPrice: medicine.oldPrice ?? "",
      stock: medicine.stock ?? "",
      lowStockThreshold: medicine.lowStockThreshold ?? "10",
      expiryDate: formatDateForInput(medicine.expiryDate),
      prescriptionRequired: Boolean(medicine.prescriptionRequired),
      badge: medicine.badge || "",
      rating: String(medicine.rating ?? "4.5"),
      description: medicine.description || "",
      image: medicine.image || "",
    });
    setEditImageFile(null);
    setEditPreviewImage(medicine.image || "");
  };

  // Submit Edit
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editModalItem) return;

    try {
      setSavingEdit(true);
      const token = getAdminToken();

      const payload = new FormData();
      payload.append("name", editForm.name.trim());
      payload.append("brand", editForm.brand.trim());
      payload.append("category", editForm.category.trim());
      payload.append("batchNo", editForm.batchNo.trim());
      payload.append("price", String(editForm.price));
      if (editForm.oldPrice !== "") {
        payload.append("oldPrice", String(editForm.oldPrice));
      }
      payload.append("stock", String(editForm.stock));
      payload.append("lowStockThreshold", String(editForm.lowStockThreshold));
      payload.append("expiryDate", editForm.expiryDate);
      payload.append("prescriptionRequired", String(editForm.prescriptionRequired));
      payload.append("badge", editForm.badge.trim());
      payload.append("rating", String(editForm.rating));
      payload.append("description", editForm.description.trim());

      if (editImageFile) {
        payload.append("image", editImageFile);
      } else if (editForm.image.trim()) {
        payload.append("image", editForm.image.trim());
      }

      const res = await API.put(`/medicines/admin/${editModalItem._id}`, payload, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
          "Content-Type": "multipart/form-data",
        },
      });

      const updated = res.data?.medicine || { ...editModalItem, ...editForm };

      // Update local state
      setMedicines((prev) =>
        prev.map((m) => (m._id === editModalItem._id ? { ...m, ...updated } : m))
      );

      showToast(`Medicine "${editForm.name}" updated successfully!`);
      setEditModalItem(null);
    } catch (err) {
      console.error("Save edit error:", err);
      alert(err.response?.data?.message || "Failed to update medicine.");
    } finally {
      setSavingEdit(false);
    }
  };

  // Handle Delete Confirmation
  const handleConfirmDelete = async () => {
    if (!deleteModalItem) return;

    try {
      setDeleting(true);
      const token = getAdminToken();

      await API.delete(`/medicines/admin/${deleteModalItem._id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      setMedicines((prev) => prev.filter((m) => m._id !== deleteModalItem._id));
      showToast(`Medicine "${deleteModalItem.name}" deleted from database.`);
      setDeleteModalItem(null);
    } catch (err) {
      console.error("Delete error:", err);
      alert(err.response?.data?.message || "Failed to delete medicine.");
    } finally {
      setDeleting(false);
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setStockFilter("All");
    setPrescriptionFilter("All");
    setSortBy("newest");
    setCurrentPage(1);
  };

  const handleClearAll = async () => {
    if (
      !window.confirm(
        "Are you sure you want to remove ALL old medicines from the database? This will leave the database completely empty until you add new medicines."
      )
    ) {
      return;
    }
    try {
      const token = getAdminToken();
      await API.delete("/medicines/admin/clear-all", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setMedicines([]);
      showToast("All old medicines deleted from database.");
    } catch (err) {
      console.error(err);
      alert("Failed to clear medicines.");
    }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6 pb-12"
    >
      {/* ── Toast Notification ── */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-900 text-white px-5 py-3.5 shadow-2xl"
          >
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <p className="text-sm font-semibold">{toastMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 1. Header & Quick Actions ── */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900">Manage Medicines</h1>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
              {medicines.length} Total in DB
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            View live medicines database, modify details, update inventory stock, and remove items.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {medicines.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-rose-700 transition"
              title="Delete all old medicines from DB"
            >
              <Trash2 size={14} />
              <span>Clear Old Data</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => fetchMedicines(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs"
          >
            <RefreshCw size={15} className={refreshing ? "animate-spin text-[#00a884]" : ""} />
            <span>{refreshing ? "Syncing..." : "Refresh"}</span>
          </button>

          <motion.div {...buttonMotion}>
            <Link
              to="/admin/medicines/add"
              className="inline-flex items-center gap-2 rounded-xl bg-[#00a884] hover:bg-[#009272] px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md transition"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>+ Add Medicine</span>
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* ── 2. Summary KPI Cards ── */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <Pill size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Medicines</p>
            <h3 className="text-xl font-black text-slate-900">{stats.total}</h3>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
            <Boxes size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">In Stock</p>
            <h3 className="text-xl font-black text-slate-900">{stats.inStock}</h3>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Low Stock (&le;10)</p>
            <h3 className="text-xl font-black text-amber-600">{stats.lowStock}</h3>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <ShieldAlert size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Rx Required</p>
            <h3 className="text-xl font-black text-blue-600">{stats.prescriptionCount}</h3>
          </div>
        </div>
      </motion.div>

      {/* ── 3. Filters & Search Bar Card ── */}
      <motion.div
        variants={itemVariants}
        className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm sm:text-base">
            <Filter size={18} className="text-[#00a884]" />
            <span>Search & Filter Catalog</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
            >
              <RotateCcw size={13} /> Reset Filters
            </button>

            {/* View Mode Switcher */}
            <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs transition ${
                  viewMode === "table"
                    ? "bg-white text-slate-900 shadow-xs font-bold"
                    : "text-slate-500 hover:text-slate-900"
                }`}
                title="Table View"
              >
                <List size={16} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs transition ${
                  viewMode === "grid"
                    ? "bg-white text-slate-900 shadow-xs font-bold"
                    : "text-slate-500 hover:text-slate-900"
                }`}
                title="Grid View"
              >
                <LayoutGrid size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {/* Search Box */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by name, brand, category, batch..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 focus:border-[#00a884] focus:bg-white focus:outline-none transition"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 focus:border-[#00a884] focus:bg-white focus:outline-none transition"
            >
              {categoriesList.map((cat) => (
                <option key={cat} value={cat}>
                  Category: {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Filter */}
          <div>
            <select
              value={stockFilter}
              onChange={(e) => {
                setStockFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 focus:border-[#00a884] focus:bg-white focus:outline-none transition"
            >
              <option value="All">All Stock Levels</option>
              <option value="inStock">In Stock (&gt; 0)</option>
              <option value="lowStock">Low Stock Alert (&le; 10)</option>
              <option value="outOfStock">Out of Stock (0)</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 focus:border-[#00a884] focus:bg-white focus:outline-none transition"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="stock-low">Stock: Low to High</option>
              <option value="stock-high">Stock: High to Low</option>
              <option value="expiry">Expiry: Earliest First</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* ── 4. Main Content: Table or Grid View ── */}
      {loading ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8">
          <Loader2 className="animate-spin text-[#00a884]" size={36} />
          <p className="mt-3 text-sm font-semibold text-slate-600">Loading medicines from database...</p>
        </div>
      ) : filteredMedicines.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <PackageSearch size={48} className="text-slate-300" />
          <h3 className="mt-3 text-base font-bold text-slate-800">No medicines found</h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm">
            {searchTerm || selectedCategory !== "All" || stockFilter !== "All"
              ? "No medicines match the selected search criteria. Try adjusting your filters."
              : "Your database doesn't have any medicines yet. Click '+ Add Medicine' to get started."}
          </p>
          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={resetFilters}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Clear Filters
            </button>
            <Link
              to="/admin/medicines/add"
              className="rounded-xl bg-[#00a884] px-4 py-2 text-xs font-bold text-white hover:bg-[#009272] transition"
            >
              + Add First Medicine
            </Link>
          </div>
        </div>
      ) : viewMode === "table" ? (
        /* ── TABLE VIEW ── */
        <motion.div
          variants={itemVariants}
          className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="border-b border-slate-200/80 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3.5 pl-6 pr-3">Medicine</th>
                  <th className="px-3 py-3.5">Category</th>
                  <th className="px-3 py-3.5">Batch / Expiry</th>
                  <th className="px-3 py-3.5">Selling Price</th>
                  <th className="px-3 py-3.5">Stock Level</th>
                  <th className="px-3 py-3.5">Type</th>
                  <th className="py-3.5 pl-3 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {paginatedMedicines.map((med) => {
                  const isLow = Number(med.stock) > 0 && Number(med.stock) <= (med.lowStockThreshold || 10);
                  const isOut = Number(med.stock) <= 0;
                  const imgSrc = formatImageUrl(med.image, "/images/placeholder.png");

                  return (
                    <motion.tr
                      key={med._id}
                      variants={tableRowVariants}
                      className="hover:bg-slate-50/60 transition"
                    >
                      {/* Name & Image */}
                      <td className="py-4 pl-6 pr-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 overflow-hidden border border-slate-200/70 p-1">
                            <img
                              src={imgSrc}
                              alt={med.name}
                              onError={(e) => {
                                e.currentTarget.src = "/images/placeholder.png";
                              }}
                              className="h-full w-full object-contain mix-blend-multiply"
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">{med.name}</span>
                              {med.badge && (
                                <span className="inline-flex rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-600 border border-rose-100">
                                  {med.badge}
                                </span>
                              )}
                            </div>
                            {med.brand && (
                              <p className="text-[11px] text-slate-400 font-medium">
                                By {med.brand}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-3 py-4">
                        <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-100">
                          {med.category || "General"}
                        </span>
                      </td>

                      {/* Batch & Expiry */}
                      <td className="px-3 py-4">
                        <p className="font-mono text-xs font-bold text-slate-800">
                          {med.batchNo || "BCH001"}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Exp: {formatDate(med.expiryDate)}
                        </p>
                      </td>

                      {/* Price */}
                      <td className="px-3 py-4">
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-bold text-slate-900">
                            ₹{Number(med.price || 0).toFixed(2)}
                          </span>
                          {med.oldPrice && Number(med.oldPrice) > Number(med.price) && (
                            <span className="text-[11px] text-slate-400 line-through">
                              ₹{Number(med.oldPrice).toFixed(2)}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Stock */}
                      <td className="px-3 py-4">
                        <div>
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                              isOut
                                ? "bg-rose-50 text-rose-700 border border-rose-200"
                                : isLow
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                isOut
                                  ? "bg-rose-500"
                                  : isLow
                                  ? "bg-amber-500"
                                  : "bg-emerald-500"
                              }`}
                            />
                            {isOut
                              ? "Out of Stock"
                              : isLow
                              ? `Low Stock (${med.stock})`
                              : `In Stock (${med.stock})`}
                          </span>
                        </div>
                      </td>

                      {/* Type Rx / OTC */}
                      <td className="px-3 py-4">
                        {med.prescriptionRequired ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700">
                            <ShieldAlert size={14} /> Rx Required
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500">
                            <ShieldCheck size={14} className="text-emerald-600" /> OTC
                          </span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-4 pl-3 pr-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View */}
                          <button
                            type="button"
                            onClick={() => setViewModalItem(med)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>

                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(med)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-emerald-600 hover:bg-emerald-50 transition"
                            title="Edit Medicine"
                          >
                            <Pencil size={16} />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => setDeleteModalItem(med)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-rose-500 hover:bg-rose-50 transition"
                            title="Delete Medicine"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-slate-200/80 bg-slate-50/50 p-4 text-xs font-semibold text-slate-600">
            <div>
              Showing{" "}
              <span className="font-bold text-slate-900">
                {(currentPage - 1) * pageSize + 1}
              </span>{" "}
              to{" "}
              <span className="font-bold text-slate-900">
                {Math.min(currentPage * pageSize, filteredMedicines.length)}
              </span>{" "}
              of <span className="font-bold text-slate-900">{filteredMedicines.length}</span>{" "}
              medicines
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-slate-700 disabled:opacity-40 hover:bg-slate-100 transition"
              >
                <ChevronLeft size={14} /> Prev
              </button>

              <span className="px-2">
                Page {currentPage} of {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-slate-700 disabled:opacity-40 hover:bg-slate-100 transition"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </motion.div>
      ) : (
        /* ── GRID VIEW ── */
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        >
          {paginatedMedicines.map((med) => {
            const isLow = Number(med.stock) > 0 && Number(med.stock) <= (med.lowStockThreshold || 10);
            const isOut = Number(med.stock) <= 0;
            const imgSrc = formatImageUrl(med.image, "/images/placeholder.png");

            return (
              <motion.div
                key={med._id}
                variants={itemVariants}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-xs hover:shadow-md transition"
              >
                <div>
                  {/* Top Bar: Category + Type */}
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                      {med.category || "General"}
                    </span>
                    {med.prescriptionRequired && (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200">
                        Rx
                      </span>
                    )}
                  </div>

                  {/* Image */}
                  <div className="my-3 flex h-32 w-full items-center justify-center rounded-xl bg-slate-50 p-2 overflow-hidden">
                    <img
                      src={imgSrc}
                      alt={med.name}
                      onError={(e) => {
                        e.currentTarget.src = "/images/placeholder.png";
                      }}
                      className="h-full w-full object-contain mix-blend-multiply group-hover:scale-105 transition"
                    />
                  </div>

                  {/* Name & Brand */}
                  <h4 className="font-bold text-slate-900 line-clamp-1">{med.name}</h4>
                  {med.brand && (
                    <p className="text-xs text-slate-400 font-medium">By {med.brand}</p>
                  )}

                  {/* Pricing & Stock */}
                  <div className="mt-3 flex items-baseline justify-between">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-base font-black text-slate-900">
                        ₹{Number(med.price || 0).toFixed(2)}
                      </span>
                      {med.oldPrice && (
                        <span className="text-xs text-slate-400 line-through">
                          ₹{Number(med.oldPrice).toFixed(2)}
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-xs font-bold ${
                        isOut ? "text-rose-600" : isLow ? "text-amber-600" : "text-emerald-600"
                      }`}
                    >
                      {isOut ? "Out of Stock" : `${med.stock} units`}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="text-[11px] text-slate-400">
                    Exp: {formatDate(med.expiryDate)}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setViewModalItem(med)}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition"
                      title="View"
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(med)}
                      className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50 transition"
                      title="Edit"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteModalItem(med)}
                      className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 transition"
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* ── VIEW DETAILS MODAL ── */}
      <AnimatePresence>
        {viewModalItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
            <motion.div
              variants={modalVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 p-5">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-base">
                  <Pill className="text-[#00a884]" size={20} />
                  <span>Medicine Details</span>
                </div>
                <button
                  type="button"
                  onClick={() => setViewModalItem(null)}
                  className="rounded-xl p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
                <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start">
                  <div className="flex h-36 w-36 shrink-0 items-center justify-center rounded-2xl bg-slate-50 border border-slate-200/80 p-3">
                    <img
                      src={formatImageUrl(viewModalItem.image, "/images/placeholder.png")}
                      alt={viewModalItem.name}
                      onError={(e) => {
                        e.currentTarget.src = "/images/placeholder.png";
                      }}
                      className="h-full w-full object-contain mix-blend-multiply"
                    />
                  </div>

                  <div className="space-y-2 text-center sm:text-left flex-1">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <span className="rounded-full bg-emerald-50 px-3 py-0.5 text-xs font-bold text-emerald-700">
                        {viewModalItem.category}
                      </span>
                      {viewModalItem.badge && (
                        <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-bold text-rose-600">
                          {viewModalItem.badge}
                        </span>
                      )}
                      {viewModalItem.prescriptionRequired && (
                        <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700">
                          Rx Required
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-black text-slate-900">{viewModalItem.name}</h3>
                    {viewModalItem.brand && (
                      <p className="text-sm font-semibold text-slate-500">
                        Manufacturer: {viewModalItem.brand}
                      </p>
                    )}

                    <div className="flex items-center justify-center sm:justify-start gap-3 pt-1">
                      <span className="text-2xl font-black text-slate-900">
                        ₹{Number(viewModalItem.price || 0).toFixed(2)}
                      </span>
                      {viewModalItem.oldPrice && (
                        <span className="text-sm text-slate-400 line-through">
                          ₹{Number(viewModalItem.oldPrice).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium">Batch Number:</span>
                    <p className="font-bold text-slate-900 font-mono mt-0.5">
                      {viewModalItem.batchNo || "BCH001"}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Expiry Date:</span>
                    <p className="font-bold text-slate-900 mt-0.5">
                      {formatDate(viewModalItem.expiryDate)}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Stock Units:</span>
                    <p className="font-bold text-slate-900 mt-0.5">
                      {viewModalItem.stock || 0} units
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Low Stock Alert:</span>
                    <p className="font-bold text-slate-900 mt-0.5">
                      {viewModalItem.lowStockThreshold || 10} units
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Rating:</span>
                    <p className="font-bold text-slate-900 mt-0.5 flex items-center gap-1">
                      <Star size={13} className="fill-amber-400 text-amber-400" />
                      {viewModalItem.rating || 4.5} ({viewModalItem.reviewCount || 0} reviews)
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Database ID:</span>
                    <p className="font-mono text-[10px] text-slate-600 mt-0.5 truncate">
                      {viewModalItem._id}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Description & Usage
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {viewModalItem.description || "No description provided for this medicine."}
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 border-t border-slate-100 p-4">
                <button
                  type="button"
                  onClick={() => setViewModalItem(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const item = viewModalItem;
                    setViewModalItem(null);
                    handleOpenEdit(item);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#00a884] px-4 py-2 text-xs font-bold text-white hover:bg-[#009272]"
                >
                  <Pencil size={14} /> Edit Medicine
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── EDIT MEDICINE MODAL ── */}
      <AnimatePresence>
        {editModalItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
            <motion.div
              variants={modalVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 p-5">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-base">
                  <Pencil className="text-[#00a884]" size={20} />
                  <span>Edit Medicine: {editModalItem.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setEditModalItem(null)}
                  className="rounded-xl p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Edit Form */}
              <form onSubmit={handleSaveEdit}>
                <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Name */}
                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Medicine Name *
                      </label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        required
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-medium text-slate-800 focus:border-[#00a884] focus:bg-white focus:outline-none"
                      />
                    </div>

                    {/* Brand */}
                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Brand / Manufacturer
                      </label>
                      <input
                        type="text"
                        value={editForm.brand}
                        onChange={(e) => setEditForm({ ...editForm, brand: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-medium text-slate-800 focus:border-[#00a884] focus:bg-white focus:outline-none"
                      />
                    </div>

                    {/* Category */}
                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Category *
                      </label>
                      <input
                        type="text"
                        value={editForm.category}
                        onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                        required
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-medium text-slate-800 focus:border-[#00a884] focus:bg-white focus:outline-none"
                      />
                    </div>

                    {/* Batch Number */}
                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Batch Number
                      </label>
                      <input
                        type="text"
                        value={editForm.batchNo}
                        onChange={(e) => setEditForm({ ...editForm, batchNo: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-medium text-slate-800 focus:border-[#00a884] focus:bg-white focus:outline-none"
                      />
                    </div>

                    {/* Expiry Date */}
                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Expiry Date *
                      </label>
                      <input
                        type="date"
                        value={editForm.expiryDate}
                        onChange={(e) => setEditForm({ ...editForm, expiryDate: e.target.value })}
                        required
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-medium text-slate-800 focus:border-[#00a884] focus:bg-white focus:outline-none"
                      />
                    </div>

                    {/* Selling Price */}
                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Selling Price (₹) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={editForm.price}
                        onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                        required
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-bold text-slate-800 focus:border-[#00a884] focus:bg-white focus:outline-none"
                      />
                    </div>

                    {/* Old Price / MRP */}
                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-700">
                        MRP / Old Price (₹)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={editForm.oldPrice}
                        onChange={(e) => setEditForm({ ...editForm, oldPrice: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-medium text-slate-800 focus:border-[#00a884] focus:bg-white focus:outline-none"
                      />
                    </div>

                    {/* Stock Units */}
                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Stock Quantity *
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={editForm.stock}
                        onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
                        required
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-bold text-slate-800 focus:border-[#00a884] focus:bg-white focus:outline-none"
                      />
                    </div>

                    {/* Low Stock Threshold */}
                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Low Stock Alert Threshold
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={editForm.lowStockThreshold}
                        onChange={(e) =>
                          setEditForm({ ...editForm, lowStockThreshold: e.target.value })
                        }
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-medium text-slate-800 focus:border-[#00a884] focus:bg-white focus:outline-none"
                      />
                    </div>

                    {/* Badge */}
                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Product Badge
                      </label>
                      <input
                        type="text"
                        value={editForm.badge}
                        onChange={(e) => setEditForm({ ...editForm, badge: e.target.value })}
                        placeholder="e.g. Best Seller, 15% OFF"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-medium text-slate-800 focus:border-[#00a884] focus:bg-white focus:outline-none"
                      />
                    </div>

                    {/* Prescription Toggle */}
                    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/50 p-3">
                      <div>
                        <p className="text-xs font-bold text-slate-800">Prescription Required (Rx)</p>
                        <p className="text-[10px] text-slate-400">Must upload Rx at checkout</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={editForm.prescriptionRequired}
                        onChange={(e) =>
                          setEditForm({ ...editForm, prescriptionRequired: e.target.checked })
                        }
                        className="h-5 w-5 rounded-md border-slate-300 text-[#00a884] focus:ring-[#00a884]"
                      />
                    </div>

                    {/* Image URL & File */}
                    <div className="sm:col-span-2 space-y-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Update Image (File or URL)
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="file"
                          accept="image/*"
                          ref={fileInputRef}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setEditImageFile(file);
                              setEditPreviewImage(URL.createObjectURL(file));
                            }
                          }}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2 text-xs"
                        />
                        <input
                          type="text"
                          value={editForm.image}
                          onChange={(e) => {
                            setEditForm({ ...editForm, image: e.target.value });
                            if (!editImageFile) setEditPreviewImage(e.target.value);
                          }}
                          placeholder="Or Image Web URL"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2 text-xs font-medium text-slate-800 focus:border-[#00a884] focus:bg-white focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Description / Indications
                      </label>
                      <textarea
                        rows={3}
                        value={editForm.description}
                        onChange={(e) =>
                          setEditForm({ ...editForm, description: e.target.value })
                        }
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs sm:text-sm font-medium text-slate-800 focus:border-[#00a884] focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end gap-3 border-t border-slate-100 p-4">
                  <button
                    type="button"
                    onClick={() => setEditModalItem(null)}
                    className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingEdit}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#00a884] hover:bg-[#009272] px-6 py-2.5 text-xs font-bold text-white shadow-md disabled:opacity-50"
                  >
                    {savingEdit ? (
                      <>
                        <Loader2 className="animate-spin" size={15} /> Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── DELETE CONFIRMATION MODAL ── */}
      <AnimatePresence>
        {deleteModalItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
            <motion.div
              variants={modalVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full max-w-md overflow-hidden rounded-3xl bg-white p-6 shadow-2xl"
            >
              <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-rose-100 text-rose-600 mx-auto mb-4">
                <Trash2 size={28} />
              </div>

              <h3 className="text-center text-lg font-black text-slate-900">
                Delete Medicine?
              </h3>
              <p className="mt-2 text-center text-xs sm:text-sm text-slate-500">
                Are you sure you want to permanently delete{" "}
                <span className="font-bold text-slate-900">
                  "{deleteModalItem.name}"
                </span>{" "}
                from the database? This action cannot be undone.
              </p>

              <div className="mt-6 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteModalItem(null)}
                  disabled={deleting}
                  className="w-full rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-700 py-2.5 text-xs font-bold text-white shadow-md disabled:opacity-50"
                >
                  {deleting ? <Loader2 className="animate-spin" size={15} /> : "Yes, Delete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
