/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable no-unused-vars */
import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Package,
  CreditCard,
  Truck,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Tag,
} from "lucide-react";
import { Link } from "react-router-dom";
import API from "../api/axios";

const NotificationsPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response =
        (await API.get("/orders/my-orders").catch(() =>
          API.get("/auth/my-purchases")
        )) || null;

      const fetchedOrders =
        response?.data?.orders ||
        response?.data?.purchases ||
        response?.data?.data ||
        [];

      setOrders(Array.isArray(fetchedOrders) ? fetchedOrders : []);
    } catch (err) {
      console.error("Fetch notifications error:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const notifications = useMemo(() => {
    return orders.map((order, index) => {
      const status = String(order.deliveryStatus || order.orderStatus || "PLACED").toUpperCase();
      const isDelivered = status === "DELIVERED";
      const isOutForDelivery = status === "OUT_FOR_DELIVERY";

      let type = "order";
      let title = `Order #${order.orderId || order._id} Confirmed`;
      let message = "Your medication order is verified by our licensed duty pharmacist and being prepared.";

      if (isDelivered) {
        type = "delivered";
        title = `Order #${order.orderId || order._id} Delivered Safely`;
        message = "Package delivered to your address in a tamper-evident sealed pouch.";
      } else if (isOutForDelivery) {
        type = "delivery";
        title = `Order #${order.orderId || order._id} is Out for Delivery!`;
        message = "Your delivery rider has been dispatched with your medical package.";
      }

      return {
        id: order._id || index,
        orderId: order.orderId || order._id,
        type,
        title,
        message,
        amount: order.totalAmount,
        date: order.createdAt ? new Date(order.createdAt).toLocaleString() : "Recently",
      };
    });
  }, [orders]);

  const filteredNotifications = useMemo(() => {
    if (filter === "all") return notifications;
    return notifications.filter((n) => n.type === filter || (filter === "delivery" && n.type === "delivered"));
  }, [notifications, filter]);

  return (
    <div className="min-h-screen bg-slate-50/60 py-8 sm:py-10 lg:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 mb-2">
              <Bell size={13} />
              <span>Real-Time Clinical & Order Alerts</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Notifications & Order Status
            </h1>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                filter === "all"
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All Alerts
            </button>
            <button
              onClick={() => setFilter("delivery")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                filter === "delivery"
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Dispatches
            </button>
          </div>
        </motion.div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-2xl bg-white border border-slate-200 p-4 animate-pulse" />
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-xs">
            <Bell size={40} className="text-slate-300 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-slate-900 mb-1">
              No notifications yet
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mb-6 max-w-xs mx-auto">
              You will receive live updates when your prescriptions are verified and orders are dispatched.
            </p>
            <Link
              to="/products"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs"
            >
              Browse Medicines
            </Link>
          </div>
        ) : (
          <div className="space-y-3.5">
            <AnimatePresence>
              {filteredNotifications.map((notif, idx) => (
                <motion.div
                  key={notif.id || idx}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs hover:border-emerald-200 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                      {notif.type === "delivered" ? (
                        <CheckCircle2 size={20} />
                      ) : notif.type === "delivery" ? (
                        <Truck size={20} />
                      ) : (
                        <Package size={20} />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 leading-snug">
                        {notif.title}
                      </h3>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                        {notif.message}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {notif.date}
                      </p>
                    </div>
                  </div>

                  <Link
                    to={`/track-order?order_id=${encodeURIComponent(notif.orderId)}`}
                    className="self-end sm:self-center inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-emerald-50 text-emerald-700 font-bold text-xs border border-slate-200 transition shrink-0"
                  >
                    <span>Track Live</span>
                    <ArrowRight size={13} />
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;