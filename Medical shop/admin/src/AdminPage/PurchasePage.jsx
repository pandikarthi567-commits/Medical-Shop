import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ListFilter,
  RotateCcw,
  Calendar,
  User,
  CreditCard,
  CircleDot,
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
  AlertCircle,
  ShoppingCart,
  Loader2,
  Trash2,
  Package,
  Building2,
  ClipboardList,
} from "lucide-react";
import API from "../api/axios";
import { pageVariants, itemVariants, buttonMotion } from "./components/pageMotion";

// Format date like "03 Sep 2026  10:24 AM"
const formatDateTime = (dateVal) => {
  if (!dateVal) return "N/A";
  const d = new Date(dateVal);
  if (Number.isNaN(d.getTime())) return "N/A";
  const dateStr = d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const timeStr = d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return `${dateStr}  ${timeStr}`;
};

const statusColors = {
  RECEIVED: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  PENDING: "bg-amber-50 text-amber-700 border border-amber-200",
  CANCELLED: "bg-rose-50 text-rose-700 border border-rose-200",
};

const paymentStatusColors = {
  PAID: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  PENDING: "bg-amber-50 text-amber-700 border border-amber-200",
  PARTIAL: "bg-blue-50 text-blue-700 border border-blue-200",
};

const EMPTY_ITEM = {
  medicineId: "",
  name: "",
  brand: "",
  category: "",
  batchNo: "",
  expiryDate: "",
  unitCost: "",
  quantity: 1,
};

const PurchasePage = () => {
  // ─── Data from DB ────────────────────────────────────────────────
  const [purchases, setPurchases] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [suppliersList, setSuppliersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ─── Filters ─────────────────────────────────────────────────────
  const [dateRangeFilter, setDateRangeFilter] = useState("All Dates");
  const [supplierFilter, setSupplierFilter] = useState("All Suppliers");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("All Methods");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");

  // ─── Pagination ──────────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // ─── Modals ──────────────────────────────────────────────────────
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [showNewPurchaseModal, setShowNewPurchaseModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // ─── New Purchase Form ───────────────────────────────────────────
  const [newPurchaseForm, setNewPurchaseForm] = useState({
    supplierName: "",
    supplierPhone: "",
    supplierEmail: "",
    invoiceNo: "",
    paymentMethod: "Cash",
    paymentStatus: "PAID",
    purchaseStatus: "RECEIVED",
    note: "",
    items: [{ ...EMPTY_ITEM }],
  });

  // ─── Fetch Data ──────────────────────────────────────────────────
  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [purchasesRes, medsRes, supsRes] = await Promise.all([
        API.get("/purchases"),
        API.get("/medicines/all").catch(() => ({ data: [] })),
        API.get("/suppliers?limit=100").catch(() => ({ data: { suppliers: [] } })),
      ]);

      const fetchedPurchases =
        purchasesRes.data?.purchases ||
        (Array.isArray(purchasesRes.data) ? purchasesRes.data : []);
      setPurchases(fetchedPurchases);

      const fetchedMeds =
        medsRes.data?.medicines ||
        medsRes.data?.data ||
        (Array.isArray(medsRes.data) ? medsRes.data : []);
      setMedicines(fetchedMeds);

      const fetchedSups =
        supsRes.data?.suppliers ||
        (Array.isArray(supsRes.data) ? supsRes.data : []);
      setSuppliersList(fetchedSups);
    } catch (err) {
      console.error("Fetch purchases error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to fetch purchase records from database."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ─── Unique suppliers from DB ────────────────────────────────────
  const uniqueSuppliers = useMemo(() => {
    const set = new Set();
    suppliersList.forEach((s) => s.name && set.add(s.name.trim()));
    purchases.forEach((p) => {
      const name = (p.supplierName || "").trim();
      if (name) set.add(name);
    });
    return Array.from(set);
  }, [suppliersList, purchases]);

  // ─── Filter Logic ────────────────────────────────────────────────
  const filteredPurchases = useMemo(() => {
    return purchases.filter((p) => {
      // Search
      if (appliedSearch.trim()) {
        const q = appliedSearch.toLowerCase().trim();
        const pid = (p.purchaseId || p._id || "").toLowerCase();
        const sup = (p.supplierName || "").toLowerCase();
        const inv = (p.invoiceNo || "").toLowerCase();
        const itemMatch = Array.isArray(p.items)
          ? p.items.some((i) => (i.name || "").toLowerCase().includes(q))
          : false;
        if (
          !pid.includes(q) &&
          !sup.includes(q) &&
          !inv.includes(q) &&
          !itemMatch
        ) {
          return false;
        }
      }

      // Supplier
      if (supplierFilter !== "All Suppliers") {
        if (
          (p.supplierName || "").toLowerCase() !==
          supplierFilter.toLowerCase()
        ) {
          return false;
        }
      }

      // Payment Method
      if (paymentMethodFilter !== "All Methods") {
        const pm = (p.paymentMethod || "").toLowerCase();
        if (!pm.includes(paymentMethodFilter.toLowerCase())) return false;
      }

      // Status
      if (statusFilter !== "All Status") {
        const st = (p.purchaseStatus || "").toLowerCase();
        if (statusFilter === "Received" && st !== "received") return false;
        if (statusFilter === "Pending" && st !== "pending") return false;
        if (statusFilter === "Cancelled" && st !== "cancelled") return false;
      }

      // Date Range
      if (dateRangeFilter === "Today") {
        const today = new Date();
        const pDate = new Date(p.createdAt);
        if (
          pDate.getDate() !== today.getDate() ||
          pDate.getMonth() !== today.getMonth() ||
          pDate.getFullYear() !== today.getFullYear()
        ) {
          return false;
        }
      } else if (dateRangeFilter === "This Month") {
        const today = new Date();
        const pDate = new Date(p.createdAt);
        if (
          pDate.getMonth() !== today.getMonth() ||
          pDate.getFullYear() !== today.getFullYear()
        ) {
          return false;
        }
      }

      return true;
    });
  }, [
    purchases,
    appliedSearch,
    supplierFilter,
    paymentMethodFilter,
    statusFilter,
    dateRangeFilter,
  ]);

  // ─── Pagination ──────────────────────────────────────────────────
  const totalEntries = filteredPurchases.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const currentRecords = filteredPurchases.slice(
    startIndex,
    startIndex + pageSize
  );

  // ─── Handlers ────────────────────────────────────────────────────
  const handleApplyFilter = (e) => {
    e?.preventDefault();
    setAppliedSearch(searchQuery);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setDateRangeFilter("All Dates");
    setSupplierFilter("All Suppliers");
    setPaymentMethodFilter("All Methods");
    setStatusFilter("All Status");
    setSearchQuery("");
    setAppliedSearch("");
    setCurrentPage(1);
  };

  // ─── Export CSV ──────────────────────────────────────────────────
  const handleExportCSV = () => {
    if (filteredPurchases.length === 0) {
      alert("No records to export.");
      return;
    }
    const headers = [
      "#",
      "Purchase ID",
      "Date & Time",
      "Supplier",
      "Invoice No",
      "Items",
      "Total Amount",
      "Payment Method",
      "Payment Status",
      "Status",
    ];
    const rows = filteredPurchases.map((p, idx) => [
      idx + 1,
      p.purchaseId || p._id,
      `"${formatDateTime(p.createdAt)}"`,
      `"${p.supplierName || ""}"`,
      `"${p.invoiceNo || ""}"`,
      Array.isArray(p.items) ? p.items.length : 0,
      Number(p.totalAmount || 0).toFixed(2),
      p.paymentMethod || "Cash",
      p.paymentStatus || "PAID",
      p.purchaseStatus || "RECEIVED",
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Purchase_Report_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ─── Form Item Helpers ───────────────────────────────────────────
  const updateItem = (idx, field, value) => {
    setNewPurchaseForm((prev) => {
      const items = [...prev.items];
      items[idx] = { ...items[idx], [field]: value };
      // Auto-fill from selected medicine
      if (field === "medicineId" && value) {
        const med = medicines.find((m) => m._id === value);
        if (med) {
          items[idx].name = med.name || "";
          items[idx].brand = med.brand || "";
          items[idx].category = med.category || "";
          items[idx].batchNo = med.batchNo || "";
          if (med.price && (!items[idx].unitCost || items[idx].unitCost === "")) {
            items[idx].unitCost = med.price;
          }
        }
      }
      return { ...prev, items };
    });
  };

  const addItem = () => {
    setNewPurchaseForm((prev) => ({
      ...prev,
      items: [...prev.items, { ...EMPTY_ITEM }],
    }));
  };

  const removeItem = (idx) => {
    setNewPurchaseForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx),
    }));
  };

  // ─── Computed Total ──────────────────────────────────────────────
  const formTotal = newPurchaseForm.items.reduce(
    (sum, item) =>
      sum + (Number(item.unitCost) || 0) * (Number(item.quantity) || 0),
    0
  );

  // ─── Create New Purchase ─────────────────────────────────────────
  const handleCreatePurchase = async (e) => {
    e.preventDefault();
    setSubmitError("");

    if (!newPurchaseForm.supplierName.trim()) {
      setSubmitError("Supplier name is required.");
      return;
    }
    const validItems = newPurchaseForm.items.filter(
      (i) => i.name.trim() && Number(i.unitCost) > 0 && Number(i.quantity) > 0
    );
    if (validItems.length === 0) {
      setSubmitError(
        "Please add at least one item with a name, unit cost, and quantity."
      );
      return;
    }

    try {
      setSubmitting(true);
      await API.post("/purchases", {
        ...newPurchaseForm,
        items: validItems,
      });
      await fetchData();
      setShowNewPurchaseModal(false);
      setNewPurchaseForm({
        supplierName: "",
        supplierPhone: "",
        supplierEmail: "",
        invoiceNo: "",
        paymentMethod: "Cash",
        paymentStatus: "PAID",
        purchaseStatus: "RECEIVED",
        note: "",
        items: [{ ...EMPTY_ITEM }],
      });
    } catch (err) {
      console.error("Create purchase error:", err);
      setSubmitError(
        err.response?.data?.message ||
          "Failed to save purchase. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Delete Purchase ─────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this purchase record?")) return;
    try {
      await API.delete(`/purchases/${id}`);
      await fetchData();
    } catch (err) {
      alert("Failed to delete purchase.");
    }
  };

  // ─── Render ──────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Purchases
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage stock purchases from suppliers and track restocking history.
          </p>
        </div>

        <div className="flex items-center gap-4 self-start sm:self-auto">
          {/* Breadcrumbs */}
          <div className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-slate-400">
            <Link to="/admin" className="hover:text-emerald-600 transition">
              Home
            </Link>
            <span>&gt;</span>
            <span className="text-slate-700">Purchases</span>
          </div>

          {/* New Purchase Button */}
          <motion.button
            {...buttonMotion}
            onClick={() => setShowNewPurchaseModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-2xs hover:bg-emerald-700 active:scale-95 transition cursor-pointer"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>New Purchase</span>
          </motion.button>
        </div>
      </div>

      {/* ── Summary Cards ── */}
      {!loading && !error && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Total Purchases",
              value: purchases.length,
              icon: <ShoppingCart size={18} />,
              color: "text-emerald-600 bg-emerald-50",
            },
            {
              label: "Total Spent",
              value: `₹ ${purchases
                .reduce((s, p) => s + Number(p.totalAmount || 0), 0)
                .toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
              icon: <CreditCard size={18} />,
              color: "text-blue-600 bg-blue-50",
            },
            {
              label: "Received",
              value: purchases.filter((p) => p.purchaseStatus === "RECEIVED")
                .length,
              icon: <Package size={18} />,
              color: "text-purple-600 bg-purple-50",
            },
            {
              label: "Pending",
              value: purchases.filter((p) => p.purchaseStatus === "PENDING")
                .length,
              icon: <ClipboardList size={18} />,
              color: "text-amber-600 bg-amber-50",
            },
          ].map((card, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex items-center gap-4"
            >
              <div className={`rounded-xl p-2.5 ${card.color}`}>
                {card.icon}
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">{card.label}</p>
                <p className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                  {card.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Search & Filter Card ── */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <div className="text-emerald-600">
              <ListFilter size={18} strokeWidth={2.4} />
            </div>
            <span>Search &amp; Filter</span>
          </div>
          <button
            onClick={handleClearFilters}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition cursor-pointer"
          >
            <RotateCcw size={13} />
            <span>Clear Filters</span>
          </button>
        </div>

        {/* 4 Filter Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Date Range */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
              Date Range
            </label>
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
                className="w-full appearance-none pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:border-slate-300 focus:border-emerald-500 focus:outline-hidden transition"
              >
                <option value="All Dates">All Recorded Dates</option>
                <option value="Today">Today's Purchases</option>
                <option value="This Month">This Month</option>
              </select>
              <ChevronDown
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>
          </div>

          {/* Supplier */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
              Supplier
            </label>
            <div className="relative">
              <Building2
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <select
                value={supplierFilter}
                onChange={(e) => {
                  setSupplierFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full appearance-none pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:border-slate-300 focus:border-emerald-500 focus:outline-hidden transition"
              >
                <option value="All Suppliers">All Suppliers</option>
                {uniqueSuppliers.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
              Payment Method
            </label>
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
                className="w-full appearance-none pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:border-slate-300 focus:border-emerald-500 focus:outline-hidden transition"
              >
                <option value="All Methods">All Methods</option>
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Card">Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cheque">Cheque</option>
              </select>
              <ChevronDown
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>
          </div>

          {/* Purchase Status */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
              Purchase Status
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-purple-600 pointer-events-none" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full appearance-none pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:border-slate-300 focus:border-emerald-500 focus:outline-hidden transition"
              >
                <option value="All Status">All Status</option>
                <option value="Received">Received</option>
                <option value="Pending">Pending</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <ChevronDown
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>
          </div>
        </div>

        {/* Search Row */}
        <form
          onSubmit={handleApplyFilter}
          className="flex flex-col sm:flex-row items-stretch gap-3"
        >
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search by Purchase ID, Supplier, Invoice No, or Medicine..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-hidden transition"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-2xs hover:bg-emerald-700 active:scale-95 transition cursor-pointer shrink-0"
          >
            <ListFilter size={15} />
            <span>Apply Filter</span>
          </button>
        </form>
      </div>

      {/* ── Purchase Transactions Table ── */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
        {/* Table Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <div className="text-emerald-600">
              <ShoppingCart size={18} strokeWidth={2.4} />
            </div>
            <span>Purchase Records</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              <Download size={13} className="text-slate-500" />
              <span>Export</span>
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              <Printer size={13} className="text-slate-500" />
              <span>Print</span>
            </button>
            <button
              type="button"
              className="p-1.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition cursor-pointer"
            >
              <MoreVertical size={16} />
            </button>
          </div>
        </div>

        {/* Table / States */}
        {loading ? (
          <div className="py-20 text-center text-slate-500 space-y-3">
            <Loader2
              size={32}
              className="animate-spin mx-auto text-emerald-600"
            />
            <p className="text-sm font-semibold">
              Fetching purchase records from MongoDB...
            </p>
          </div>
        ) : error ? (
          <div className="py-12 text-center text-rose-600 space-y-3">
            <AlertCircle size={32} className="mx-auto" />
            <p className="text-sm font-semibold">{error}</p>
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
            >
              Retry
            </button>
          </div>
        ) : currentRecords.length === 0 ? (
          <div className="py-16 text-center text-slate-500 space-y-3">
            <ShoppingCart size={36} className="mx-auto text-slate-300" />
            <p className="text-base font-bold text-slate-800">
              No Purchases Found
            </p>
            <p className="text-xs text-slate-400">
              No purchase records matched your active filters.
            </p>
            <button
              onClick={handleClearFilters}
              className="mt-2 text-xs font-bold text-emerald-600 hover:underline"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-5 sm:mx-0">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-[#f4f9f7] text-slate-600 text-[11px] uppercase font-bold border-y border-slate-100">
                  <th className="py-3.5 pl-4 sm:pl-3 font-bold">#</th>
                  <th className="py-3.5 font-bold">Purchase ID</th>
                  <th className="py-3.5 font-bold">Date &amp; Time</th>
                  <th className="py-3.5 font-bold">Supplier</th>
                  <th className="py-3.5 font-bold">Invoice No</th>
                  <th className="py-3.5 text-center font-bold">Items</th>
                  <th className="py-3.5 text-right font-bold">Total Amount</th>
                  <th className="py-3.5 pl-4 font-bold">Payment</th>
                  <th className="py-3.5 text-center font-bold">Pay. Status</th>
                  <th className="py-3.5 text-center font-bold">Status</th>
                  <th className="py-3.5 pr-4 sm:pr-3 text-center font-bold">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentRecords.map((purchase, idx) => {
                  const pid =
                    purchase.purchaseId ||
                    `PUR-${String(purchase._id).slice(-5).toUpperCase()}`;
                  const itemCount = Array.isArray(purchase.items)
                    ? purchase.items.reduce(
                        (s, i) => s + Number(i.quantity || 1),
                        0
                      )
                    : 0;
                  const totalAmt = Number(purchase.totalAmount || 0).toFixed(2);
                  const pStatus = (
                    purchase.purchaseStatus || "RECEIVED"
                  ).toUpperCase();
                  const payStatus = (
                    purchase.paymentStatus || "PAID"
                  ).toUpperCase();

                  return (
                    <tr
                      key={purchase._id || idx}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="py-3.5 pl-4 sm:pl-3 text-slate-400 font-semibold">
                        {startIndex + idx + 1}
                      </td>

                      <td className="py-3.5 font-semibold text-emerald-600 font-mono whitespace-nowrap">
                        {pid}
                      </td>

                      <td className="py-3.5 text-slate-600 text-xs whitespace-nowrap">
                        {formatDateTime(purchase.createdAt)}
                      </td>

                      <td className="py-3.5 font-medium text-slate-800">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                            <Building2 size={13} className="text-emerald-600" />
                          </div>
                          <span>{purchase.supplierName}</span>
                        </div>
                      </td>

                      <td className="py-3.5 text-slate-500 font-mono text-xs">
                        {purchase.invoiceNo || "—"}
                      </td>

                      <td className="py-3.5 text-center text-slate-700 font-semibold">
                        {itemCount}
                      </td>

                      <td className="py-3.5 text-right font-bold text-slate-900 font-mono">
                        ₹{" "}
                        {Number(totalAmt).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}
                      </td>

                      <td className="py-3.5 pl-4 text-slate-600 font-medium">
                        {purchase.paymentMethod || "Cash"}
                      </td>

                      <td className="py-3.5 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                            paymentStatusColors[payStatus] ||
                            "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {payStatus}
                        </span>
                      </td>

                      <td className="py-3.5 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                            statusColors[pStatus] ||
                            "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {pStatus}
                        </span>
                      </td>

                      <td className="py-3.5 pr-4 sm:pr-3 text-center">
                        <div className="flex items-center justify-center gap-1.5 text-slate-500">
                          <button
                            onClick={() => setSelectedPurchase(purchase)}
                            title="View Details"
                            className="p-1 rounded-md hover:text-emerald-600 hover:bg-slate-100 transition cursor-pointer"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedPurchase(purchase);
                              setTimeout(() => window.print(), 300);
                            }}
                            title="Print"
                            className="p-1 rounded-md hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                          >
                            <Printer size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(purchase._id)}
                            title="Delete"
                            className="p-1 rounded-md hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 text-xs">
          <div className="text-slate-500 font-medium">
            Showing {totalEntries === 0 ? 0 : startIndex + 1} to{" "}
            {Math.min(startIndex + pageSize, totalEntries)} of {totalEntries}{" "}
            entries
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft size={14} />
              </button>

              {Array.from(
                { length: Math.min(5, totalPages) },
                (_, i) => i + 1
              ).map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition cursor-pointer ${
                    currentPage === p
                      ? "bg-emerald-600 text-white"
                      : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {p}
                </button>
              ))}

              {totalPages > 5 && (
                <>
                  <span className="px-1 text-slate-400">...</span>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold border border-slate-200 hover:bg-slate-50 ${
                      currentPage === totalPages
                        ? "bg-emerald-600 text-white"
                        : "text-slate-700"
                    }`}
                  >
                    {totalPages}
                  </button>
                </>
              )}

              <button
                disabled={currentPage >= totalPages}
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="relative">
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="appearance-none pl-3 pr-7 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:border-slate-300 focus:outline-hidden"
              >
                <option value={10}>10 / page</option>
                <option value={20}>20 / page</option>
                <option value={50}>50 / page</option>
              </select>
              <ChevronDown
                size={12}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── View Purchase Detail Modal ── */}
      {selectedPurchase && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">
                  Purchase Receipt
                </span>
                <h3 className="text-lg font-black text-slate-900 font-mono mt-0.5">
                  #
                  {selectedPurchase.purchaseId ||
                    String(selectedPurchase._id).slice(-6).toUpperCase()}
                </h3>
                <p className="text-xs text-slate-400">
                  {formatDateTime(selectedPurchase.createdAt)}
                </p>
              </div>
              <button
                onClick={() => setSelectedPurchase(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* Supplier Details */}
            <div className="py-4 border-b border-slate-100 text-xs space-y-1.5">
              <p className="font-bold text-slate-700 mb-2">
                Supplier Information
              </p>
              {[
                ["Supplier", selectedPurchase.supplierName],
                ["Phone", selectedPurchase.supplierPhone || "—"],
                ["Email", selectedPurchase.supplierEmail || "—"],
                ["Invoice No", selectedPurchase.invoiceNo || "—"],
                ["Payment Method", selectedPurchase.paymentMethod || "Cash"],
                ["Payment Status", selectedPurchase.paymentStatus || "PAID"],
                [
                  "Purchase Status",
                  selectedPurchase.purchaseStatus || "RECEIVED",
                ],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between">
                  <span className="text-slate-500">{label}:</span>
                  <span className="font-bold text-slate-900 text-right max-w-[60%] truncate">
                    {val}
                  </span>
                </div>
              ))}
            </div>

            {/* Items */}
            <div className="py-4 border-b border-slate-100 text-xs">
              <p className="font-bold text-slate-700 mb-3">
                Purchased Items (
                {Array.isArray(selectedPurchase.items)
                  ? selectedPurchase.items.length
                  : 0}
                )
              </p>
              <div className="space-y-2.5">
                {(selectedPurchase.items || []).map((it, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-start gap-2 bg-slate-50 rounded-xl p-2.5"
                  >
                    <div>
                      <p className="font-bold text-slate-800">{it.name}</p>
                      <p className="text-slate-400">
                        {it.brand && `${it.brand} · `}
                        {it.category && `${it.category} · `}
                        Qty: {it.quantity} × ₹{it.unitCost}
                      </p>
                      {it.batchNo && (
                        <p className="text-slate-400">Batch: {it.batchNo}</p>
                      )}
                    </div>
                    <span className="font-bold text-slate-900 whitespace-nowrap">
                      ₹{" "}
                      {Number(it.subtotal || 0).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="py-4 flex justify-between items-center text-sm">
              <span className="font-bold text-slate-800">
                Total Amount Paid
              </span>
              <span className="text-xl font-black text-emerald-600 font-mono">
                ₹{" "}
                {Number(selectedPurchase.totalAmount || 0).toLocaleString(
                  "en-IN",
                  { minimumFractionDigits: 2 }
                )}
              </span>
            </div>

            {selectedPurchase.note && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 mb-4">
                <span className="font-bold">Note: </span>
                {selectedPurchase.note}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-700 cursor-pointer"
              >
                <Printer size={14} />
                <span>Print</span>
              </button>
              <button
                onClick={() => setSelectedPurchase(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── New Purchase Modal ── */}
      {showNewPurchaseModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  New Purchase Entry
                </h3>
                <p className="text-xs text-slate-500">
                  Record a stock purchase from a supplier. Stock will be
                  updated automatically.
                </p>
              </div>
              <button
                onClick={() => setShowNewPurchaseModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={handleCreatePurchase}
              className="space-y-5 text-xs"
            >
              {/* Supplier Details */}
              <div className="rounded-2xl border border-slate-200 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-slate-700 text-sm flex items-center gap-2">
                    <Building2 size={16} className="text-emerald-600" />
                    Supplier / Vendor Details
                  </p>
                  <span className="text-[11px] text-slate-400">
                    {suppliersList.length} vendors available
                  </span>
                </div>

                {/* Dropdown to pick existing vendor from DB */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Select Registered Vendor / Supplier (from DB)
                  </label>
                  <select
                    onChange={(e) => {
                      const selectedSup = suppliersList.find((s) => s.name === e.target.value);
                      if (selectedSup) {
                        setNewPurchaseForm({
                          ...newPurchaseForm,
                          supplierName: selectedSup.name,
                          supplierPhone: selectedSup.phone || "",
                          supplierEmail: selectedSup.email || "",
                        });
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50/40 text-slate-800 font-semibold focus:border-emerald-500 focus:outline-hidden"
                  >
                    <option value="">— Select from Vendor List or type manually below —</option>
                    {suppliersList.map((sup) => (
                      <option key={sup._id} value={sup.name}>
                        {sup.name} {sup.supplierType ? `(${sup.supplierType})` : ""} - {sup.location || "Local"} ({sup.phone})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Supplier / Vendor Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Pharma Distributors Ltd"
                      value={newPurchaseForm.supplierName}
                      onChange={(e) =>
                        setNewPurchaseForm({
                          ...newPurchaseForm,
                          supplierName: e.target.value,
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 font-medium focus:border-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Invoice No
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. INV-20260901"
                      value={newPurchaseForm.invoiceNo}
                      onChange={(e) =>
                        setNewPurchaseForm({
                          ...newPurchaseForm,
                          invoiceNo: e.target.value,
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 font-medium focus:border-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Supplier Phone
                    </label>
                    <input
                      type="text"
                      placeholder="Phone number"
                      value={newPurchaseForm.supplierPhone}
                      onChange={(e) =>
                        setNewPurchaseForm({
                          ...newPurchaseForm,
                          supplierPhone: e.target.value,
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 font-medium focus:border-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Supplier Email
                    </label>
                    <input
                      type="email"
                      placeholder="supplier@email.com"
                      value={newPurchaseForm.supplierEmail}
                      onChange={(e) =>
                        setNewPurchaseForm({
                          ...newPurchaseForm,
                          supplierEmail: e.target.value,
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 font-medium focus:border-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="rounded-2xl border border-slate-200 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-slate-700 text-sm">
                    Medicines / Items
                  </p>
                  <button
                    type="button"
                    onClick={addItem}
                    className="inline-flex items-center gap-1 text-emerald-600 font-bold text-xs hover:text-emerald-700 cursor-pointer"
                  >
                    <Plus size={14} /> Add Item
                  </button>
                </div>

                <div className="space-y-3">
                  {newPurchaseForm.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-50 rounded-xl p-3 space-y-3 relative"
                    >
                      {newPurchaseForm.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(idx)}
                          className="absolute top-2 right-2 p-1 rounded-lg text-rose-500 hover:bg-rose-50 transition cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}

                      <p className="font-bold text-slate-600 text-[11px] uppercase">
                        Item {idx + 1}
                      </p>

                      {/* Select from DB medicines */}
                      <div>
                        <label className="block font-semibold text-slate-600 mb-1">
                          Select Medicine (from DB)
                        </label>
                        <select
                          value={item.medicineId}
                          onChange={(e) =>
                            updateItem(idx, "medicineId", e.target.value)
                          }
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 font-medium focus:border-emerald-500 focus:outline-hidden"
                        >
                          <option value="">— Select or type manually —</option>
                          {medicines.map((med) => (
                            <option key={med._id} value={med._id}>
                              {med.name}{" "}
                              {med.brand ? `(${med.brand})` : ""} — Stock:{" "}
                              {med.stock}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-semibold text-slate-600 mb-1">
                            Medicine Name <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Medicine name"
                            value={item.name}
                            onChange={(e) =>
                              updateItem(idx, "name", e.target.value)
                            }
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 font-medium focus:border-emerald-500 focus:outline-hidden"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-600 mb-1">
                            Brand
                          </label>
                          <input
                            type="text"
                            placeholder="Brand"
                            value={item.brand}
                            onChange={(e) =>
                              updateItem(idx, "brand", e.target.value)
                            }
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 font-medium focus:border-emerald-500 focus:outline-hidden"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-600 mb-1">
                            Batch No
                          </label>
                          <input
                            type="text"
                            placeholder="Batch number"
                            value={item.batchNo}
                            onChange={(e) =>
                              updateItem(idx, "batchNo", e.target.value)
                            }
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 font-medium focus:border-emerald-500 focus:outline-hidden"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-600 mb-1">
                            Expiry Date
                          </label>
                          <input
                            type="date"
                            value={item.expiryDate}
                            onChange={(e) =>
                              updateItem(idx, "expiryDate", e.target.value)
                            }
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 font-medium focus:border-emerald-500 focus:outline-hidden"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-600 mb-1">
                            Unit Cost (₹) <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            required
                            placeholder="0.00"
                            value={item.unitCost}
                            onChange={(e) =>
                              updateItem(idx, "unitCost", e.target.value)
                            }
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 font-medium focus:border-emerald-500 focus:outline-hidden"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-600 mb-1">
                            Quantity <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="number"
                            min="1"
                            required
                            placeholder="1"
                            value={item.quantity}
                            onChange={(e) =>
                              updateItem(
                                idx,
                                "quantity",
                                Math.max(1, Number(e.target.value))
                              )
                            }
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 font-medium focus:border-emerald-500 focus:outline-hidden"
                          />
                        </div>
                      </div>

                      {/* Subtotal display */}
                      {item.unitCost && item.quantity && (
                        <p className="text-right text-xs font-bold text-emerald-600">
                          Subtotal: ₹{" "}
                          {(
                            Number(item.unitCost) * Number(item.quantity)
                          ).toFixed(2)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Grand Total */}
                <div className="flex justify-between items-center pt-2 border-t border-slate-200 font-bold text-sm">
                  <span className="text-slate-700">Grand Total</span>
                  <span className="text-emerald-600 text-base font-black">
                    ₹{" "}
                    {formTotal.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>

              {/* Payment & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={newPurchaseForm.paymentMethod}
                    onChange={(e) =>
                      setNewPurchaseForm({
                        ...newPurchaseForm,
                        paymentMethod: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 font-medium focus:border-emerald-500 focus:outline-hidden"
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="Card">Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Payment Status
                  </label>
                  <select
                    value={newPurchaseForm.paymentStatus}
                    onChange={(e) =>
                      setNewPurchaseForm({
                        ...newPurchaseForm,
                        paymentStatus: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 font-medium focus:border-emerald-500 focus:outline-hidden"
                  >
                    <option value="PAID">Paid</option>
                    <option value="PENDING">Pending</option>
                    <option value="PARTIAL">Partial</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Purchase Status
                  </label>
                  <select
                    value={newPurchaseForm.purchaseStatus}
                    onChange={(e) =>
                      setNewPurchaseForm({
                        ...newPurchaseForm,
                        purchaseStatus: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 font-medium focus:border-emerald-500 focus:outline-hidden"
                  >
                    <option value="RECEIVED">Received</option>
                    <option value="PENDING">Pending</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Note (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Any additional notes about this purchase..."
                  value={newPurchaseForm.note}
                  onChange={(e) =>
                    setNewPurchaseForm({
                      ...newPurchaseForm,
                      note: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 font-medium focus:border-emerald-500 focus:outline-hidden resize-none"
                />
              </div>

              {submitError && (
                <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-xl p-3">
                  <AlertCircle size={14} />
                  <span>{submitError}</span>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewPurchaseModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={16} />
                  )}
                  <span>Save Purchase</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchasePage;
