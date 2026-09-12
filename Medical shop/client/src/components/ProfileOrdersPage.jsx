// src/pages/ProfileOrdersPage.jsx
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Package,
  Truck,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  ExternalLink,
} from "lucide-react";
import API from "../api/axios";

const getStatusBadge = (status) => {
  const s = String(status || "").toUpperCase();
  if (s === "DELIVERED") {
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
        <CheckCircle2 size={13} />
        <span>Delivered</span>
      </span>
    );
  }
  if (s === "OUT_FOR_DELIVERY") {
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 flex items-center gap-1">
        <Truck size={13} />
        <span>Out for Delivery</span>
      </span>
    );
  }
  if (s === "CANCELLED" || s === "FAILED") {
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 flex items-center gap-1">
        <AlertCircle size={13} />
        <span>{status}</span>
      </span>
    );
  }
  return (
    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
      <Clock size={13} />
      <span>{status || "Processing"}</span>
    </span>
  );
};

const ProfileOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const { data } = await API.get("/orders/my-orders");
        setOrders(data.orders || []);
      } catch (error) {
        console.error("Fetch orders error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50/60 py-8 sm:py-10 lg:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 mb-2">
              <Package size={13} />
              <span>Purchase History</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              My Orders & Prescriptions
            </h1>
          </div>

          <Link
            to="/products"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-emerald-600 hover:text-emerald-700 transition"
          >
            <span>Order More Medicines</span>
            <ArrowRight size={14} />
          </Link>
        </motion.div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-36 rounded-2xl bg-white border border-slate-200 p-6 animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-xs">
            <ShoppingBag size={44} className="text-slate-300 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-slate-900 mb-1">
              No orders placed yet
            </h2>
            <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
              When you order medicines or upload prescriptions, your order timeline and live GPS tracking will show up here.
            </p>
            <Link
              to="/products"
              className="inline-flex px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-md hover:bg-emerald-700 transition"
            >
              Browse Medicines
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, idx) => (
              <motion.div
                key={order._id || idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -2 }}
                className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs hover:border-emerald-200 hover:shadow-md transition-all"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                      <Package size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-semibold">Order ID</p>
                      <p className="text-sm font-bold text-slate-900">
                        {order.orderId || order._id}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusBadge(order.deliveryStatus || order.orderStatus)}
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600">
                      {order.paymentStatus || "PAID"}
                    </span>
                  </div>
                </div>

                {/* Order Details Body */}
                <div className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1 text-xs text-slate-600">
                    <p>
                      <span className="font-semibold text-slate-800">Date Placed:</span>{" "}
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "Recent"}
                    </p>
                    {order.items && (
                      <p>
                        <span className="font-semibold text-slate-800">Medicines:</span>{" "}
                        {order.items.length} item{order.items.length === 1 ? "" : "s"}
                      </p>
                    )}
                    {order.tracking?.courierName && (
                      <p>
                        <span className="font-semibold text-slate-800">Courier:</span>{" "}
                        {order.tracking.courierName}
                      </p>
                    )}
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-xs text-slate-400 font-semibold">Total Amount</p>
                    <p className="text-xl font-extrabold text-emerald-600">
                      ₹{order.totalAmount}
                    </p>
                  </div>
                </div>

                {/* Bottom Action Links */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                  <Link
                    to={`/track-order?order_id=${encodeURIComponent(order.orderId || order._id)}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs transition"
                  >
                    <Truck size={14} />
                    <span>Track Live Delivery</span>
                  </Link>

                  <Link
                    to={`/profile/orders/${order._id}`}
                    className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition"
                  >
                    <span>View Details</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileOrdersPage;