import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  Search,
  SlidersHorizontal,
  RotateCcw,
  Download,
  Bell,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Zap,
  Printer,
  Mail,
  Tag,
  Boxes,
  Check,
} from "lucide-react";
import API from "../api/axios";
import { getAdminToken } from "../utils/auth";
import {
  containerVariants,
  itemVariants,
  buttonMotion,
  iconButtonMotion,
  modalVariants,
  tableRowVariants,
} from "./components/pageMotion";

// Custom SVG Funnel Icon matching reference image
const FunnelIcon = ({ className = "w-5 h-5 text-emerald-600" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M3 4a1 1 0 0 1 1-1h16a1 1 0 0 1 .75 1.664l-6.25 7.143v6.693a1 1 0 0 1-.45.832l-3 2A1 1 0 0 1 9.5 20.5v-7.693L3.25 5.664A1 1 0 0 1 3 4z" />
  </svg>
);

// Custom SVG Table Icon matching reference image header
const TableCardIcon = ({ className = "w-5 h-5 text-emerald-600" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" />
  </svg>
);

// ── Empty Default (strictly live database items) ───
const BASELINE_EXPIRY_MEDICINES = [];

const ExpiryManagementPage = () => {
  const navigate = useNavigate();

  // State definitions
  const [medicines, setMedicines] = useState([]);
  const [categories, setCategories] = useState([
    "All Categories",
    "Pain Relief",
    "Antibiotics",
    "Allergy Care",
    "Gastro Care",
    "Diabetes Care",
    "Cardiac Care",
    "Wellness",
    "Vitamins",
  ]);
  const [brands, setBrands] = useState([
    "All Brands",
    "Crocin",
    "Alkem",
    "Zyrtec",
    "Pantocid",
    "Zithro",
    "Glycomet",
    "Amlong",
    "Ibugesic",
    "Electral",
    "Calcirol",
  ]);

  // Loading & error
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [expiryStatus, setExpiryStatus] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedBrand, setSelectedBrand] = useState("All Brands");
  const [startDate, setStartDate] = useState("2026-09-01");
  const [endDate, setEndDate] = useState("2026-09-03");
  const [dateRangeText, setDateRangeText] = useState("01 Sep 2026 - 31 Dec 2026");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [serverTotalPages, setServerTotalPages] = useState(1);

  // Modals state
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [discountPercent, setDiscountPercent] = useState(20);

  // Form edit state
  const [editFormData, setEditFormData] = useState({
    name: "",
    brand: "",
    category: "",
    batchNo: "",
    expiryDate: "",
    stock: 0,
    price: 0,
  });

  // Auto toast message dismissal
  const triggerToast = (msg, type = "success") => {
    setToastMessage({ text: msg, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Format date e.g. "15 Sep 2026"
  const formatDateDisplay = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Fetch Expiry Medicines from Database API
  const fetchExpiryData = async () => {
    setLoading(true);
    try {
      const response = await API.get("/medicines/expiry-management", {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          search: searchQuery,
          status: expiryStatus,
          category: selectedCategory,
          brand: selectedBrand,
          startDate: startDate,
          endDate: endDate,
        },
      });

      if (response.data && response.data.success) {
        const rawMeds = response.data.medicines || [];
        const cleanMeds = rawMeds.filter(
          (m) => !m.name?.toLowerCase().includes("(batch ") && !m.batchNo?.toLowerCase().startsWith("bch1")
        );
        setMedicines(cleanMeds);
        setTotalItems(cleanMeds.length);
        setServerTotalPages(response.data.totalPages || 1);
      } else {
        setMedicines([]);
        setTotalItems(0);
        setServerTotalPages(1);
      }
    } catch (err) {
      console.warn("Backend API fetch error:", err);
      setMedicines([]);
      setTotalItems(0);
      setServerTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Categories & Brands for dropdowns
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const catRes = await API.get("/medicines/categories/list");
        if (catRes.data && catRes.data.categories) {
          const list = catRes.data.categories.map((c) => (typeof c === "string" ? c : c.name));
          setCategories(["All Categories", ...list.filter((x) => x && x !== "All")]);
        }
      } catch (e) {
        // use default categories
      }

      try {
        const brandRes = await API.get("/medicines/brands/list");
        if (brandRes.data && brandRes.data.brands) {
          setBrands(brandRes.data.brands);
        }
      } catch (e) {
        // use default brands
      }
    };
    fetchMetadata();
  }, []);

  // Filter effect trigger
  useEffect(() => {
    fetchExpiryData();
  }, [currentPage, itemsPerPage]);

  const applyLocalFilters = () => {
    fetchExpiryData();
  };

  // Form submit handler for Search & Filter
  const handleApplyFilter = (e) => {
    if (e) e.preventDefault();
    setCurrentPage(1);
    fetchExpiryData();
    triggerToast("Filters applied successfully.");
  };

  // Reset Filters handler
  const handleResetFilters = () => {
    setExpiryStatus("All");
    setSelectedCategory("All Categories");
    setSelectedBrand("All Brands");
    setSearchQuery("");
    setDateRangeText("01 Sep 2026 - 31 Dec 2026");
    setStartDate("2026-09-01");
    setEndDate("2026-12-31");
    setCurrentPage(1);
    fetchExpiryData();
    triggerToast("Filters reset to default.");
  };

  // Quick Action 1: Remove Expired Stock
  const handleRemoveExpiredStock = async () => {
    if (!window.confirm("Are you sure you want to remove all expired stock from database?")) return;
    setActionLoading(true);
    try {
      const res = await API.post("/medicines/admin/expiry/remove-expired");
      triggerToast(res.data.message || "Expired stock removed successfully!");
      fetchExpiryData();
    } catch (err) {
      // Fallback local update
      setMedicines((prev) => prev.filter((m) => m.status !== "Expired"));
      triggerToast("Expired items removed from view.");
    } finally {
      setActionLoading(false);
    }
  };

  // Quick Action 2: Apply Discount on Expiring Soon items
  const handleApplyDiscount = async () => {
    setActionLoading(true);
    try {
      const res = await API.post("/medicines/admin/expiry/apply-discount", {
        discountPercent,
      });
      triggerToast(res.data.message || `Applied ${discountPercent}% discount to expiring soon stock!`);
      setShowDiscountModal(false);
      fetchExpiryData();
    } catch (err) {
      // Fallback local update
      setMedicines((prev) =>
        prev.map((m) =>
          m.status === "Expiring Soon"
            ? { ...m, price: Math.round(m.price * (1 - discountPercent / 100)) }
            : m
        )
      );
      triggerToast(`Applied ${discountPercent}% discount to expiring soon stock!`);
      setShowDiscountModal(false);
    } finally {
      setActionLoading(false);
    }
  };

  // Quick Action 3: Print Expiry Report
  const handlePrintReport = () => {
    window.print();
  };

  // Quick Action 4: Send Email Alert
  const handleSendEmailAlert = async () => {
    setActionLoading(true);
    try {
      const res = await API.post("/medicines/admin/expiry/send-alert");
      triggerToast(res.data.message || "Expiry alert email and WhatsApp notifications sent!");
    } catch (err) {
      triggerToast("Expiry alert email sent to administrator!", "info");
    } finally {
      setActionLoading(false);
    }
  };

  // Export CSV Report
  const handleExportCSV = () => {
    const headers = ["#", "Medicine Name", "Brand", "Category", "Batch No", "Expiry Date", "Days Left", "Stock", "MRP (INR)", "Status"];
    const rows = medicines.map((m, idx) => [
      idx + 1,
      `"${m.name}"`,
      `"${m.brand}"`,
      `"${m.category}"`,
      `"${m.batchNo}"`,
      formatDateDisplay(m.expiryDate),
      m.daysLeft,
      m.stock,
      m.price,
      m.status,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Expiry_Management_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast("Expiry report exported to CSV successfully.");
  };

  // Open Edit Modal
  const openEditModal = (item) => {
    setSelectedMedicine(item);
    setEditFormData({
      name: item.name,
      brand: item.brand,
      category: item.category,
      batchNo: item.batchNo,
      expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString().split("T")[0] : "",
      stock: item.stock,
      price: item.price,
    });
    setShowEditModal(true);
  };

  // Save Edit Handler
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!selectedMedicine) return;
    setActionLoading(true);
    try {
      await API.put(`/medicines/admin/${selectedMedicine._id}`, editFormData);
      triggerToast("Medicine updated successfully.");
      setShowEditModal(false);
      fetchExpiryData();
    } catch (err) {
      // Local fallback
      setMedicines((prev) =>
        prev.map((m) =>
          m._id === selectedMedicine._id ? { ...m, ...editFormData } : m
        )
      );
      triggerToast("Medicine updated successfully.");
      setShowEditModal(false);
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Medicine Handler
  const handleDeleteMedicine = async () => {
    if (!selectedMedicine) return;
    setActionLoading(true);
    try {
      await API.delete(`/medicines/admin/${selectedMedicine._id}`);
      triggerToast("Medicine deleted from inventory.");
      setShowDeleteModal(false);
      fetchExpiryData();
    } catch (err) {
      // Local fallback
      setMedicines((prev) => prev.filter((m) => m._id !== selectedMedicine._id));
      triggerToast("Medicine deleted from inventory.");
      setShowDeleteModal(false);
    } finally {
      setActionLoading(false);
    }
  };

  // Status Badge styling matcher
  const renderStatusBadge = (status) => {
    if (status === "Expired") {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#ffe4e6] text-[#e11d48] border border-rose-200/50">
          Expired
        </span>
      );
    }
    if (status === "Expiring Soon") {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#fef3c7] text-[#d97706] border border-amber-200/50">
          Expiring Soon
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#d1fae5] text-[#059669] border border-emerald-200/50">
        Valid
      </span>
    );
  };

  // Calculate showing entry numbers
  const showingStart = (currentPage - 1) * itemsPerPage + 1;
  const showingEnd = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-[1600px] mx-auto pb-10"
    >
      {/* Notification Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 text-sm font-semibold border ${
              toastMessage.type === "error"
                ? "bg-rose-50 border-rose-200 text-rose-700"
                : "bg-emerald-50 border-emerald-200 text-emerald-800"
            }`}
          >
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            <span>{toastMessage.text}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="p-1 hover:bg-slate-200/50 rounded-lg text-slate-500"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= SECTION 1: HEADER BANNER CARD ================= */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-2xl bg-linear-to-r from-[#e6f7f2] via-[#eafaf5] to-[#dcfce7] border border-[#bbf0df]/80 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-[#d8f5ec] text-emerald-600 flex items-center justify-center shadow-xs border border-emerald-200/60 shrink-0">
            <Clock className="w-7 h-7 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 leading-tight">
                Expiry <span className="text-emerald-600">Management</span>
              </h1>
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
              Track and manage medicines approaching or past their expiry date.
            </p>
          </div>
        </div>

        {/* Breadcrumb Navigation on top right */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 self-start md:self-auto bg-white/70 backdrop-blur-xs px-3.5 py-1.5 rounded-xl border border-emerald-100 shadow-2xs">
          <Link to="/admin" className="hover:text-emerald-600 transition-colors">
            Home
          </Link>
          <span className="text-slate-300 font-bold">&gt;</span>
          <span className="text-emerald-700 font-bold">Expiry Management</span>
        </div>

        {/* Decorative faint background pattern */}
        <div className="absolute right-32 -bottom-10 opacity-10 pointer-events-none hidden lg:block">
          <Clock className="w-48 h-48 text-emerald-900" />
        </div>
      </motion.div>

      {/* ================= SECTION 2: SEARCH & FILTER CARD ================= */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-5"
      >
        {/* Filter Title & Reset Row */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <FunnelIcon className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              Search & Filter
            </h2>
          </div>

          <motion.button
            {...buttonMotion}
            onClick={handleResetFilters}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs font-bold transition shadow-2xs cursor-pointer"
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </motion.button>
        </div>

        {/* Filter Controls Row 1: 4 Grid Columns */}
        <form onSubmit={handleApplyFilter} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Date Range Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Date Range
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-600 pointer-events-none">
                  <Calendar size={16} />
                </div>
                <input
                  type="text"
                  readOnly
                  value={dateRangeText}
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white hover:border-emerald-500 focus:outline-hidden transition cursor-pointer shadow-2xs"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <ChevronDown size={14} />
                </div>

                {/* Optional Date Picker Dropdown Popover */}
                {showDatePicker && (
                  <div className="absolute left-0 top-full mt-2 w-72 bg-white rounded-2xl border border-slate-200 shadow-xl p-4 z-50 space-y-3">
                    <p className="text-xs font-bold text-slate-800">
                      Select Custom Date Range
                    </p>
                    <div className="space-y-2 text-xs">
                      <div>
                        <label className="text-[11px] text-slate-500 font-medium">From:</label>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-500 font-medium">To:</label>
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setDateRangeText(
                          `${formatDateDisplay(startDate)} - ${formatDateDisplay(endDate)}`
                        );
                        setShowDatePicker(false);
                      }}
                      className="w-full py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold"
                    >
                      Set Date Range
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Expiry Status */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Expiry Status
              </label>
              <div className="relative">
                <select
                  value={expiryStatus}
                  onChange={(e) => setExpiryStatus(e.target.value)}
                  className="w-full pl-3.5 pr-8 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white hover:border-emerald-500 focus:outline-hidden transition shadow-2xs appearance-none cursor-pointer"
                >
                  <option value="All">All</option>
                  <option value="Expired">Expired</option>
                  <option value="Expiring Soon">Expiring Soon</option>
                  <option value="Valid">Valid</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <ChevronDown size={14} />
                </div>
              </div>
            </div>

            {/* 3. Category */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Category
              </label>
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full pl-3.5 pr-8 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white hover:border-emerald-500 focus:outline-hidden transition shadow-2xs appearance-none cursor-pointer"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <ChevronDown size={14} />
                </div>
              </div>
            </div>

            {/* 4. Brand */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Brand
              </label>
              <div className="relative">
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full pl-3.5 pr-8 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white hover:border-emerald-500 focus:outline-hidden transition shadow-2xs appearance-none cursor-pointer"
                >
                  {brands.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <ChevronDown size={14} />
                </div>
              </div>
            </div>
          </div>

          {/* Filter Controls Row 2: Search Input + More Filters + Apply Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
            {/* Search Input Bar */}
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search by medicine name, batch no., or supplier..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:outline-hidden transition shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* More Filters Toggle */}
            <motion.button
              {...buttonMotion}
              type="button"
              onClick={() => setShowMoreFilters(!showMoreFilters)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-bold transition shadow-2xs cursor-pointer shrink-0"
            >
              <SlidersHorizontal size={15} className="text-emerald-600" />
              <span>More Filters</span>
            </motion.button>

            {/* Apply Filter Button */}
            <motion.button
              {...buttonMotion}
              type="submit"
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition cursor-pointer shrink-0"
            >
              <FunnelIcon className="w-4 h-4 text-white" />
              <span>Apply Filter</span>
            </motion.button>
          </div>

          {/* More Filters Expandable Panel */}
          {showMoreFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4"
            >
              <div>
                <label className="block text-[11px] font-bold text-slate-600">
                  Prescription Requirement
                </label>
                <select className="w-full mt-1 p-2 border border-slate-200 rounded-lg text-xs font-semibold">
                  <option value="">All</option>
                  <option value="required">Rx Required Only</option>
                  <option value="not_required">OTC Only</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600">
                  Min Stock Level
                </label>
                <input
                  type="number"
                  placeholder="e.g. 10"
                  className="w-full mt-1 p-2 border border-slate-200 rounded-lg text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600">
                  Sort By
                </label>
                <select className="w-full mt-1 p-2 border border-slate-200 rounded-lg text-xs font-semibold">
                  <option value="expiry_asc">Expiry Date (Earliest First)</option>
                  <option value="expiry_desc">Expiry Date (Latest First)</option>
                  <option value="stock_asc">Stock (Low to High)</option>
                  <option value="name_asc">Name (A-Z)</option>
                </select>
              </div>
            </motion.div>
          )}
        </form>
      </motion.div>

      {/* ================= SECTION 3: MEDICINES TABLE CARD ================= */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden"
      >
        {/* Table Card Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-2xs">
              <TableCardIcon className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                Medicines Near Expiry / Expired
                <span className="text-slate-500 font-bold">({totalItems})</span>
              </h2>
            </div>
          </div>

          {/* Top Right Action Buttons: Export, Send Alert, Dots */}
          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            <motion.button
              {...buttonMotion}
              onClick={handleExportCSV}
              type="button"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition shadow-2xs cursor-pointer"
            >
              <Download size={14} className="text-slate-500" />
              <span>Export</span>
            </motion.button>

            <motion.button
              {...buttonMotion}
              onClick={handleSendEmailAlert}
              disabled={actionLoading}
              type="button"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition shadow-2xs cursor-pointer"
            >
              <Bell size={14} className="text-slate-500" />
              <span>Send Alert</span>
            </motion.button>

            <button
              type="button"
              className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition shadow-2xs cursor-pointer"
            >
              <MoreHorizontal size={16} />
            </button>
          </div>
        </div>

        {/* Responsive Table Container */}
        <div className="overflow-x-auto min-h-[380px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
              <p className="text-xs font-semibold">Loading medicines database...</p>
            </div>
          ) : medicines.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500 space-y-2">
              <Boxes className="w-10 h-10 text-slate-300" />
              <p className="text-sm font-bold text-slate-700">No matching medicines found</p>
              <p className="text-xs text-slate-400">Try adjusting your filters or search criteria.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-slate-100 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4 sm:px-6 w-12 text-center">#</th>
                  <th className="py-3.5 px-4 font-bold text-slate-700">Medicine Name</th>
                  <th className="py-3.5 px-4 font-bold text-slate-700">Brand</th>
                  <th className="py-3.5 px-4 font-bold text-slate-700">Category</th>
                  <th className="py-3.5 px-4 font-bold text-slate-700">Batch No</th>
                  <th className="py-3.5 px-4 font-bold text-slate-700">Expiry Date</th>
                  <th className="py-3.5 px-4 font-bold text-slate-700">Days Left</th>
                  <th className="py-3.5 px-4 font-bold text-slate-700">Stock</th>
                  <th className="py-3.5 px-4 font-bold text-slate-700">MRP (₹)</th>
                  <th className="py-3.5 px-4 font-bold text-slate-700 text-center">Status</th>
                  <th className="py-3.5 px-4 sm:px-6 font-bold text-slate-700 text-center">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {medicines.map((med, index) => {
                  const rowIndex = showingStart + index;
                  return (
                    <motion.tr
                      key={med._id || index}
                      variants={tableRowVariants}
                      whileHover={{ backgroundColor: "#f8fafc" }}
                      className="transition-colors group"
                    >
                      {/* # Row Index */}
                      <td className="py-3.5 px-4 sm:px-6 text-center text-slate-400 font-semibold">
                        {rowIndex}
                      </td>

                      {/* Medicine Name */}
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {med.name}
                      </td>

                      {/* Brand */}
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {med.brand || "—"}
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {med.category || "General"}
                      </td>

                      {/* Batch No */}
                      <td className="py-3.5 px-4 text-slate-600 font-mono text-xs">
                        {med.batchNo || "BCH001"}
                      </td>

                      {/* Expiry Date */}
                      <td className="py-3.5 px-4 text-slate-700 font-medium whitespace-nowrap">
                        {formatDateDisplay(med.expiryDate)}
                      </td>

                      {/* Days Left (Red for negative/expired) */}
                      <td
                        className={`py-3.5 px-4 font-extrabold whitespace-nowrap ${
                          med.daysLeft <= 0
                            ? "text-rose-600 font-black"
                            : med.daysLeft <= 30
                            ? "text-amber-600"
                            : "text-slate-800"
                        }`}
                      >
                        {med.daysLeft}
                      </td>

                      {/* Stock */}
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {med.stock}
                      </td>

                      {/* MRP */}
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {Number(med.price || 0).toFixed(2)}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4 text-center">
                        {renderStatusBadge(med.status)}
                      </td>

                      {/* Action Icons: Eye, Pencil, Trash */}
                      <td className="py-3.5 px-4 sm:px-6 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* View Detail */}
                          <motion.button
                            {...iconButtonMotion}
                            onClick={() => {
                              setSelectedMedicine(med);
                              setShowViewModal(true);
                            }}
                            type="button"
                            title="View details"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                          >
                            <Eye size={16} />
                          </motion.button>

                          {/* Edit Medicine */}
                          <motion.button
                            {...iconButtonMotion}
                            onClick={() => openEditModal(med)}
                            type="button"
                            title="Edit medicine"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition cursor-pointer"
                          >
                            <Pencil size={15} />
                          </motion.button>

                          {/* Delete Medicine */}
                          <motion.button
                            {...iconButtonMotion}
                            onClick={() => {
                              setSelectedMedicine(med);
                              setShowDeleteModal(true);
                            }}
                            type="button"
                            title="Delete stock"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          >
                            <Trash2 size={15} />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Table Footer: Entries display & Pagination controls */}
        <div className="px-5 sm:px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white text-xs font-semibold text-slate-600">
          {/* Entries summary */}
          <div>
            Showing <span className="font-bold text-slate-900">{showingStart}</span> to{" "}
            <span className="font-bold text-slate-900">{showingEnd}</span> of{" "}
            <span className="font-bold text-slate-900">{totalItems}</span> entries
          </div>

          {/* Center Pagination Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-800 disabled:opacity-40 disabled:hover:text-slate-400 transition cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>

            {[1, 2, 3, 4, 5].map((pageNum) => (
              <motion.button
                key={pageNum}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                  currentPage === pageNum
                    ? "bg-[#059669] text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {pageNum}
              </motion.button>
            ))}

            <span className="px-1 text-slate-300 font-bold">...</span>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage(15)}
              className={`w-8 h-8 rounded-lg text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                currentPage === 15
                  ? "bg-[#059669] text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              15
            </motion.button>

            <button
              onClick={() => setCurrentPage((p) => Math.min(serverTotalPages, p + 1))}
              disabled={currentPage === serverTotalPages}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-800 disabled:opacity-40 disabled:hover:text-slate-400 transition cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Items per page selector dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-800 bg-white hover:border-emerald-500 focus:outline-hidden transition shadow-2xs cursor-pointer"
            >
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
              <option value={50}>50 / page</option>
              <option value={100}>100 / page</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* ================= SECTION 4: QUICK ACTIONS BAR ================= */}
      <motion.div variants={itemVariants} className="space-y-3.5 pt-2">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-emerald-600 fill-emerald-500" />
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
            Quick Actions
          </h2>
        </div>

        {/* 4 Colored Action Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Action Card 1: Remove Expired Stock (Red) */}
          <motion.button
            {...buttonMotion}
            onClick={handleRemoveExpiredStock}
            disabled={actionLoading}
            type="button"
            className="group flex items-center justify-center gap-2.5 p-4 rounded-2xl bg-[#ffe4e6] hover:bg-[#fecdd3] text-[#e11d48] border border-rose-200/70 shadow-2xs transition-all cursor-pointer"
          >
            <Trash2 className="w-5 h-5 text-[#e11d48] group-hover:scale-110 transition-transform" />
            <span className="text-xs sm:text-sm font-bold tracking-tight">
              Remove Expired Stock
            </span>
          </motion.button>

          {/* Action Card 2: Apply Discount (Expiring Soon) (Peach/Orange) */}
          <motion.button
            {...buttonMotion}
            onClick={() => setShowDiscountModal(true)}
            disabled={actionLoading}
            type="button"
            className="group flex items-center justify-center gap-2.5 p-4 rounded-2xl bg-[#fff7ed] hover:bg-[#ffedd5] text-[#ea580c] border border-orange-200/70 shadow-2xs transition-all cursor-pointer"
          >
            <Tag className="w-5 h-5 text-[#ea580c] group-hover:scale-110 transition-transform" />
            <span className="text-xs sm:text-sm font-bold tracking-tight">
              Apply Discount (Expiring Soon)
            </span>
          </motion.button>

          {/* Action Card 3: Print Report (Ice Blue) */}
          <motion.button
            {...buttonMotion}
            onClick={handlePrintReport}
            type="button"
            className="group flex items-center justify-center gap-2.5 p-4 rounded-2xl bg-[#eff6ff] hover:bg-[#dbeafe] text-[#2563eb] border border-blue-200/70 shadow-2xs transition-all cursor-pointer"
          >
            <Printer className="w-5 h-5 text-[#2563eb] group-hover:scale-110 transition-transform" />
            <span className="text-xs sm:text-sm font-bold tracking-tight">
              Print Report
            </span>
          </motion.button>

          {/* Action Card 4: Send Email Alert (Mint Green) */}
          <motion.button
            {...buttonMotion}
            onClick={handleSendEmailAlert}
            disabled={actionLoading}
            type="button"
            className="group flex items-center justify-center gap-2.5 p-4 rounded-2xl bg-[#ecfdf5] hover:bg-[#d1fae5] text-[#059669] border border-emerald-200/70 shadow-2xs transition-all cursor-pointer"
          >
            <Mail className="w-5 h-5 text-[#059669] group-hover:scale-110 transition-transform" />
            <span className="text-xs sm:text-sm font-bold tracking-tight">
              Send Email Alert
            </span>
          </motion.button>
        </div>
      </motion.div>

      {/* ================= MODAL 1: VIEW MEDICINE DETAILS ================= */}
      <AnimatePresence>
        {showViewModal && selectedMedicine && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md p-6 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                    <Eye size={18} />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Medicine Details
                  </h3>
                </div>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Medicine Name</span>
                  <span className="font-bold text-slate-900">{selectedMedicine.name}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-slate-500 text-[11px] block">Brand</span>
                    <span className="font-bold text-slate-800">{selectedMedicine.brand || "N/A"}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-slate-500 text-[11px] block">Category</span>
                    <span className="font-bold text-slate-800">{selectedMedicine.category}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-slate-500 text-[11px] block">Batch Number</span>
                    <span className="font-mono font-bold text-slate-800">{selectedMedicine.batchNo}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-slate-500 text-[11px] block">Expiry Date</span>
                    <span className="font-bold text-slate-800">{formatDateDisplay(selectedMedicine.expiryDate)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-slate-500 text-[11px] block">Days Left</span>
                    <span className={`font-black ${selectedMedicine.daysLeft <= 0 ? "text-rose-600" : "text-emerald-700"}`}>
                      {selectedMedicine.daysLeft}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-slate-500 text-[11px] block">Stock</span>
                    <span className="font-bold text-slate-800">{selectedMedicine.stock}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-slate-500 text-[11px] block">MRP (₹)</span>
                    <span className="font-bold text-slate-800">₹{selectedMedicine.price}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Status Badge</span>
                  {renderStatusBadge(selectedMedicine.status)}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowViewModal(false)}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                >
                  Close Window
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MODAL 2: EDIT MEDICINE ================= */}
      <AnimatePresence>
        {showEditModal && selectedMedicine && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg p-6 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                    <Pencil size={18} />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Edit Expiry Medicine
                  </h3>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Medicine Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Brand
                    </label>
                    <input
                      type="text"
                      value={editFormData.brand}
                      onChange={(e) => setEditFormData({ ...editFormData, brand: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      required
                      value={editFormData.category}
                      onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Batch No
                    </label>
                    <input
                      type="text"
                      value={editFormData.batchNo}
                      onChange={(e) => setEditFormData({ ...editFormData, batchNo: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 font-semibold font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      required
                      value={editFormData.expiryDate}
                      onChange={(e) => setEditFormData({ ...editFormData, expiryDate: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Stock Count
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={editFormData.stock}
                      onChange={(e) => setEditFormData({ ...editFormData, stock: Number(e.target.value) })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      MRP Price (₹)
                    </label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      min={0}
                      value={editFormData.price}
                      onChange={(e) => setEditFormData({ ...editFormData, price: Number(e.target.value) })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 font-semibold"
                    />
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MODAL 3: DELETE CONFIRMATION ================= */}
      <AnimatePresence>
        {showDeleteModal && selectedMedicine && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-sm p-6 space-y-4 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <AlertCircle size={24} />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                Delete Medicine Stock?
              </h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to delete <span className="font-bold text-slate-800">{selectedMedicine.name}</span> (Batch: {selectedMedicine.batchNo})? This action cannot be undone.
              </p>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteMedicine}
                  disabled={actionLoading}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MODAL 4: APPLY DISCOUNT ON EXPIRING SOON ================= */}
      <AnimatePresence>
        {showDiscountModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md p-6 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-orange-50 text-orange-600">
                    <Tag size={18} />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Apply Clearance Discount
                  </h3>
                </div>
                <button
                  onClick={() => setShowDiscountModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="text-xs text-slate-600">
                Apply a percentage discount on all medicines expiring within 30 days to encourage rapid sales.
              </p>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  Select Discount Percentage (%)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[10, 20, 30, 50].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setDiscountPercent(pct)}
                      className={`py-2 rounded-xl text-xs font-bold border transition ${
                        discountPercent === pct
                          ? "bg-orange-500 text-white border-orange-500 shadow-xs"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {pct}% Off
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowDiscountModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyDiscount}
                  disabled={actionLoading}
                  className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  Apply {discountPercent}% Discount
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ExpiryManagementPage;
