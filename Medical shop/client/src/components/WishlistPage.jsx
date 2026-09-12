/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  ShoppingCart,
  Trash2,
  Star,
  Pill,
  ShieldCheck,
  ShoppingBag,
  ArrowRight,
  Check,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";

const WishlistPage = () => {
  const navigate = useNavigate();

  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [cartLoadingId, setCartLoadingId] = useState(null);
  const [addedId, setAddedId] = useState(null);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await API.get("/wishlist/my");
      const items = response?.data?.wishlist || [];
      setWishlistItems(items);
    } catch (error) {
      console.error("Fetch wishlist error:", error);
      setWishlistItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (medicineId) => {
    try {
      setRemovingId(medicineId);
      const response = await API.delete(`/wishlist/remove/${medicineId}`);
      setWishlistItems(response?.data?.wishlist || []);
    } catch (error) {
      console.error("Remove wishlist item error:", error);
      alert(error.response?.data?.message || "Failed to remove wishlist item");
    } finally {
      setRemovingId(null);
    }
  };

  const handleAddToCart = async (medicine) => {
    const medicineId = medicine._id || medicine.id;
    try {
      setCartLoadingId(medicineId);

      // Add to local cart and backend
      const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");
      const existingIdx = existingCart.findIndex((i) => i._id === medicineId);
      if (existingIdx !== -1) {
        existingCart[existingIdx].quantity = (existingCart[existingIdx].quantity || 1) + 1;
      } else {
        existingCart.push({
          _id: medicineId,
          name: medicine.name,
          price: medicine.price,
          image: medicine.image || "",
          category: medicine.category || "",
          prescriptionRequired: medicine.prescriptionRequired || false,
          stock: medicine.stock || 0,
          quantity: 1,
        });
      }
      localStorage.setItem("cart", JSON.stringify(existingCart));
      window.dispatchEvent(new Event("cartChanged"));

      try {
        await API.post("/cart/add", {
          medicineId,
          quantity: 1,
        });
      } catch (err) {
        // Backend optional fallback
      }

      setAddedId(medicineId);
      setTimeout(() => setAddedId(null), 2000);
    } catch (error) {
      console.error("Add to cart error:", error);
    } finally {
      setCartLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 py-8 sm:py-10 lg:py-12">
      <div className="max-w-7xl 2xl:max-w-400 mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 mb-2">
              <Heart size={13} className="fill-rose-500 text-rose-500" />
              <span>Saved Medical Items</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              My Saved Wishlist ({wishlistItems.length})
            </h1>
          </div>

          <Link
            to="/cart"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-emerald-600 hover:text-emerald-700 transition"
          >
            <span>Go to Cart</span>
            <ArrowRight size={14} />
          </Link>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-72 rounded-2xl bg-white border border-slate-200 p-4 animate-pulse" />
            ))}
          </div>
        ) : wishlistItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl border border-slate-200 bg-white p-12 sm:p-16 text-center max-w-lg mx-auto shadow-xs"
          >
            <div className="h-16 w-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4">
              <Heart size={32} />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-1">
              Your Wishlist is Empty
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
              Save your frequent prescriptions, vitamins, and healthcare devices to order them easily anytime.
            </p>
            <Link
              to="/products"
              className="inline-flex px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition"
            >
              Browse Medicines
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {wishlistItems.map((item) => {
                const medicine = item.medicine || item;
                const medId = medicine._id || item._id;

                return (
                  <motion.div
                    key={medId}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-xs hover:shadow-lg hover:border-emerald-200 transition-all"
                  >
                    <div>
                      {/* Image Preview & Delete */}
                      <div className="relative h-44 rounded-xl bg-slate-50 p-4 flex items-center justify-center mb-3">
                        <button
                          onClick={() => handleRemove(medId)}
                          disabled={removingId === medId}
                          className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/90 text-slate-400 hover:text-rose-500 hover:bg-white flex items-center justify-center shadow-xs transition"
                          aria-label="Remove item"
                        >
                          <Trash2 size={14} />
                        </button>

                        {medicine.image ? (
                          <img
                            src={medicine.image}
                            alt={medicine.name}
                            className="h-full w-full object-contain p-1"
                          />
                        ) : (
                          <Pill size={38} className="text-emerald-600/70 transform -rotate-45" />
                        )}
                      </div>

                      <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                        {medicine.category || "Healthcare"}
                      </span>
                      <h3 className="font-bold text-sm text-slate-900 line-clamp-2 mt-0.5 mb-1">
                        {medicine.name}
                      </h3>
                      <p className="text-base font-extrabold text-slate-900 mb-3">
                        ₹{medicine.price}
                      </p>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAddToCart(medicine)}
                      disabled={cartLoadingId === medId}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                        addedId === medId
                          ? "bg-emerald-700 text-white"
                          : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                      }`}
                    >
                      {addedId === medId ? (
                        <>
                          <Check size={14} />
                          <span>Added to Cart!</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart size={14} />
                          <span>Move to Cart</span>
                        </>
                      )}
                    </motion.button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;