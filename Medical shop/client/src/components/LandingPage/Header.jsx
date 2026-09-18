/* eslint-disable no-useless-assignment */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  ShoppingCart,
  Menu,
  X,
  Search,
  MapPin,
  User,
  Bell,
  Phone,
  Package,
  FileText,
  LogOut,
  ChevronDown,
  ShieldCheck,
  CheckCircle2,
  Navigation,
  Pill,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { getImageUrl } from "../../utils/imageUrl";

const popularLocations = [
  "Madurai 625020",
  "Chennai 600001",
  "Coimbatore 641001",
  "Trichy 620001",
  "Salem 636001",
  "Tirunelveli 627001",
];

const Header = () => {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [showHeaderSearch, setShowHeaderSearch] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [inputLocation, setInputLocation] = useState("");

  const [authToken, setAuthToken] = useState(localStorage.getItem("token") || "");
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });

  const [savedAddress, setSavedAddress] = useState(
    localStorage.getItem("userAddress") || ""
  );

  const [headerSuggestions, setHeaderSuggestions] = useState([]);
  const [loadingHeaderSuggestions, setLoadingHeaderSuggestions] = useState(false);
  const [showHeaderDropdown, setShowHeaderDropdown] = useState(false);
  const headerSearchRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const query = searchQuery.trim();
    if (query.length < 2) {
      setHeaderSuggestions([]);
      setShowHeaderDropdown(false);
      setLoadingHeaderSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoadingHeaderSuggestions(true);
        const { data } = await api.get(`/medicines?search=${encodeURIComponent(query)}&limit=5`);
        setHeaderSuggestions(data?.medicines || []);
        setShowHeaderDropdown(true);
      } catch {
        setHeaderSuggestions([]);
      } finally {
        setLoadingHeaderSuggestions(false);
      }
    }, 220);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (headerSearchRef.current && !headerSearchRef.current.contains(e.target)) {
        setShowHeaderDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const syncAuthState = useCallback(() => {
    const token = localStorage.getItem("token") || "";
    let parsedUser = null;

    try {
      parsedUser = JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      parsedUser = null;
    }

    setAuthToken(token);
    setCurrentUser(parsedUser);
    setSavedAddress(localStorage.getItem("userAddress") || parsedUser?.location || "");

    try {
      const cartItems = JSON.parse(localStorage.getItem("cart") || "[]");
      const count = Array.isArray(cartItems)
        ? cartItems.reduce((acc, item) => acc + (item.quantity ?? item.qty ?? 1), 0)
        : 0;
      setCartCount(count);
    } catch {
      setCartCount(0);
    }

    if (token) {
      api.get("/cart/my").then((res) => {
        const items =
          res?.data?.cart?.items ||
          res?.data?.items ||
          res?.data?.cart ||
          [];
        if (Array.isArray(items)) {
          const apiCount = items.reduce((acc, item) => acc + (item.quantity ?? item.qty ?? 1), 0);
          setCartCount(apiCount);
          localStorage.setItem("cart", JSON.stringify(items));
        }
      }).catch(() => {});
    }
  }, []);

  // Fetch real-time user profile from MongoDB Database on mount if token exists
  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await api.get("/users/profile");
        const profileUser = res?.data?.user || res?.data?.profile;
        if (profileUser) {
          setCurrentUser(profileUser);
          localStorage.setItem("user", JSON.stringify(profileUser));

          if (profileUser.location) {
            setSavedAddress(profileUser.location);
            localStorage.setItem("userAddress", profileUser.location);
          }
        }
      } catch (err) {
        console.error("Header profile fetch error:", err);
      }
    };

    fetchUserProfile();
  }, [authToken]);

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Medicines", path: "/products" },
    { label: "Healthcare", path: "/healthcare" },
    { label: "Categories", path: "/categories" },
    { label: "Offers", path: "/offers" },
    { label: "Contact", path: "/contact" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 20);
      setShowHeaderSearch(y > 180);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenu(false);
    setSearchOpen(false);
    setUserMenuOpen(false);
    syncAuthState();
  }, [location.pathname, syncAuthState]);

  useEffect(() => {
    const handleStorage = () => {
      syncAuthState();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("authChanged", handleStorage);
    window.addEventListener("addressChanged", handleStorage);
    window.addEventListener("cartChanged", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("authChanged", handleStorage);
      window.removeEventListener("addressChanged", handleStorage);
      window.removeEventListener("cartChanged", handleStorage);
    };
  }, [syncAuthState]);

  const isLoggedIn = Boolean(authToken);
  const isActive = (path) => location.pathname === path;

  // Real-time delivery location display
  const displayLocation =
    currentUser?.location ||
    savedAddress ||
    localStorage.getItem("userAddress") ||
    "Madurai, Tamil Nadu";

  const handleNavigation = (path) => {
    navigate(path);
    setMobileMenu(false);
    setSearchOpen(false);
    setUserMenuOpen(false);
  };

  const handleProtectedNavigation = (path) => {
    if (!isLoggedIn && (path === "/cart" || path === "/track-order" || path === "/wishlist" || path === "/profile")) {
      if (path === "/cart" || path === "/track-order") {
        navigate(path);
      } else {
        navigate("/login");
      }
    } else {
      navigate(path);
    }
    setMobileMenu(false);
    setSearchOpen(false);
    setUserMenuOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const keyword = searchQuery.trim();
    if (!keyword) return;

    navigate(`/products?search=${encodeURIComponent(keyword)}`);
    setSearchOpen(false);
    setMobileMenu(false);
  };

  const handleSaveLocation = async (newLoc) => {
    const loc = String(newLoc || "").trim();
    if (!loc) return;

    localStorage.setItem("userAddress", loc);
    setSavedAddress(loc);

    if (currentUser) {
      const updatedUser = { ...currentUser, location: loc };
      setCurrentUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }

    if (isLoggedIn) {
      try {
        await api.put("/users/profile", { location: loc });
      } catch (err) {
        console.error("Update DB location error:", err);
      }
    }

    window.dispatchEvent(new Event("addressChanged"));
    window.dispatchEvent(new Event("authChanged"));
    setLocationModalOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("authChanged"));

    setAuthToken("");
    setCurrentUser(null);
    setUserMenuOpen(false);
    setMobileMenu(false);

    navigate("/");
  };

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-md border-b border-emerald-100/80"
          : "bg-white border-b border-slate-100 shadow-xs"
      }`}
    >
      {/* Top Utility Bar */}
      <div className="bg-linear-to-r from-slate-900 via-emerald-950 to-slate-900 text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl 2xl:max-w-400 mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Express Pharmacy Delivery</span>
            </div>
            <span className="hidden sm:inline text-slate-500">|</span>

            {/* REAL-TIME DYNAMIC ADDRESS DISPLAY */}
            <button
              type="button"
              onClick={() => setLocationModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 text-slate-300 hover:text-white transition group text-left cursor-pointer"
            >
              <MapPin size={13} className="text-emerald-400 shrink-0 group-hover:scale-110 transition-transform" />
              <span>Deliver to:</span>
              <span className="font-bold text-emerald-300 group-hover:underline truncate max-w-56">
                {displayLocation}
              </span>
              <ChevronDown size={12} className="text-slate-400" />
            </button>
          </div>

          <div className="flex items-center gap-4 font-medium">
            <div className="hidden md:flex items-center gap-1.5 text-slate-300">
              <ShieldCheck size={13} className="text-emerald-400" />
              <span>100% Genuine Medicines</span>
            </div>
            <a
              href="tel:+919876543210"
              className="flex items-center gap-1 text-slate-200 hover:text-emerald-400 transition"
            >
              <Phone size={12} className="text-emerald-400" />
              <span>+91 98765 43210</span>
            </a>
            <button
              onClick={() => handleProtectedNavigation("/track-order")}
              className="hidden sm:inline-block text-emerald-300 hover:text-white transition font-medium"
            >
              Track Order
            </button>
          </div>
        </div>
      </div>

      {/* Main Brand & Action Bar */}
      <div className="mx-auto w-full max-w-7xl 2xl:max-w-400 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 sm:gap-6 h-16 sm:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
            <motion.div
              whileHover={{ scale: 1.08, rotate: [0, -6, 6, 0] }}
              transition={{ duration: 0.4 }}
              className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-linear-to-tr from-emerald-600 via-emerald-500 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-500/20"
            >
              <Heart className="text-white fill-white w-5 h-5 sm:w-6 sm:h-6" />
            </motion.div>

            <div className="leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl sm:text-2xl text-slate-900 tracking-tight">
                  Medi<span className="text-emerald-600">Care</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                  RX
                </span>
              </div>
              <p className="hidden sm:block text-[11px] text-slate-500 font-medium">
                Online Pharmacy & Healthcare
              </p>
            </div>
          </Link>

          {/* Desktop Search Bar with Live Autocomplete */}
          <div ref={headerSearchRef} className="hidden md:flex flex-1 max-w-xl xl:max-w-2xl mx-4 relative">
            <form onSubmit={handleSearch} className="w-full relative">
              <div className="relative flex items-center">
                <Search
                  size={18}
                  className="absolute left-4 text-emerald-600 pointer-events-none"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    if (searchQuery.trim().length >= 2 && headerSuggestions.length > 0) {
                      setShowHeaderDropdown(true);
                    }
                  }}
                  placeholder="Search medicines, healthcare devices, wellness..."
                  className="w-full pl-11 pr-24 py-2.5 sm:py-3 rounded-full bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-sm text-slate-800 placeholder:text-slate-400 border border-slate-200 focus:border-emerald-500 outline-none transition-all shadow-inner focus:shadow-md focus:ring-2 focus:ring-emerald-500/20"
                />
                {loadingHeaderSuggestions && (
                  <Loader2 className="w-4 h-4 text-emerald-600 animate-spin absolute right-24" />
                )}
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  className="absolute right-1.5 px-4 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow transition cursor-pointer"
                >
                  Search
                </motion.button>
              </div>
            </form>

            {/* Header Live Dropdown */}
            <AnimatePresence>
              {showHeaderDropdown && searchQuery.trim().length >= 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden z-50 divide-y divide-slate-100"
                >
                  <div className="px-4 py-2 bg-slate-50 flex items-center justify-between text-xs text-slate-500 font-semibold">
                    <span className="text-emerald-800 font-bold">
                      Medicines ({headerSuggestions.length})
                    </span>
                    <span className="text-[11px] text-slate-400">Click to view</span>
                  </div>

                  {loadingHeaderSuggestions && headerSuggestions.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
                      <span>Searching...</span>
                    </div>
                  ) : headerSuggestions.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500">
                      No matching medicines found for "{searchQuery}"
                    </div>
                  ) : (
                    <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
                      {headerSuggestions.map((med) => (
                        <div
                          key={med._id}
                          onClick={() => {
                            setShowHeaderDropdown(false);
                            navigate(`/products?search=${encodeURIComponent(med.name)}`);
                          }}
                          className="px-4 py-2.5 flex items-center justify-between gap-3 hover:bg-emerald-50/60 cursor-pointer transition"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                              {med.image ? (
                                <img
                                  src={getImageUrl(med.image)}
                                  alt={med.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                    e.target.nextSibling.style.display = "block";
                                  }}
                                />
                              ) : null}
                              <Pill
                                size={14}
                                className="text-emerald-600"
                                style={{ display: med.image ? "none" : "block" }}
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h5 className="text-xs font-bold text-slate-900 truncate">
                                {med.name}
                              </h5>
                              <p className="text-[10px] text-slate-400 truncate">
                                {med.brand || (typeof med.category === "object" ? med.category.name : med.category) || "Medicine"}
                              </p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-xs font-black text-emerald-700">₹{med.price}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div
                    onClick={() => {
                      setShowHeaderDropdown(false);
                      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
                    }}
                    className="px-4 py-2 bg-slate-50 hover:bg-emerald-50 text-xs font-bold text-emerald-700 flex items-center justify-between cursor-pointer transition"
                  >
                    <span>View all results for "{searchQuery}"</span>
                    <ChevronRight size={14} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
              aria-label="Toggle Search"
            >
              <Search size={20} />
            </button>

            {/* Wishlist */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleProtectedNavigation("/wishlist")}
              className="hidden sm:flex p-2.5 rounded-xl text-slate-600 hover:text-emerald-600 hover:bg-emerald-50/70 transition"
              aria-label="Wishlist"
            >
              <Heart size={20} />
            </motion.button>

            {/* Cart Button */}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => handleProtectedNavigation("/cart")}
              className="relative flex items-center gap-2 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100/70 text-emerald-700 border border-emerald-200 transition font-semibold text-sm"
              aria-label="Cart"
            >
              <ShoppingCart size={19} className="text-emerald-600" />
              <span className="hidden sm:inline text-xs font-bold">Cart</span>
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold shadow-sm"
                >
                  {cartCount}
                </motion.span>
              )}
            </motion.button>

            {/* User Profile / Auth */}
            {!isLoggedIn ? (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/login")}
                className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold shadow-sm transition"
              >
                <User size={16} />
                <span>Sign In</span>
              </motion.button>
            ) : (
              <div
                className="relative hidden sm:block"
                onMouseEnter={() => setUserMenuOpen(true)}
                onMouseLeave={() => setUserMenuOpen(false)}
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 transition"
                >
                  <div className="h-8 w-8 rounded-lg bg-linear-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center font-bold text-xs shadow-xs overflow-hidden">
                    {currentUser?.avatar ? (
                      <img
                        src={getImageUrl(currentUser.avatar)}
                        alt={currentUser.name || "User Avatar"}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = "none";
                        }}
                      />
                    ) : currentUser?.name ? (
                      currentUser.name.charAt(0).toUpperCase()
                    ) : (
                      <User size={14} />
                    )}
                  </div>
                  <div className="text-left max-w-28">
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {currentUser?.name || "My Account"}
                    </p>
                    <p className="text-[10px] text-emerald-600 font-medium truncate">
                      Verified User
                    </p>
                  </div>
                  <ChevronDown size={14} className="text-slate-400" />
                </motion.button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.18 }}
                      className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-white border border-slate-200 shadow-xl p-2 z-50"
                    >
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 mb-1.5 flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 rounded-xl bg-linear-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-sm shadow-xs overflow-hidden">
                          {currentUser?.avatar ? (
                            <img
                              src={getImageUrl(currentUser.avatar)}
                              alt={currentUser.name || "User Avatar"}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.style.display = "none";
                              }}
                            />
                          ) : currentUser?.name ? (
                            currentUser.name.charAt(0).toUpperCase()
                          ) : (
                            <User size={18} />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-sm text-slate-900 truncate">
                            {currentUser?.name || "Patient Profile"}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {currentUser?.phone || currentUser?.email || "Signed In"}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleProtectedNavigation("/profile")}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition cursor-pointer"
                      >
                        <User size={15} />
                        <span>My Account Profile</span>
                      </button>

                      <button
                        onClick={() => handleProtectedNavigation("/orders")}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition cursor-pointer"
                      >
                        <Package size={15} />
                        <span>My Orders</span>
                      </button>

                      <button
                        onClick={() => handleProtectedNavigation("/prescriptions")}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition cursor-pointer"
                      >
                        <FileText size={15} />
                        <span>My Prescriptions</span>
                      </button>

                      <button
                        onClick={() => handleProtectedNavigation("/wishlist")}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition cursor-pointer"
                      >
                        <Heart size={15} />
                        <span>Saved Medicines</span>
                      </button>

                      <div className="h-px bg-slate-100 my-1"></div>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <LogOut size={15} />
                        <span>Sign Out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenu(!mobileMenu)}
              className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenu ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Realtime Location Bar */}
        <div className="flex sm:hidden items-center justify-between py-2 border-t border-slate-100 text-xs">
          <button
            type="button"
            onClick={() => setLocationModalOpen(true)}
            className="flex items-center gap-1.5 text-slate-700 hover:text-emerald-600 font-semibold truncate"
          >
            <MapPin size={14} className="text-emerald-600 shrink-0" />
            <span>Deliver to:</span>
            <span className="text-emerald-700 underline truncate max-w-44">
              {displayLocation}
            </span>
          </button>
          <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full shrink-0">
            Express
          </span>
        </div>

        {/* Desktop Category Navigation */}
        <nav className="hidden lg:flex items-center justify-center gap-8 py-2.5 border-t border-slate-100">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path} className="relative py-1">
              <span
                className={`text-sm font-semibold transition-colors duration-200 ${
                  isActive(item.path)
                    ? "text-emerald-600"
                    : "text-slate-600 hover:text-emerald-600"
                }`}
              >
                {item.label}
              </span>
              {isActive(item.path) && (
                <motion.div
                  layoutId="activeNavTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          ))}
        </nav>
      </div>

      {/* Location Selector Modal */}
      <AnimatePresence>
        {locationModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLocationModalOpen(false)}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl bg-white p-6 shadow-2xl border border-slate-100"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <Navigation size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Select Delivery Location
                    </h3>
                    <p className="text-xs text-slate-500">
                      Enter your address or pincode for live availability
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setLocationModalOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Custom Input */}
              <div className="space-y-3 mb-5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  City or Pincode
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inputLocation}
                    onChange={(e) => setInputLocation(e.target.value)}
                    placeholder="e.g. Madurai 625020"
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleSaveLocation(inputLocation)}
                    className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
                  >
                    Save
                  </button>
                </div>
              </div>

              {/* Popular Selectable Pills */}
              <div>
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Popular Locations
                </p>
                <div className="flex flex-wrap gap-2">
                  {popularLocations.map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => handleSaveLocation(loc)}
                      className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                        displayLocation === loc
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700 font-bold"
                          : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
                      }`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;