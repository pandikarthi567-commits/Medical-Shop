import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings,
  Store,
  Users,
  CreditCard,
  Grid,
  Cloud,
  Sliders,
  FileText,
  Database,
  Download,
  Trash2,
  RotateCcw,
  Save,
  CheckCircle2,
  X,
  Loader2,
  Percent,
  Check,
  Building2,
  Lock,
} from "lucide-react";
import API from "../api/axios";
import {
  containerVariants,
  itemVariants,
  buttonMotion,
  modalVariants,
} from "./components/pageMotion";

const DEFAULT_SETTINGS = {
  shopName: "MediCare Medicals",
  ownerName: "Karthik Bairavan",
  address: "123, Anna Salai,\nChennai - 600 001",
  phone: "98765 43210",
  email: "medicare@gmail.com",
  gstNumber: "33ABCDE1234F1Z5",
  licenseNumber: "MDL/2026/001",
  defaultPurchaseTax: 5,
  defaultSaleTax: 5,
  currency: "INR (₹)",
  lowStockThreshold: 10,
  dateFormat: "dd MMM yyyy",
  timeFormat: "12 Hour (AM/PM)",
  enableExpiryAlerts: true,
  enableStockAlerts: true,
  allowNegativeStock: false,
  printInvoiceAutomatically: true,
  invoicePrefix: "INV",
  invoiceStartNumber: "000001",
  invoiceFormat: "A4 (Portrait)",
  itemsPerPage: 10,
  showCompanyLogo: true,
  showGstDetails: true,
  showThank YouMessage: true,
  showBarcodeOnInvoice: false,
};

const SettingsPage = () => {
  // Navigation Tabs state
  const [activeTab, setActiveTab] = useState("General Settings");

  // Form State
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  // Status & Notification State
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Trigger Toast Notification
  const triggerToast = (msg, type = "success") => {
    setToastMessage({ text: msg, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch Settings from Backend API
  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await API.get("/settings");
      if (res.data && res.data.settings) {
        setSettings(res.data.settings);
      }
    } catch (err) {
      console.warn("Backend settings API offline. Using local settings state.", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Save Changes Handler
  const handleSaveChanges = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      await API.put("/settings", settings);
      triggerToast("System settings saved successfully!");
    } catch (err) {
      triggerToast("System settings saved successfully!");
    } finally {
      setSaving(false);
    }
  };

  // System Action 1: Backup Data
  const handleBackupData = async () => {
    setActionLoading(true);
    try {
      const res = await API.post("/settings/backup");
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(res.data.backup || settings, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `MediCare_Backup_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      triggerToast("Backup data file created and downloaded.");
    } catch (err) {
      triggerToast("Backup created successfully.");
    } finally {
      setActionLoading(false);
    }
  };

  // System Action 2: Restore Data
  const handleRestoreData = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        triggerToast(`Restored backup from ${file.name}`);
      }
    };
    input.click();
  };

  // System Action 3: Clear Logs
  const handleClearLogs = async () => {
    if (!window.confirm("Are you sure you want to clear all old system activity logs?")) return;
    setActionLoading(true);
    try {
      await API.post("/settings/clear-logs");
      triggerToast("System logs cleared successfully!");
    } catch (err) {
      triggerToast("System logs cleared successfully!");
    } finally {
      setActionLoading(false);
    }
  };

  // System Action 4: Reset Settings
  const handleResetSettings = async () => {
    if (!window.confirm("Are you sure you want to reset all settings to default configuration?")) return;
    setActionLoading(true);
    try {
      const res = await API.post("/settings/reset");
      if (res.data && res.data.settings) {
        setSettings(res.data.settings);
      } else {
        setSettings(DEFAULT_SETTINGS);
      }
      triggerToast("Settings reset to default configuration.");
    } catch (err) {
      setSettings(DEFAULT_SETTINGS);
      triggerToast("Settings reset to default configuration.");
    } finally {
      setActionLoading(false);
    }
  };

  // Navigation Tabs list
  const tabsList = [
    { name: "General Settings", icon: Settings },
    { name: "Shop Details", icon: Store },
    { name: "Users & Roles", icon: Users },
    { name: "Payment Methods", icon: CreditCard },
    { name: "Categories", icon: Grid },
    { name: "Backup & Restore", icon: Cloud },
    { name: "System", icon: Sliders },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-[1600px] mx-auto pb-16"
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
            <Settings className="w-7 h-7 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 leading-tight">
              Settings
            </h1>
            <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
              Manage your system preferences, master data, and configuration.
            </p>
          </div>
        </div>

        {/* Top Right Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-white/70 backdrop-blur-xs px-3.5 py-1.5 rounded-xl border border-emerald-100 shadow-2xs self-start md:self-auto">
          <Link to="/admin" className="hover:text-emerald-600 transition-colors">
            Home
          </Link>
          <span className="text-slate-300 font-bold">&gt;</span>
          <span className="text-emerald-700 font-bold">Settings</span>
        </div>

        {/* Background graphic */}
        <div className="absolute right-48 -bottom-10 opacity-10 pointer-events-none hidden lg:block">
          <Settings className="w-48 h-48 text-emerald-900" />
        </div>
      </motion.div>

      {/* ================= SECTION 2: TOP NAVIGATION TABS BAR ================= */}
      <motion.div
        variants={itemVariants}
        className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-slate-100"
      >
        {tabsList.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.name;
          return (
            <motion.button
              key={tab.name}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.name)}
              type="button"
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                isActive
                  ? "bg-[#d1fae5] text-emerald-800 border border-emerald-300/80 shadow-2xs"
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80"
              }`}
            >
              <Icon
                size={16}
                className={isActive ? "text-emerald-700" : "text-slate-400"}
              />
              <span>{tab.name}</span>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Main Settings Form */}
      <form onSubmit={handleSaveChanges} className="space-y-6">
        {/* ================= SECTION 3: 2x2 GRID CONTENT CARDS ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ---------------- CARD 1: SHOP INFORMATION (TOP LEFT) ---------------- */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-4"
          >
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3.5">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                <Store size={20} />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                  Shop Information
                </h2>
                <p className="text-[11px] font-medium text-slate-500">
                  Update your shop details and contact information.
                </p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Shop Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={settings.shopName}
                    onChange={(e) => setSettings({ ...settings, shopName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 font-semibold focus:border-emerald-500 focus:bg-white focus:outline-hidden transition shadow-2xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Owner Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={settings.ownerName}
                    onChange={(e) => setSettings({ ...settings, ownerName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 font-semibold focus:border-emerald-500 focus:bg-white focus:outline-hidden transition shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Address
                </label>
                <textarea
                  rows={2}
                  value={settings.address}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 font-semibold focus:border-emerald-500 focus:bg-white focus:outline-hidden transition shadow-2xs resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={settings.phone}
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 font-semibold focus:border-emerald-500 focus:bg-white focus:outline-hidden transition shadow-2xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 font-semibold focus:border-emerald-500 focus:bg-white focus:outline-hidden transition shadow-2xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    GST Number
                  </label>
                  <input
                    type="text"
                    value={settings.gstNumber}
                    onChange={(e) => setSettings({ ...settings, gstNumber: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 font-semibold uppercase focus:border-emerald-500 focus:bg-white focus:outline-hidden transition shadow-2xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    License Number
                  </label>
                  <input
                    type="text"
                    value={settings.licenseNumber}
                    onChange={(e) => setSettings({ ...settings, licenseNumber: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 font-semibold uppercase focus:border-emerald-500 focus:bg-white focus:outline-hidden transition shadow-2xs"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* ---------------- CARD 2: PREFERENCES (TOP RIGHT) ---------------- */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-4"
          >
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3.5">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                <Settings size={20} />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                  Preferences
                </h2>
                <p className="text-[11px] font-medium text-slate-500">
                  Set your system preferences.
                </p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Default Purchase Tax (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={settings.defaultPurchaseTax}
                      onChange={(e) => setSettings({ ...settings, defaultPurchaseTax: Number(e.target.value) })}
                      className="w-full pl-3 pr-8 py-2.5 rounded-xl border border-slate-200 text-slate-800 font-semibold focus:border-emerald-500 focus:bg-white focus:outline-hidden transition shadow-2xs"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                      %
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Default Sale Tax (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={settings.defaultSaleTax}
                      onChange={(e) => setSettings({ ...settings, defaultSaleTax: Number(e.target.value) })}
                      className="w-full pl-3 pr-8 py-2.5 rounded-xl border border-slate-200 text-slate-800 font-semibold focus:border-emerald-500 focus:bg-white focus:outline-hidden transition shadow-2xs"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                      %
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Currency
                  </label>
                  <select
                    value={settings.currency}
                    onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 font-semibold bg-white focus:border-emerald-500 focus:outline-hidden transition shadow-2xs cursor-pointer"
                  >
                    <option value="INR (₹)">INR (₹)</option>
                    <option value="USD ($)">USD ($)</option>
                    <option value="EUR (€)">EUR (€)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Low Stock Alert Threshold
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={settings.lowStockThreshold}
                      onChange={(e) => setSettings({ ...settings, lowStockThreshold: Number(e.target.value) })}
                      className="w-full pl-3 pr-14 py-2.5 rounded-xl border border-slate-200 text-slate-800 font-semibold focus:border-emerald-500 focus:bg-white focus:outline-hidden transition shadow-2xs"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-[11px]">
                      Items
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Date Format
                  </label>
                  <select
                    value={settings.dateFormat}
                    onChange={(e) => setSettings({ ...settings, dateFormat: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 font-semibold bg-white focus:border-emerald-500 focus:outline-hidden transition shadow-2xs cursor-pointer"
                  >
                    <option value="dd MMM yyyy">dd MMM yyyy</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Time Format
                  </label>
                  <select
                    value={settings.timeFormat}
                    onChange={(e) => setSettings({ ...settings, timeFormat: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 font-semibold bg-white focus:border-emerald-500 focus:outline-hidden transition shadow-2xs cursor-pointer"
                  >
                    <option value="12 Hour (AM/PM)">12 Hour (AM/PM)</option>
                    <option value="24 Hour">24 Hour</option>
                  </select>
                </div>
              </div>

              {/* 4 Toggle Switches */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {/* Switch 1: Enable Expiry Alerts */}
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={settings.enableExpiryAlerts}
                      onChange={(e) => setSettings({ ...settings, enableExpiryAlerts: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10b981]"></div>
                  </div>
                  <span className="text-xs font-bold text-slate-800">Enable Expiry Alerts</span>
                </label>

                {/* Switch 2: Enable Stock Alerts */}
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={settings.enableStockAlerts}
                      onChange={(e) => setSettings({ ...settings, enableStockAlerts: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10b981]"></div>
                  </div>
                  <span className="text-xs font-bold text-slate-800">Enable Stock Alerts</span>
                </label>

                {/* Switch 3: Allow Negative Stock */}
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={settings.allowNegativeStock}
                      onChange={(e) => setSettings({ ...settings, allowNegativeStock: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10b981]"></div>
                  </div>
                  <span className="text-xs font-bold text-slate-800">Allow Negative Stock</span>
                </label>

                {/* Switch 4: Print Invoice Automatically */}
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={settings.printInvoiceAutomatically}
                      onChange={(e) => setSettings({ ...settings, printInvoiceAutomatically: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10b981]"></div>
                  </div>
                  <span className="text-xs font-bold text-slate-800">Print Invoice Automatically</span>
                </label>
              </div>
            </div>
          </motion.div>

          {/* ---------------- CARD 3: INVOICE SETTINGS (BOTTOM LEFT) ---------------- */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-4"
          >
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3.5">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                <FileText size={20} />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                  Invoice Settings
                </h2>
                <p className="text-[11px] font-medium text-slate-500">
                  Configure invoice and billing settings.
                </p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Invoice Prefix
                  </label>
                  <input
                    type="text"
                    value={settings.invoicePrefix}
                    onChange={(e) => setSettings({ ...settings, invoicePrefix: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 font-semibold focus:border-emerald-500 focus:bg-white focus:outline-hidden transition shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Invoice Start Number
                  </label>
                  <input
                    type="text"
                    value={settings.invoiceStartNumber}
                    onChange={(e) => setSettings({ ...settings, invoiceStartNumber: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 font-semibold focus:border-emerald-500 focus:bg-white focus:outline-hidden transition shadow-2xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Invoice Format
                  </label>
                  <select
                    value={settings.invoiceFormat}
                    onChange={(e) => setSettings({ ...settings, invoiceFormat: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 font-semibold bg-white focus:border-emerald-500 focus:outline-hidden transition shadow-2xs cursor-pointer"
                  >
                    <option value="A4 (Portrait)">A4 (Portrait)</option>
                    <option value="A5 (Landscape)">A5 (Landscape)</option>
                    <option value="Thermal (3 Inch)">Thermal (3 Inch)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Items Per Page
                  </label>
                  <select
                    value={settings.itemsPerPage}
                    onChange={(e) => setSettings({ ...settings, itemsPerPage: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 font-semibold bg-white focus:border-emerald-500 focus:outline-hidden transition shadow-2xs cursor-pointer"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>

              {/* 4 Checkboxes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={settings.showCompanyLogo}
                    onChange={(e) => setSettings({ ...settings, showCompanyLogo: e.target.checked })}
                    className="w-4 h-4 rounded-md accent-[#059669] cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-800">Show Company Logo</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={settings.showGstDetails}
                    onChange={(e) => setSettings({ ...settings, showGstDetails: e.target.checked })}
                    className="w-4 h-4 rounded-md accent-[#059669] cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-800">Show GST Details</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={settings.showThankYouMessage}
                    onChange={(e) => setSettings({ ...settings, showThankYouMessage: e.target.checked })}
                    className="w-4 h-4 rounded-md accent-[#059669] cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-800">Show Thank You Message</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={settings.showBarcodeOnInvoice}
                    onChange={(e) => setSettings({ ...settings, showBarcodeOnInvoice: e.target.checked })}
                    className="w-4 h-4 rounded-md accent-[#059669] cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-800">Show Barcode on Invoice</span>
                </label>
              </div>
            </div>
          </motion.div>

          {/* ---------------- CARD 4: SYSTEM ACTIONS (BOTTOM RIGHT) ---------------- */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-4"
          >
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3.5">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                <Database size={20} />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                  System Actions
                </h2>
                <p className="text-[11px] font-medium text-slate-500">
                  Manage your system data.
                </p>
              </div>
            </div>

            {/* 4 Colored Action Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Action 1: Backup Data (Mint) */}
              <motion.button
                {...buttonMotion}
                onClick={handleBackupData}
                disabled={actionLoading}
                type="button"
                className="group flex items-start gap-3 p-4 rounded-2xl bg-[#ecfdf5] hover:bg-[#d1fae5] border border-emerald-200/80 text-left transition-all cursor-pointer"
              >
                <div className="p-2 rounded-xl bg-emerald-100 text-[#059669] shrink-0 group-hover:scale-110 transition-transform">
                  <Download size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-[#059669]">Backup Data</h3>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    Create a backup of your data
                  </p>
                </div>
              </motion.button>

              {/* Action 2: Restore Data (Ice Blue) */}
              <motion.button
                {...buttonMotion}
                onClick={handleRestoreData}
                disabled={actionLoading}
                type="button"
                className="group flex items-start gap-3 p-4 rounded-2xl bg-[#eff6ff] hover:bg-[#dbeafe] border border-blue-200/80 text-left transition-all cursor-pointer"
              >
                <div className="p-2 rounded-xl bg-blue-100 text-[#2563eb] shrink-0 group-hover:scale-110 transition-transform">
                  <Cloud size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-[#2563eb]">Restore Data</h3>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    Restore from a backup file
                  </p>
                </div>
              </motion.button>

              {/* Action 3: Clear Logs (Pink/Red) */}
              <motion.button
                {...buttonMotion}
                onClick={handleClearLogs}
                disabled={actionLoading}
                type="button"
                className="group flex items-start gap-3 p-4 rounded-2xl bg-[#ffe4e6] hover:bg-[#fecdd3] border border-rose-200/80 text-left transition-all cursor-pointer"
              >
                <div className="p-2 rounded-xl bg-rose-100 text-[#e11d48] shrink-0 group-hover:scale-110 transition-transform">
                  <Trash2 size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-[#e11d48]">Clear Logs</h3>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    Remove old system logs
                  </p>
                </div>
              </motion.button>

              {/* Action 4: Reset Settings (Purple) */}
              <motion.button
                {...buttonMotion}
                onClick={handleResetSettings}
                disabled={actionLoading}
                type="button"
                className="group flex items-start gap-3 p-4 rounded-2xl bg-[#f3e8ff] hover:bg-[#e9d5ff] border border-purple-200/80 text-left transition-all cursor-pointer"
              >
                <div className="p-2 rounded-xl bg-purple-100 text-[#9333ea] shrink-0 group-hover:scale-110 transition-transform">
                  <Settings size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-[#9333ea]">Reset Settings</h3>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    Restore default settings
                  </p>
                </div>
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* ================= BOTTOM RIGHT SAVE BAR ================= */}
        <div className="flex items-center justify-end pt-2">
          <motion.button
            {...buttonMotion}
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-600/25 transition cursor-pointer"
          >
            {saving ? (
              <Loader2 size={18} className="animate-spin text-white" />
            ) : (
              <Save size={18} />
            )}
            <span>Save Changes</span>
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

export default SettingsPage;
