// src/pages/CheckoutPage.jsx
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Lock,
  ShoppingBag,
  MapPin,
  ArrowRight,
  Truck,
  CheckCircle2,
  Receipt,
  CreditCard,
} from "lucide-react";
import { load } from "@cashfreepayments/cashfree-js";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [cashfree, setCashfree] = useState(null);
  const [placing, setPlacing] = useState(false);
  const [cartItems, setCartItems] = useState(() => {
    try {
      const items = JSON.parse(localStorage.getItem("cartItems") || localStorage.getItem("cart") || "[]");
      return Array.isArray(items) ? items : [];
    } catch {
      return [];
    }
  });
  const [shippingAddress, setShippingAddress] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("shippingAddress") || "{}");
    } catch {
      return {};
    }
  });

  useEffect(() => {
    const init = async () => {
      try {
        const cf = await load({ mode: "sandbox" });
        setCashfree(cf);
      } catch (err) {
        console.error("Cashfree init error:", err);
      }
    };
    init();
  }, []);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || item.qty || 1)),
    0
  );
  const delivery = subtotal >= 500 || subtotal === 0 ? 0 : 40;
  const total = subtotal + delivery;

  const handlePlaceOrder = async () => {
    try {
      setPlacing(true);

      const { data } = await API.post("/orders", {
        items: cartItems,
        shippingAddress,
      });

      if (!data?.success) {
        throw new Error(data?.message || "Order creation failed");
      }

      const localOrderId = data.order?.orderId;

      localStorage.setItem("latestOrderLocalId", data.order?._id);
      localStorage.setItem("latestOrderId", localOrderId);
      localStorage.removeItem("cartItems");
      localStorage.removeItem("cart");
      window.dispatchEvent(new Event("cartChanged"));

      navigate(`/track-order?order_id=${encodeURIComponent(localOrderId)}`);
    } catch (error) {
      console.error("Checkout error:", error);
      alert(error.response?.data?.message || error.message || "Failed to place order in database");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 py-8 sm:py-10 lg:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 mb-2">
            <Lock size={13} />
            <span>Secure 256-Bit SSL Checkout</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Order Review & Final Payment
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Please review your healthcare items and delivery destination before paying.
          </p>
        </motion.div>

        {cartItems.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-xs">
            <ShoppingBag size={42} className="text-slate-400 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-slate-800 mb-2">No items to checkout</h2>
            <p className="text-sm text-slate-500 mb-6">Your cart is currently empty or already ordered.</p>
            <Link
              to="/products"
              className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm"
            >
              Browse Catalog
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-12 gap-8 items-start">
            {/* Left Col: Order Items & Delivery (Col 7) */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="md:col-span-7 space-y-6"
            >
              {/* Items Card */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
                <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 mb-4 flex items-center justify-between">
                  <span>Prescription & Medicines</span>
                  <span className="text-xs text-slate-500 font-normal">
                    {cartItems.length} items
                  </span>
                </h2>

                <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto pr-1">
                  {cartItems.map((item, idx) => (
                    <div key={idx} className="py-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-slate-800 truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          Qty: {item.quantity || item.qty || 1} × ₹{item.price}
                        </p>
                      </div>
                      <p className="font-extrabold text-sm text-slate-900">
                        ₹{(Number(item.price || 0) * Number(item.quantity || item.qty || 1))}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Address Card */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
                <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 mb-4 flex items-center gap-2">
                  <MapPin size={17} className="text-emerald-600" />
                  <span>Delivery Destination</span>
                </h2>

                <div className="text-sm text-slate-600 space-y-1">
                  <p className="font-bold text-slate-900">
                    {shippingAddress.fullName || "Valued Customer"}
                  </p>
                  <p>{shippingAddress.addressLine1 || "Address provided at cart"}</p>
                  {shippingAddress.addressLine2 && <p>{shippingAddress.addressLine2}</p>}
                  <p>
                    {shippingAddress.city && `${shippingAddress.city}, `}
                    {shippingAddress.state && `${shippingAddress.state} `}
                    {shippingAddress.postalCode && `- ${shippingAddress.postalCode}`}
                  </p>
                  <p className="text-xs text-emerald-700 font-semibold pt-1">
                    Contact: {shippingAddress.phone || "Not provided"}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Right Col: Payment Action Card (Col 5) */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="md:col-span-5 space-y-4"
            >
              <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs">
                <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 mb-4">
                  Payment Summary
                </h2>

                <div className="space-y-3 text-sm text-slate-600 mb-6">
                  <div className="flex justify-between">
                    <span>Medicines Subtotal</span>
                    <span className="font-semibold text-slate-900">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Delivery Charges</span>
                    <span className="font-semibold text-slate-900">
                      {delivery === 0 ? <span className="text-emerald-600">FREE</span> : `₹${delivery}`}
                    </span>
                  </div>
                  <div className="h-px bg-slate-100 my-1" />
                  <div className="flex justify-between items-baseline text-base font-black text-slate-900">
                    <span>Payable Now</span>
                    <span className="text-2xl text-emerald-600">₹{total}</span>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePlaceOrder}
                  disabled={placing}
                  className="w-full py-3.5 px-6 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md shadow-emerald-500/20 disabled:opacity-50 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 size={16} />
                  <span>{placing ? "Placing Order..." : `⚡ Confirm & Place Order (₹${total})`}</span>
                </motion.button>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-500">
                  <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                  <span>Instant Verification & Receipt</span>
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/50 p-4 text-xs text-emerald-800 flex items-start gap-2.5">
                <Truck size={17} className="text-emerald-600 shrink-0 mt-0.5" />
                <p>
                  You will be redirected to the live GPS tracking screen immediately after payment confirmation.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;