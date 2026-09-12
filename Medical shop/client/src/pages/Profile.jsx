/* eslint-disable no-unused-vars */
import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Package,
  Heart,
  Bell,
  LogOut,
  Edit3,
  CalendarDays,
  BadgeCheck,
  ChevronRight,
  Save,
  X,
  Truck,
  FileText,
  ShoppingCart,
  CheckCircle2,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { logoutUser } from "../utils/auth";

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.25, ease: "easeInOut" },
  },
};

const defaultUser = {
  name: "",
  phone: "",
  email: "",
  location: "",
  joinedDate: "",
  isPhoneVerified: false,
};

const formatJoinedDate = (dateString) => {
  if (!dateString) return "Recent Patient";
  const date = new Date(dateString);
  return date.toLocaleString("en-IN", {
    month: "short",
    year: "numeric",
  });
};

const Profile = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(defaultUser);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [orderCount, setOrderCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    location: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/users/profile");
        const profileUser = res?.data?.user || res?.data?.profile || defaultUser;

        setUser(profileUser);
        setFormData({
          name: profileUser.name || "",
          email: profileUser.email || "",
          location: profileUser.location || "",
        });

        localStorage.setItem("user", JSON.stringify(profileUser));
        window.dispatchEvent(new Event("authChanged"));
      } catch (error) {
        console.error("Fetch profile error:", error);
        logoutUser();
        navigate("/login");
      } finally {
        setLoadingProfile(false);
      }
    };

    const fetchCounts = async () => {
      try {
        const [ordersRes, wishlistRes] = await Promise.allSettled([
          api.get("/orders/my-orders"),
          api.get("/wishlist/my"),
        ]);

        if (ordersRes.status === "fulfilled") {
          setOrderCount(ordersRes.value?.data?.orders?.length || 0);
        }
        if (wishlistRes.status === "fulfilled") {
          setWishlistCount(wishlistRes.value?.data?.wishlist?.length || 0);
        }
      } catch (err) {
        // Optional stats fallback
      }
    };

    fetchProfile();
    fetchCounts();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await api.put("/users/profile", formData);
      const updatedUser = res?.data?.user || res?.data?.profile || {
        ...user,
        ...formData,
      };

      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("authChanged"));
      setIsEditing(false);
    } catch (error) {
      console.error("Save profile error:", error);
      alert(error?.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-slate-50/60 py-8 sm:py-10 lg:py-12 px-4 sm:px-6"
    >
      <div className="mx-auto w-full max-w-6xl space-y-6 sm:space-y-8">
        {/* Profile Hero Card */}
        <div className="relative overflow-hidden rounded-3xl sm:rounded-4xl bg-linear-to-r from-emerald-600 via-teal-600 to-emerald-800 text-white p-6 sm:p-8 lg:p-10 shadow-xl shadow-emerald-900/5">
          {/* Subtle Background Radial Pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div
              className="w-full h-full"
              style={{
                backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* User Identity */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-3xl bg-white/20 border border-white/25 flex items-center justify-center text-white text-3xl font-black backdrop-blur-md shrink-0 shadow-inner">
                {user.name ? user.name.charAt(0).toUpperCase() : <User size={36} />}
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                    {user.name || "MediCare Patient"}
                  </h1>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold backdrop-blur-md">
                    <BadgeCheck size={14} className="text-emerald-200" />
                    <span>Verified Patient</span>
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-emerald-100 font-medium">
                  {user.email || "No email registered"}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-emerald-50/90 font-medium">
                  <span className="inline-flex items-center gap-1.5">
                    <Phone size={14} />
                    <span>+91 {user.phone || "Not linked"}</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays size={14} />
                    <span>Joined {formatJoinedDate(user.joinedDate || user.createdAt)}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-2.5 self-start lg:self-center">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsEditing(!isEditing)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 font-bold text-xs shadow-md transition"
              >
                <Edit3 size={15} />
                <span>{isEditing ? "Close Edit" : "Edit Profile"}</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-xs backdrop-blur-md transition"
              >
                <LogOut size={15} />
                <span>Logout</span>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Edit Profile Drawer */}
        <AnimatePresence>
          {isEditing && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Edit Personal Details
                  </h2>
                  <p className="text-xs text-slate-500">
                    Update your prescription recipient information
                  </p>
                </div>
                <button
                  onClick={() => setIsEditing(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Full Legal Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. John Doe"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g. john@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Primary City / Delivery Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="e.g. Madurai, Tamil Nadu"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Activity Summary Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/profile/orders"
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-emerald-200 hover:shadow-md transition group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">Orders Placed</span>
              <Package size={18} className="text-emerald-600 group-hover:scale-110 transition" />
            </div>
            <p className="text-2xl font-black text-slate-900">{orderCount}</p>
            <span className="text-[11px] font-bold text-emerald-600 mt-1 inline-block">
              View History →
            </span>
          </Link>

          <Link
            to="/wishlist"
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-rose-200 hover:shadow-md transition group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">Saved Wishlist</span>
              <Heart size={18} className="text-rose-500 group-hover:scale-110 transition" />
            </div>
            <p className="text-2xl font-black text-slate-900">{wishlistCount}</p>
            <span className="text-[11px] font-bold text-rose-600 mt-1 inline-block">
              View Items →
            </span>
          </Link>

          <Link
            to="/prescription"
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-teal-200 hover:shadow-md transition group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">Prescriptions</span>
              <FileText size={18} className="text-teal-600 group-hover:scale-110 transition" />
            </div>
            <p className="text-2xl font-black text-slate-900">Active</p>
            <span className="text-[11px] font-bold text-teal-600 mt-1 inline-block">
              Upload New Rx →
            </span>
          </Link>

          <Link
            to="/track-order"
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-blue-200 hover:shadow-md transition group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">Live GPS Tracking</span>
              <Truck size={18} className="text-blue-600 group-hover:scale-110 transition" />
            </div>
            <p className="text-2xl font-black text-slate-900">Radar</p>
            <span className="text-[11px] font-bold text-blue-600 mt-1 inline-block">
              Track Courier →
            </span>
          </Link>
        </div>

        {/* Account Details & Quick Navigation Grid */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Left Col: Personal Information Cards (Col 7) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs">
              <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 mb-5 flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-600" />
                <span>Personal Medical Profile</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-slate-400 font-semibold mb-1">Full Name</p>
                  <p className="text-sm font-bold text-slate-900">
                    {user.name || "Not registered"}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-slate-400 font-semibold mb-1">Mobile Contact</p>
                  <p className="text-sm font-bold text-slate-900 font-mono">
                    +91 {user.phone || "Not linked"}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-slate-400 font-semibold mb-1">Email Address</p>
                  <p className="text-sm font-bold text-slate-900 truncate">
                    {user.email || "Not registered"}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-slate-400 font-semibold mb-1">Delivery City</p>
                  <p className="text-sm font-bold text-slate-900">
                    {user.location || "Madurai, Tamil Nadu"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Col: Quick Healthcare Shortcuts (Col 5) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
                Healthcare Quick Links
              </h3>

              <Link
                to="/profile/orders"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50 text-slate-800 hover:text-emerald-800 transition"
              >
                <div className="flex items-center gap-3">
                  <Package size={17} className="text-emerald-600" />
                  <span className="text-xs font-bold">Past Orders & Invoices</span>
                </div>
                <ChevronRight size={15} className="text-slate-400" />
              </Link>

              <Link
                to="/prescription"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50 text-slate-800 hover:text-emerald-800 transition"
              >
                <div className="flex items-center gap-3">
                  <FileText size={17} className="text-emerald-600" />
                  <span className="text-xs font-bold">Upload Prescription Note</span>
                </div>
                <ChevronRight size={15} className="text-slate-400" />
              </Link>

              <Link
                to="/wishlist"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-rose-50 text-slate-800 hover:text-rose-800 transition"
              >
                <div className="flex items-center gap-3">
                  <Heart size={17} className="text-rose-500" />
                  <span className="text-xs font-bold">Saved Items Wishlist</span>
                </div>
                <ChevronRight size={15} className="text-slate-400" />
              </Link>

              <Link
                to="/cart"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50 text-slate-800 hover:text-emerald-800 transition"
              >
                <div className="flex items-center gap-3">
                  <ShoppingCart size={17} className="text-emerald-600" />
                  <span className="text-xs font-bold">Review Shopping Cart</span>
                </div>
                <ChevronRight size={15} className="text-slate-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;