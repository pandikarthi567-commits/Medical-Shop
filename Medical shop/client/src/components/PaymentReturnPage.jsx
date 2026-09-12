// src/pages/PaymentReturnPage.jsx
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Package,
  Truck,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import API from "../api/axios";

const PaymentReturnPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("verifying");
  const [errorMessage, setErrorMessage] = useState("");

  const orderId = searchParams.get("order_id");

  useEffect(() => {
    const verify = async () => {
      try {
        setLoading(true);
        if (!orderId) {
          setStatus("failed");
          setErrorMessage("Missing Order ID parameter in callback URL");
          return;
        }

        const { data } = await API.get(`/orders/verify/${orderId}`);
        const orderData = data?.order;
        setOrder(orderData);

        if (orderData?.paymentStatus === "PAID") {
          setStatus("success");
          // Clear cart on successful order
          localStorage.removeItem("cart");
          localStorage.removeItem("cartItems");
          window.dispatchEvent(new Event("cartChanged"));
        } else {
          setStatus("pending");
        }
      } catch (error) {
        console.error("Payment verification error:", error);
        setStatus("failed");
        setErrorMessage(
          error.response?.data?.message || "Could not confirm payment status"
        );
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [orderId]);

  return (
    <div className="min-h-screen bg-slate-50/60 py-12 sm:py-16 flex items-center justify-center px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 shadow-xl text-center"
      >
        {loading ? (
          <div className="py-8 space-y-4">
            <div className="h-16 w-16 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin mx-auto" />
            <h2 className="text-xl font-bold text-slate-900">
              Verifying Your Payment...
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
              Please wait while we confirm your transaction securely with Cashfree and assign your order to our pharmacy dispensary.
            </p>
          </div>
        ) : status === "success" ? (
          <div className="space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
              className="h-20 w-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md shadow-emerald-500/10"
            >
              <CheckCircle2 size={44} />
            </motion.div>

            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 mb-2">
                Order Confirmed
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Payment Successful!
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xs mx-auto">
                Your medicines are being packed in a tamper-proof cold pouch.
              </p>
            </div>

            {/* Receipt Summary */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-left text-xs space-y-2.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Order Reference:</span>
                <span className="font-bold text-slate-900">{order?.orderId || orderId}</span>
              </div>
              {order?.totalAmount && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Paid:</span>
                  <span className="font-bold text-emerald-700">₹{order.totalAmount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="font-bold text-emerald-600">Paid & Verified</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2.5 pt-2">
              <Link
                to={`/track-order?order_id=${encodeURIComponent(order?.orderId || orderId || "")}`}
                className="w-full py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
              >
                <Truck size={17} />
                <span>Track Live Order & Rider</span>
              </Link>
              <Link
                to="/profile/orders"
                className="w-full py-3 px-6 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm transition flex items-center justify-center gap-1.5"
              >
                <Package size={15} />
                <span>View In My Orders</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="h-16 w-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
              <AlertTriangle size={36} />
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                Payment Verification Pending
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                {errorMessage ||
                  "The payment status is awaiting confirmation from your bank or payment app."}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                to={`/track-order?order_id=${encodeURIComponent(orderId || "")}`}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs sm:text-sm"
              >
                Check Order Status
              </Link>
              <Link
                to="/cart"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs sm:text-sm hover:bg-slate-50"
              >
                Return to Cart
              </Link>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default PaymentReturnPage;