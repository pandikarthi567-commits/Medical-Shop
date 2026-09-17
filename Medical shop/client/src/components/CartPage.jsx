/* eslint-disable react-hooks/exhaustive-deps */
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
  CheckCircle2,
  Lock,
  ShoppingBag,
  Sparkles,
  CreditCard,
  QrCode,
  Check,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";

const CartPage = () => {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [removingId, setRemovingId] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState("cashfree");
  const [showCashfreeModal, setShowCashfreeModal] = useState(false);
  const [cashfreeTab, setCashfreeTab] = useState("upi");
  const [currentOrder, setCurrentOrder] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState(null);

  const [cardDetails, setCardDetails] = useState({
    number: "4022 8920 1029 4022",
    name: "Subash K",
    expiry: "09/29",
    cvv: "820",
  });
  const [selectedUpiApp, setSelectedUpiApp] = useState("gpay");
  const [selectedBank, setSelectedBank] = useState("hdfc");

  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "Virudhunagar",
    state: "Tamil Nadu",
    postalCode: "626001",
    country: "India",
  });

  const fetchUserProfile = async () => {
    try {
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
        addressLine1: profile?.address || prev.addressLine1 || "",
        city: profile?.location?.split(",")?.[0]?.trim() || prev.city || "Virudhunagar",
        state: profile?.location?.split(",")?.[1]?.trim() || prev.state || "Tamil Nadu",
        postalCode: profile?.pincode || prev.postalCode || "626001",
      }));
    } catch (error) {
      console.error("Fetch profile error:", error);
    }
  };

  const fetchCart = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const response = await API.get("/cart/my");
      const items =
        response?.data?.cart?.items ||
        response?.data?.items ||
        response?.data?.cart ||
        [];

      const validItems = Array.isArray(items) ? items : [];
      setCartItems(validItems);
      localStorage.setItem("cart", JSON.stringify(validItems));
    } catch (error) {
      console.error("Fetch cart error:", error);
      if (showLoading) setCartItems([]);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart(true);
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

    // ⚡ Optimistic UI update
    setCartItems((prev) =>
      prev.map((ci) => {
        const cItemId = getItemId(ci);
        const cMedId = ci?.medicine?._id || ci?.medicineId || ci?._id;
        if (cItemId === itemId || cMedId === medicineId) {
          const nextQty = getQty(ci) + 1;
          return { ...ci, quantity: nextQty, qty: nextQty };
        }
        return ci;
      })
    );

    try {
      setUpdatingId(itemId);
      await API.post("/cart/add", {
        medicineId,
        quantity: 1,
      });
      await fetchCart(false);
      window.dispatchEvent(new Event("cartChanged"));
    } catch (error) {
      console.error("Increase quantity error:", error);
      await fetchCart(false);
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

    // ⚡ Optimistic UI update
    if (currentQty <= 1) {
      setCartItems((prev) =>
        prev.filter((ci) => {
          const cItemId = getItemId(ci);
          const cMedId = ci?.medicine?._id || ci?.medicineId || ci?._id;
          return !(cItemId === itemId || cMedId === medicineId);
        })
      );
    } else {
      setCartItems((prev) =>
        prev.map((ci) => {
          const cItemId = getItemId(ci);
          const cMedId = ci?.medicine?._id || ci?.medicineId || ci?._id;
          if (cItemId === itemId || cMedId === medicineId) {
            const nextQty = currentQty - 1;
            return { ...ci, quantity: nextQty, qty: nextQty };
          }
          return ci;
        })
      );
    }

    try {
      setUpdatingId(itemId);
      if (currentQty <= 1) {
        await API.delete(`/cart/remove/${medicineId}`);
      } else {
        await API.put(`/cart/update/${medicineId}`, {
          quantity: currentQty - 1,
        });
      }
      await fetchCart(false);
      window.dispatchEvent(new Event("cartChanged"));
    } catch (error) {
      console.error("Decrease quantity error:", error);
      await fetchCart(false);
      alert(error.response?.data?.message || "Failed to decrease quantity");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (item) => {
    const itemId = getItemId(item);
    const medicine = getMedicine(item);
    const medicineId = medicine?._id || item?.medicineId || item?._id;

    setCartItems((prev) =>
      prev.filter((ci) => {
        const cItemId = getItemId(ci);
        const cMedId = ci?.medicine?._id || ci?.medicineId || ci?._id;
        return !(cItemId === itemId || cMedId === medicineId);
      })
    );

    try {
      setRemovingId(itemId);
      await API.delete(`/cart/remove/${medicineId}`);
      await fetchCart(false);
      window.dispatchEvent(new Event("cartChanged"));
    } catch (error) {
      console.error("Remove cart item error:", error);
      await fetchCart(false);
      alert(error.response?.data?.message || "Failed to remove item");
    } finally {
      setRemovingId(null);
    }
  };

  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + getLineTotal(item), 0);
  }, [cartItems]);

  const delivery = cartItems.length > 0 ? (subtotal >= 500 ? 0 : 40) : 0;
  const total = Number((subtotal + delivery).toFixed(2));

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateAddress = () => {
    if (!shippingAddress.fullName.trim()) return "Recipient full name is required";
    if (!shippingAddress.phone.trim()) return "Phone number is required";

    const cleanedPhone = shippingAddress.phone.replace(/\D/g, "").slice(-10);
    if (!/^\d{10}$/.test(cleanedPhone)) {
      return "Phone number must be 10 digits";
    }

    if (!shippingAddress.addressLine1.trim()) return "Street address is required";
    if (!shippingAddress.city.trim()) return "City is required";
    if (!shippingAddress.state.trim()) return "State is required";
    if (!shippingAddress.postalCode.trim()) return "PIN code is required";

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

      if (paymentMethod === "cashfree") {
        // Create Cashfree Order in Backend
        const response = await API.post("/payments/cashfree/create-order", {
          shippingAddress: {
            ...shippingAddress,
            phone: shippingAddress.phone.replace(/\D/g, "").slice(-10),
          },
        });

        const order = response?.data?.order;
        const orderId = order?.orderId || response?.data?.orderId;

        if (!orderId) {
          alert("Could not initialize Cashfree order. Please try again.");
          return;
        }

        setCurrentOrder(order);
        setShowCashfreeModal(true);
      } else {
        // Cash on Delivery Order
        const response = await API.post("/orders", {
          items: cartItems,
          paymentMethod: "COD",
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
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert(error.response?.data?.message || "Failed to place order in database");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleSimulateCashfreePayment = async (selectedMethodType = "UPI") => {
    if (!currentOrder?.orderId) return;

    try {
      setIsProcessingPayment(true);
      const generatedTxnId = `CF_TXN_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

      const response = await API.post("/payments/cashfree/complete-duplicate", {
        orderId: currentOrder.orderId,
        paymentMethod: selectedMethodType,
        transactionId: generatedTxnId,
      });

      const updatedOrder = response?.data?.order || {
        ...currentOrder,
        paymentStatus: "PAID",
        orderStatus: "CONFIRMED",
      };

      setPaymentSuccessData({
        orderId: currentOrder.orderId,
        transactionId: generatedTxnId,
        amount: total,
      });

      localStorage.setItem("latestOrderLocalId", updatedOrder._id);
      localStorage.setItem("latestOrderId", currentOrder.orderId);
      localStorage.removeItem("cartItems");
      localStorage.removeItem("cart");
      window.dispatchEvent(new Event("cartChanged"));

      setTimeout(() => {
        setShowCashfreeModal(false);
        navigate(`/track-order?order_id=${encodeURIComponent(currentOrder.orderId)}`, {
          state: { orderId: currentOrder.orderId, order: updatedOrder },
        });
      }, 1600);
    } catch (err) {
      console.error("Duplicate payment confirmation error:", err);
      alert(err.response?.data?.message || "Payment simulation failed");
    } finally {
      setIsProcessingPayment(false);
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
              <span>Prescription &amp; Healthcare Cart</span>
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
            <div className="h-20 w-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-5">
              <ShoppingBag size={36} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Your Cart is Empty</h2>
            <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
              Explore certified prescription medicines, healthcare essentials, and wellness products with express doorstep delivery.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition"
            >
              <Sparkles size={16} />
              <span>Browse Medicines &amp; Healthcare</span>
            </Link>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* Left Col: Cart Items & Shipping Address (Col 7/8) */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-6">
              {/* Itemized Medicine List */}
              <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7 shadow-xs">
                <h2 className="text-base font-bold text-slate-900 pb-4 border-b border-slate-100 mb-4 flex items-center justify-between">
                  <span>Selected Medicines ({cartItems.length})</span>
                  <span className="text-xs font-semibold text-emerald-600">Verified Stocks</span>
                </h2>

                <div className="divide-y divide-slate-100">
                  {cartItems.map((item) => {
                    const itemId = getItemId(item);
                    const medicine = getMedicine(item);
                    const qty = getQty(item);
                    const price = getPrice(item);
                    const lineTotal = getLineTotal(item);

                    return (
                      <div
                        key={itemId}
                        className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="h-16 w-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                            {medicine?.image ? (
                              <img
                                src={medicine.image}
                                alt={medicine.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <ShoppingCart size={24} className="text-slate-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mb-1 inline-block">
                              {medicine?.category || "Prescription Medicine"}
                            </span>
                            <h3 className="text-sm font-bold text-slate-900 truncate">
                              {medicine?.name || "Medicine Item"}
                            </h3>
                            <p className="text-xs text-slate-500 font-medium">
                              ₹{price}/unit
                            </p>
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
                              className="h-7 w-7 rounded-lg bg-white flex items-center justify-center text-slate-700 hover:text-red-600 shadow-xs disabled:opacity-50 transition cursor-pointer"
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
                              className="h-7 w-7 rounded-lg bg-white flex items-center justify-center text-slate-700 hover:text-emerald-600 shadow-xs disabled:opacity-50 transition cursor-pointer"
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
                            className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition cursor-pointer"
                            aria-label="Remove item"
                          >
                            <Trash2 size={16} />
                          </motion.button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Delivery Address Form */}
              <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7 shadow-xs">
                <div className="flex items-center gap-2 pb-4 border-b border-slate-100 mb-5">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Delivery Address</h2>
                    <p className="text-xs text-slate-500">
                      Where should our express courier deliver your medications?
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Recipient Full Name *
                    </label>
                    <div className="relative">
                      <User size={14} className="absolute left-3.5 top-3 text-slate-400" />
                      <input
                        type="text"
                        name="fullName"
                        value={shippingAddress.fullName}
                        onChange={handleAddressChange}
                        placeholder="Subash"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Phone Number (10 digits) *
                    </label>
                    <div className="relative">
                      <Phone size={14} className="absolute left-3.5 top-3 text-slate-400" />
                      <input
                        type="tel"
                        name="phone"
                        maxLength={10}
                        value={shippingAddress.phone}
                        onChange={handleAddressChange}
                        placeholder="9600509567"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition font-mono"
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
                      placeholder="1/1033,4-Mallikittangi Street, Pandiyan Nagar, Virudhunagar"
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
                      placeholder="Virudhunagar"
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
                      placeholder="626001"
                      maxLength={6}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition font-mono"
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

            {/* Right Col: Order Summary & Payment Mode (Col 5/4) */}
            <div className="lg:col-span-5 xl:col-span-4 sticky top-28 space-y-4">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs space-y-5">
                <h2 className="text-lg font-bold text-slate-900 pb-3 border-b border-slate-100">
                  Order Summary
                </h2>

                <div className="space-y-3 text-sm text-slate-600">
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
                    <p className="text-[11px] text-emerald-700 font-medium bg-emerald-50 p-2.5 rounded-xl">
                      Add ₹{(500 - subtotal).toFixed(2)} more items to get <strong>FREE Express Delivery</strong>!
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

                {/* Payment Method Selector */}
                <div className="space-y-2.5 pt-2 border-t border-slate-100">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Select Payment Gateway
                  </label>

                  {/* Cashfree Option */}
                  <label
                    onClick={() => setPaymentMethod("cashfree")}
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border transition cursor-pointer ${
                      paymentMethod === "cashfree"
                        ? "border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === "cashfree"}
                      onChange={() => setPaymentMethod("cashfree")}
                      className="mt-1 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                          <CreditCard size={15} className="text-emerald-600" />
                          <span>Cashfree Payment Gateway</span>
                        </span>
                        <span className="text-[10px] font-extrabold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                          Instant
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        UPI (GPay/PhonePe), Credit/Debit Cards, QR Code &amp; NetBanking
                      </p>
                    </div>
                  </label>

                  {/* Cash on Delivery Option */}
                  <label
                    onClick={() => setPaymentMethod("cod")}
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border transition cursor-pointer ${
                      paymentMethod === "cod"
                        ? "border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                      className="mt-1 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                          <Truck size={15} className="text-emerald-600" />
                          <span>Cash on Delivery (COD)</span>
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Pay ₹{total} via Cash or UPI upon doorstep arrival
                      </p>
                    </div>
                  </label>
                </div>

                {/* Checkout CTA Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleProceedToCheckout}
                  disabled={checkoutLoading || cartItems.length === 0}
                  className="w-full py-3.5 px-6 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md shadow-emerald-500/20 disabled:opacity-50 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {checkoutLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Initializing Payment...</span>
                    </div>
                  ) : paymentMethod === "cashfree" ? (
                    <>
                      <Lock size={15} />
                      <span>Pay ₹{total} with Cashfree</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      <span>Place Order with Cash on Delivery</span>
                    </>
                  )}
                </motion.button>

                {/* Safety Guarantee */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-500">
                  <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                  <span>256-Bit SSL Encrypted &amp; Cashfree Certified</span>
                </div>
              </div>

              {/* Express Support Note */}
              <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/50 p-4 text-xs text-emerald-800 flex items-start gap-2.5">
                <Truck size={17} className="text-emerald-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Express orders are verified by our duty pharmacist within 10 minutes and packaged in tamper-evident sealed pouches.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* DUPLICATE CASHFREE PAYMENT GATEWAY MODAL */}
      <AnimatePresence>
        {showCashfreeModal && currentOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100"
            >
              {/* Cashfree Branded Header */}
              <div className="bg-linear-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-5 sm:p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 font-black text-lg">
                    CF
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm tracking-tight text-white">Cashfree Payments</h3>
                      <span className="text-[10px] font-extrabold bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/20">
                        Sandbox Simulator
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">MediCare Super Speciality Pharmacy</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Amount</span>
                  <span className="text-xl font-black text-emerald-400">₹{total}</span>
                </div>
              </div>

              {/* Success Screen inside Modal */}
              {paymentSuccessData ? (
                <div className="p-8 text-center space-y-4">
                  <div className="h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
                    <CheckCircle2 size={36} />
                  </div>
                  <h3 className="text-xl font-black text-slate-900">Payment Successful!</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Your transaction has been approved by Cashfree. Redirecting to your live order tracking radar...
                  </p>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-mono text-slate-600">
                    Ref ID: {paymentSuccessData.transactionId}
                  </div>
                </div>
              ) : (
                <div className="p-5 sm:p-6 space-y-5">
                  {/* Payment Channel Tabs */}
                  <div className="flex rounded-2xl bg-slate-100 p-1 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setCashfreeTab("upi")}
                      className={`flex-1 py-2 rounded-xl transition cursor-pointer ${
                        cashfreeTab === "upi" ? "bg-white text-emerald-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      📱 UPI &amp; QR
                    </button>
                    <button
                      type="button"
                      onClick={() => setCashfreeTab("card")}
                      className={`flex-1 py-2 rounded-xl transition cursor-pointer ${
                        cashfreeTab === "card" ? "bg-white text-emerald-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      💳 Card Payment
                    </button>
                    <button
                      type="button"
                      onClick={() => setCashfreeTab("netbanking")}
                      className={`flex-1 py-2 rounded-xl transition cursor-pointer ${
                        cashfreeTab === "netbanking" ? "bg-white text-emerald-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      🏦 NetBanking
                    </button>
                  </div>

                  {/* Tab 1: UPI & QR Simulation */}
                  {cashfreeTab === "upi" && (
                    <div className="space-y-4">
                      {/* Simulated QR Code */}
                      <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                        <div className="h-28 w-28 bg-white p-2 rounded-2xl border border-emerald-200 flex items-center justify-center shrink-0 shadow-xs">
                          {/* Stylized QR Code Representation */}
                          <div className="w-full h-full bg-slate-900 rounded-lg p-1.5 flex flex-col justify-between">
                            <div className="flex justify-between">
                              <div className="w-5 h-5 bg-white rounded-xs p-0.5">
                                <div className="w-full h-full bg-slate-900" />
                              </div>
                              <div className="w-5 h-5 bg-white rounded-xs p-0.5">
                                <div className="w-full h-full bg-slate-900" />
                              </div>
                            </div>
                            <div className="text-center text-[8px] text-emerald-400 font-mono font-bold tracking-widest">
                              CASHFREE
                            </div>
                            <div className="flex justify-between">
                              <div className="w-5 h-5 bg-white rounded-xs p-0.5">
                                <div className="w-full h-full bg-slate-900" />
                              </div>
                              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
                            </div>
                          </div>
                        </div>

                        <div className="text-center sm:text-left space-y-1">
                          <h4 className="text-xs font-bold text-slate-800">Scan QR with Any UPI App</h4>
                          <p className="text-[11px] text-slate-500">
                            Scan with Google Pay, PhonePe, Paytm, or BHIM to pay ₹{total} instantly.
                          </p>
                          <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                            Zero Transaction Fee
                          </span>
                        </div>
                      </div>

                      {/* UPI App Icons / Selector */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                          Or Select UPI App
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          {[
                            { id: "gpay", name: "GPay", color: "bg-blue-50 text-blue-700 border-blue-200" },
                            { id: "phonepe", name: "PhonePe", color: "bg-purple-50 text-purple-700 border-purple-200" },
                            { id: "paytm", name: "Paytm", color: "bg-sky-50 text-sky-700 border-sky-200" },
                            { id: "bhim", name: "BHIM UPI", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
                          ].map((app) => (
                            <button
                              key={app.id}
                              type="button"
                              onClick={() => setSelectedUpiApp(app.id)}
                              className={`p-2.5 rounded-xl border text-center font-bold text-xs transition cursor-pointer ${
                                selectedUpiApp === app.id
                                  ? `${app.color} ring-2 ring-emerald-500`
                                  : "border-slate-200 hover:bg-slate-50 text-slate-700"
                              }`}
                            >
                              {app.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tab 2: Card Simulation */}
                  {cashfreeTab === "card" && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Card Number</label>
                        <input
                          type="text"
                          value={cardDetails.number}
                          onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Expiry (MM/YY)</label>
                          <input
                            type="text"
                            value={cardDetails.expiry}
                            onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">CVV / CVC</label>
                          <input
                            type="password"
                            maxLength={4}
                            value={cardDetails.cvv}
                            onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Cardholder Name</label>
                        <input
                          type="text"
                          value={cardDetails.name}
                          onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  )}

                  {/* Tab 3: NetBanking Simulation */}
                  {cashfreeTab === "netbanking" && (
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">Popular Indian Banks</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: "hdfc", name: "HDFC Bank" },
                          { id: "icici", name: "ICICI Bank" },
                          { id: "sbi", name: "State Bank of India" },
                          { id: "axis", name: "Axis Bank" },
                          { id: "kotak", name: "Kotak Bank" },
                          { id: "pnb", name: "Punjab National Bank" },
                        ].map((bank) => (
                          <button
                            key={bank.id}
                            type="button"
                            onClick={() => setSelectedBank(bank.id)}
                            className={`p-3 rounded-xl border text-left font-bold text-xs transition cursor-pointer ${
                              selectedBank === bank.id
                                ? "border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20"
                                : "border-slate-200 hover:bg-slate-50 text-slate-700"
                            }`}
                          >
                            {bank.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowCashfreeModal(false)}
                      disabled={isProcessingPayment}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold cursor-pointer transition disabled:opacity-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSimulateCashfreePayment(cashfreeTab.toUpperCase())}
                      disabled={isProcessingPayment}
                      className="flex-1 py-3 px-5 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isProcessingPayment ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Authorizing with Cashfree...</span>
                        </>
                      ) : (
                        <>
                          <Lock size={14} />
                          <span>Pay ₹{total} via Cashfree</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CartPage;