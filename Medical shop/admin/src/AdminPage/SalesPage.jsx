import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  RotateCcw,
  Calendar,
  User,
  CreditCard,
  Search,
  Plus,
  Download,
  Printer,
  MoreVertical,
  Eye,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  CheckCircle2,
  FileText,
  Loader2,
  Trash2,
} from "lucide-react";
import API from "../api/axios";
import { itemVariants, buttonMotion, containerVariants, tableRowVariants } from "./components/pageMotion";

// Format date into exact pattern: "03 Sep 2026 10:24 AM"
const formatDateTime = (d) => {
  if (!d) return "03 Sep 2026 10:24 AM";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "03 Sep 2026 10:24 AM";
  const day = String(dt.getDate()).padStart(2, "0");
  const month = dt.toLocaleString("en-US", { month: "short" });
  const year = dt.getFullYear();
  const time = dt.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return `${day} ${month} ${year}  ${time}`;
};

// Custom SVG Icons matching image precisely
const FunnelIcon = ({ className = "w-5 h-5 text-emerald-600" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M3 4a1 1 0 0 1 1-1h16a1 1 0 0 1 .75 1.664l-6.25 7.143v6.693a1 1 0 0 1-.45.832l-3 2A1 1 0 0 1 9.5 20.5v-7.693L3.25 5.664A1 1 0 0 1 3 4z" />
  </svg>
);

const ListBulletIcon = ({ className = "w-5 h-5 text-emerald-600" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="9" y1="6" x2="20" y2="6" />
    <line x1="9" y1="12" x2="20" y2="12" />
    <line x1="9" y1="18" x2="20" y2="18" />
    <circle cx="4.5" cy="6" r="1.5" fill="currentColor" />
    <circle cx="4.5" cy="12" r="1.5" fill="currentColor" />
    <circle cx="4.5" cy="18" r="1.5" fill="currentColor" />
  </svg>
);

const SalesPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter states
  const [dateRangeFilter, setDateRangeFilter] = useState("01 Sep 2026 - 03 Sep 2026");
  const [customerFilter, setCustomerFilter] = useState("All Customers");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("All Methods");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals & action states
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showNewSaleModal, setShowNewSaleModal] = useState(false);
  const [submittingSale, setSubmittingSale] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState(null);
  const [newSaleForm, setNewSaleForm] = useState({
    customerName: "Walk-in Customer",
    customerPhone: "9876543210",
    customerEmail: "",
    medicineId: "",
    quantity: 1,
    paymentMethod: "Cash",
  });

  // Fetch sales records & medicines from backend
  const fetchOrdersFromDb = async () => {
    try {
      setLoading(true);
      setError("");
      const [ordersRes, medsRes] = await Promise.all([
        API.get("/admin/orders").catch(() => API.get("/orders")),
        API.get("/medicines/all").catch(() => API.get("/medicines")).catch(() => ({ data: [] })),
      ]);

      let fo = ordersRes.data?.orders || ordersRes.data?.data || ordersRes.data || [];
      if (!Array.isArray(fo)) fo = [];
      setOrders(fo);

      const fm =
        medsRes.data?.medicines ||
        medsRes.data?.data ||
        (Array.isArray(medsRes.data) ? medsRes.data : []);
      setMedicines(fm);
      if (fm.length > 0 && !newSaleForm.medicineId) {
        setNewSaleForm((p) => ({ ...p, medicineId: fm[0]._id }));
      }
    } catch (err) {
      console.error("Sales fetch error:", err);
      setError(err.response?.data?.message || "Failed to fetch sales records from database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersFromDb();
  }, []);

  // Unique customers list for filter dropdown
  const uniqueCustomers = useMemo(() => {
    const s = new Set();
    orders.forEach((o) => {
      const n = (o.customerName || o.user?.name || "").trim();
      if (n) s.add(n);
    });
    return Array.from(s);
  }, [orders]);

  // Filtered orders computation
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (appliedSearch.trim()) {
        const q = appliedSearch.toLowerCase();
        const inv = (order.orderId || order._id || "").toLowerCase();
        const cust = (order.customerName || order.user?.name || "").toLowerCase();
        const item = Array.isArray(order.items)
          ? order.items.some((i) => (i.name || "").toLowerCase().includes(q))
          : false;
        if (!inv.includes(q) && !cust.includes(q) && !item) return false;
      }
      if (customerFilter !== "All Customers") {
        const custName = (order.customerName || order.user?.name || "").trim().toLowerCase();
        if (custName !== customerFilter.toLowerCase()) return false;
      }
      if (paymentMethodFilter !== "All Methods") {
        const pm = (order.paymentMethod || "").toLowerCase();
        if (!pm.includes(paymentMethodFilter.toLowerCase())) return false;
      }
      if (statusFilter !== "All Status") {
        const st = (order.orderStatus || order.deliveryStatus || order.paymentStatus || "").toLowerCase();
        if (statusFilter === "Completed" && !["delivered", "completed", "paid", "confirmed"].includes(st))
          return false;
        if (statusFilter === "Pending" && !["pending", "processing", "placed", "unpaid"].includes(st))
          return false;
        if (statusFilter === "Cancelled" && st !== "cancelled") return false;
      }
      return true;
    });
  }, [orders, appliedSearch, customerFilter, paymentMethodFilter, statusFilter]);

  // Pagination calculations
  const totalEntries = filteredOrders.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const currentRecords = filteredOrders.slice(startIndex, startIndex + pageSize);

  // Pagination numbers builder matching reference (e.g. 1, 2, 3, 4, 5, ..., 25)
  const getPageNums = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, "...", totalPages];
    }
    if (currentPage >= totalPages - 3) {
      return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
  };

  const handleApplyFilter = (e) => {
    e?.preventDefault();
    setAppliedSearch(searchQuery);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setDateRangeFilter("01 Sep 2026 - 03 Sep 2026");
    setCustomerFilter("All Customers");
    setPaymentMethodFilter("All Methods");
    setStatusFilter("All Status");
    setSearchQuery("");
    setAppliedSearch("");
    setCurrentPage(1);
  };

  // CSV Export feature
  const handleExportCSV = () => {
    if (!filteredOrders.length) {
      alert("No sales records to export.");
      return;
    }
    const headers = [
      "#",
      "Invoice No",
      "Date & Time",
      "Customer Name",
      "Items",
      "Total Amount",
      "Payment Method",
      "Status",
    ];
    const rows = filteredOrders.map((o, idx) => {
      const inv = o.orderId || `INV-${String(o._id).slice(-6).toUpperCase()}`;
      const cust = o.customerName || o.user?.name || "Walk-in Customer";
      const totalItems = Array.isArray(o.items)
        ? o.items.reduce((sum, item) => sum + Number(item.quantity || 1), 0)
        : 1;
      const amt = Number(o.totalAmount || 0).toFixed(2);
      const pm = o.paymentMethod || "Cash";
      return [
        idx + 1,
        `"${inv}"`,
        `"${formatDateTime(o.createdAt)}"`,
        `"${cust}"`,
        totalItems,
        `"${amt}"`,
        `"${pm}"`,
        `"Completed"`,
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Sales_Transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Create new direct counter sale
  const handleCreateNewSale = async (e) => {
    e.preventDefault();
    try {
      setSubmittingSale(true);
      const med = medicines.find((m) => m._id === newSaleForm.medicineId);
      const unitPrice = med ? med.price : 120;
      const sub = unitPrice * Number(newSaleForm.quantity || 1);

      const payload = {
        customerName: newSaleForm.customerName.trim() || "Walk-in Customer",
        customerPhone: newSaleForm.customerPhone.trim() || "9876543210",
        customerEmail: newSaleForm.customerEmail.trim(),
        totalAmount: sub,
        subtotal: sub,
        paymentMethod: newSaleForm.paymentMethod,
        paymentStatus: "PAID",
        orderStatus: "DELIVERED",
        deliveryStatus: "DELIVERED",
        items: [
          {
            productId: med?._id,
            name: med?.name || "Medicine",
            price: unitPrice,
            quantity: Number(newSaleForm.quantity || 1),
            subtotal: sub,
          },
        ],
      };

      await API.post("/admin/orders", payload).catch(async () => await API.post("/orders", payload));
      await fetchOrdersFromDb();
      setShowNewSaleModal(false);
      setNewSaleForm({
        customerName: "Walk-in Customer",
        customerPhone: "9876543210",
        customerEmail: "",
        medicineId: medicines[0]?._id || "",
        quantity: 1,
        paymentMethod: "Cash",
      });
    } catch (err) {
      console.error(err);
      alert("Failed to save sale.");
    } finally {
      setSubmittingSale(false);
    }
  };

  const handleClearAllOrders = async () => {
    if (!window.confirm("Are you sure you want to delete ALL sales & orders from the database? This cannot be undone.")) {
      return;
    }
    try {
      setLoading(true);
      await API.delete("/admin/orders/clear/all").catch(() => API.delete("/admin/orders/clear-all"));
      await fetchOrdersFromDb();
      alert("All sales orders cleared from database successfully.");
    } catch (err) {
      console.error(err);
      alert("Failed to clear sales records.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="space-y-6 pb-8 text-slate-800"
    >
      {/* 1. Top Title & Breadcrumb Header */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">Sales</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
            Manage your sales, view invoices, and track revenue.
          </p>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 self-start sm:self-auto flex-wrap">
          {/* Breadcrumbs: Home > Sales */}
          <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-500">
            <Link to="/admin" className="hover:text-emerald-600 transition">
              Home
            </Link>
            <span className="text-slate-400 font-light">&gt;</span>
            <span className="text-slate-700 font-semibold">Sales</span>
          </div>

          {orders.length > 0 && (
            <motion.button
              {...buttonMotion}
              onClick={handleClearAllOrders}
              className="inline-flex items-center gap-1.5 rounded-xl bg-rose-50 border border-rose-200 hover:bg-rose-100 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-rose-700 shadow-2xs transition-colors cursor-pointer"
            >
              <Trash2 size={15} />
              <span>Clear All Sales</span>
            </motion.button>
          )}

          {/* New Sale Button with Plus icon */}
          <motion.button
            {...buttonMotion}
            onClick={() => setShowNewSaleModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#009b72] hover:bg-[#008964] px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs transition-colors cursor-pointer"
          >
            <Plus size={16} strokeWidth={2.6} />
            <span>New Sale</span>
          </motion.button>
        </div>
      </motion.div>

      {/* 2. Search & Filter Card */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-2xl border border-[#e8edf0] p-5 sm:p-6 shadow-xs space-y-5"
      >
        {/* Card Header: Search & Filter title + Clear Filters button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 font-bold text-base sm:text-[17px] text-[#1e293b]">
            <FunnelIcon className="w-5 h-5 text-[#009b72]" />
            <span>Search &amp; Filter</span>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleClearFilters}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-200/90 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition cursor-pointer"
          >
            <RotateCcw size={13} className="text-slate-500" />
            <span>Clear Filters</span>
          </motion.button>
        </div>

        {/* 4 Filter Dropdown Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Date Range Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Date Range</label>
            <div className="relative">
              <Calendar
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <select
                value={dateRangeFilter}
                onChange={(e) => {
                  setDateRangeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full appearance-none pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-normal text-slate-700 hover:border-slate-300 focus:border-emerald-500 focus:outline-none transition cursor-pointer"
              >
                <option value="01 Sep 2026 - 03 Sep 2026">01 Sep 2026 - 03 Sep 2026</option>
                <option value="Today">Today</option>
                <option value="This Week">This Week</option>
                <option value="This Month">This Month</option>
                <option value="All Dates">All Recorded Dates</option>
              </select>
              <ChevronDown
                size={15}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>
          </div>

          {/* Customer Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Customer</label>
            <div className="relative">
              <User
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <select
                value={customerFilter}
                onChange={(e) => {
                  setCustomerFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full appearance-none pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-normal text-slate-700 hover:border-slate-300 focus:border-emerald-500 focus:outline-none transition cursor-pointer"
              >
                <option value="All Customers">All Customers</option>
                <option value="Walk-in Customer">Walk-in Customer</option>
                {uniqueCustomers
                  .filter((c) => c !== "Walk-in Customer")
                  .map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
              </select>
              <ChevronDown
                size={15}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Payment Method</label>
            <div className="relative">
              <CreditCard
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <select
                value={paymentMethodFilter}
                onChange={(e) => {
                  setPaymentMethodFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full appearance-none pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-normal text-slate-700 hover:border-slate-300 focus:border-emerald-500 focus:outline-none transition cursor-pointer"
              >
                <option value="All Methods">All Methods</option>
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Card">Card</option>
              </select>
              <ChevronDown
                size={15}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>
          </div>

          {/* Invoice Status Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Invoice Status</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#7c3aed] flex items-center justify-center pointer-events-none">
                <span className="w-1 h-1 rounded-full bg-white" />
              </span>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full appearance-none pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-normal text-slate-700 hover:border-slate-300 focus:border-emerald-500 focus:outline-none transition cursor-pointer"
              >
                <option value="All Status">All Status</option>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <ChevronDown
                size={15}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>
          </div>
        </div>

        {/* Search Bar + Apply Filter Button */}
        <form onSubmit={handleApplyFilter} className="flex flex-col sm:flex-row items-stretch gap-3">
          <div className="relative flex-1">
            <Search
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search by Invoice No, Customer Name, Medicine, or Batch No..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none transition"
            />
          </div>

          <motion.button
            {...buttonMotion}
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#009b72] hover:bg-[#008964] px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white shadow-xs transition-colors cursor-pointer shrink-0"
          >
            <FunnelIcon className="w-4 h-4 text-white" />
            <span>Apply Filter</span>
          </motion.button>
        </form>
      </motion.div>

      {/* 3. Sales Transactions Table Card */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-2xl border border-[#e8edf0] shadow-xs overflow-hidden"
      >
        {/* Card Header: Sales Transactions + Export / Print / More */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 sm:px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5 font-bold text-base sm:text-[17px] text-[#1e293b]">
            <ListBulletIcon className="w-5 h-5 text-[#009b72]" />
            <span>Sales Transactions</span>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            {/* Export Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              <Download size={14} className="text-slate-600" />
              <span>Export</span>
            </motion.button>

            {/* Print Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              <Printer size={14} className="text-slate-600" />
              <span>Print</span>
            </motion.button>

            {/* More button */}
            <button
              onClick={() => alert("Options: Refresh list, customize columns.")}
              className="p-1.5 sm:p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition cursor-pointer"
            >
              <MoreVertical size={16} />
            </button>
          </div>
        </div>

        {/* Table Body Area */}
        {loading ? (
          <div className="py-24 text-center space-y-3">
            <Loader2 size={34} className="animate-spin mx-auto text-[#009b72]" />
            <p className="text-sm font-medium text-slate-500">Loading sales transactions from database...</p>
          </div>
        ) : error ? (
          <div className="py-16 text-center space-y-3">
            <AlertCircle size={32} className="mx-auto text-rose-500" />
            <p className="text-sm font-semibold text-rose-600">{error}</p>
            <button
              onClick={fetchOrdersFromDb}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : currentRecords.length === 0 ? (
          <div className="py-20 text-center space-y-2">
            <FileText size={38} className="mx-auto text-slate-300" />
            <p className="text-base font-bold text-slate-700">No Sales Found</p>
            <p className="text-xs text-slate-400">No records match your active search or filters.</p>
            <button
              onClick={handleClearFilters}
              className="text-xs font-semibold text-[#009b72] hover:underline mt-1 cursor-pointer"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[920px]">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-slate-200/80 text-[11px] sm:text-xs font-bold text-slate-600 tracking-wider">
                  <th className="py-3.5 pl-6 pr-2 w-12">#</th>
                  <th className="py-3.5 px-3">Invoice No</th>
                  <th className="py-3.5 px-3">Date &amp; Time</th>
                  <th className="py-3.5 px-3">Customer Name</th>
                  <th className="py-3.5 px-3 text-center">Items</th>
                  <th className="py-3.5 px-3">Total Amount</th>
                  <th className="py-3.5 px-3">Payment Method</th>
                  <th className="py-3.5 px-3 text-center">Status</th>
                  <th className="py-3.5 pr-6 pl-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-[13px]">
                {currentRecords.map((order, idx) => {
                  const invoiceNum = order.orderId || `INV-${String(order._id).slice(-6).toUpperCase()}`;
                  const custName = order.customerName || order.user?.name || "Walk-in Customer";
                  const itemCount = Array.isArray(order.items)
                    ? order.items.reduce((acc, it) => acc + Number(it.quantity || 1), 0)
                    : 1;
                  const total = Number(order.totalAmount || 0);
                  const payMethod = order.paymentMethod || "Cash";

                  return (
                    <motion.tr
                      key={order._id || idx}
                      custom={idx}
                      variants={tableRowVariants}
                      initial="initial"
                      animate="animate"
                      className="hover:bg-[#f9fcfa] transition-colors"
                    >
                      {/* # Serial */}
                      <td className="py-3.5 pl-6 pr-2 text-slate-500 font-medium">{startIndex + idx + 1}</td>

                      {/* Invoice No (Emerald Green) */}
                      <td className="py-3.5 px-3">
                        <button
                          onClick={() => setSelectedInvoice(order)}
                          className="font-semibold text-[#009b72] hover:underline font-mono cursor-pointer"
                        >
                          {invoiceNum}
                        </button>
                      </td>

                      {/* Date & Time */}
                      <td className="py-3.5 px-3 text-slate-600 whitespace-nowrap">
                        {formatDateTime(order.createdAt)}
                      </td>

                      {/* Customer Name */}
                      <td className="py-3.5 px-3 font-medium text-slate-800">{custName}</td>

                      {/* Items */}
                      <td className="py-3.5 px-3 text-center text-slate-600 font-medium">{itemCount}</td>

                      {/* Total Amount */}
                      <td className="py-3.5 px-3 font-semibold text-slate-800">
                        ₹ {total.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* Payment Method */}
                      <td className="py-3.5 px-3 text-slate-600">{payMethod}</td>

                      {/* Status badge (Completed mint green) */}
                      <td className="py-3.5 px-3 text-center">
                        <span className="inline-block px-3 py-0.5 rounded-md text-[11px] font-medium bg-[#e6f8f2] text-[#059669]">
                          Completed
                        </span>
                      </td>

                      {/* Action Icons */}
                      <td className="py-3.5 pr-6 pl-3 text-center">
                        <div className="flex items-center justify-center gap-2 text-slate-400">
                          {/* Eye: View Invoice */}
                          <button
                            onClick={() => setSelectedInvoice(order)}
                            title="View Invoice"
                            className="p-1 rounded-md hover:text-[#009b72] hover:bg-emerald-50 transition cursor-pointer"
                          >
                            <Eye size={15} />
                          </button>

                          {/* Printer: Print receipt */}
                          <button
                            onClick={() => {
                              setSelectedInvoice(order);
                              setTimeout(() => window.print(), 350);
                            }}
                            title="Print Invoice"
                            className="p-1 rounded-md hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                          >
                            <Printer size={15} />
                          </button>

                          {/* 3 dots */}
                          <div className="relative">
                            <button
                              onClick={() => setActionMenuOpen(actionMenuOpen === order._id ? null : order._id)}
                              title="More Options"
                              className="p-1 rounded-md hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                            >
                              <MoreVertical size={15} />
                            </button>

                            {actionMenuOpen === order._id && (
                              <div
                                onMouseLeave={() => setActionMenuOpen(null)}
                                className="absolute right-0 mt-1 w-32 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-20 text-left text-xs font-medium"
                              >
                                <button
                                  onClick={() => {
                                    setSelectedInvoice(order);
                                    setActionMenuOpen(null);
                                  }}
                                  className="w-full px-3 py-1.5 hover:bg-slate-50 text-slate-700"
                                >
                                  View Details
                                </button>
                                <button
                                  onClick={() => {
                                    handleExportCSV();
                                    setActionMenuOpen(null);
                                  }}
                                  className="w-full px-3 py-1.5 hover:bg-slate-50 text-slate-700"
                                >
                                  Export Sale
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. Bottom Pagination Row matching reference */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 sm:px-6 py-4 border-t border-slate-100 bg-white">
          {/* Showing X to Y of Z entries */}
          <div className="text-xs sm:text-[13px] text-slate-500 font-normal">
            Showing {totalEntries === 0 ? 0 : startIndex + 1} to{" "}
            {Math.min(startIndex + pageSize, totalEntries)} of {totalEntries} entries
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center gap-1.5">
            {/* Left Chevron */}
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
            >
              <ChevronLeft size={15} />
            </button>

            {/* Page number buttons */}
            {getPageNums().map((p, idx) =>
              p === "..." ? (
                <span key={`ellipsis-${idx}`} className="px-1.5 text-slate-400 text-xs font-medium">
                  ...
                </span>
              ) : (
                <button
                  key={`page-${p}`}
                  onClick={() => setCurrentPage(p)}
                  className={`w-8 h-8 rounded-lg text-xs sm:text-[13px] font-semibold transition cursor-pointer ${
                    currentPage === p
                      ? "bg-[#009b72] text-white shadow-2xs"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {p}
                </button>
              )
            )}

            {/* Right Chevron */}
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
            >
              <ChevronRight size={15} />
            </button>

            {/* Page size dropdown */}
            <div className="relative ml-2">
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="appearance-none pl-3 pr-7 py-1.5 rounded-lg border border-slate-200 bg-white text-xs sm:text-[13px] font-medium text-slate-700 hover:border-slate-300 focus:outline-none cursor-pointer"
              >
                <option value={10}>10 / page</option>
                <option value={20}>20 / page</option>
                <option value={50}>50 / page</option>
                <option value={100}>100 / page</option>
              </select>
              <ChevronDown
                size={13}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* 5. View / Print Invoice Modal */}
      <AnimatePresence>
        {selectedInvoice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              transition={{ type: "spring", stiffness: 450, damping: 30 }}
              className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200"
            >
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[11px] uppercase font-bold text-[#009b72] tracking-wider">
                    Tax Invoice / Receipt
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 font-mono mt-0.5">
                    #{selectedInvoice.orderId || selectedInvoice._id}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">{formatDateTime(selectedInvoice.createdAt)}</p>
                </div>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="py-4 border-b border-slate-100 text-xs space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer Name</span>
                  <span className="font-semibold text-slate-800">
                    {selectedInvoice.customerName || selectedInvoice.user?.name || "Walk-in Customer"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Method</span>
                  <span className="font-semibold text-slate-800">{selectedInvoice.paymentMethod || "Cash"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status</span>
                  <span className="font-semibold text-[#059669] bg-[#e6f8f2] px-2.5 py-0.5 rounded-md text-[11px]">
                    Completed
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="py-4 border-b border-slate-100 text-xs">
                <p className="font-bold text-slate-700 mb-2">Items Purchased</p>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {(selectedInvoice.items || []).map((it, i) => (
                    <div key={i} className="flex justify-between text-slate-700">
                      <span>
                        {it.name} <span className="text-slate-400 font-mono">x{it.quantity}</span>
                      </span>
                      <span className="font-semibold">₹ {Number(it.subtotal || it.price || 0).toFixed(2)}</span>
                    </div>
                  ))}
                  {(!selectedInvoice.items || selectedInvoice.items.length === 0) && (
                    <p className="text-slate-400 italic">No item breakdown available.</p>
                  )}
                </div>
              </div>

              {/* Total Amount */}
              <div className="py-4 flex justify-between items-center">
                <span className="font-bold text-slate-800">Total Amount Paid</span>
                <span className="text-2xl font-black text-[#009b72] font-mono">
                  ₹ {Number(selectedInvoice.totalAmount || 0).toFixed(2)}
                </span>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-[#009b72] hover:bg-[#008964] text-white text-xs font-semibold flex items-center gap-2 cursor-pointer transition"
                >
                  <Printer size={15} /> Print Invoice
                </button>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer transition"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 6. New Sale Modal */}
      <AnimatePresence>
        {showNewSaleModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              transition={{ type: "spring", stiffness: 450, damping: 30 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">New Counter Sale</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Record a sale directly to the database.</p>
                </div>
                <button
                  onClick={() => setShowNewSaleModal(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateNewSale} className="space-y-4 pt-4 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Customer Name</label>
                  <input
                    type="text"
                    required
                    value={newSaleForm.customerName}
                    onChange={(e) => setNewSaleForm({ ...newSaleForm, customerName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:border-emerald-500 focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Customer Phone</label>
                  <input
                    type="text"
                    value={newSaleForm.customerPhone}
                    onChange={(e) => setNewSaleForm({ ...newSaleForm, customerPhone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:border-emerald-500 focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Select Medicine</label>
                  <select
                    value={newSaleForm.medicineId}
                    onChange={(e) => setNewSaleForm({ ...newSaleForm, medicineId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:border-emerald-500 focus:outline-none transition cursor-pointer"
                  >
                    {medicines.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.name} (₹{m.price}) - Stock: {m.stock}
                      </option>
                    ))}
                    {medicines.length === 0 && <option value="">General Medicine (₹120)</option>}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={newSaleForm.quantity}
                      onChange={(e) =>
                        setNewSaleForm({ ...newSaleForm, quantity: Math.max(1, Number(e.target.value)) })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:border-emerald-500 focus:outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Payment Method</label>
                    <select
                      value={newSaleForm.paymentMethod}
                      onChange={(e) => setNewSaleForm({ ...newSaleForm, paymentMethod: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:border-emerald-500 focus:outline-none transition cursor-pointer"
                    >
                      <option value="Cash">Cash</option>
                      <option value="UPI">UPI</option>
                      <option value="Card">Card</option>
                    </select>
                  </div>
                </div>

                <div className="pt-3 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowNewSaleModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingSale}
                    className="px-5 py-2.5 rounded-xl bg-[#009b72] hover:bg-[#008964] text-white text-xs font-semibold flex items-center gap-2 cursor-pointer disabled:opacity-50 transition"
                  >
                    {submittingSale ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
                    <span>Save Sale</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SalesPage;

