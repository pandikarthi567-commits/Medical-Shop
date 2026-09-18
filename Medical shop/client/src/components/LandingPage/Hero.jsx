/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  FileText,
  ArrowRight,
  Pill,
  Heart,
  Zap,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Clock,
  Sparkles,
  Activity,
  Award,
  Loader2,
  ChevronRight,
  Tag,
  Package,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { getImageUrl } from "../../utils/imageUrl";

const Hero = () => {
  const navigate = useNavigate();
  const searchContainerRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const quickSearches = [
    "Paracetamol",
    "Vitamin C",
    "Diabetes Care",
    "BP Monitor",
    "Pain Relief",
  ];

  // Debounced Live Autocomplete Search when typing 2, 3, or 4+ characters
  useEffect(() => {
    const query = searchTerm.trim();

    if (query.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      setLoadingSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoadingSuggestions(true);
        const { data } = await api.get(
          `/medicines?search=${encodeURIComponent(query)}&limit=6`
        );

        const results = data?.medicines || [];
        setSuggestions(results);
        setShowDropdown(true);
        setSelectedIndex(-1);
      } catch (err) {
        console.error("Autocomplete search error:", err);
        setSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 220);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (keywordToSearch) => {
    const query = (keywordToSearch !== undefined ? keywordToSearch : searchTerm).trim();
    setShowDropdown(false);
    if (query) {
      navigate(`/products?search=${encodeURIComponent(query)}`);
    } else {
      navigate("/products");
    }
  };

  const handleSelectMedicine = (med) => {
    setShowDropdown(false);
    if (med?.name) {
      navigate(`/products?search=${encodeURIComponent(med.name)}`);
    }
  };

  const handleKeyDown = (e) => {
    if (!showDropdown || suggestions.length === 0) {
      if (e.key === "Enter") handleSearch();
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        handleSelectMedicine(suggestions[selectedIndex]);
      } else {
        handleSearch();
      }
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  return (
    <section className="relative overflow-hidden bg-linear-to-b from-emerald-50/60 via-slate-50/50 to-white pt-6 sm:pt-10 lg:pt-14 pb-16 sm:pb-20 lg:pb-28">
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-0 left-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-emerald-300/20 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute top-1/3 right-10 w-80 sm:w-112 h-80 sm:h-112 bg-teal-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-64 h-64 bg-cyan-200/20 rounded-full blur-3xl pointer-events-none" />

      {/* Subtle Grid Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(#059669 1px, transparent 1px), radial-gradient(#059669 1px, #ffffff 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative max-w-7xl 2xl:max-w-400 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-8 xl:gap-12 items-center">
          {/* Left Column - Main Copy & Search Bar (Col 7) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: "easeOut" }}
            className="lg:col-span-7 flex flex-col justify-center"
          >
            {/* Trust Pill Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 self-start rounded-full bg-emerald-100/80 border border-emerald-300/60 px-3.5 py-1.5 mb-6 text-xs sm:text-sm font-semibold text-emerald-800 shadow-xs"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Licensed Chemist & Govt. Certified Pharmacy</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            </motion.div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl xl:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Genuine Medicines,{" "}
              <span className="bg-linear-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Delivered Faster
              </span>{" "}
              To Your Doorstep.
            </h1>

            {/* Description */}
            <p className="mt-4 sm:mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl font-normal">
              Order authentic prescription drugs, daily vitamins, baby essentials, and surgical devices. Verified by licensed pharmacists with 24/7 care.
            </p>

            {/* Integrated Search Box with Instant Live Autocomplete Dropdown */}
            <div ref={searchContainerRef} className="relative mt-7 sm:mt-8 max-w-2xl z-30">
              <div className="relative flex items-center rounded-2xl bg-white p-2 shadow-lg shadow-emerald-950/5 border border-slate-200/90 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/15 transition-all">
                <Search className="w-5 h-5 ml-3 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Search medicines, ailments, devices, or brands..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => {
                    if (searchTerm.trim().length >= 2 && suggestions.length > 0) {
                      setShowDropdown(true);
                    }
                  }}
                  onKeyDown={handleKeyDown}
                  className="w-full px-3 py-2 text-sm sm:text-base outline-none text-slate-800 placeholder:text-slate-400 bg-transparent min-w-0"
                />

                {loadingSuggestions && (
                  <Loader2 className="w-4 h-4 text-emerald-600 animate-spin mr-2 shrink-0" />
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSearch()}
                  className="px-5 sm:px-7 py-3 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold text-sm shadow-md transition shrink-0 flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Search</span>
                  <ArrowRight size={15} />
                </motion.button>
              </div>

              {/* Floating Live Autocomplete Dropdown */}
              <AnimatePresence>
                {showDropdown && searchTerm.trim().length >= 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.98 }}
                    transition={{ duration: 0.18 }}
                    className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden z-50 divide-y divide-slate-100"
                  >
                    {/* Header */}
                    <div className="px-4 py-2.5 bg-slate-50 flex items-center justify-between text-xs text-slate-500 font-semibold">
                      <div className="flex items-center gap-1.5 text-emerald-800">
                        <Pill size={13} className="text-emerald-600" />
                        <span>Matching Medicines ({suggestions.length})</span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        Press ↑ ↓ to navigate, ↵ to select
                      </span>
                    </div>

                    {/* Results List */}
                    {loadingSuggestions && suggestions.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
                        <span>Searching authentic medicines...</span>
                      </div>
                    ) : suggestions.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-500">
                        <p className="font-semibold text-slate-700">
                          No direct medicine matches found for "{searchTerm}"
                        </p>
                        <p className="mt-1 text-[11px] text-slate-400">
                          Try searching by generic name (e.g. Paracetamol, Dolo, Cetirizine)
                        </p>
                      </div>
                    ) : (
                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-50 py-1">
                        {suggestions.map((med, index) => {
                          const isSelected = selectedIndex === index;
                          const hasDiscount =
                            Number(med?.oldPrice) > Number(med?.price);
                          const isOutOfStock = Number(med?.stock || 0) <= 0;

                          return (
                            <div
                              key={med._id || index}
                              onClick={() => handleSelectMedicine(med)}
                              onMouseEnter={() => setSelectedIndex(index)}
                              className={`px-4 py-3 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                                isSelected
                                  ? "bg-emerald-50/80 text-emerald-950"
                                  : "hover:bg-slate-50/90 text-slate-800"
                              }`}
                            >
                              {/* Left Thumbnail & Info */}
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200/80 overflow-hidden flex items-center justify-center shrink-0">
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
                                    size={18}
                                    className="text-emerald-600"
                                    style={{
                                      display: med.image ? "none" : "block",
                                    }}
                                  />
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                                      {med.name}
                                    </h4>
                                    {med.category && (
                                      <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-[10px] font-semibold text-emerald-700 truncate">
                                        {typeof med.category === "object"
                                          ? med.category.name
                                          : med.category}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                    {med.brand || med.description || "Verified Pharmacy Item"}
                                  </p>
                                </div>
                              </div>

                              {/* Right Price & Stock */}
                              <div className="text-right shrink-0">
                                <div className="flex items-baseline gap-1.5 justify-end">
                                  <span className="text-xs sm:text-sm font-extrabold text-emerald-700">
                                    ₹{med.price}
                                  </span>
                                  {hasDiscount && (
                                    <span className="text-[10px] text-slate-400 line-through">
                                      ₹{med.oldPrice}
                                    </span>
                                  )}
                                </div>

                                <span
                                  className={`inline-block text-[10px] font-bold ${
                                    isOutOfStock
                                      ? "text-rose-500"
                                      : "text-emerald-600"
                                  }`}
                                >
                                  {isOutOfStock ? "Out of Stock" : "In Stock"}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Footer - Search all */}
                    <div
                      onClick={() => handleSearch()}
                      className="px-4 py-2.5 bg-slate-50 hover:bg-emerald-50 text-xs font-bold text-emerald-700 flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <span>
                        View all search results for "
                        <strong className="text-slate-900">{searchTerm}</strong>"
                      </span>
                      <ChevronRight size={14} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Quick search tags */}
              <div className="flex items-center gap-2 mt-3 flex-wrap text-xs text-slate-500">
                <span className="font-semibold text-slate-700">Popular:</span>
                {quickSearches.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setSearchTerm(tag);
                      handleSearch(tag);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-100/90 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 transition border border-slate-200/60 font-medium cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-4 max-w-xl">
              <Link to="/products" className="w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20 transition cursor-pointer"
                >
                  <Pill size={18} className="text-emerald-400" />
                  <span>Order Medicines</span>
                  <ArrowRight size={16} />
                </motion.button>
              </Link>

              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/prescription")}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-emerald-50/50 border-2 border-emerald-500/40 text-emerald-800 font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
              >
                <FileText size={18} className="text-emerald-600" />
                <span>Upload Prescription</span>
              </motion.button>
            </div>

            {/* Quick Guarantees Bar */}
            <div className="mt-8 pt-6 border-t border-slate-200/80 grid grid-cols-3 gap-2 sm:gap-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
                  <ShieldCheck size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800">100% Genuine</p>
                  <p className="text-[11px] text-slate-500 truncate">From top labs</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-teal-100 text-teal-700 shrink-0">
                  <Truck size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800">Super Fast</p>
                  <p className="text-[11px] text-slate-500 truncate">Doorstep delivery</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-cyan-100 text-cyan-700 shrink-0">
                  <Clock size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800">24/7 Service</p>
                  <p className="text-[11px] text-slate-500 truncate">Always open</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Visual Real-World Healthcare Showcase (Col 5) */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="lg:col-span-5 relative flex items-center justify-center min-h-96 sm:min-h-112 lg:min-h-128"
          >
            {/* Background Medical Shield Graphic */}
            <div className="relative w-full max-w-md aspect-square rounded-3xl bg-linear-to-br from-emerald-500/10 via-teal-400/10 to-cyan-500/10 border border-emerald-200/50 p-6 flex flex-col justify-between shadow-2xl backdrop-blur-xs">
              {/* Floating Pulse Rings */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-64 rounded-full border border-emerald-400/20 animate-ping opacity-30" />
                <div className="absolute w-80 h-80 rounded-full border border-teal-400/20" />
              </div>

              {/* Floating Widget 1: Live Patient Vitals with ECG line */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10 self-start bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-slate-100 max-w-[240px]"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-red-50 text-red-500">
                      <Heart size={16} className="animate-pulse" />
                    </span>
                    <span className="text-xs font-bold text-slate-800">Vitals Monitor</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Normal
                  </span>
                </div>

                <div className="flex items-baseline justify-between text-slate-700 mb-2">
                  <span className="text-xl font-extrabold text-slate-900">74 <span className="text-xs font-normal text-slate-500">BPM</span></span>
                  <span className="text-xs font-semibold text-slate-600">BP: 120/80</span>
                </div>

                {/* Animated ECG Waveform */}
                <svg className="w-full h-8 stroke-emerald-500 fill-none" viewBox="0 0 200 40">
                  <motion.path
                    d="M 0,20 L 40,20 L 50,5 L 60,35 L 70,10 L 80,25 L 90,20 L 200,20"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                </svg>
              </motion.div>

              {/* Central Levitating Medicine Emblem */}
              <div className="relative z-0 my-auto flex flex-col items-center justify-center">
                <motion.div
                  animate={{
                    y: [-8, 8, -8],
                    rotate: [0, 4, -4, 0],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl bg-linear-to-tr from-emerald-500 via-teal-500 to-cyan-500 p-0.5 shadow-2xl flex items-center justify-center"
                >
                  <div className="w-full h-full bg-white rounded-[22px] flex flex-col items-center justify-center p-4">
                    <Pill className="w-14 h-14 text-emerald-600 mb-2 transform -rotate-45" />
                    <span className="text-xs font-bold text-slate-800">MediCare RX</span>
                    <span className="text-[10px] text-emerald-600 font-semibold">100% Quality Tested</span>
                  </div>
                </motion.div>
              </div>

              {/* Floating Widget 2: Live Dispatch Tracking */}
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="relative z-10 self-end bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-slate-100 max-w-[260px]"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="text-xs font-bold text-slate-800">Express Delivery Active</span>
                </div>
                <p className="text-xs text-slate-600 mb-2">
                  Driver dispatched • ETA: <strong className="text-emerald-700 font-bold">14 mins</strong>
                </p>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <motion.div
                    className="bg-emerald-500 h-full rounded-full"
                    initial={{ width: "20%" }}
                    animate={{ width: "80%" }}
                    transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
                  />
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;