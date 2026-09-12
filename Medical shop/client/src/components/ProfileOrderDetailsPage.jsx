// src/pages/ProfileOrderDetailsPage.jsx
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Package,
  Truck,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  CreditCard,
  ShoppingBag,
} from "lucide-react";
import API from "../api/axios";

const StatusBadge = ({ text, color }) => (
  <span className={`px-3 py-1 rounded-full text-xs font-bold ${color}`}>
    {text}
  </span>
);

const ProfileOrderDetailsPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const { data } = await API.get(`/orders/my-orders/${id}`);
        setOrder(data.order);
      } catch (error) {
        console.error("Fetch order detail error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/60 py-12 px-4 max-w-4xl mx-auto space-y-4">
        <div className="h-8 w-40 bg-slate-200 rounded animate-pulse" />
        <div className="h-48 bg-white border border-slate-200 rounded-3xl animate-pulse" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50/60 py-16 px-4 text-center">
        <div className="max-w-md mx-auto rounded-3xl border border-slate-200 bg-white p-8">
          <AlertCircle size={40} className="text-amber-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900 mb-2">Order Not Found</h2>
          <p className="text-xs text-slate-500 mb-5">We couldn't retrieve the details for this order.</p>
          <Link
            to="/profile/orders"
            className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const isDelivered = order.deliveryStatus === "DELIVERED";
  const isNotDelivered = order.deliveryStatus === "NOT_DELIVERED";

  return (
    <div className="min-h-screen bg-slate-50/60 py-8 sm:py-10 lg:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Back Link */}
        <Link
          to="/profile/orders"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-900 transition"
        >
          <ArrowLeft size={16} />
          <span>Back to All Orders</span>
        </Link>

        {/* Order Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div>
              <span className="text-xs text-slate-400 font-semibold">Order Reference</span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                #{order.orderId || order._id}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Placed on {order.createdAt ? new Date(order.createdAt).toLocaleString() : "Recently"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {isDelivered ? (
                <StatusBadge text="Delivered" color="bg-emerald-100 text-emerald-800" />
              ) : isNotDelivered ? (
                <StatusBadge text="Not Delivered" color="bg-rose-100 text-rose-800" />
              ) : (
                <StatusBadge text={order.deliveryStatus || "In Transit"} color="bg-blue-100 text-blue-800" />
              )}
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                {order.paymentStatus || "PAID"}
              </span>
            </div>
          </div>

          {/* Quick Tracking Action */}
          <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-slate-600">
              {order.tracking?.courierName && (
                <p>
                  <strong>Courier:</strong> {order.tracking.courierName} • ID:{" "}
                  <code className="bg-slate-100 px-1.5 py-0.5 rounded">{order.tracking.trackingId || "Assigned"}</code>
                </p>
              )}
            </div>

            <Link
              to={`/track-order?order_id=${encodeURIComponent(order.orderId || order._id)}`}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition"
            >
              <Truck size={15} />
              <span>Track on Live GPS Map</span>
            </Link>
          </div>
        </motion.div>

        {/* Ordered Items Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs"
        >
          <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 mb-4 flex items-center justify-between">
            <span>Prescription & Medicines ({order.items?.length || 0})</span>
            <span className="text-xs font-semibold text-emerald-700">Tamper-Proof Packed</span>
          </h2>

          <div className="divide-y divide-slate-100">
            {order.items?.map((item, idx) => (
              <div key={idx} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="h-14 w-14 rounded-xl bg-slate-50 border border-slate-100 p-2 shrink-0 flex items-center justify-center">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="h-full w-full object-contain" />
                    ) : (
                      <Package size={22} className="text-emerald-600" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-slate-900 truncate">{item.name}</p>
                    <p className="text-xs text-slate-500">
                      ₹{item.price} × {item.quantity} unit{item.quantity === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>

                <p className="font-extrabold text-sm text-slate-900 shrink-0">
                  ₹{item.subtotal || item.price * item.quantity}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-baseline text-base font-extrabold text-slate-900">
            <span>Total Order Amount</span>
            <span className="text-xl text-emerald-600">₹{order.totalAmount}</span>
          </div>
        </motion.div>

        {/* Shipping Destination */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs"
        >
          <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 mb-4 flex items-center gap-2">
            <MapPin size={17} className="text-emerald-600" />
            <span>Delivery Destination Address</span>
          </h2>

          <div className="text-sm text-slate-600 space-y-1">
            <p className="font-bold text-slate-900">
              {order.shippingAddress?.fullName || order.customerName || "Customer"}
            </p>
            <p>{order.shippingAddress?.addressLine1}</p>
            {order.shippingAddress?.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
            <p>
              {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.postalCode}
            </p>
            <p className="text-xs text-slate-500 pt-1">
              Contact: {order.shippingAddress?.phone || order.customerPhone || "N/A"}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfileOrderDetailsPage;