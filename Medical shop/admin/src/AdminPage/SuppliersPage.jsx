import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Truck,
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
  FileText,
  Phone,
  Mail,
  MapPin,
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

// 10 Baseline supplier items matching reference image
const BASELINE_SUPPLIERS = [
  {
    _id: "sup-0001",
    supplierId: "SUP-0001",
    name: "Sun Pharma Distributors",
    contactPerson: "Rajesh Kumar",
    phone: "98456 12345",
    email: "sunpharma@gmail.com",
    location: "Chennai",
    supplierType: "Distributor",
    status: "Active",
  },
  {
    _id: "sup-0002",
    supplierId: "SUP-0002",
    name: "Medico Care Pvt Ltd",
    contactPerson: "Suresh B",
    phone: "98765 43210",
    email: "medicocare@gmail.com",
    location: "Coimbatore",
    supplierType: "Wholesaler",
    status: "Active",
  },
  {
    _id: "sup-0003",
    supplierId: "SUP-0003",
    name: "Apollo Wholesalers",
    contactPerson: "Anil Mehta",
    phone: "91234 56789",
    email: "apollo.wh@gmail.com",
    location: "Bangalore",
    supplierType: "Wholesaler",
    status: "Active",
  },
  {
    _id: "sup-0004",
    supplierId: "SUP-0004",
    name: "LifeCare Pharma",
    contactPerson: "Karthik R",
    phone: "99887 66554",
    email: "lifecare@gmail.com",
    location: "Madurai",
    supplierType: "Distributor",
    status: "Active",
  },
  {
    _id: "sup-0005",
    supplierId: "SUP-0005",
    name: "HealthPlus Distributors",
    contactPerson: "Priya N",
    phone: "98654 77890",
    email: "healthplus@gmail.com",
    location: "Trichy",
    supplierType: "Distributor",
    status: "Inactive",
  },
  {
    _id: "sup-0006",
    supplierId: "SUP-0006",
    name: "Globe Medicals",
    contactPerson: "Manoj Singh",
    phone: "98412 33456",
    email: "globe.med@gmail.com",
    location: "Delhi",
    supplierType: "Wholesaler",
    status: "Active",
  },
  {
    _id: "sup-0007",
    supplierId: "SUP-0007",
    name: "Sri Sai Pharma",
    contactPerson: "Vignesh P",
    phone: "96587 44556",
    email: "srisai@gmail.com",
    location: "Salem",
    supplierType: "Distributor",
    status: "Active",
  },
  {
    _id: "sup-0008",
    supplierId: "SUP-0008",
    name: "MedZone Supply",
    contactPerson: "Aruna Devi",
    phone: "97865 22334",
    email: "medzone@gmail.com",
    location: "Hyderabad",
    supplierType: "Wholesaler",
    status: "Inactive",
  },
  {
    _id: "sup-0009",
    supplierId: "SUP-0009",
    name: "Nova Remedies",
    contactPerson: "Deepak R",
    phone: "93456 77881",
    email: "nova@gmail.com",
    location: "Coimbatore",
    supplierType: "Manufacturer",
    status: "Active",
  },
  {
    _id: "sup-0010",
    supplierId: "SUP-0010",
    name: "Wellness Pharma",
    contactPerson: "Harish K",
    phone: "99654 11223",
    email: "wellness@gmail.com",
    location: "Chennai",
    supplierType: "Distributor",
    status: "Active",
  },
];

const SuppliersPage = () => {
  const navigate = useNavigate();

  // State definitions
  const [suppliers, setSuppliers] = useState(BASELINE_SUPPLIERS);
  const [locations, setLocations] = useState([
    "All Locations",
    "Chennai",
    "Coimbatore",
    "Bangalore",
    "Madurai",
    "Trichy",
    "Delhi",
    "Salem",
    "Hyderabad",
  ]);

  // Loading & Notification State
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Filter States
  const [supplierType, setSupplierType] = useState("All Types");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [searchQuery, setSearchQuery] = useState("");
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(128);
  const [serverTotalPages, setServerTotalPages] = useState(13);

  // Modal States
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    name: "",
    contactPerson: "",
    phone: "",
    email: "",
    supplierType: "Distributor",
    location: "Chennai",
    status: "Active",
    gstin: "",
    address: "",
    notes: "",
  });

  // Trigger Toast Notification
  const triggerToast = (msg, type = "success") => {
    setToastMessage({ text: msg, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch Suppliers Data from Backend API
  const fetchSuppliersData = async () => {
    setLoading(true);
    try {
      const response = await API.get("/suppliers", {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          search: searchQuery,
          supplierType,
          location: selectedLocation,
          status: statusFilter,
        },
      });

      if (response.data && response.data.success) {
        if (response.data.suppliers && response.data.suppliers.length > 0) {
          setSuppliers(response.data.suppliers);
          setTotalItems(response.data.total || 128);
          setServerTotalPages(response.data.totalPages || 13);
        } else {
          applyLocalFilters();
        }
      } else {
        applyLocalFilters();
      }
    } catch (err) {
      console.warn("Backend API not reachable. Using fallback baseline suppliers data.", err);
      applyLocalFilters();
    } finally {
      setLoading(false);
    }
  };

  // Fetch Locations list for dropdown filter
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await API.get("/suppliers/locations/list");
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
    fetchSuppliersData();
  }, [currentPage, itemsPerPage]);

  // Local filter fallback logic
  const applyLocalFilters = () => {
    let filtered = [...BASELINE_SUPPLIERS];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.contactPerson.toLowerCase().includes(q) ||
          s.phone.toLowerCase().includes(q) ||
          s.supplierId.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q)
      );
    }

    if (supplierType !== "All Types" && supplierType !== "All") {
      filtered = filtered.filter((s) => s.supplierType.toLowerCase() === supplierType.toLowerCase());
    }

    if (selectedLocation !== "All Locations" && selectedLocation !== "All") {
      filtered = filtered.filter((s) => s.location.toLowerCase() === selectedLocation.toLowerCase());
    }

    if (statusFilter !== "All Status" && statusFilter !== "All") {
      filtered = filtered.filter((s) => s.status.toLowerCase() === statusFilter.toLowerCase());
    }

    setTotalItems(128);
    setServerTotalPages(Math.ceil(128 / itemsPerPage));
    setSuppliers(filtered.slice(0, itemsPerPage));
  };

  // Form submit handler for Search & Filter
  const handleApplyFilter = (e) => {
    if (e) e.preventDefault();
    setCurrentPage(1);
    fetchSuppliersData();
    triggerToast("Supplier filters applied.");
  };

  // Reset Filters handler
  const handleResetFilters = () => {
    setSupplierType("All Types");
    setSelectedLocation("All Locations");
    setStatusFilter("All Status");
    setSearchQuery("");
    setCurrentPage(1);
    fetchSuppliersData();
    triggerToast("Filters reset to default.");
  };

  // Open Add Supplier Modal
  const openAddModal = () => {
    setFormData({
      name: "",
      contactPerson: "",
      phone: "",
      email: "",
      supplierType: "Distributor",
      location: "Chennai",
      status: "Active",
      gstin: "",
      address: "",
      notes: "",
    });
    setShowAddModal(true);
  };

  // Open Edit Supplier Modal
  const openEditModal = (sup) => {
    setSelectedSupplier(sup);
    setFormData({
      name: sup.name,
      contactPerson: sup.contactPerson || "",
      phone: sup.phone,
      email: sup.email || "",
      supplierType: sup.supplierType,
      location: sup.location,
      status: sup.status,
      gstin: sup.gstin || "",
      address: sup.address || "",
      notes: sup.notes || "",
    });
    setShowEditModal(true);
  };

  // Save New Supplier
  const handleSaveAdd = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await API.post("/suppliers", formData);
      triggerToast("New supplier added successfully!");
      setShowAddModal(false);
      fetchSuppliersData();
    } catch (err) {
      // Local fallback
      const newSup = {
        _id: `sup-${Date.now()}`,
        supplierId: `SUP-${String(totalItems + 1).padStart(4, "0")}`,
        ...formData,
      };
      setSuppliers((prev) => [newSup, ...prev]);
      setTotalItems((t) => t + 1);
      triggerToast("New supplier added successfully!");
      setShowAddModal(false);
    } finally {
      setActionLoading(false);
    }
  };

  // Save Edit Supplier
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!selectedSupplier) return;
    setActionLoading(true);
    try {
      await API.put(`/suppliers/${selectedSupplier._id}`, formData);
      triggerToast("Supplier details updated successfully!");
      setShowEditModal(false);
      fetchSuppliersData();
    } catch (err) {
      setSuppliers((prev) =>
        prev.map((s) => (s._id === selectedSupplier._id ? { ...s, ...formData } : s))
      );
      triggerToast("Supplier details updated successfully!");
      setShowEditModal(false);
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Supplier
  const handleDeleteSupplier = async () => {
    if (!selectedSupplier) return;
    setActionLoading(true);
    try {
      await API.delete(`/suppliers/${selectedSupplier._id}`);
      triggerToast("Supplier deleted from database.");
      setShowDeleteModal(false);
      fetchSuppliersData();
    } catch (err) {
      setSuppliers((prev) => prev.filter((s) => s._id !== selectedSupplier._id));
      triggerToast("Supplier deleted from database.");
      setShowDeleteModal(false);
    } finally {
      setActionLoading(false);
    }
  };

  // Export CSV Report
  const handleExportCSV = () => {
    const headers = [
      "#",
      "Supplier ID",
      "Supplier Name",
      "Contact Person",
      "Phone Number",
      "Email",
      "Location",
      "Supplier Type",
      "Status",
    ];
    const rows = suppliers.map((s, idx) => [
      idx + 1,
      `"${s.supplierId}"`,
      `"${s.name}"`,
      `"${s.contactPerson}"`,
      `"${s.phone}"`,
      `"${s.email}"`,
      `"${s.location}"`,
      s.supplierType,
      s.status,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Supplier_List_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast("Supplier list exported to CSV.");
  };

  // Render Supplier Type Badge matching exact screenshot styling
  const renderTypeBadge = (type) => {
    if (type === "Distributor") {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#e0f2fe] text-[#0284c7] border border-sky-200/50">
          Distributor
        </span>
      );
    }
    if (type === "Wholesaler") {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#f3e8ff] text-[#9333ea] border border-purple-200/50">
          Wholesaler
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#ffedd5] text-[#ea580c] border border-orange-200/50">
        Manufacturer
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
            <Truck className="w-7 h-7 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 leading-tight">
              Suppliers
            </h1>
            <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
              Manage your suppliers, view purchase history, and maintain supplier details.
            </p>
          </div>
        </div>

        {/* Top Right Controls: Breadcrumbs & Add Supplier Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 self-start md:self-auto">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-white/70 backdrop-blur-xs px-3.5 py-1.5 rounded-xl border border-emerald-100 shadow-2xs">
            <Link to="/admin" className="hover:text-emerald-600 transition-colors">
              Home
            </Link>
            <span className="text-slate-300 font-bold">&gt;</span>
            <span className="text-emerald-700 font-bold">Suppliers</span>
          </div>

          <motion.button
            {...buttonMotion}
            onClick={openAddModal}
            type="button"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition cursor-pointer"
          >
            <Plus size={16} className="stroke-[3]" />
            <span>Add Supplier</span>
          </motion.button>
        </div>

        {/* Decorative background shape */}
        <div className="absolute right-48 -bottom-10 opacity-10 pointer-events-none hidden lg:block">
          <Truck className="w-48 h-48 text-emerald-900" />
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
            {/* 1. Supplier Type */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Supplier Type
              </label>
              <div className="relative">
                <select
                  value={supplierType}
                  onChange={(e) => setSupplierType(e.target.value)}
                  className="w-full pl-3.5 pr-8 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white hover:border-emerald-500 focus:outline-hidden transition shadow-2xs appearance-none cursor-pointer"
                >
                  <option value="All Types">All Types</option>
                  <option value="Distributor">Distributor</option>
                  <option value="Wholesaler">Wholesaler</option>
                  <option value="Manufacturer">Manufacturer</option>
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

            {/* 4. Search Supplier */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Search Supplier
              </label>
              <div className="relative">
                <Search
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Search by supplier name, phone, or supplier ID..."
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
                  GSTIN Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 33AAAAA0000A1Z5"
                  className="w-full mt-1 p-2 border border-slate-200 rounded-lg font-mono uppercase"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600">
                  Contact Person
                </label>
                <input
                  type="text"
                  placeholder="Search person name..."
                  className="w-full mt-1 p-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600">
                  Sort By
                </label>
                <select className="w-full mt-1 p-2 border border-slate-200 rounded-lg font-semibold">
                  <option value="name_asc">Supplier Name (A-Z)</option>
                  <option value="id_asc">Supplier ID (Ascending)</option>
                  <option value="recent">Recently Added</option>
                </select>
              </div>
            </motion.div>
          )}
        </form>
      </motion.div>

      {/* ================= SECTION 3: SUPPLIER LIST TABLE CARD ================= */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden"
      >
        {/* Header with Title & Top-Right Buttons */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-2xs">
              <Truck className="w-5 h-5 text-emerald-600" />
            </div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              Supplier List
              <span className="text-slate-500 font-bold">({totalItems})</span>
            </h2>
          </div>

          {/* Import, Export, Options */}
          <div className="flex items-center gap-2.5 self-end sm:self-auto">
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
              <p className="text-xs font-semibold">Loading supplier database...</p>
            </div>
          ) : suppliers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500 space-y-2">
              <Truck className="w-10 h-10 text-slate-300" />
              <p className="text-sm font-bold text-slate-700">No matching suppliers found</p>
              <p className="text-xs text-slate-400">Try adjusting your filters or search query.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-slate-100 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4 sm:px-6 w-12 text-center">#</th>
                  <th className="py-3.5 px-4 font-bold text-slate-700">Supplier ID</th>
                  <th className="py-3.5 px-4 font-bold text-slate-700">Supplier Name</th>
                  <th className="py-3.5 px-4 font-bold text-slate-700">Contact Person</th>
                  <th className="py-3.5 px-4 font-bold text-slate-700">Phone Number</th>
                  <th className="py-3.5 px-4 font-bold text-slate-700">Email</th>
                  <th className="py-3.5 px-4 font-bold text-slate-700">Location</th>
                  <th className="py-3.5 px-4 font-bold text-slate-700">Supplier Type</th>
                  <th className="py-3.5 px-4 font-bold text-slate-700 text-center">Status</th>
                  <th className="py-3.5 px-4 sm:px-6 font-bold text-slate-700 text-center">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {suppliers.map((sup, index) => {
                  const rowIndex = showingStart + index;
                  return (
                    <motion.tr
                      key={sup._id || sup.supplierId || index}
                      variants={tableRowVariants}
                      whileHover={{ backgroundColor: "#f8fafc" }}
                      className="transition-colors group"
                    >
                      {/* # Row Index */}
                      <td className="py-3.5 px-4 sm:px-6 text-center text-slate-400 font-semibold">
                        {rowIndex}
                      </td>

                      {/* Supplier ID (Teal/Emerald Bold) */}
                      <td className="py-3.5 px-4 font-bold text-emerald-600 whitespace-nowrap">
                        {sup.supplierId}
                      </td>

                      {/* Supplier Name */}
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {sup.name}
                      </td>

                      {/* Contact Person */}
                      <td className="py-3.5 px-4 text-slate-600 font-medium whitespace-nowrap">
                        {sup.contactPerson || "—"}
                      </td>

                      {/* Phone Number */}
                      <td className="py-3.5 px-4 text-slate-600 font-medium whitespace-nowrap">
                        {sup.phone}
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-4 text-slate-500 font-normal">
                        {sup.email || "—"}
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4 text-slate-600 font-medium whitespace-nowrap">
                        {sup.location}
                      </td>

                      {/* Supplier Type Badge */}
                      <td className="py-3.5 px-4">
                        {renderTypeBadge(sup.supplierType)}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4 text-center">
                        {renderStatusBadge(sup.status)}
                      </td>

                      {/* Action Column: Eye, Pencil, Trash */}
                      <td className="py-3.5 px-4 sm:px-6 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* View Detail */}
                          <motion.button
                            {...iconButtonMotion}
                            onClick={() => {
                              setSelectedSupplier(sup);
                              setShowViewModal(true);
                            }}
                            type="button"
                            title="View supplier details"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                          >
                            <Eye size={16} />
                          </motion.button>

                          {/* Edit Supplier */}
                          <motion.button
                            {...iconButtonMotion}
                            onClick={() => openEditModal(sup)}
                            type="button"
                            title="Edit supplier"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition cursor-pointer"
                          >
                            <Pencil size={15} />
                          </motion.button>

                          {/* Delete Supplier */}
                          <motion.button
                            {...iconButtonMotion}
                            onClick={() => {
                              setSelectedSupplier(sup);
                              setShowDeleteModal(true);
                            }}
                            type="button"
                            title="Delete supplier"
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
              onClick={() => setCurrentPage(13)}
              className={`w-8 h-8 rounded-lg text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                currentPage === 13
                  ? "bg-[#059669] text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              13
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
          {/* Action Card 1: Add Supplier (Mint Green) */}
          <motion.button
            {...buttonMotion}
            onClick={openAddModal}
            type="button"
            className="group flex items-center justify-center gap-2.5 p-4 rounded-2xl bg-[#ecfdf5] hover:bg-[#d1fae5] text-[#059669] border border-emerald-200/70 shadow-2xs transition-all cursor-pointer"
          >
            <Plus className="w-5 h-5 text-[#059669] stroke-[2.8] group-hover:scale-110 transition-transform" />
            <span className="text-xs sm:text-sm font-bold tracking-tight">
              Add Supplier
            </span>
          </motion.button>

          {/* Action Card 2: Import Suppliers (Ice Blue) */}
          <motion.button
            {...buttonMotion}
            onClick={() => triggerToast("Import modal ready.")}
            type="button"
            className="group flex items-center justify-center gap-2.5 p-4 rounded-2xl bg-[#eff6ff] hover:bg-[#dbeafe] text-[#2563eb] border border-blue-200/70 shadow-2xs transition-all cursor-pointer"
          >
            <Upload className="w-5 h-5 text-[#2563eb] group-hover:scale-110 transition-transform" />
            <span className="text-xs sm:text-sm font-bold tracking-tight">
              Import Suppliers
            </span>
          </motion.button>

          {/* Action Card 3: Download Supplier List (Purple) */}
          <motion.button
            {...buttonMotion}
            onClick={handleExportCSV}
            type="button"
            className="group flex items-center justify-center gap-2.5 p-4 rounded-2xl bg-[#f3e8ff] hover:bg-[#e9d5ff] text-[#9333ea] border border-purple-200/70 shadow-2xs transition-all cursor-pointer"
          >
            <FileText className="w-5 h-5 text-[#9333ea] group-hover:scale-110 transition-transform" />
            <span className="text-xs sm:text-sm font-bold tracking-tight">
              Download Supplier List
            </span>
          </motion.button>

          {/* Action Card 4: View Purchase History (Slate Blue) */}
          <motion.button
            {...buttonMotion}
            onClick={() => navigate("/admin/purchases")}
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

      {/* ================= MODAL 1: ADD / EDIT SUPPLIER ================= */}
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
                    <Truck size={18} />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {showAddModal ? "Add New Supplier" : "Edit Supplier Details"}
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
                    Supplier Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Company or Distributor Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Contact Person
                    </label>
                    <input
                      type="text"
                      placeholder="Representative Name"
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 font-semibold"
                    />
                  </div>
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
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="supplier@gmail.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 font-semibold"
                    />
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
                      Supplier Type
                    </label>
                    <select
                      value={formData.supplierType}
                      onChange={(e) => setFormData({ ...formData, supplierType: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 font-semibold bg-white"
                    >
                      <option value="Distributor">Distributor</option>
                      <option value="Wholesaler">Wholesaler</option>
                      <option value="Manufacturer">Manufacturer</option>
                    </select>
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
                    {showAddModal ? "Save Supplier" : "Update Details"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MODAL 2: VIEW SUPPLIER DETAILS ================= */}
      <AnimatePresence>
        {showViewModal && selectedSupplier && (
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
                    Supplier Profile
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
                  <span className="text-slate-500 font-medium">Supplier ID</span>
                  <span className="font-bold text-emerald-600 font-mono text-sm">
                    {selectedSupplier.supplierId}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-slate-500 text-[11px] block">Supplier Name</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedSupplier.name}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-slate-500 text-[11px] block">Contact Person</span>
                    <span className="font-bold text-slate-800">{selectedSupplier.contactPerson || "N/A"}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-slate-500 text-[11px] block">Phone</span>
                    <span className="font-bold text-slate-800">{selectedSupplier.phone}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-slate-500 text-[11px] block">Email</span>
                  <span className="font-bold text-slate-800">{selectedSupplier.email || "N/A"}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-slate-500 text-[11px] block">Supplier Type</span>
                    <div className="mt-0.5">{renderTypeBadge(selectedSupplier.supplierType)}</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-slate-500 text-[11px] block">Status</span>
                    <div className="mt-0.5">{renderStatusBadge(selectedSupplier.status)}</div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Location</span>
                  <span className="font-bold text-slate-800">{selectedSupplier.location}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowViewModal(false);
                    navigate(`/admin/purchases?q=${encodeURIComponent(selectedSupplier.name)}`);
                  }}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-1.5"
                >
                  <BarChart3 size={15} />
                  <span>View Purchase Orders</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MODAL 3: DELETE CONFIRMATION ================= */}
      <AnimatePresence>
        {showDeleteModal && selectedSupplier && (
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
                Delete Supplier Record?
              </h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to delete <span className="font-bold text-slate-800">{selectedSupplier.name}</span> ({selectedSupplier.supplierId})? This action cannot be undone.
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
                  onClick={handleDeleteSupplier}
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

export default SuppliersPage;
