/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable no-unused-vars */
import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  ShieldCheck,
  Truck,
  ArrowRight,
  MapPin,
  Phone,
  User,
  Building,
  CheckCircle2,
  Lock,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { load } from "@cashfreepayments/cashfree-js";
import API from "../api/axios";

const CartPage = () => {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [removingId, setRemovingId] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [cashfree, setCashfree] = useState(null);

  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  });

  useEffect(() => {
    const initializeCashfree = async () => {
      try {
        const cashfreeInstance = await load({
          mode: "sandbox",
        });
        setCashfree(cashfreeInstance);
      } catch (error) {
        console.error("Cashfree SDK init error:", error);
      }
    };

    initializeCashfree();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setProfileLoading(true);
      const response = await API.get("/users/profile");
      const profile =
        response?.data?.user ||
        response?.data?.profile ||
        response?.data ||
        {};

      setShippingAddress((prev) => ({
        ...prev,
        fullName: profile?.name || prev.fullName || "",
        phone: profile?.phone || prev.phone || "",
      }));
    } catch (error) {
      console.error("Fetch profile error:", error);
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await API.get("/cart/my");
      const items =
        response?.data?.cart?.items ||
        response?.data?.items ||
        response?.data?.cart ||
        [];

      setCartItems(Array.isArray(items) ? items : []);
    } catch (error) {
      console.error("Fetch cart error:", error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
    fetchUserProfile();
  }, []);

  const getItemId = (item) => item?._id || item?.medicineId || item?.id;
  const getMedicine = (item) => item?.medicine || item;
  const getQty = (item) => item?.quantity ?? item?.qty ?? 1;

  const getPrice = (item) => {
    const medicine = getMedicine(item);
    return Number(item?.price ?? medicine?.price ?? 0);
  };

  const getLineTotal = (item) => getPrice(item) * getQty(item);

  const handleIncrease = async (item) => {
    const itemId = getItemId(item);
    const medicine = getMedicine(item);
    const medicineId = medicine?._id || item?.medicineId || item?._id;

    try {
      setUpdatingId(itemId);
      await API.post("/cart/add", {
        medicineId,
        quantity: 1,
      });
      await fetchCart();
      window.dispatchEvent(new Event("cartChanged"));
    } catch (error) {
      console.error("Increase quantity error:", error);
      alert(error.response?.data?.message || "Failed to increase quantity");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDecrease = async (item) => {
    const itemId = getItemId(item);
    const medicine = getMedicine(item);
    const medicineId = medicine?._id || item?.medicineId || item?._id;
    const currentQty = getQty(item);

    try {
      setUpdatingId(itemId);
      if (currentQty <= 1) {
        await API.delete(`/cart/remove/${medicineId}`);
      } else {
        await API.put(`/cart/update/${medicineId}`, {
          quantity: currentQty - 1,
        });
      }
      await fetchCart();
      window.dispatchEvent(new Event("cartChanged"));
    } catch (error) {
      console.error("Decrease quantity error:", error);
      alert(error.response?.data?.message || "Failed to decrease quantity");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (item) => {
    const itemId = getItemId(item);
    const medicine = getMedicine(item);
    const medicineId = medicine?._id || item?.medicineId || item?._id;

    try {
      setRemovingId(itemId);
      await API.delete(`/cart/remove/${medicineId}`);
      await fetchCart();
      window.dispatchEvent(new Event("cartChanged"));
    } catch (error) {
      console.error("Remove cart item error:", error);
      alert(error.response?.data?.message || "Failed to remove item");
    } finally {
      setRemovingId(null);
    }
  };

  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + getLineTotal(item), 0);
  }, [cartItems]);

  const delivery = cartItems.length > 0 ? (subtotal >= 500 ? 0 : 40) : 0;
  const total = subtotal + delivery;

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateAddress = () => {
    if (!shippingAddress.fullName.trim()) return "Full name is required";
    if (!shippingAddress.phone.trim()) return "Phone number is required";

    const cleanedPhone = shippingAddress.phone.replace(/\D/g, "").slice(-10);
    if (!/^\d{10}$/.test(cleanedPhone)) {
      return "Phone number must be 10 digits";
    }

    if (!shippingAddress.addressLine1.trim()) return "Address line 1 is required";
    if (!shippingAddress.city.trim()) return "City is required";
    if (!shippingAddress.state.trim()) return "State is required";
    if (!shippingAddress.postalCode.trim()) return "Postal code is required";

    return "";
  };

  const handleProceedToCheckout = async () => {
    try {
      setCheckoutLoading(true);

      const addressError = validateAddress();
      if (addressError) {
        alert(addressError);
        return;
      }

      const response = await API.post("/orders", {
        items: cartItems,
        shippingAddress: {
          ...shippingAddress,
          phone: shippingAddress.phone.replace(/\D/g, "").slice(-10),
        },
      });

      const order = response?.data?.order;
      const orderId = order?.orderId;

      if (!orderId) {
        alert("Order creation failed. Please try again.");
        return;
      }

      localStorage.setItem("latestOrderLocalId", order._id);
      localStorage.setItem("latestOrderId", orderId);
      localStorage.removeItem("cartItems");
      localStorage.removeItem("cart");
      window.dispatchEvent(new Event("cartChanged"));

      navigate(`/track-order?order_id=${encodeURIComponent(orderId)}`, {
        state: { orderId, order },
      });
    } catch (error) {
      console.error("Checkout error:", error);
      alert(error.response?.data?.message || "Failed to place order in database");
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse mb-8" />
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
          <div className="lg:col-span-4 h-80 bg-slate-100 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 py-8 sm:py-10 lg:py-12">
      <div className="max-w-7xl 2xl:max-w-400 mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 mb-2">
              <ShoppingCart size={13} />
              <span>Prescription & Healthcare Cart</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Shopping Cart ({cartItems.length} {cartItems.length === 1 ? "Item" : "Items"})
            </h1>
          </div>

          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-emerald-600 hover:text-emerald-700 transition"
          >
            <span>Continue Shopping</span>
            <ArrowRight size={15} />
          </Link>
        </motion.div>

        {cartItems.length === 0 ? (
          /* Empty Cart State */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl border border-slate-200 bg-white p-12 sm:p-16 text-center max-w-2xl mx-auto shadow-xs"
          >
            <div className="h-20 w-20 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-5 shadow-inner">
              <ShoppingBag size={40} />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
              Your MediCare Cart is Empty
            </h2>
            <p className="text-slate-500 text-sm max-w-md mx-auto mb-8 leading-relaxed">
              Explore 15,000+ authentic medicines, healthcare monitors, vitamins, and medical supplies with guaranteed doorstep delivery.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/products"
                className="w-full sm:w-auto px-7 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition"
              >
                Browse Medicines
              </Link>
              <Link
                to="/prescription"
                className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-sm transition"
              >
                Upload Prescription
              </Link>
            </div>
          </motion.div>
        ) : (
          /* Cart Grid */
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* Left Col: Cart Items & Address (Col 7/8) */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-6">
              {/* Item Cards Container */}
              <div className="space-y-3.5">
                <AnimatePresence>
                  {cartItems.map((item) => {
                    const itemId = getItemId(item);
                    const medicine = getMedicine(item);
                    const qty = getQty(item);
                    const price = getPrice(item);
                    const lineTotal = getLineTotal(item);

                    return (
                      <motion.div
                        key={itemId}
                        layout
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs hover:border-emerald-200 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        {/* Thumbnail & Title */}
                        <div className="flex items-center gap-3.5 min-w-0 flex-1">
                          <div className="h-16 w-16 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 p-2 overflow-hidden">
                            {medicine?.image ? (
                              <img
                                src={medicine.image}
                                alt={medicine?.name || "Medicine"}
                                className="h-full w-full object-contain"
                              />
                            ) : (
                              <ShoppingCart className="text-emerald-600/70" size={24} />
                            )}
                          </div>

                          <div className="min-w-0">
                            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                              {medicine?.category || "Healthcare"}
                            </span>
                            <h3 className="font-bold text-sm sm:text-base text-slate-900 truncate">
                              {medicine?.name || item?.name || "Medicine Item"}
                            </h3>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-slate-500 font-medium">
                                ₹{price} / unit
                              </span>
                              {medicine?.prescriptionRequired && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                                  Rx
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Stepper & Line Total */}
                        <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                          {/* Quantity Stepper */}
                          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50/80 p-1">
                            <motion.button
                              whileTap={{ scale: 0.85 }}
                              type="button"
                              onClick={() => handleDecrease(item)}
                              disabled={updatingId === itemId}
                              className="h-7 w-7 rounded-lg bg-white flex items-center justify-center text-slate-700 hover:text-red-600 shadow-xs disabled:opacity-50 transition"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={13} />
                            </motion.button>
                            <span className="w-9 text-center font-bold text-xs text-slate-900">
                              {qty}
                            </span>
                            <motion.button
                              whileTap={{ scale: 0.85 }}
                              type="button"
                              onClick={() => handleIncrease(item)}
                              disabled={updatingId === itemId}
                              className="h-7 w-7 rounded-lg bg-white flex items-center justify-center text-slate-700 hover:text-emerald-600 shadow-xs disabled:opacity-50 transition"
                              aria-label="Increase quantity"
                            >
                              <Plus size={13} />
                            </motion.button>
                          </div>

                          {/* Line total */}
                          <div className="text-right min-w-20">
                            <p className="text-base font-extrabold text-slate-900">
                              ₹{lineTotal}
                            </p>
                          </div>

                          {/* Delete Button */}
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleRemove(item)}
                            disabled={removingId === itemId}
                            className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition"
                            aria-label="Remove item"
                          >
                            <Trash2 size={16} />
                          </motion.button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* Delivery Address Form Card */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
                <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-slate-100">
                  <div className="h-9 w-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900">
                      Delivery Address
                    </h2>
                    <p className="text-xs text-slate-500">
                      Where should we deliver your medications?
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Recipient Full Name *
                    </label>
                    <div className="relative">
                      <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        name="fullName"
                        value={shippingAddress.fullName}
                        onChange={handleAddressChange}
                        placeholder="John Doe"
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Phone Number (10 digits) *
                    </label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={shippingAddress.phone}
                        onChange={handleAddressChange}
                        placeholder="9876543210"
                        maxLength={10}
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      House / Flat / Street Address *
                    </label>
                    <input
                      type="text"
                      name="addressLine1"
                      value={shippingAddress.addressLine1}
                      onChange={handleAddressChange}
                      placeholder="Plot No. 12, 3rd Cross Street"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Landmark / Colony (Optional)
                    </label>
                    <input
                      type="text"
                      name="addressLine2"
                      value={shippingAddress.addressLine2}
                      onChange={handleAddressChange}
                      placeholder="Near City Hospital / Bus Stand"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={shippingAddress.city}
                      onChange={handleAddressChange}
                      placeholder="Madurai"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={shippingAddress.state}
                      onChange={handleAddressChange}
                      placeholder="Tamil Nadu"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      PIN Code (6 digits) *
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={shippingAddress.postalCode}
                      onChange={handleAddressChange}
                      placeholder="625020"
                      maxLength={6}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Country
                    </label>
                    <input
                      type="text"
                      disabled
                      value="India"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-sm outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Col: Order Summary (Col 5/4) */}
            <div className="lg:col-span-5 xl:col-span-4 sticky top-28 space-y-4">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs">
                <h2 className="text-lg font-bold text-slate-900 pb-4 border-b border-slate-100 mb-5">
                  Order Summary
                </h2>

                <div className="space-y-3 text-sm text-slate-600 mb-5">
                  <div className="flex justify-between">
                    <span>Items Subtotal</span>
                    <span className="font-semibold text-slate-900">₹{subtotal}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1">
                      <span>Delivery Fee</span>
                      {delivery === 0 && (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                          FREE
                        </span>
                      )}
                    </span>
                    <span className="font-semibold text-slate-900">
                      {delivery === 0 ? "₹0" : `₹${delivery}`}
                    </span>
                  </div>

                  {subtotal < 500 && (
                    <p className="text-[11px] text-emerald-700 font-medium bg-emerald-50 p-2 rounded-lg">
                      Add ₹{500 - subtotal} more items to get <strong>FREE Express Delivery</strong>!
                    </p>
                  )}

                  <div className="h-px bg-slate-100 my-2" />

                  <div className="flex justify-between items-baseline text-base sm:text-lg font-black text-slate-900">
                    <span>Total Amount</span>
                    <span className="text-xl sm:text-2xl text-emerald-600">
                      ₹{total}
                    </span>
                  </div>
                </div>

                {/* Checkout Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleProceedToCheckout}
                  disabled={checkoutLoading || cartItems.length === 0}
                  className="w-full py-3.5 px-6 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md shadow-emerald-500/20 disabled:opacity-50 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {checkoutLoading ? (
                    <span>Placing Order in Database...</span>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      <span>⚡ Confirm & Place Order (₹{total})</span>
                    </>
                  )}
                </motion.button>

                {/* Safety Guarantee */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-500">
                  <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                  <span>256-Bit SSL Encrypted & Cashfree Certified</span>
                </div>
              </div>

              {/* Express Support Note */}
              <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/50 p-4 text-xs text-emerald-800 flex items-start gap-2.5">
                <Truck size={17} className="text-emerald-600 shrink-0 mt-0.5" />
                <p leading-relaxed>
                  Express orders are verified by our duty pharmacist within 10 minutes and packaged in tamper-evident sealed pouches.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;