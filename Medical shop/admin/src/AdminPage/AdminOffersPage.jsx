/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BadgePercent,
  CalendarDays,
  CircleDollarSign,
  Pencil,
  Plus,
  RefreshCcw,
  Search,
  Tag,
  TicketPercent,
  Trash2,
  X,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import API from "../api/axios";

const initialForm = {
  title: "",
  description: "",
  code: "",
  discountType: "percentage",
  discountValue: "",
  minOrderAmount: "",
  maxDiscount: "",
  validFrom: new Date().toISOString().slice(0, 10),
  validTill: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10),
  isActive: true,
};

const formatDateInput = (date) => {
  if (!date) return "";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10);
};

const formatDateDisplay = (date) => {
  if (!date) return "N/A";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "N/A";
  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const isOfferExpired = (validTill) => {
  if (!validTill) return false;
  const today = new Date();
  const till = new Date(validTill);
  today.setHours(0, 0, 0, 0);
  till.setHours(23, 59, 59, 999);
  return till < today;
};

const isOfferRunning = (validFrom, validTill) => {
  if (!validFrom || !validTill) return false;
  const today = new Date();
  const from = new Date(validFrom);
  const till = new Date(validTill);
  from.setHours(0, 0, 0, 0);
  till.setHours(23, 59, 59, 999);
  return today >= from && today <= till;
};

const AdminOffersPage = () => {
  const [offers, setOffers] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [feedback, setFeedback] = useState({ type: "", text: "" });

  const fetchOffers = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setFetching(true);

      const { data } = await API.get("/offers");
      setOffers(data?.offers || []);
    } catch (err) {
      console.error("Fetch offers error:", err);
      setFeedback({
        type: "error",
        text: err?.response?.data?.message || "Failed to fetch offers",
      });
    } finally {
      setFetching(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const filteredOffers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return offers.filter((offer) => {
      const matchesSearch =
        !query ||
        offer?.title?.toLowerCase().includes(query) ||
        offer?.code?.toLowerCase().includes(query) ||
        offer?.description?.toLowerCase().includes(query);

      if (!matchesSearch) return false;

      if (statusFilter === "active") return offer.isActive && !isOfferExpired(offer.validTill);
      if (statusFilter === "inactive") return !offer.isActive;
      if (statusFilter === "expired") return isOfferExpired(offer.validTill);
      if (statusFilter === "running") return isOfferRunning(offer.validFrom, offer.validTill) && offer.isActive;

      return true;
    });
  }, [offers, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    const total = offers.length;
    const active = offers.filter(
      (o) => o.isActive && !isOfferExpired(o.validTill)
    ).length;
    const running = offers.filter(
      (o) => isOfferRunning(o.validFrom, o.validTill) && o.isActive
    ).length;
    const expired = offers.filter((o) => isOfferExpired(o.validTill)).length;

    return { total, active, running, expired };
  }, [offers]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : name === "code"
          ? value.toUpperCase().replace(/\s+/g, "")
          : value,
    }));
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData(initialForm);
    setFeedback({ type: "", text: "" });
    setShowModal(true);
  };

  const handleEdit = (offer) => {
    setEditingId(offer._id);
    setFormData({
      title: offer.title || "",
      description: offer.description || "",
      code: offer.code || "",
      discountType: offer.discountType || "percentage",
      discountValue: offer.discountValue ?? "",
      minOrderAmount: offer.minOrderAmount ?? "",
      maxDiscount: offer.maxDiscount ?? "",
      validFrom: formatDateInput(offer.validFrom),
      validTill: formatDateInput(offer.validTill),
      isActive: Boolean(offer.isActive),
    });
    setFeedback({ type: "", text: "" });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setFeedback({ type: "error", text: "Offer title is required." });
      return;
    }
    if (!formData.code.trim()) {
      setFeedback({ type: "error", text: "Offer code is required." });
      return;
    }
    if (formData.discountValue === "" || Number(formData.discountValue) <= 0) {
      setFeedback({ type: "error", text: "Enter a valid positive discount value." });
      return;
    }

    try {
      setLoading(true);
      setFeedback({ type: "", text: "" });

      const payload = {
        ...formData,
        title: formData.title.trim(),
        description: formData.description.trim(),
        code: formData.code.trim().toUpperCase(),
        discountValue: Number(formData.discountValue),
        minOrderAmount: Number(formData.minOrderAmount || 0),
        maxDiscount: Number(formData.maxDiscount || 0),
      };

      if (editingId) {
        const { data } = await API.put(`/offers/${editingId}`, payload);
        setFeedback({
          type: "success",
          text: data?.message || "Offer updated successfully!",
        });
      } else {
        const { data } = await API.post("/offers", payload);
        setFeedback({
          type: "success",
          text: data?.message || "Offer created successfully!",
        });
      }

      setShowModal(false);
      fetchOffers();
    } catch (err) {
      console.error("Submit offer error:", err);
      setFeedback({
        type: "error",
        text: err?.response?.data?.message || "Failed to save offer.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this offer?")) {
      return;
    }

    try {
      const { data } = await API.delete(`/offers/${id}`);
      setFeedback({
        type: "success",
        text: data?.message || "Offer deleted successfully!",
      });
      setOffers((prev) => prev.filter((o) => o._id !== id));
    } catch (err) {
      console.error("Delete offer error:", err);
      setFeedback({
        type: "error",
        text: err?.response?.data?.message || "Failed to delete offer",
      });
    }
  };

  const toggleOfferStatus = async (offer) => {
    try {
      const updatedStatus = !offer.isActive;
      await API.put(`/offers/${offer._id}`, { isActive: updatedStatus });
      setOffers((prev) =>
        prev.map((o) => (o._id === offer._id ? { ...o, isActive: updatedStatus } : o))
      );
      setFeedback({
        type: "success",
        text: `Offer ${offer.code} ${updatedStatus ? "Activated" : "Deactivated"}.`,
      });
    } catch (err) {
      console.error("Toggle status error:", err);
      setFeedback({
        type: "error",
        text: "Failed to update offer status",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner matching Medicare Admin Style */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-linear-to-r from-[#e6f7f2] via-[#eef9f5] to-white border border-[#cbeee2] p-5 sm:p-6 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-1">
            <BadgePercent size={16} className="text-emerald-600" />
            <span>Marketing & Promotions</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Offers & Promo Codes
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Create and manage promotional discounts that show up directly on the customer store.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchOffers(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold shadow-2xs transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCcw size={15} className={refreshing ? "animate-spin text-emerald-600" : ""} />
            <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
          </button>

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus size={17} />
            <span>Add New Offer</span>
          </button>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback.text && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center justify-between p-4 rounded-xl border text-xs sm:text-sm font-semibold ${
            feedback.type === "error"
              ? "bg-rose-50 border-rose-200 text-rose-800"
              : "bg-emerald-50 border-emerald-200 text-emerald-800"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === "error" ? (
              <AlertCircle size={18} className="text-rose-600 shrink-0" />
            ) : (
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button
            onClick={() => setFeedback({ type: "", text: "" })}
            className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
          >
            <X size={16} />
          </button>
        </motion.div>
      )}

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="rounded-2xl border border-[#e2efe8] bg-white p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Offers
            </span>
            <div className="h-9 w-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
              <Tag size={18} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            {stats.total}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">All created coupons</p>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-white p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Active Offers
            </span>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <TicketPercent size={18} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 mt-2">
            {stats.active}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Visible to customers</p>
        </div>

        <div className="rounded-2xl border border-cyan-100 bg-white p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cyan-700 uppercase tracking-wider">
              Running Now
            </span>
            <div className="h-9 w-9 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold">
              <Clock size={18} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-cyan-700 mt-2">
            {stats.running}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Currently valid date</p>
        </div>

        <div className="rounded-2xl border border-rose-100 bg-white p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">
              Expired
            </span>
            <div className="h-9 w-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <CircleDollarSign size={18} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-600 mt-2">
            {stats.expired}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Past validity date</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="rounded-2xl border border-[#e5f0eb] bg-white p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, coupon code, or details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:outline-hidden transition"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "all", label: "All" },
            { id: "active", label: "Active" },
            { id: "running", label: "Running" },
            { id: "expired", label: "Expired" },
            { id: "inactive", label: "Disabled" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                statusFilter === tab.id
                  ? "bg-emerald-600 text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Offers Cards Grid */}
      {fetching ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-8">
          {[1, 2, 3].map((n) => (
            <div key={n} className="rounded-2xl border border-slate-200 bg-white p-6 animate-pulse space-y-4">
              <div className="h-6 w-1/3 bg-slate-200 rounded-md" />
              <div className="h-8 w-3/4 bg-slate-200 rounded-lg" />
              <div className="h-16 bg-slate-100 rounded-xl" />
            </div>
          ))}
        </div>
      ) : filteredOffers.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <div className="h-14 w-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <Tag size={26} />
          </div>
          <h3 className="text-base font-bold text-slate-900">No promotional offers found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            {searchTerm || statusFilter !== "all"
              ? "Try adjusting your search query or filter."
              : "Click the 'Add New Offer' button above to create your first discount promo code."}
          </p>
          <button
            onClick={openAddModal}
            className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 cursor-pointer"
          >
            Create Offer Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          <AnimatePresence mode="popLayout">
            {filteredOffers.map((offer) => {
              const expired = isOfferExpired(offer.validTill);
              const running = isOfferRunning(offer.validFrom, offer.validTill);

              return (
                <motion.div
                  key={offer._id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="rounded-2xl border border-[#e5f0eb] bg-white overflow-hidden shadow-2xs hover:shadow-md transition flex flex-col justify-between"
                >
                  {/* Top Color Banner */}
                  <div className="p-4 bg-linear-to-r from-emerald-600 to-teal-600 text-white">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-[11px] font-black uppercase tracking-wider">
                        {offer.discountType === "percentage"
                          ? `${offer.discountValue}% OFF`
                          : `₹${offer.discountValue} FLAT OFF`}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide ${
                            offer.isActive && !expired
                              ? "bg-emerald-400 text-slate-950"
                              : expired
                              ? "bg-rose-500 text-white"
                              : "bg-slate-700 text-white"
                          }`}
                        >
                          {expired ? "Expired" : offer.isActive ? "Active" : "Disabled"}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-base sm:text-lg font-black mt-2.5 truncate">
                      {offer.title}
                    </h3>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <p className="text-xs text-slate-600 line-clamp-2">
                        {offer.description || "No description provided."}
                      </p>

                      {/* Coupon Code Block */}
                      <div className="mt-3.5 p-3 rounded-xl bg-[#f4faf8] border border-dashed border-emerald-300 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                            Promo Code
                          </span>
                          <span className="text-base font-black text-slate-900 tracking-wider">
                            {offer.code}
                          </span>
                        </div>

                        <button
                          onClick={() => toggleOfferStatus(offer)}
                          className={`text-xs font-bold px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                            offer.isActive
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                              : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                          }`}
                        >
                          {offer.isActive ? "Enabled" : "Disabled"}
                        </button>
                      </div>

                      {/* Details Grid */}
                      <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                          <span className="text-slate-400 block font-medium">Min Order</span>
                          <span className="font-bold text-slate-800">
                            {offer.minOrderAmount > 0 ? `₹${offer.minOrderAmount}` : "None"}
                          </span>
                        </div>

                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                          <span className="text-slate-400 block font-medium">Max Discount</span>
                          <span className="font-bold text-slate-800">
                            {offer.maxDiscount > 0 ? `₹${offer.maxDiscount}` : "Unlimited"}
                          </span>
                        </div>

                        <div className="col-span-2 p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                          <span className="text-slate-400 font-medium">Validity Period</span>
                          <span className="font-bold text-slate-800">
                            {formatDateDisplay(offer.validFrom)} - {formatDateDisplay(offer.validTill)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(offer)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer"
                      >
                        <Pencil size={13} />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handleDelete(offer._id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-semibold transition cursor-pointer"
                      >
                        <Trash2 size={13} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Add / Edit Offer Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-linear-to-r from-emerald-50/50 to-white">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                    <Tag size={16} />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-slate-900">
                      {editingId ? "Edit Promotional Offer" : "Create New Offer"}
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      Configure promo code, discounts, and expiration.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Offer Title */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Offer Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      placeholder="e.g. Mega Summer Health Sale"
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-hidden transition"
                      required
                    />
                  </div>

                  {/* Offer Code */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Coupon Code *
                    </label>
                    <input
                      type="text"
                      name="code"
                      placeholder="e.g. MEDICARE25"
                      value={formData.code}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-hidden transition"
                      required
                    />
                  </div>

                  {/* Discount Type */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Discount Type *
                    </label>
                    <select
                      name="discountType"
                      value={formData.discountType}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-hidden transition cursor-pointer"
                    >
                      <option value="percentage">Percentage Discount (%)</option>
                      <option value="flat">Flat Amount Discount (₹)</option>
                    </select>
                  </div>

                  {/* Discount Value */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Discount Value ({formData.discountType === "percentage" ? "%" : "₹"}) *
                    </label>
                    <input
                      type="number"
                      name="discountValue"
                      placeholder={formData.discountType === "percentage" ? "25" : "150"}
                      value={formData.discountValue}
                      onChange={handleChange}
                      min="1"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-bold text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-hidden transition"
                      required
                    />
                  </div>

                  {/* Min Order Amount */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Min Order Amount (₹)
                    </label>
                    <input
                      type="number"
                      name="minOrderAmount"
                      placeholder="e.g. 500 (0 for no limit)"
                      value={formData.minOrderAmount}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-hidden transition"
                    />
                  </div>

                  {/* Max Discount */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Max Discount Cap (₹)
                    </label>
                    <input
                      type="number"
                      name="maxDiscount"
                      placeholder="e.g. 300 (0 for no cap)"
                      value={formData.maxDiscount}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-hidden transition"
                    />
                  </div>

                  {/* Active Toggle */}
                  <div className="flex items-center gap-3 pt-6">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                      <span className="ml-3 text-xs font-bold text-slate-800">
                        {formData.isActive ? "Offer is Active" : "Offer is Disabled"}
                      </span>
                    </label>
                  </div>

                  {/* Valid From */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Valid From Date *
                    </label>
                    <input
                      type="date"
                      name="validFrom"
                      value={formData.validFrom}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-hidden transition"
                      required
                    />
                  </div>

                  {/* Valid Till */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Valid Till Date *
                    </label>
                    <input
                      type="date"
                      name="validTill"
                      value={formData.validTill}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-hidden transition"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Description / Terms
                    </label>
                    <textarea
                      name="description"
                      rows="3"
                      placeholder="e.g. Valid on all prescription and OTC medicines above ₹500."
                      value={formData.description}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-hidden transition"
                    />
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition cursor-pointer disabled:opacity-50"
                  >
                    {loading ? "Saving..." : editingId ? "Save Changes" : "Create Offer"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminOffersPage;