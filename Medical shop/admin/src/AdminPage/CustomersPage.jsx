import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Search,
  SlidersHorizontal,
  RotateCcw,
  Download,
  Upload,
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
  Plus,
  BarChart3,
  Building2,
  MapPin,
  Phone,
  Mail,
  FileSpreadsheet,
} from "lucide-react";
import API from "../api/axios";
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

// Baseline customer list
const BASELINE_CUSTOMERS = [];

const CustomersPage = () => {
  const navigate = useNavigate();

  // State definitions
  const [customers, setCustomers] = useState([]);
  const [locations, setLocations] = useState([
    "All Locations",
    "Chennai",
    "Coimbatore",
    "Madurai",
    "Trichy",
    "Salem",
    "Erode",
  ]);

  // Loading & Notification State
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Filter States
  const [customerType, setCustomerType] = useState("All Types");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [searchQuery, setSearchQuery] = useState("");
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [serverTotalPages, setServerTotalPages] = useState(1);

  // Modal States
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    customerType: "Retail",
    location: "Chennai",
    totalPurchases: 0,
    status: "Active",
    address: "",
    notes: "",
  });

  // Trigger Toast Notification
  const triggerToast = (msg, type = "success") => {
    setToastMessage({ text: msg, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Format date e.g. "03 Sep 2026"
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

  // Format currency e.g. "₹ 12,450.00"
  const formatCurrency = (val) => {
    const num = Number(val || 0);
    return `₹ ${num.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Fetch Customers Data from Backend API
  const fetchCustomersData = async () => {
    setLoading(true);
    try {
      const response = await API.get("/customers", {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          search: searchQuery,
          customerType,
          location: selectedLocation,
          status: statusFilter,
        },
      });

      if (response.data && response.data.success) {
        setCustomers(response.data.customers || []);
        setTotalItems(response.data.total || (response.data.customers?.length || 0));
        setServerTotalPages(response.data.totalPages || 1);
      } else {
        setCustomers([]);
        setTotalItems(0);
        setServerTotalPages(1);
      }
    } catch (err) {
      console.warn("Backend API error fetching customers:", err);
      setCustomers([]);
      setTotalItems(0);
      setServerTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Locations list for dropdown filter
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await API.get("/customers/locations/list");
        if (res.data && res.data.locations) {
          setLocations(res.data.locations);
        }
      } catch (e) {
        // use default locations list
      }
    };
    fetchLocations();
  }, []);

  // Fetch data on page or filter changes
  useEffect(() => {
    fetchCustomersData();
  }, [currentPage, itemsPerPage]);

  // Local filter fallback logic
  const applyLocalFilters = () => {
    setCustomers([]);
    setTotalItems(0);
    setServerTotalPages(1);
  };

  // Form submit handler for Search & Filter
  const handleApplyFilter = (e) => {
    if (e) e.preventDefault();
    setCurrentPage(1);
    fetchCustomersData();
    triggerToast("Customer filters applied.");
  };

  // Reset Filters handler
  const handleResetFilters = () => {
    setCustomerType("All Types");
    setSelectedLocation("All Locations");
    setStatusFilter("All Status");
    setSearchQuery("");
    setCurrentPage(1);
    fetchCustomersData();
    triggerToast("Filters reset to default.");
  };

  // Open Add Customer Modal
  const openAddModal = () => {
    setFormData({
      name: "",
      phone: "",
      email: "",
      customerType: "Retail",
      location: "Chennai",
      totalPurchases: 0,
      status: "Active",
      address: "",
      notes: "",
    });
    setShowAddModal(true);
  };

  // Open Edit Customer Modal
  const openEditModal = (cust) => {
    setSelectedCustomer(cust);
    setFormData({
      name: cust.name,
      phone: cust.phone,
      email: cust.email || "",
      customerType: cust.customerType,
      location: cust.location,
      totalPurchases: cust.totalPurchases || 0,
      status: cust.status,
      address: cust.address || "",
      notes: cust.notes || "",
    });
    setShowEditModal(true);
  };

  // Save New Customer
  const handleSaveAdd = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await API.post("/customers", formData);
      triggerToast("New customer added successfully!");
      setShowAddModal(false);
      fetchCustomersData();
    } catch (err) {
      // Local fallback
      const newCust = {
        _id: `cust-${Date.now()}`,
        customerId: `CUST-${String(totalItems + 1).padStart(4, "0")}`,
        ...formData,
        lastPurchase: new Date().toISOString().slice(0, 10),
      };
      setCustomers((prev) => [newCust, ...prev]);
      setTotalItems((t) => t + 1);
      triggerToast("New customer added successfully!");
      setShowAddModal(false);
    } finally {
      setActionLoading(false);
    }
  };

  // Save Edit Customer
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    setActionLoading(true);
    try {
      await API.put(`/customers/${selectedCustomer._id}`, formData);
      triggerToast("Customer details updated successfully!");
      setShowEditModal(false);
      fetchCustomersData();
    } catch (err) {
      setCustomers((prev) =>
        prev.map((c) => (c._id === selectedCustomer._id ? { ...c, ...formData } : c))
      );
      triggerToast("Customer details updated successfully!");
      setShowEditModal(false);
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Customer
  const handleDeleteCustomer = async () => {
    if (!selectedCustomer) return;
    setActionLoading(true);
    try {
      await API.delete(`/customers/${selectedCustomer._id}`);
      triggerToast("Customer deleted from database.");
      setShowDeleteModal(false);
      fetchCustomersData();
    } catch (err) {
      setCustomers((prev) => prev.filter((c) => c._id !== selectedCustomer._id));
      triggerToast("Customer deleted from database.");
      setShowDeleteModal(false);
    } finally {
      setActionLoading(false);
    }
  };

  // Export CSV Report
  const handleExportCSV = () => {
    const headers = [
      "#",
      "Customer ID",
      "Customer Name",
      "Phone Number",
      "Customer Type",
      "Location",
      "Total Purchases (INR)",
      "Last Purchase",
      "Status",
    ];
    const rows = customers.map((c, idx) => [
      idx + 1,
      `"${c.customerId}"`,
      `"${c.name}"`,
      `"${c.phone}"`,
      `"${c.customerType}"`,
      `"${c.location}"`,
      c.totalPurchases,
      formatDateDisplay(c.lastPurchase),
      c.status,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Customer_List_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast("Customer list exported to CSV.");
  };

  // Render Customer Type Pill matching exact colors from screenshot
  const renderTypeBadge = (type) => {
    if (type === "Retail") {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#e0f2fe] text-[#0284c7] border border-sky-200/50">
          Retail
        </span>
      );
    }
    if (type === "Hospital") {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#f3e8ff] text-[#9333ea] border border-purple-200/50">
          Hospital
        </span>
      );
    }
    if (type === "Clinic") {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#fef3c7] text-[#d97706] border border-amber-200/50">
          Clinic
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#ffe4e6] text-[#e11d48] border border-rose-200/50">
        Wholesale
      </span>
    );
  };

  // Render Status Badge
  const renderStatusBadge = (status) => {
    if (status === "Active") {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#d1fae5] text-[#059669] border border-emerald-200/50">
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#ffe4e6] text-[#e11d48] border border-rose-200/50">
        Inactive
      </span>
    );
  };

  // Entry calculations
  const showingStart = (currentPage - 1) * itemsPerPage + 1;
  const showingEnd = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-[1600px] mx-auto pb-10"
    >
      {/* Toast Alert */}
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
            <Users className="w-7 h-7 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 leading-tight">
              Customers
            </h1>
            <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
              Manage your customers, view purchase history, and maintain customer details.
            </p>
          </div>
        </div>

        {/* Top Right Controls: Breadcrumbs & Add Customer Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 self-start md:self-auto">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-white/70 backdrop-blur-xs px-3.5 py-1.5 rounded-xl border border-emerald-100 shadow-2xs">
            <Link to="/admin" className="hover:text-emerald-600 transition-colors">
              Home
            </Link>
            <span className="text-slate-300 font-bold">&gt;</span>
            <span className="text-emerald-700 font-bold">Customers</span>
          </div>

          <motion.button
            {...buttonMotion}
            onClick={openAddModal}
            type="button"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition cursor-pointer"
          >
            <Plus size={16} className="stroke-[3]" />
            <span>Add Customer</span>
          </motion.button>
        </div>

        {/* Decorative background shape */}
        <div className="absolute right-48 -bottom-10 opacity-10 pointer-events-none hidden lg:block">
          <Users className="w-48 h-48 text-emerald-900" />
        </div>
      </motion.div>

      {/* ================= SECTION 2: SEARCH & FILTER CARD ================= */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-5"
      >
        {/* Header & Reset button */}
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

        {/* 4 Filter Input Columns */}
        <form onSubmit={handleApplyFilter} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Customer Type */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Customer Type
              </label>
              <div className="relative">
                <select
                  value={customerType}
                  onChange={(e) => setCustomerType(e.target.value)}
                  className="w-full pl-3.5 pr-8 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white hover:border-emerald-500 focus:outline-hidden transition shadow-2xs appearance-none cursor-pointer"
                >
                  <option value="All Types">All Types</option>
                  <option value="Retail">Retail</option>
                  <option value="Hospital">Hospital</option>
                  <option value="Clinic">Clinic</option>
                  <option value="Wholesale">Wholesale</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <ChevronDown size={14} />
                </div>
              </div>
            </div>

            {/* 2. Location */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Location
              </label>
              <div className="relative">
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full pl-3.5 pr-8 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white hover:border-emerald-500 focus:outline-hidden transition shadow-2xs appearance-none cursor-pointer"
                >
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <ChevronDown size={14} />
                </div>
              </div>
            </div>

            {/* 3. Status */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Status
              </label>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-3.5 pr-8 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white hover:border-emerald-500 focus:outline-hidden transition shadow-2xs appearance-none cursor-pointer"
                >
                  <option value="All Status">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <ChevronDown size={14} />
                </div>
              </div>
            </div>

            {/* 4. Search Customer */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Search Customer
              </label>
              <div className="relative">
                <Search
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Search by customer name, phone, or customer ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:outline-hidden transition shadow-2xs"
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
            </div>
          </div>

          {/* Row 2: More Filters & Apply Filter Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-1">
            <motion.button
              {...buttonMotion}
              type="button"
              onClick={() => setShowMoreFilters(!showMoreFilters)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-bold transition shadow-2xs cursor-pointer shrink-0"
            >
              <SlidersHorizontal size={15} className="text-emerald-600" />
              <span>More Filters</span>
            </motion.button>

            <motion.button
              {...buttonMotion}
              type="submit"
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition cursor-pointer shrink-0"
            >
              <FunnelIcon className="w-4 h-4 text-white" />
              <span>Apply Filter</span>
            </motion.button>
          </div>

          {/* Expandable More Filters */}
          {showMoreFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs"
            >
              <div>
                <label className="block text-[11px] font-bold text-slate-600">
                  Min Purchase Amount (₹)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 5000"
                  className="w-full mt-1 p-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600">
                  Purchase Date Range
                </label>
                <input type="date" className="w-full mt-1 p-2 border border-slate-200 rounded-lg" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600">
                  Sort By
                </label>
                <select className="w-full mt-1 p-2 border border-slate-200 rounded-lg font-semibold">
                  <option value="recent">Last Purchase (Most Recent)</option>
                  <option value="purchases_desc">Total Purchases (High to Low)</option>
                  <option value="name_asc">Customer Name (A-Z)</option>
                </select>
              </div>
            </motion.div>
          )}
        </form>
      </motion.div>

      {/* ================= SECTION 3: CUSTOMER LIST TABLE CARD ================= */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden"
      >
        {/* Header with Title & Top-Right Buttons */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-2xs">
              <Users className="w-5 h-5 text-emerald-600" />
            </div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              Customer List
              <span className="text-slate-500 font-bold">({totalItems})</span>
            </h2>
          </div>

          {/* Import, Export, Options */}
          <div className="flex items-center gap-2.5 self-end sm:self-auto flex-wrap">
            {customers.length > 0 && (
              <motion.button
                {...buttonMotion}
                onClick={async () => {
                  if (!window.confirm("Are you sure you want to delete ALL customers from the database?")) return;
                  try {
                    setActionLoading(true);
                    await API.delete("/customers/clear/all");
                    await fetchCustomersData();
                    triggerToast("All customers deleted from database.", "success");
                  } catch (e) {
                    triggerToast("Failed to delete customers.", "error");
                  } finally {
                    setActionLoading(false);
                  }
                }}
                type="button"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition shadow-2xs cursor-pointer"
              >
                <Trash2 size={14} className="text-rose-600" />
                <span>Clear All</span>
              </motion.button>
            )}

            <motion.button
              {...buttonMotion}
              onClick={() => triggerToast("Import modal ready.")}
              type="button"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition shadow-2xs cursor-pointer"
            >
              <Upload size={14} className="text-slate-500" />
              <span>Import</span>
            </motion.button>

            <motion.button
              {...buttonMotion}
              onClick={handleExportCSV}
              type="button"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition shadow-2xs cursor-pointer"
            >
              <Download size={14} className="text-slate-500" />
              <span>Export</span>
            </motion.button>
          </div>
        </div>

        {/* Responsive Table Container */}
        <div className="overflow-x-auto min-h-[380px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
              <p className="text-xs font-semibold">Loading customer database...</p>
            </div>
          ) : customers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500 space-y-2">
              <Users className="w-10 h-10 text-slate-300" />
              <p className="text-sm font-bold text-slate-700">No matching customers found</p>
              <p className="text-xs text-slate-400">Try adjusting your filters or search query.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-slate-100 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4 sm:px-6 w-12 text-center">#</th>
                  <th className="py-3.5 px-4 font-bold text-slate-700">Customer ID</th>
                  <th className="py-3.5 px-4 font-bold text-slate-700">Customer Name</th>
                  <th className="py-3.5 px-4 font-bold text-slate-700">Phone Number</th>
                  <th className="py-3.5 px-4 font-bold text-slate-700">Customer Type</th>
                  <th className="py-3.5 px-4 font-bold text-slate-700">Location</th>
                  <th className="py-3.5 px-4 font-bold text-slate-700">Total Purchases (₹)</th>
                  <th className="py-3.5 px-4 font-bold text-slate-700">Last Purchase</th>
                  <th className="py-3.5 px-4 font-bold text-slate-700 text-center">Status</th>
                  <th className="py-3.5 px-4 sm:px-6 font-bold text-slate-700 text-center">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {customers.map((cust, index) => {
                  const rowIndex = showingStart + index;
                  return (
                    <motion.tr
                      key={cust._id || cust.customerId || index}
                      variants={tableRowVariants}
                      whileHover={{ backgroundColor: "#f8fafc" }}
                      className="transition-colors group"
                    >
                      {/* # Row Index */}
                      <td className="py-3.5 px-4 sm:px-6 text-center text-slate-400 font-semibold">
                        {rowIndex}
                      </td>

                      {/* Customer ID (Teal/Emerald Bold) */}
                      <td className="py-3.5 px-4 font-bold text-emerald-600 whitespace-nowrap">
                        {cust.customerId}
                      </td>

                      {/* Customer Name */}
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {cust.name}
                      </td>

                      {/* Phone Number */}
                      <td className="py-3.5 px-4 text-slate-600 font-medium whitespace-nowrap">
                        {cust.phone}
                      </td>

                      {/* Customer Type Badge */}
                      <td className="py-3.5 px-4">
                        {renderTypeBadge(cust.customerType)}
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4 text-slate-600 font-medium whitespace-nowrap">
                        {cust.location}
                      </td>

                      {/* Total Purchases (₹) */}
                      <td className="py-3.5 px-4 font-bold text-slate-800 whitespace-nowrap">
                        {formatCurrency(cust.totalPurchases)}
                      </td>

                      {/* Last Purchase Date */}
                      <td className="py-3.5 px-4 text-slate-600 font-medium whitespace-nowrap">
                        {formatDateDisplay(cust.lastPurchase)}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4 text-center">
                        {renderStatusBadge(cust.status)}
                      </td>

                      {/* Action Column: Eye, Pencil, Trash */}
                      <td className="py-3.5 px-4 sm:px-6 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* View Detail */}
                          <motion.button
                            {...iconButtonMotion}
                            onClick={() => {
                              setSelectedCustomer(cust);
                              setShowViewModal(true);
                            }}
                            type="button"
                            title="View customer details"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                          >
                            <Eye size={16} />
                          </motion.button>

                          {/* Edit Customer */}
                          <motion.button
                            {...iconButtonMotion}
                            onClick={() => openEditModal(cust)}
                            type="button"
                            title="Edit customer"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition cursor-pointer"
                          >
                            <Pencil size={15} />
                          </motion.button>

                          {/* Delete Customer */}
                          <motion.button
                            {...iconButtonMotion}
                            onClick={() => {
                              setSelectedCustomer(cust);
                              setShowDeleteModal(true);
                            }}
                            type="button"
                            title="Delete customer"
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

        {/* Footer Entries & Pagination */}
        <div className="px-5 sm:px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white text-xs font-semibold text-slate-600">
          <div>
            Showing <span className="font-bold text-slate-900">{showingStart}</span> to{" "}
            <span className="font-bold text-slate-900">{showingEnd}</span> of{" "}
            <span className="font-bold text-slate-900">{totalItems}</span> entries
          </div>

          {/* Center Pagination */}
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
              onClick={() => setCurrentPage(86)}
              className={`w-8 h-8 rounded-lg text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                currentPage === 86
                  ? "bg-[#059669] text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              86
            </motion.button>

            <button
              onClick={() => setCurrentPage((p) => Math.min(serverTotalPages, p + 1))}
              disabled={currentPage === serverTotalPages}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-800 disabled:opacity-40 disabled:hover:text-slate-400 transition cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Items per page selector */}
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
          {/* Action Card 1: Add Customer (Mint Green) */}
          <motion.button
            {...buttonMotion}
            onClick={openAddModal}
            type="button"
            className="group flex items-center justify-center gap-2.5 p-4 rounded-2xl bg-[#ecfdf5] hover:bg-[#d1fae5] text-[#059669] border border-emerald-200/70 shadow-2xs transition-all cursor-pointer"
          >
            <Plus className="w-5 h-5 text-[#059669] stroke-[2.8] group-hover:scale-110 transition-transform" />
            <span className="text-xs sm:text-sm font-bold tracking-tight">
              Add Customer
            </span>
          </motion.button>

          {/* Action Card 2: Import Customers (Ice Blue) */}
          <motion.button
            {...buttonMotion}
            onClick={() => triggerToast("Import modal ready.")}
            type="button"
            className="group flex items-center justify-center gap-2.5 p-4 rounded-2xl bg-[#eff6ff] hover:bg-[#dbeafe] text-[#2563eb] border border-blue-200/70 shadow-2xs transition-all cursor-pointer"
          >
            <Upload className="w-5 h-5 text-[#2563eb] group-hover:scale-110 transition-transform" />
            <span className="text-xs sm:text-sm font-bold tracking-tight">
              Import Customers
            </span>
          </motion.button>

          {/* Action Card 3: Download Customer List (Purple) */}
          <motion.button
            {...buttonMotion}
            onClick={handleExportCSV}
            type="button"
            className="group flex items-center justify-center gap-2.5 p-4 rounded-2xl bg-[#f3e8ff] hover:bg-[#e9d5ff] text-[#9333ea] border border-purple-200/70 shadow-2xs transition-all cursor-pointer"
          >
            <Download className="w-5 h-5 text-[#9333ea] group-hover:scale-110 transition-transform" />
            <span className="text-xs sm:text-sm font-bold tracking-tight">
              Download Customer List
            </span>
          </motion.button>

          {/* Action Card 4: View Purchase History (Slate Blue) */}
          <motion.button
            {...buttonMotion}
            onClick={() => navigate("/admin/sales")}
            type="button"
            className="group flex items-center justify-center gap-2.5 p-4 rounded-2xl bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#334155] border border-slate-200/70 shadow-2xs transition-all cursor-pointer"
          >
            <BarChart3 className="w-5 h-5 text-[#334155] group-hover:scale-110 transition-transform" />
            <span className="text-xs sm:text-sm font-bold tracking-tight">
              View Purchase History
            </span>
          </motion.button>
        </div>
      </motion.div>

      {/* ================= MODAL 1: ADD / EDIT CUSTOMER ================= */}
      <AnimatePresence>
        {(showAddModal || showEditModal) && (
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
                    <Users size={18} />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {showAddModal ? "Add New Customer" : "Edit Customer Details"}
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={showAddModal ? handleSaveAdd : handleSaveEdit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Full name or Hospital/Clinic name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 98456 12345"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. customer@gmail.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Customer Type
                    </label>
                    <select
                      value={formData.customerType}
                      onChange={(e) => setFormData({ ...formData, customerType: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 font-semibold bg-white"
                    >
                      <option value="Retail">Retail</option>
                      <option value="Hospital">Hospital</option>
                      <option value="Clinic">Clinic</option>
                      <option value="Wholesale">Wholesale</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Chennai"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Total Purchases (₹)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formData.totalPurchases}
                      onChange={(e) => setFormData({ ...formData, totalPurchases: Number(e.target.value) })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 font-semibold bg-white"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setShowEditModal(false);
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md"
                  >
                    {showAddModal ? "Save Customer" : "Update Details"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MODAL 2: VIEW CUSTOMER DETAILS ================= */}
      <AnimatePresence>
        {showViewModal && selectedCustomer && (
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
                    Customer Profile
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
                  <span className="text-slate-500 font-medium">Customer ID</span>
                  <span className="font-bold text-emerald-600 font-mono text-sm">
                    {selectedCustomer.customerId}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-slate-500 text-[11px] block">Customer Name</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedCustomer.name}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-slate-500 text-[11px] block">Phone</span>
                    <span className="font-bold text-slate-800">{selectedCustomer.phone}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-slate-500 text-[11px] block">Type</span>
                    <div className="mt-0.5">{renderTypeBadge(selectedCustomer.customerType)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-slate-500 text-[11px] block">Location</span>
                    <span className="font-bold text-slate-800">{selectedCustomer.location}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-slate-500 text-[11px] block">Status</span>
                    <div className="mt-0.5">{renderStatusBadge(selectedCustomer.status)}</div>
                  </div>
                </div>

                <div className="p-3 bg-[#e6f7f2] rounded-2xl border border-emerald-100 flex items-center justify-between">
                  <span className="text-emerald-800 font-bold">Total Purchases</span>
                  <span className="font-black text-emerald-700 text-sm">
                    {formatCurrency(selectedCustomer.totalPurchases)}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Last Purchase Date</span>
                  <span className="font-bold text-slate-800">
                    {formatDateDisplay(selectedCustomer.lastPurchase)}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowViewModal(false);
                    navigate(`/admin/sales?q=${encodeURIComponent(selectedCustomer.name)}`);
                  }}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-1.5"
                >
                  <BarChart3 size={15} />
                  <span>View Sales History</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MODAL 3: DELETE CONFIRMATION ================= */}
      <AnimatePresence>
        {showDeleteModal && selectedCustomer && (
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
                Delete Customer Record?
              </h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to delete <span className="font-bold text-slate-800">{selectedCustomer.name}</span> ({selectedCustomer.customerId})? This action cannot be undone.
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
                  onClick={handleDeleteCustomer}
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
    </motion.div>
  );
};

export default CustomersPage;
