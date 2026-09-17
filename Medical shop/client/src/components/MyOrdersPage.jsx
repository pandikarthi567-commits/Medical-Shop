/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Truck,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  MapPin,
  FileText,
  CreditCard,
  RefreshCw,
  Search,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Calendar,
} from "lucide-react";
import API from "../api/axios";
import { getImageUrl } from "../utils/imageUrl";

const getStatusBadge = (status) => {
  const s = String(status || "").toUpperCase();
  if (s === "DELIVERED") {
    return (
      <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1.5 shadow-xs">
        <CheckCircle2 size={13} className="text-emerald-600" />
        <span>Delivered</span>
      </span>
    );
  }
  if (s === "OUT_FOR_DELIVERY") {
    return (
      <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 flex items-center gap-1.5 shadow-xs">
        <Truck size={13} className="text-blue-600 animate-pulse" />
        <span>Out for Delivery</span>
      </span>
    );
  }
  if (s === "SHIPPED") {
    return (
      <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 flex items-center gap-1.5 shadow-xs">
        <Package size={13} className="text-indigo-600" />
        <span>Dispatched &amp; Shipped</span>
      </span>
    );
  }
  if (s === "CANCELLED" || s === "FAILED") {
    return (
      <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 flex items-center gap-1.5 shadow-xs">
        <AlertCircle size={13} className="text-rose-600" />
        <span>{status}</span>
      </span>
    );
  }
  return (
    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 flex items-center gap-1.5 shadow-xs">
      <Clock size={13} className="text-amber-600" />
      <span>{status || "Processing"}</span>
    </span>
  );
};

const MyOrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/orders/my-orders");
      setOrders(data.orders || []);
    } catch (error) {
      console.error("Fetch my orders error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((order) => {
    const term = searchTerm.toLowerCase();
    const id = String(order.orderId || order._id || "").toLowerCase();
    const name = String(order.customerName || "").toLowerCase();
    const items = (order.medicines || [])
      .map((m) => m.name || m.medicine?.name || "")
      .join(" ")
      .toLowerCase();
    return id.includes(term) || name.includes(term) || items.includes(term);
  });

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 via-white to-slate-50 py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 mb-2">
              <Package size={14} className="text-emerald-600" />
              <span>Patient Orders &amp; Delivery</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              My Orders
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Track live delivery dispatches, inspect batch-verified pharmaceuticals, and view receipts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchOrders}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              <span>Refresh</span>
            </button>

            <Link
              to="/products"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-md shadow-emerald-600/20"
            >
              <ShoppingBag size={14} />
              <span>Order Medicines</span>
            </Link>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Order ID, medicine name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-3 focus:ring-emerald-500/15 outline-hidden transition shadow-xs"
            />
          </div>
        </div>

        {/* Orders Content */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-44 rounded-2xl bg-slate-100 animate-pulse border border-slate-200/80"
              />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm"
          >
            <div className="h-16 w-16 mx-auto rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <Package size={30} />
            </div>
            <h2 className="text-lg font-bold text-slate-900">No Orders Found</h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1 mb-6">
              {searchTerm
                ? "No orders match your search term. Try searching with a different keyword."
                : "You haven't placed any medicine orders yet. Explore our genuine pharmaceuticals and healthcare products."}
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-md shadow-emerald-600/20"
            >
              <ShoppingBag size={15} />
              <span>Browse Medicines</span>
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-5">
            {filteredOrders.map((order) => {
              const orderId = order.orderId || String(order._id).slice(-8).toUpperCase();
              const dateStr = order.createdAt
                ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Recent Order";

              const itemsCount = (order.medicines || []).reduce(
                (acc, m) => acc + (m.quantity || 1),
                0
              );

              return (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-slate-200/80 bg-white shadow-xs hover:shadow-md transition overflow-hidden"
                >
                  {/* Card Header Bar */}
                  <div className="p-4 sm:p-5 bg-slate-50/70 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                          Order Placed
                        </span>
                        <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                          <Calendar size={12} className="text-slate-400" />
                          {dateStr}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                          Total Amount
                        </span>
                        <span className="font-extrabold text-emerald-700 mt-0.5 block text-sm">
                          ₹{Number(order.totalAmount || 0).toFixed(2)}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                          Payment
                        </span>
                        <span
                          className={`font-bold mt-0.5 inline-block text-[11px] px-2 py-0.5 rounded-md ${
                            order.paymentStatus === "PAID"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {order.paymentStatus || "PENDING"} (
                          {order.paymentMethod || "ONLINE"})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {getStatusBadge(order.orderStatus || order.deliveryStatus)}
                    </div>
                  </div>

                  {/* Card Body & Items List */}
                  <div className="p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-mono font-bold text-slate-500">
                        Order #{orderId}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {itemsCount} {itemsCount === 1 ? "item" : "items"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
                      {(order.medicines || []).map((item, idx) => {
                        const medicineName =
                          item.name || item.medicine?.name || "Prescription Medicine";
                        const medicineImg =
                          item.image || item.medicine?.image || "/placeholder-pill.png";
                        const price = item.price || item.medicine?.price || 0;
                        const qty = item.quantity || 1;

                        return (
                          <div
                            key={idx}
                            className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/60 border border-slate-100"
                          >
                            <img
                              src={getImageUrl(medicineImg)}
                              alt={medicineName}
                              className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0 bg-white"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src =
                                  "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100&auto=format&fit=crop&q=60";
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-slate-800 truncate">
                                {medicineName}
                              </p>
                              <p className="text-[11px] text-slate-500">
                                Qty: {qty} &times; ₹{Number(price).toFixed(2)}
                              </p>
                            </div>
                            <span className="text-xs font-bold text-slate-700">
                              ₹{(qty * price).toFixed(2)}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Shipping Address snippet */}
                    {order.shippingAddress && (
                      <div className="flex items-start gap-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4">
                        <MapPin size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-slate-700">Delivery Address: </span>
                          <span>{order.shippingAddress}</span>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <ShieldCheck size={14} className="text-emerald-600" />
                        <span>100% Genuine Pharmacy Batch Verified</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            navigate(`/track-order?orderId=${order.orderId || order._id}`)
                          }
                          className="px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <Truck size={14} />
                          <span>Live Tracking</span>
                        </button>

                        <button
                          onClick={() => navigate(`/products`)}
                          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <span>Re-Order</span>
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrdersPage;
