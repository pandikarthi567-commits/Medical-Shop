/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useRef, useState } from "react";
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
  validFrom: "",
  validTill: "",
  isActive: true,
};

const pageMotion = {
  initial: { opacity: 0, y: 20, filter: "blur(4px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -16, filter: "blur(3px)" },
};

const cardMotion = {
  initial: { opacity: 0, y: 18, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -14, scale: 0.96 },
};

const formMotion = {
  hidden: { opacity: 0, y: -16, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -12, scale: 0.98 },
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

const formatDiscountText = (offer) => {
  if (offer.discountType === "percentage") {
    return `${offer.discountValue}% OFF`;
  }
  return `₹${offer.discountValue} OFF`;
};

const isOfferExpired = (validTill) => {
  if (!validTill) return false;
  const today = new Date();
  const till = new Date(validTill);
  today.setHours(0, 0, 0, 0);
  till.setHours(0, 0, 0, 0);
  return till < today;
};

const isOfferUpcoming = (validFrom) => {
  if (!validFrom) return false;
  const today = new Date();
  const from = new Date(validFrom);
  today.setHours(0, 0, 0, 0);
  from.setHours(0, 0, 0, 0);
  return from > today;
};

const isOfferRunning = (validFrom, validTill) => {
  if (!validFrom || !validTill) return false;
  const today = new Date();
  const from = new Date(validFrom);
  const till = new Date(validTill);
  today.setHours(0, 0, 0, 0);
  from.setHours(0, 0, 0, 0);
  till.setHours(0, 0, 0, 0);
  return today >= from && today <= till;
};

const AdminOffersPage = () => {
  const formSectionRef = useRef(null);

  const [offers, setOffers] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchOffers = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setFetching(true);
      }

      setError("");

      const { data } = await API.get("/offers");
      setOffers(data?.offers || []);
    } catch (err) {
      console.error("Fetch offers error:", err);
      setError(err?.response?.data?.message || "Failed to fetch offers");
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

    if (!query) return offers;

    return offers.filter((offer) => {
      const searchableText = [
        offer?.title,
        offer?.description,
        offer?.code,
        offer?.discountType,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [offers, searchTerm]);

  const stats = useMemo(() => {
    const active = offers.filter((offer) => offer.isActive).length;
    const running = offers.filter((offer) =>
      isOfferRunning(offer.validFrom, offer.validTill)
    ).length;
    const expired = offers.filter((offer) => isOfferExpired(offer.validTill)).length;

    return {
      total: offers.length,
      active,
      running,
      expired,
    };
  }, [offers]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : name === "code"
          ? value.toUpperCase()
          : value,
    }));
  };

  const resetForm = () => {
    setFormData(initialForm);
    setEditingId(null);
    setShowForm(false);
    setError("");
  };

  const scrollToForm = () => {
    setTimeout(() => {
      formSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  const openAddForm = () => {
    setEditingId(null);
    setFormData(initialForm);
    setMessage("");
    setError("");
    setShowForm(true);
    scrollToForm();
  };

  const validateForm = () => {
    if (!formData.title.trim()) return "Offer title is required";
    if (!formData.code.trim()) return "Offer code is required";
    if (!formData.discountType) return "Discount type is required";
    if (formData.discountValue === "" || Number(formData.discountValue) < 0) {
      return "Enter a valid discount value";
    }
    if (!formData.validFrom || !formData.validTill) {
      return "Valid from and valid till are required";
    }

    const from = new Date(formData.validFrom);
    const till = new Date(formData.validTill);

    if (Number.isNaN(from.getTime()) || Number.isNaN(till.getTime())) {
      return "Invalid date selected";
    }

    if (till < from) {
      return "Valid till date cannot be earlier than valid from date";
    }

    if (Number(formData.minOrderAmount || 0) < 0) {
      return "Minimum order amount cannot be negative";
    }

    if (Number(formData.maxDiscount || 0) < 0) {
      return "Max discount cannot be negative";
    }

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setMessage("");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

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
        setMessage(data?.message || "Offer updated successfully");
      } else {
        const { data } = await API.post("/offers", payload);
        setMessage(data?.message || "Offer added successfully");
      }

      setFormData(initialForm);
      setEditingId(null);
      setShowForm(false);
      fetchOffers();
    } catch (err) {
      console.error("Submit offer error:", err);
      setError(err?.response?.data?.message || "Failed to save offer");
    } finally {
      setLoading(false);
    }
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

    setMessage("");
    setError("");
    setShowForm(true);
    scrollToForm();
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this offer?"
    );
    if (!confirmDelete) return;

    try {
      setError("");
      setMessage("");

      const { data } = await API.delete(`/offers/${id}`);
      setMessage(data?.message || "Offer deleted successfully");

      if (editingId === id) {
        resetForm();
      }

      setOffers((prev) => prev.filter((offer) => offer._id !== id));
    } catch (err) {
      console.error("Delete offer error:", err);
      setError(err?.response?.data?.message || "Failed to delete offer");
    }
  };

  return (
    <motion.div
      variants={pageMotion}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto max-w-7xl space-y-6"
    >
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              <Sparkles size={14} />
              Offer Dashboard
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Admin Offer Management
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Create, update, search, and manage all promotional offers.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-80">
              <Search
                size={18}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search by title, code, type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-300 bg-slate-50 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white"
              />
            </div>

            <button
              onClick={openAddForm}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              <Plus size={16} />
              Add Offer
            </button>

            <button
              onClick={() => fetchOffers(true)}
              disabled={refreshing}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCcw size={16} className={refreshing ? "animate-spin" : ""} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>
      </div>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-green-200 bg-green-50 p-3 text-green-700"
        >
          {message}
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-700"
        >
          {error}
        </motion.div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Offers</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">{stats.total}</h2>
            </div>
            <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
              <Tag size={20} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500">Active Offers</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">{stats.active}</h2>
            </div>
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
              <TicketPercent size={20} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500">Running Now</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">{stats.running}</h2>
            </div>
            <div className="rounded-xl bg-amber-50 p-3 text-amber-700">
              <CalendarDays size={20} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500">Expired Offers</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">{stats.expired}</h2>
            </div>
            <div className="rounded-xl bg-red-50 p-3 text-red-700">
              <CircleDollarSign size={20} />
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form
            ref={formSectionRef}
            key="offer-form"
            variants={formMotion}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
            onSubmit={handleSubmit}
            className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  {editingId ? "Edit Offer" : "Add New Offer"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {editingId
                    ? "Update the selected offer details."
                    : "Fill the form and create a new promotional offer."}
                </p>
              </div>

              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <X size={16} />
                Close
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Offer Title</label>
              <input
                type="text"
                name="title"
                placeholder="Enter offer title"
                value={formData.title}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-blue-500"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Description</label>
              <textarea
                name="description"
                placeholder="Enter offer description"
                value={formData.description}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-blue-500"
                rows="4"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Offer Code</label>
                <input
                  type="text"
                  name="code"
                  placeholder="SAVE20"
                  value={formData.code}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 p-3 uppercase outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Discount Type</label>
                <select
                  name="discountType"
                  value={formData.discountType}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-blue-500"
                  required
                >
                  <option value="percentage">Percentage</option>
                  <option value="flat">Flat</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Discount Value</label>
                <input
                  type="number"
                  name="discountValue"
                  placeholder="Enter discount value"
                  value={formData.discountValue}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-blue-500"
                  min="0"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Minimum Order Amount
                </label>
                <input
                  type="number"
                  name="minOrderAmount"
                  placeholder="Enter minimum order amount"
                  value={formData.minOrderAmount}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-blue-500"
                  min="0"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-slate-700">Maximum Discount</label>
                <input
                  type="number"
                  name="maxDiscount"
                  placeholder="Enter max discount"
                  value={formData.maxDiscount}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-blue-500"
                  min="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Valid From</label>
                <input
                  type="date"
                  name="validFrom"
                  value={formData.validFrom}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Valid Till</label>
                <input
                  type="date"
                  name="validTill"
                  value={formData.validTill}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="h-4 w-4"
              />
              <span className="text-sm font-medium text-slate-700">Active offer</span>
            </label>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
              >
                {editingId ? <Pencil size={16} /> : <Plus size={16} />}
                {loading
                  ? "Saving..."
                  : editingId
                  ? "Update Offer"
                  : "Add Offer"}
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl bg-slate-500 px-5 py-3 text-white transition-colors hover:bg-slate-600"
              >
                Cancel
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.35 }}
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Offer Cards</h2>
            <p className="mt-1 text-sm text-slate-500">
              Each offer is displayed in detailed card format.
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
            Showing {filteredOffers.length}
          </span>
        </div>

        {fetching ? (
          <p className="text-slate-500">Loading offers...</p>
        ) : filteredOffers.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
            No offers found.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 2xl:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {filteredOffers.map((offer) => {
                const expired = isOfferExpired(offer.validTill);
                const upcoming = isOfferUpcoming(offer.validFrom);
                const running = isOfferRunning(offer.validFrom, offer.validTill);

                return (
                  <motion.div
                    key={offer._id}
                    layout
                    variants={cardMotion}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                  >
                    <div className="border-b border-slate-100 bg-slate-50 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                            <BadgePercent size={14} />
                            {formatDiscountText(offer)}
                          </div>
                          <h3 className="text-lg font-bold text-slate-900">
                            {offer.title}
                          </h3>
                          <p className="mt-1 text-sm text-slate-600">
                            {offer.description || "No description provided."}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              offer.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {offer.isActive ? "Active" : "Inactive"}
                          </span>

                          {running && (
                            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                              Running
                            </span>
                          )}

                          {upcoming && (
                            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                              Upcoming
                            </span>
                          )}

                          {expired && (
                            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                              Expired
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs uppercase tracking-wide text-slate-500">
                          Offer Code
                        </p>
                        <p className="mt-1 text-base font-semibold text-slate-900">
                          {offer.code}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs uppercase tracking-wide text-slate-500">
                          Discount Type
                        </p>
                        <p className="mt-1 text-base font-semibold capitalize text-slate-900">
                          {offer.discountType}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs uppercase tracking-wide text-slate-500">
                          Minimum Order
                        </p>
                        <p className="mt-1 text-base font-semibold text-slate-900">
                          ₹{Number(offer.minOrderAmount || 0)}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs uppercase tracking-wide text-slate-500">
                          Maximum Discount
                        </p>
                        <p className="mt-1 text-base font-semibold text-slate-900">
                          ₹{Number(offer.maxDiscount || 0)}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3 sm:col-span-2">
                        <p className="text-xs uppercase tracking-wide text-slate-500">
                          Validity Period
                        </p>
                        <p className="mt-1 flex flex-wrap items-center text-base font-semibold text-slate-900">
                          <span>{formatDateDisplay(offer.validFrom)}</span>
                          <ChevronRight className="mx-1" size={14} />
                          <span>{formatDateDisplay(offer.validTill)}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 border-t border-slate-100 p-4">
                      <button
                        onClick={() => handleEdit(offer)}
                        className="inline-flex items-center gap-2 rounded-xl bg-yellow-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-yellow-600"
                      >
                        <Pencil size={16} />
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(offer._id)}
                        className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default AdminOffersPage;