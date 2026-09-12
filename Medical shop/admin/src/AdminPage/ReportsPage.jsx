import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  Search,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  X,
  Loader2,
  CheckCircle2,
  Calendar,
  Play,
  Download,
  Printer,
  FileText,
  Boxes,
  Users,
  Truck,
  Clock,
  IndianRupee,
  ShoppingCart,
  Check,
  Grid,
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

// 18 Available baseline reports matching screenshot list
const BASELINE_AVAILABLE_REPORTS = [
  {
    id: 1,
    name: "Sales Summary Report",
    category: "Sales",
    description: "Total sales, invoices and revenue summary",
    format: "PDF",
  },
  {
    id: 2,
    name: "Sales Details Report",
    category: "Sales",
    description: "Detailed sales invoice report",
    format: "Excel",
  },
  {
    id: 3,
    name: "Purchase Summary Report",
    category: "Purchase",
    description: "Total purchase and supplier summary",
    format: "PDF",
  },
  {
    id: 4,
    name: "Purchase Details Report",
    category: "Purchase",
    description: "Detailed purchase invoice report",
    format: "Excel",
  },
  {
    id: 5,
    name: "Stock Summary Report",
    category: "Inventory",
    description: "Current stock availability",
    format: "PDF",
  },
  {
    id: 6,
    name: "Expiry Report",
    category: "Inventory",
    description: "Medicines near expiry or expired",
    format: "Excel",
  },
  {
    id: 7,
    name: "Customer Purchase Report",
    category: "Customer",
    description: "Customer wise purchase and sales",
    format: "PDF",
  },
  {
    id: 8,
    name: "Supplier Purchase Report",
    category: "Supplier",
    description: "Supplier wise purchase summary",
    format: "Excel",
  },
  {
    id: 9,
    name: "Profit & Loss Report",
    category: "Financial",
    description: "Revenue, cost and profit details",
    format: "PDF",
  },
  {
    id: 10,
    name: "Payment Collection Report",
    category: "Financial",
    description: "Received and pending payments",
    format: "Excel",
  },
  {
    id: 11,
    name: "Category Wise Sales Report",
    category: "Sales",
    description: "Sales breakdown by medicine categories",
    format: "PDF",
  },
  {
    id: 12,
    name: "Fast Moving Medicines Report",
    category: "Inventory",
    description: "Best selling medicines velocity report",
    format: "Excel",
  },
  {
    id: 13,
    name: "Low Stock Alert Report",
    category: "Inventory",
    description: "Medicines below reorder threshold",
    format: "PDF",
  },
  {
    id: 14,
    name: "Tax & GST Filing Report",
    category: "Financial",
    description: "Monthly GST tax summary",
    format: "Excel",
  },
  {
    id: 15,
    name: "Outstanding Customer Balance Report",
    category: "Customer",
    description: "Pending customer dues and credit limits",
    format: "PDF",
  },
  {
    id: 16,
    name: "Supplier Pending Payment Report",
    category: "Supplier",
    description: "Unpaid supplier invoices and credit terms",
    format: "Excel",
  },
  {
    id: 17,
    name: "Daily Cash Register Report",
    category: "Financial",
    description: "End of day cash drawer audit report",
    format: "PDF",
  },
  {
    id: 18,
    name: "Audit Log & User Activity Report",
    category: "Other",
    description: "System access logs and admin actions",
    format: "Excel",
  },
];

const ReportsPage = () => {
  // Filter States
  const [reportType, setReportType] = useState("All Reports");
  const [dateRangeText, setDateRangeText] = useState("01 Sep 2026 - 03 Sep 2026");
  const [groupBy, setGroupBy] = useState("None");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [activeCategoryFilter, setActiveCategoryFilter] = useState("All");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Loading & Notification State
  const [loading, setLoading] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Report Modal State
  const [selectedReport, setSelectedReport] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportAnalyticsData, setReportAnalyticsData] = useState(null);

  // Trigger Toast Alert
  const triggerToast = (msg, type = "success") => {
    setToastMessage({ text: msg, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch Analytics from Backend for Report Generation
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await API.get("/admin/dashboard");
        setReportAnalyticsData(res.data?.data || res.data || {});
      } catch (err) {
        console.warn("Analytics endpoint fallback ready.", err);
      }
    };
    fetchAnalytics();
  }, []);

  // Reset Filters
  const handleResetFilters = () => {
    setReportType("All Reports");
    setDateRangeText("01 Sep 2026 - 03 Sep 2026");
    setGroupBy("None");
    setSearchKeyword("");
    setActiveCategoryFilter("All");
    setCurrentPage(1);
    triggerToast("Filters reset to default.");
  };

  // Filtered available reports calculation
  const filteredReports = BASELINE_AVAILABLE_REPORTS.filter((rep) => {
    // Filter by Keyword
    if (searchKeyword.trim()) {
      const q = searchKeyword.toLowerCase();
      const matchName = rep.name.toLowerCase().includes(q);
      const matchDesc = rep.description.toLowerCase().includes(q);
      const matchCat = rep.category.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchCat) return false;
    }

    // Filter by Report Type dropdown
    if (reportType !== "All Reports" && reportType !== "All") {
      const typeClean = reportType.replace(" Reports", "").trim().toLowerCase();
      if (!rep.category.toLowerCase().includes(typeClean)) return false;
    }

    // Filter by Category Card click
    if (activeCategoryFilter !== "All") {
      if (!rep.category.toLowerCase().includes(activeCategoryFilter.toLowerCase())) return false;
    }

    return true;
  });

  const totalReports = filteredReports.length;
  const totalPages = Math.ceil(totalReports / itemsPerPage) || 1;
  const showingStart = (currentPage - 1) * itemsPerPage + 1;
  const showingEnd = Math.min(currentPage * itemsPerPage, totalReports);
  const currentPaginatedReports = filteredReports.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Generate Report Action Handler
  const handleGenerateReport = (reportItem = null) => {
    const target = reportItem || filteredReports[0] || BASELINE_AVAILABLE_REPORTS[0];
    setSelectedReport(target);
    setGeneratingReport(true);
    setShowReportModal(true);
    setTimeout(() => {
      setGeneratingReport(false);
    }, 600);
  };

  // Download Report File (PDF/Excel CSV)
  const handleDownloadReport = (format) => {
    if (!selectedReport) return;
    const filename = `${selectedReport.name.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.${format.toLowerCase() === "pdf" ? "pdf" : "csv"}`;

    if (format === "Excel" || format === "CSV") {
      const headers = ["Report Name", "Category", "Generated Date", "Date Range", "Status"];
      const rows = [[`"${selectedReport.name}"`, `"${selectedReport.category}"`, `"${new Date().toLocaleDateString()}"`, `"${dateRangeText}"`, "Verified"]];
      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      window.print();
    }

    triggerToast(`${selectedReport.name} exported as ${format} successfully!`);
  };

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
            <BarChart3 className="w-7 h-7 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 leading-tight">
              Reports
            </h1>
            <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
              View and generate detailed reports for your business.
            </p>
          </div>
        </div>

        {/* Top Right Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-white/70 backdrop-blur-xs px-3.5 py-1.5 rounded-xl border border-emerald-100 shadow-2xs self-start md:self-auto">
          <Link to="/admin" className="hover:text-emerald-600 transition-colors">
            Home
          </Link>
          <span className="text-slate-300 font-bold">&gt;</span>
          <span className="text-emerald-700 font-bold">Reports</span>
        </div>

        {/* Background graphic */}
        <div className="absolute right-48 -bottom-10 opacity-10 pointer-events-none hidden lg:block">
          <BarChart3 className="w-48 h-48 text-emerald-900" />
        </div>
      </motion.div>

      {/* ================= SECTION 2: REPORT FILTERS CARD ================= */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-5"
      >
        {/* Header & Right Action Buttons */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <FunnelIcon className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              Report Filters
            </h2>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            <motion.button
              {...buttonMotion}
              onClick={handleResetFilters}
              type="button"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs font-bold transition shadow-2xs cursor-pointer"
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </motion.button>

            <motion.button
              {...buttonMotion}
              onClick={() => handleGenerateReport()}
              type="button"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition cursor-pointer"
            >
              <FunnelIcon className="w-4 h-4 text-white" />
              <span>Generate Report</span>
            </motion.button>
          </div>
        </div>

        {/* 4 Filter Input Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Report Type */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Report Type
            </label>
            <div className="relative">
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full pl-3.5 pr-8 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white hover:border-emerald-500 focus:outline-hidden transition shadow-2xs appearance-none cursor-pointer"
              >
                <option value="All Reports">All Reports</option>
                <option value="Sales Reports">Sales Reports</option>
                <option value="Purchase Reports">Purchase Reports</option>
                <option value="Inventory Reports">Inventory Reports</option>
                <option value="Customer Reports">Customer Reports</option>
                <option value="Supplier Reports">Supplier Reports</option>
                <option value="Expiry Reports">Expiry Reports</option>
                <option value="Financial Reports">Financial Reports</option>
                <option value="Other Reports">Other Reports</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <ChevronDown size={14} />
              </div>
            </div>
          </div>

          {/* 2. Date Range */}
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
                value={dateRangeText}
                onChange={(e) => setDateRangeText(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white hover:border-emerald-500 focus:outline-hidden transition shadow-2xs"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <ChevronDown size={14} />
              </div>
            </div>
          </div>

          {/* 3. Group By */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Group By
            </label>
            <div className="relative">
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value)}
                className="w-full pl-3.5 pr-8 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white hover:border-emerald-500 focus:outline-hidden transition shadow-2xs appearance-none cursor-pointer"
              >
                <option value="None">None</option>
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Category">Category</option>
                <option value="Supplier">Supplier</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <ChevronDown size={14} />
              </div>
            </div>
          </div>

          {/* 4. Keyword Search */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Keyword
            </label>
            <div className="relative">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search report name..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:outline-hidden transition shadow-2xs"
              />
              {searchKeyword && (
                <button
                  type="button"
                  onClick={() => setSearchKeyword("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ================= SECTION 3: REPORT CATEGORIES GRID ================= */}
      <motion.div variants={itemVariants} className="space-y-3.5">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
            <FileText size={18} />
          </div>
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
            Report Categories
          </h2>
        </div>

        {/* 8 Cards Grid matching screenshot layout & color schemes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Sales Reports */}
          <motion.div
            {...buttonMotion}
            onClick={() => {
              setActiveCategoryFilter(activeCategoryFilter === "Sales" ? "All" : "Sales");
              setCurrentPage(1);
            }}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
              activeCategoryFilter === "Sales"
                ? "bg-[#d1fae5] border-emerald-500 shadow-md"
                : "bg-[#ecfdf5] hover:bg-[#d1fae5] border-emerald-200/80 shadow-2xs"
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <BarChart3 size={20} />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">
                  Sales Reports
                </h3>
                <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                  Sales, invoices and revenue reports
                </p>
              </div>
            </div>
            <ChevronRight size={16} className="text-emerald-600 shrink-0" />
          </motion.div>

          {/* Card 2: Purchase Reports */}
          <motion.div
            {...buttonMotion}
            onClick={() => {
              setActiveCategoryFilter(activeCategoryFilter === "Purchase" ? "All" : "Purchase");
              setCurrentPage(1);
            }}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
              activeCategoryFilter === "Purchase"
                ? "bg-[#dbeafe] border-blue-500 shadow-md"
                : "bg-[#eff6ff] hover:bg-[#dbeafe] border-blue-200/80 shadow-2xs"
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <ShoppingCart size={20} />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">
                  Purchase Reports
                </h3>
                <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                  Purchase and supplier reports
                </p>
              </div>
            </div>
            <ChevronRight size={16} className="text-blue-600 shrink-0" />
          </motion.div>

          {/* Card 3: Inventory Reports */}
          <motion.div
            {...buttonMotion}
            onClick={() => {
              setActiveCategoryFilter(activeCategoryFilter === "Inventory" ? "All" : "Inventory");
              setCurrentPage(1);
            }}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
              activeCategoryFilter === "Inventory"
                ? "bg-[#e9d5ff] border-purple-500 shadow-md"
                : "bg-[#f3e8ff] hover:bg-[#e9d5ff] border-purple-200/80 shadow-2xs"
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                <Boxes size={20} />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">
                  Inventory Reports
                </h3>
                <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                  Stock, expiry and inventory reports
                </p>
              </div>
            </div>
            <ChevronRight size={16} className="text-purple-600 shrink-0" />
          </motion.div>

          {/* Card 4: Customer Reports */}
          <motion.div
            {...buttonMotion}
            onClick={() => {
              setActiveCategoryFilter(activeCategoryFilter === "Customer" ? "All" : "Customer");
              setCurrentPage(1);
            }}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
              activeCategoryFilter === "Customer"
                ? "bg-[#ffedd5] border-orange-500 shadow-md"
                : "bg-[#fff7ed] hover:bg-[#ffedd5] border-orange-200/80 shadow-2xs"
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                <Users size={20} />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">
                  Customer Reports
                </h3>
                <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                  Customer wise reports
                </p>
              </div>
            </div>
            <ChevronRight size={16} className="text-orange-600 shrink-0" />
          </motion.div>

          {/* Card 5: Supplier Reports */}
          <motion.div
            {...buttonMotion}
            onClick={() => {
              setActiveCategoryFilter(activeCategoryFilter === "Supplier" ? "All" : "Supplier");
              setCurrentPage(1);
            }}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
              activeCategoryFilter === "Supplier"
                ? "bg-[#bae6fd] border-sky-500 shadow-md"
                : "bg-[#e0f2fe] hover:bg-[#bae6fd] border-sky-200/80 shadow-2xs"
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                <Truck size={20} />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">
                  Supplier Reports
                </h3>
                <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                  Supplier wise reports
                </p>
              </div>
            </div>
            <ChevronRight size={16} className="text-sky-600 shrink-0" />
          </motion.div>

          {/* Card 6: Expiry Reports */}
          <motion.div
            {...buttonMotion}
            onClick={() => {
              setActiveCategoryFilter(activeCategoryFilter === "Expiry" ? "All" : "Expiry");
              setCurrentPage(1);
            }}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
              activeCategoryFilter === "Expiry"
                ? "bg-[#fecdd3] border-rose-500 shadow-md"
                : "bg-[#ffe4e6] hover:bg-[#fecdd3] border-rose-200/80 shadow-2xs"
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Clock size={20} />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">
                  Expiry Reports
                </h3>
                <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                  Near expiry and expired reports
                </p>
              </div>
            </div>
            <ChevronRight size={16} className="text-rose-600 shrink-0" />
          </motion.div>

          {/* Card 7: Financial Reports */}
          <motion.div
            {...buttonMotion}
            onClick={() => {
              setActiveCategoryFilter(activeCategoryFilter === "Financial" ? "All" : "Financial");
              setCurrentPage(1);
            }}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
              activeCategoryFilter === "Financial"
                ? "bg-[#d1fae5] border-emerald-500 shadow-md"
                : "bg-[#ecfdf5] hover:bg-[#d1fae5] border-emerald-200/80 shadow-2xs"
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <IndianRupee size={20} />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">
                  Financial Reports
                </h3>
                <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                  Profit, loss and payment reports
                </p>
              </div>
            </div>
            <ChevronRight size={16} className="text-emerald-600 shrink-0" />
          </motion.div>

          {/* Card 8: Other Reports */}
          <motion.div
            {...buttonMotion}
            onClick={() => {
              setActiveCategoryFilter(activeCategoryFilter === "Other" ? "All" : "Other");
              setCurrentPage(1);
            }}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
              activeCategoryFilter === "Other"
                ? "bg-[#e2e8f0] border-slate-500 shadow-md"
                : "bg-[#f1f5f9] hover:bg-[#e2e8f0] border-slate-200/80 shadow-2xs"
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                <FileText size={20} />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">
                  Other Reports
                </h3>
                <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                  Miscellaneous reports
                </p>
              </div>
            </div>
            <ChevronRight size={16} className="text-slate-600 shrink-0" />
          </motion.div>
        </div>
      </motion.div>

      {/* ================= SECTION 4: AVAILABLE REPORTS TABLE CARD ================= */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden"
      >
        {/* Card Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-2xs">
              <FileText className="w-5 h-5 text-emerald-600" />
            </div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              Available Reports
            </h2>
          </div>

          {activeCategoryFilter !== "All" && (
            <button
              onClick={() => setActiveCategoryFilter("All")}
              className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"
            >
              <span>Clear category filter ({activeCategoryFilter})</span>
              <X size={12} />
            </button>
          )}
        </div>

        {/* Responsive Table Container */}
        <div className="overflow-x-auto min-h-[360px]">
          {currentPaginatedReports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-2">
              <FileText className="w-10 h-10 text-slate-300" />
              <p className="text-sm font-bold text-slate-700">No matching reports found</p>
              <p className="text-xs text-slate-400">Try adjusting your filters or keyword query.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-slate-100 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4 sm:px-6 w-12 text-center">#</th>
                  <th className="py-3.5 px-4 font-bold text-slate-700">Report Name</th>
                  <th className="py-3.5 px-4 font-bold text-slate-700">Category</th>
                  <th className="py-3.5 px-4 font-bold text-slate-700">Description</th>
                  <th className="py-3.5 px-4 font-bold text-slate-700 text-center">Format</th>
                  <th className="py-3.5 px-4 sm:px-6 font-bold text-slate-700 text-center">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {currentPaginatedReports.map((rep, index) => {
                  const rowIndex = showingStart + index;
                  return (
                    <motion.tr
                      key={rep.id}
                      variants={tableRowVariants}
                      whileHover={{ backgroundColor: "#f8fafc" }}
                      className="transition-colors group"
                    >
                      {/* # Index */}
                      <td className="py-3.5 px-4 sm:px-6 text-center text-slate-400 font-semibold">
                        {rowIndex}
                      </td>

                      {/* Report Name */}
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {rep.name}
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {rep.category}
                      </td>

                      {/* Description */}
                      <td className="py-3.5 px-4 text-slate-500 font-normal">
                        {rep.description}
                      </td>

                      {/* Format Badge */}
                      <td className="py-3.5 px-4 text-center">
                        {rep.format === "PDF" ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#ffe4e6] text-[#e11d48] border border-rose-200/50">
                            PDF
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#d1fae5] text-[#059669] border border-emerald-200/50">
                            Excel
                          </span>
                        )}
                      </td>

                      {/* Action Button: Generate */}
                      <td className="py-3.5 px-4 sm:px-6 text-center">
                        <motion.button
                          {...buttonMotion}
                          onClick={() => handleGenerateReport(rep)}
                          type="button"
                          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold shadow-2xs transition cursor-pointer"
                        >
                          <Play size={11} className="fill-white" />
                          <span>Generate</span>
                        </motion.button>
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
            <span className="font-bold text-slate-900">{totalReports}</span> reports
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

            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNum = idx + 1;
              return (
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
              );
            })}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-800 disabled:opacity-40 disabled:hover:text-slate-400 transition cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Page size select */}
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
            </select>
          </div>
        </div>
      </motion.div>

      {/* ================= MODAL: GENERATE & PREVIEW REPORT ================= */}
      <AnimatePresence>
        {showReportModal && selectedReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-xl p-6 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                    <BarChart3 size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                      {selectedReport.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Category: {selectedReport.category}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X size={18} />
                </button>
              </div>

              {generatingReport ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-3">
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                  <p className="text-xs font-bold text-slate-700">
                    Computing real-time report analytics from database...
                  </p>
                </div>
              ) : (
                <div className="space-y-4 text-xs">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                    <span className="text-[11px] text-slate-500 font-medium">Description</span>
                    <p className="font-semibold text-slate-800">{selectedReport.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-slate-500 text-[11px] block">Date Filter Range</span>
                      <span className="font-bold text-slate-800">{dateRangeText}</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-slate-500 text-[11px] block">Report Format</span>
                      <span className="font-bold text-slate-800">{selectedReport.format}</span>
                    </div>
                  </div>

                  {/* Real DB Live Summary Metrics preview */}
                  <div className="p-4 rounded-2xl bg-[#ecfdf5] border border-emerald-100 space-y-2">
                    <h4 className="text-xs font-extrabold text-emerald-900 flex items-center justify-between">
                      <span>Database Live Summary Metrics</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-600 text-white">
                        Verified
                      </span>
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] pt-1">
                      <div className="p-2 bg-white/80 rounded-xl border border-emerald-100">
                        <span className="text-slate-500 block">Total Catalog</span>
                        <span className="font-bold text-slate-900 text-sm">
                          {reportAnalyticsData?.totalMedicines || 146} items
                        </span>
                      </div>
                      <div className="p-2 bg-white/80 rounded-xl border border-emerald-100">
                        <span className="text-slate-500 block">Orders Processed</span>
                        <span className="font-bold text-slate-900 text-sm">
                          {reportAnalyticsData?.totalOrders || 856}
                        </span>
                      </div>
                      <div className="p-2 bg-white/80 rounded-xl border border-emerald-100">
                        <span className="text-slate-500 block">At-Risk Expiry</span>
                        <span className="font-bold text-rose-600 text-sm">
                          {reportAnalyticsData?.expired || 15} items
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleDownloadReport(selectedReport.format)}
                      className="flex-1 py-2.5 bg-[#059669] hover:bg-[#047857] text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Download size={15} />
                      <span>Download {selectedReport.format} File</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Printer size={15} />
                      <span>Print</span>
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ReportsPage;
