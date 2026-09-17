import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bike,
  User,
  Phone,
  MapPin,
  Star,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  ShieldCheck,
  AlertCircle,
  Edit2,
  Trash2,
  Package,
  Activity,
  UserCheck,
  UserX,
  RefreshCw,
  X,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import PageTransition, { fadeUpItem } from "./components/PageTransition";

const VEHICLE_TYPES = [
  "Motorcycle (Express)",
  "Electric Scooter (Eco)",
  "Express Bike",
  "Medical Dispatch Bike",
  "Cold-Chain Van",
  "Bicycle Courier",
];

const DeliveryBoysPage = () => {
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL"); // ALL, AVAILABLE, ON_DELIVERY, OFFLINE

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedRider, setSelectedRider] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Active Pending Orders for Assignment
  const [pendingOrders, setPendingOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [assignEta, setAssignEta] = useState(30);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    vehicleType: "Motorcycle (Express)",
    vehicleNumber: "",
    area: "Virudhunagar & Madurai Hub",
    rating: 5.0,
  });

  const fetchRiders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await API.get("/riders");
      if (res.data?.success) {
        setRiders(res.data.riders || []);
      }
    } catch (err) {
      console.error("Failed to load delivery personnel:", err);
      setError(err?.response?.data?.message || "Failed to load delivery boys");
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingOrders = async () => {
    try {
      const res = await API.get("/tracking/admin/orders/live-tracking");
      if (res.data?.success) {
        const orders = res.data.orders || [];
        // Filter orders that don't have an assigned rider or are pending dispatch
        setPendingOrders(orders);
      }
    } catch (err) {
      console.error("Failed to fetch pending orders for assignment:", err);
    }
  };

  useEffect(() => {
    fetchRiders();
    fetchPendingOrders();
  }, []);

  // Filtered Riders List
  const filteredRiders = useMemo(() => {
    return riders.filter((rider) => {
      const matchesSearch =
        rider.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rider.phone?.includes(searchTerm) ||
        rider.vehicleNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rider.area?.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      if (filterStatus === "AVAILABLE") return rider.status === "AVAILABLE" && rider.active;
      if (filterStatus === "ON_DELIVERY") return rider.status === "ON_DELIVERY" || (rider.activeOrdersCount || 0) > 0;
      if (filterStatus === "OFFLINE") return !rider.active || rider.status === "OFFLINE";

      return true;
    });
  }, [riders, searchTerm, filterStatus]);

  // Metric Stats
  const metrics = useMemo(() => {
    const total = riders.length;
    const available = riders.filter((r) => r.status === "AVAILABLE" && r.active).length;
    const onDelivery = riders.filter((r) => r.status === "ON_DELIVERY" || (r.activeOrdersCount || 0) > 0).length;
    const totalDeliveries = riders.reduce((sum, r) => sum + Number(r.totalDeliveries || 0), 0);

    return { total, available, onDelivery, totalDeliveries };
  }, [riders]);

  const handleCreateRider = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert("Please fill in the driver's name and phone number.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await API.post("/riders", formData);
      if (res.data?.success) {
        setShowAddModal(false);
        setFormData({
          name: "",
          phone: "",
          vehicleType: "Motorcycle (Express)",
          vehicleNumber: "",
          area: "Virudhunagar & Madurai Hub",
          rating: 5.0,
        });
        fetchRiders();
      }
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to register delivery boy");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateRider = async (e) => {
    e.preventDefault();
    if (!selectedRider?._id) return;

    try {
      setSubmitting(true);
      const res = await API.put(`/riders/${selectedRider._id}`, formData);
      if (res.data?.success) {
        setShowEditModal(false);
        setSelectedRider(null);
        fetchRiders();
      }
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update delivery boy");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (rider) => {
    try {
      await API.put(`/riders/${rider._id}`, { active: !rider.active });
      fetchRiders();
    } catch (err) {
      console.error("Failed to toggle rider active status:", err);
    }
  };

  const handleDeleteRider = async (id) => {
    try {
      await API.delete(`/riders/${id}`);
      setDeleteConfirmId(null);
      fetchRiders();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete delivery boy");
    }
  };

  const handleAssignToOrder = async () => {
    if (!selectedRider || !selectedOrderId) {
      alert("Please select an active order to assign to this delivery boy.");
      return;
    }

    try {
      setSubmitting(true);
      await API.put(`/tracking/${selectedOrderId}/assign-rider`, {
        riderId: selectedRider._id,
        name: selectedRider.name,
        phone: selectedRider.phone,
        vehicleNumber: selectedRider.vehicleNumber,
        vehicleType: selectedRider.vehicleType,
        etaMinutes: Number(assignEta) || 30,
      });

      setShowAssignModal(false);
      setSelectedOrderId("");
      fetchRiders();
      fetchPendingOrders();
      alert(`Successfully assigned ${selectedRider.name} to order #${selectedOrderId}!`);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to assign delivery boy to order");
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (rider) => {
    setSelectedRider(rider);
    setFormData({
      name: rider.name || "",
      phone: rider.phone || "",
      vehicleType: rider.vehicleType || "Motorcycle (Express)",
      vehicleNumber: rider.vehicleNumber || "",
      area: rider.area || "Virudhunagar & Madurai Hub",
      rating: rider.rating || 5.0,
    });
    setShowEditModal(true);
  };

  const openAssignModal = (rider) => {
    setSelectedRider(rider);
    setSelectedOrderId(pendingOrders[0]?.orderId || "");
    setShowAssignModal(true);
  };

  return (
    <PageTransition className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 mb-2">
            <Bike size={14} className="text-emerald-600" />
            <span>Express Delivery Fleet</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Delivery Boy Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage certified delivery drivers, assign riders to live orders, and monitor dispatch routes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchRiders}
            className="p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition shadow-xs"
            title="Refresh Fleet"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>

          <Link
            to="/admin/live-tracking"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
          >
            <MapPin size={16} />
            <span>Live Radar Map</span>
          </Link>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition"
          >
            <Plus size={16} />
            <span>Add Delivery Boy</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Fleet</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <User size={18} />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900">{metrics.total}</h3>
          <p className="text-xs text-slate-500 mt-1">Registered drivers</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Available</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <UserCheck size={18} />
            </div>
          </div>
          <h3 className="text-2xl font-black text-emerald-700">{metrics.available}</h3>
          <p className="text-xs text-slate-500 mt-1">Ready for instant dispatch</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">On Active Route</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Activity size={18} />
            </div>
          </div>
          <h3 className="text-2xl font-black text-amber-700">{metrics.onDelivery}</h3>
          <p className="text-xs text-slate-500 mt-1">Currently delivering orders</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Completed Orders</span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900">{metrics.totalDeliveries}+</h3>
          <p className="text-xs text-slate-500 mt-1">Medicines delivered safely</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search delivery boys by name, phone, vehicle number, or hub..."
            className="w-full pl-10 pr-4 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {["ALL", "AVAILABLE", "ON_DELIVERY", "OFFLINE"].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilterStatus(status)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap ${
                filterStatus === status
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {status === "ALL"
                ? "All Drivers"
                : status === "AVAILABLE"
                ? "Available (Ready)"
                : status === "ON_DELIVERY"
                ? "On Delivery"
                : "Offline / Inactive"}
            </button>
          ))}
        </div>
      </div>

      {/* Delivery Boys Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 rounded-3xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : filteredRiders.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-500 space-y-3 shadow-xs">
          <Bike size={36} className="mx-auto text-slate-400 opacity-60" />
          <h3 className="text-base font-bold text-slate-800">No Delivery Boys Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchTerm
              ? `No driver matching "${searchTerm}"`
              : "No delivery personnel registered under this filter."}
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition"
          >
            <Plus size={14} />
            <span>Register First Driver</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRiders.map((rider) => {
            const isAvailable = rider.status === "AVAILABLE" && rider.active;
            const isOnDelivery = rider.status === "ON_DELIVERY" || (rider.activeOrdersCount || 0) > 0;

            return (
              <motion.div
                key={rider._id}
                variants={fadeUpItem}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  {/* Top Header of Card */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-800 font-black text-lg flex items-center justify-center shadow-xs">
                        {rider.name ? rider.name.charAt(0).toUpperCase() : "D"}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">{rider.name}</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[11px] font-mono text-slate-500">{rider.phone}</span>
                          <span className="text-slate-300">•</span>
                          <div className="flex items-center gap-0.5 text-amber-500 text-[11px] font-bold">
                            <Star size={12} fill="currentColor" />
                            <span>{rider.rating?.toFixed(1) || "5.0"}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        isOnDelivery
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : isAvailable
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-slate-100 text-slate-500 border-slate-200"
                      }`}
                    >
                      {isOnDelivery
                        ? "On Route"
                        : isAvailable
                        ? "Available"
                        : "Offline"}
                    </span>
                  </div>

                  {/* Vehicle & Hub Info */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs text-slate-600 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Vehicle:</span>
                      <span className="font-bold text-slate-800">
                        {rider.vehicleType || "Motorcycle"}
                        {rider.vehicleNumber ? ` (${rider.vehicleNumber})` : ""}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Operating Hub:</span>
                      <span className="font-semibold text-slate-700 truncate max-w-44">
                        {rider.area || "Virudhunagar Central"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Lifetime Deliveries:</span>
                      <span className="font-extrabold text-emerald-700">
                        {rider.totalDeliveries || 0} Delivered
                      </span>
                    </div>
                  </div>

                  {/* Active Orders List if any */}
                  {Array.isArray(rider.assignedOrders) && rider.assignedOrders.length > 0 && (
                    <div className="mb-4 p-3 rounded-2xl bg-amber-50/70 border border-amber-200/60 text-xs">
                      <div className="flex items-center justify-between mb-1.5 text-amber-900 font-bold">
                        <span className="flex items-center gap-1.5">
                          <Package size={13} />
                          <span>Active Delivery Assignment ({rider.assignedOrders.length})</span>
                        </span>
                      </div>
                      <div className="space-y-1">
                        {rider.assignedOrders.map((ord) => (
                          <div
                            key={ord._id || ord.orderId}
                            className="flex justify-between items-center text-[11px] text-amber-800"
                          >
                            <span className="font-mono font-bold">{ord.orderId}</span>
                            <span className="truncate max-w-28 text-slate-600">{ord.customerName}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Action Buttons */}
                <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                  <a
                    href={`tel:${rider.phone}`}
                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                    title="Call Delivery Boy"
                  >
                    <Phone size={15} />
                  </a>

                  <button
                    onClick={() => openAssignModal(rider)}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs text-center flex items-center justify-center gap-1.5"
                  >
                    <Package size={14} />
                    <span>Assign Order</span>
                  </button>

                  <button
                    onClick={() => openEditModal(rider)}
                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                    title="Edit Details"
                  >
                    <Edit2 size={15} />
                  </button>

                  <button
                    onClick={() => setDeleteConfirmId(rider._id)}
                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-600 transition"
                    title="Delete Driver"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal: Add New Delivery Boy */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                    <Bike size={20} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Register New Delivery Boy</h2>
                    <p className="text-xs text-slate-500">Add a verified delivery driver to the fleet</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 transition"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateRider} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Driver Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Murugan K."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Phone Number *</label>
                    <input
                      type="text"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. +91 98421 55678"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Vehicle Type</label>
                    <select
                      value={formData.vehicleType}
                      onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    >
                      {VEHICLE_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Vehicle Plate Number</label>
                    <input
                      type="text"
                      value={formData.vehicleNumber}
                      onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                      placeholder="e.g. TN-67-AX-4092"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Assigned Delivery Hub</label>
                    <input
                      type="text"
                      value={formData.area}
                      onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                      placeholder="e.g. Virudhunagar Main Dispensary"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-600 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-xs flex items-center gap-2"
                  >
                    {submitting ? "Registering..." : "Add Driver"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Edit Delivery Boy */}
      <AnimatePresence>
        {showEditModal && selectedRider && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-sky-100 text-sky-700">
                    <Edit2 size={20} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Edit Delivery Boy</h2>
                    <p className="text-xs text-slate-500">Update vehicle details or active dispatch status</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 transition"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleUpdateRider} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Driver Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Phone Number *</label>
                    <input
                      type="text"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Vehicle Type</label>
                    <select
                      value={formData.vehicleType}
                      onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    >
                      {VEHICLE_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Vehicle Plate Number</label>
                    <input
                      type="text"
                      value={formData.vehicleNumber}
                      onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Assigned Delivery Hub</label>
                    <input
                      type="text"
                      value={formData.area}
                      onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-600 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold transition shadow-xs flex items-center gap-2"
                  >
                    {submitting ? "Saving..." : "Update Driver"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Quick Assign Rider to Order */}
      <AnimatePresence>
        {showAssignModal && selectedRider && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                    <Package size={20} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Assign {selectedRider.name} to Order
                    </h2>
                    <p className="text-xs text-slate-500">
                      {selectedRider.vehicleType} • {selectedRider.vehicleNumber || selectedRider.phone}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 transition"
                >
                  <X size={18} />
                </button>
              </div>

              {pendingOrders.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-xs">
                  <Package size={28} className="mx-auto text-slate-400 mb-2" />
                  <p className="font-bold text-slate-700">No active delivery orders available</p>
                  <p className="mt-1">All orders currently have assigned riders or are delivered.</p>
                </div>
              ) : (
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Select Customer Delivery Order *
                    </label>
                    <select
                      value={selectedOrderId}
                      onChange={(e) => setSelectedOrderId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
                    >
                      {pendingOrders.map((ord) => (
                        <option key={ord.orderId} value={ord.orderId}>
                          #{ord.orderId} — {ord.customerName} (₹{ord.totalAmount}) [
                          {ord?.tracking?.rider?.name ? `Current: ${ord.tracking.rider.name}` : "Unassigned"}]
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Estimated Arrival Time (ETA)
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[15, 30, 45, 60].map((mins) => (
                        <button
                          key={mins}
                          type="button"
                          onClick={() => setAssignEta(mins)}
                          className={`py-2 rounded-xl font-bold border transition ${
                            assignEta === mins
                              ? "bg-emerald-600 text-white border-emerald-600"
                              : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          {mins} mins
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAssignModal(false)}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-600 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={submitting || !selectedOrderId}
                      onClick={handleAssignToOrder}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-xs flex items-center gap-2"
                    >
                      {submitting ? "Assigning..." : "Confirm & Dispatch"}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Alert Modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl space-y-4 text-center"
            >
              <div className="h-14 w-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
                <AlertCircle size={28} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete Delivery Boy?</h3>
                <p className="text-xs text-slate-500 mt-1">
                  This driver will be removed from your active fleet list.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-600 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteRider(deleteConfirmId)}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white transition shadow-xs"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
};

export default DeliveryBoysPage;
