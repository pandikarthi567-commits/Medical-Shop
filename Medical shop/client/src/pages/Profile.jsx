/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Package,
  Heart,
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
  Activity,
  Droplet,
  AlertTriangle,
  HeartPulse,
  Camera,
  Loader2,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { logoutUser } from "../utils/auth";
import { getImageUrl } from "../utils/imageUrl";

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
  avatar: "",
  location: "",
  address: "",
  pincode: "",
  bloodGroup: "",
  gender: "",
  age: "",
  emergencyContact: "",
  allergies: "",
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
  const [prescriptionsCount, setPrescriptionsCount] = useState(0);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    address: "",
    pincode: "",
    bloodGroup: "",
    gender: "",
    age: "",
    emergencyContact: "",
    allergies: "",
  });

  const fetchProfile = async () => {
    try {
      setLoadingProfile(true);
      const res = await api.get("/users/profile");
      const profileUser = res?.data?.user || res?.data?.profile || defaultUser;
      const stats = res?.data?.stats;

      setUser(profileUser);
      setFormData({
        name: profileUser.name || "",
        email: profileUser.email || "",
        phone: profileUser.phone || "",
        location: profileUser.location || "",
        address: profileUser.address || "",
        pincode: profileUser.pincode || "",
        bloodGroup: profileUser.bloodGroup || "",
        gender: profileUser.gender || "",
        age: profileUser.age || "",
        emergencyContact: profileUser.emergencyContact || "",
        allergies: profileUser.allergies || "",
      });

      if (stats) {
        setOrderCount(stats.ordersCount || 0);
        setPrescriptionsCount(stats.prescriptionsCount || 0);
        setWishlistCount(stats.wishlistCount || 0);
      }

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

  useEffect(() => {
    fetchProfile();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file (JPG, PNG, WebP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image file size must be less than 5MB");
      return;
    }

    try {
      setUploadingAvatar(true);
      const data = new FormData();
      data.append("avatar", file);

      const res = await api.post("/users/avatar", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const updatedUser = res?.data?.user || res?.data?.profile || {
        ...user,
        avatar: res?.data?.avatarUrl,
      };

      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("authChanged"));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error("Upload avatar error:", err);
      alert(err?.response?.data?.message || "Failed to upload profile picture");
    } finally {
      setUploadingAvatar(false);
    }
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
      setSaveSuccess(true);
      setIsEditing(false);

      setTimeout(() => setSaveSuccess(false), 4000);
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
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div
              className="w-full h-full"
              style={{
                backgroundImage:
                  "radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* User Identity */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              {/* Profile Avatar with Camera Upload Overlay */}
              <div className="relative group shrink-0">
                <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-3xl bg-white/20 border-2 border-white/30 flex items-center justify-center text-white text-3xl font-black backdrop-blur-md overflow-hidden shadow-inner relative">
                  {user.avatar ? (
                    <img
                      src={getImageUrl(user.avatar)}
                      alt={user.name || "Profile Picture"}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = "none";
                      }}
                    />
                  ) : user.name ? (
                    user.name.charAt(0).toUpperCase()
                  ) : (
                    <User size={36} />
                  )}

                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                <label
                  htmlFor="avatar-file-upload"
                  className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-white text-emerald-700 hover:bg-emerald-50 hover:scale-110 shadow-lg flex items-center justify-center cursor-pointer transition border border-emerald-200"
                  title="Upload profile picture"
                >
                  <Camera size={14} />
                  <input
                    id="avatar-file-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
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
                    <span>{user.phone ? `+91 ${user.phone}` : "Mobile not linked"}</span>
                  </span>
                  {user.location && (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin size={14} />
                      <span>{user.location}</span>
                    </span>
                  )}
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
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 font-bold text-xs shadow-md transition cursor-pointer"
              >
                <Edit3 size={15} />
                <span>{isEditing ? "Close Edit" : "Edit Details"}</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-xs backdrop-blur-md transition cursor-pointer"
              >
                <LogOut size={15} />
                <span>Logout</span>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Success Alert */}
        {saveSuccess && (
          <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-bold text-emerald-800">
            <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
            <span>Personal details updated successfully!</span>
          </div>
        )}

        {/* Edit Profile Drawer / Modal */}
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
                    Edit Personal &amp; Medical Details
                  </h2>
                  <p className="text-xs text-slate-500">
                    Update your prescription, shipping, and healthcare contact information
                  </p>
                </div>
                <button
                  onClick={() => setIsEditing(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-6">
                {/* Profile Picture Upload Section */}
                <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative shrink-0">
                    <div className="h-16 w-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-2xl shadow-sm overflow-hidden relative border-2 border-white">
                      {user.avatar ? (
                        <img
                          src={getImageUrl(user.avatar)}
                          alt={user.name || "Avatar"}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = "none";
                          }}
                        />
                      ) : user.name ? (
                        user.name.charAt(0).toUpperCase()
                      ) : (
                        <User size={28} />
                      )}

                      {uploadingAvatar && (
                        <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 text-center sm:text-left">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Profile Picture / Avatar
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Upload a square image (JPG, PNG, WebP) under 5MB
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="modal-avatar-upload"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50 text-xs font-bold shadow-xs cursor-pointer transition"
                    >
                      <Camera size={14} />
                      <span>{uploadingAvatar ? "Uploading..." : "Change Photo"}</span>
                      <input
                        id="modal-avatar-upload"
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/jpg"
                        onChange={handleAvatarUpload}
                        disabled={uploadingAvatar}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Full Legal Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Subash"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-emerald-500 focus:ring-3 focus:ring-emerald-500/15"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g. user@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-emerald-500 focus:ring-3 focus:ring-emerald-500/15"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Mobile Number (+91)
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      maxLength={10}
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="10-digit phone number"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-emerald-500 focus:ring-3 focus:ring-emerald-500/15"
                    />
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Delivery City / Region
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="e.g. VIRUDHUNAGAR, TAMIL NADU"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-emerald-500 focus:ring-3 focus:ring-emerald-500/15"
                    />
                  </div>

                  {/* Pincode */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Postal Pincode
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      maxLength={6}
                      value={formData.pincode}
                      onChange={handleChange}
                      placeholder="e.g. 626001"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-emerald-500 focus:ring-3 focus:ring-emerald-500/15"
                    />
                  </div>

                  {/* Blood Group */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Blood Group
                    </label>
                    <select
                      name="bloodGroup"
                      value={formData.bloodGroup}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold outline-none focus:border-emerald-500 focus:ring-3 focus:ring-emerald-500/15"
                    >
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold outline-none focus:border-emerald-500 focus:ring-3 focus:ring-emerald-500/15"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Age */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Age (Years)
                    </label>
                    <input
                      type="number"
                      name="age"
                      min={1}
                      max={120}
                      value={formData.age}
                      onChange={handleChange}
                      placeholder="e.g. 24"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-emerald-500 focus:ring-3 focus:ring-emerald-500/15"
                    />
                  </div>

                  {/* Emergency Contact */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Emergency Contact (Name/Phone)
                    </label>
                    <input
                      type="text"
                      name="emergencyContact"
                      value={formData.emergencyContact}
                      onChange={handleChange}
                      placeholder="e.g. Father: 9876543210"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-emerald-500 focus:ring-3 focus:ring-emerald-500/15"
                    />
                  </div>

                  {/* Complete Address */}
                  <div className="sm:col-span-2 lg:col-span-3">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Complete Door / Street Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="e.g. Door No. 14B, Gandhi Nagar Street, Near Old Bus Stand"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-emerald-500 focus:ring-3 focus:ring-emerald-500/15"
                    />
                  </div>

                  {/* Known Allergies */}
                  <div className="sm:col-span-2 lg:col-span-3">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Known Allergies / Medical Notes
                    </label>
                    <input
                      type="text"
                      name="allergies"
                      value={formData.allergies}
                      onChange={handleChange}
                      placeholder="e.g. Penicillin allergy, Diabetic, None"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-emerald-500 focus:ring-3 focus:ring-emerald-500/15"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                  >
                    <Save size={14} />
                    <span>{saving ? "Saving Details..." : "Save Changes"}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Activity Summary Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/orders"
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
            to="/prescriptions"
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-teal-200 hover:shadow-md transition group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">Prescriptions</span>
              <FileText size={18} className="text-teal-600 group-hover:scale-110 transition" />
            </div>
            <p className="text-2xl font-black text-slate-900">{prescriptionsCount}</p>
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
          {/* Left Col: Personal Medical Profile (Col 7) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-5">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck size={18} className="text-emerald-600" />
                  <span>Personal Medical Profile</span>
                </h2>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 size={13} />
                  <span>Edit</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-slate-400 font-semibold mb-1">Full Legal Name</p>
                  <p className="text-sm font-bold text-slate-900">
                    {user.name || "Not registered"}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-slate-400 font-semibold mb-1">Mobile Contact</p>
                  <p className="text-sm font-bold text-slate-900 font-mono">
                    {user.phone ? `+91 ${user.phone}` : "Click Edit to link phone"}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-slate-400 font-semibold mb-1">Email Address</p>
                  <p className="text-sm font-bold text-slate-900 truncate">
                    {user.email || "Not registered"}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-slate-400 font-semibold mb-1">Primary City / Region</p>
                  <p className="text-sm font-bold text-slate-900">
                    {user.location || "VIRUDHUNAGAR, TAMIL NADU"}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-slate-400 font-semibold mb-1 flex items-center gap-1">
                    <Droplet size={13} className="text-red-500" />
                    <span>Blood Group</span>
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    {user.bloodGroup || "Not specified"}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-slate-400 font-semibold mb-1">Gender &amp; Age</p>
                  <p className="text-sm font-bold text-slate-900">
                    {user.gender || "Not set"}{" "}
                    {user.age ? `• ${user.age} yrs` : ""}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 sm:col-span-2">
                  <p className="text-slate-400 font-semibold mb-1">Delivery Address &amp; Pincode</p>
                  <p className="text-xs font-semibold text-slate-800">
                    {user.address || "No street address specified"}
                    {user.pincode ? ` - ${user.pincode}` : ""}
                  </p>
                </div>

                {user.emergencyContact && (
                  <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100 sm:col-span-2">
                    <p className="text-rose-700 font-bold mb-1 flex items-center gap-1">
                      <HeartPulse size={13} />
                      <span>Emergency Contact</span>
                    </p>
                    <p className="text-xs font-semibold text-slate-800">
                      {user.emergencyContact}
                    </p>
                  </div>
                )}

                {user.allergies && (
                  <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 sm:col-span-2">
                    <p className="text-amber-800 font-bold mb-1 flex items-center gap-1">
                      <AlertTriangle size={13} />
                      <span>Known Allergies &amp; Medical Notes</span>
                    </p>
                    <p className="text-xs font-semibold text-slate-800">
                      {user.allergies}
                    </p>
                  </div>
                )}
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
                to="/orders"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50 text-slate-800 hover:text-emerald-800 transition"
              >
                <div className="flex items-center gap-3">
                  <Package size={17} className="text-emerald-600" />
                  <span className="text-xs font-bold">My Orders &amp; Invoices</span>
                </div>
                <ChevronRight size={15} className="text-slate-400" />
              </Link>

              <Link
                to="/prescriptions"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50 text-slate-800 hover:text-emerald-800 transition"
              >
                <div className="flex items-center gap-3">
                  <FileText size={17} className="text-emerald-600" />
                  <span className="text-xs font-bold">My Doctor Prescriptions</span>
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