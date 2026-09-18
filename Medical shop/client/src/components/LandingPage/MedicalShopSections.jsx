/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Pill,
  Truck,
  Lock,
  Users,
  Clock,
  Shield,
  Headphones,
  Sparkles,
  ThermometerSnowflake,
  FileCheck,
  ArrowRight,
  Layers,
  LayoutGrid,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import MedicineCard from "./MedicineCard";
import DepthCarousel from "./DepthCarousel";

const fallbackMedicines = [];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

const MedicalShopSections = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState("3d"); // "3d" | "grid"

  const categories = [
    "All",
    "Pain Relief",
    "Vitamins & Supplements",
    "Medical Devices",
    "Diabetes Care",
  ];

  const features = [
    {
      icon: Truck,
      title: "Express Doorstep Delivery",
      description: "Quick 20-30 minute dispatch across local areas with live GPS rider tracking.",
      accent: "emerald",
    },
    {
      icon: Shield,
      title: "100% Genuine Medicines",
      description: "Directly sourced from WHO-GMP certified suppliers and top pharmaceutical brands.",
      accent: "teal",
    },
    {
      icon: FileCheck,
      title: "Licensed Pharmacist Review",
      description: "Every prescription verified by registered doctors and qualified pharmacists.",
      accent: "cyan",
    },
    {
      icon: ThermometerSnowflake,
      title: "Cold-Chain Integrity",
      description: "Insulin and temperature-sensitive biologicals stored strictly at 2°C to 8°C.",
      accent: "blue",
    },
    {
      icon: Lock,
      title: "Secure & Encrypted Checkout",
      description: "Bank-grade 256-bit SSL encryption with UPI, NetBanking, Cards, and Cash on Delivery.",
      accent: "emerald",
    },
    {
      icon: Headphones,
      title: "24/7 Expert Healthcare Support",
      description: "Dedicated pharmacist helpline ready to assist you with dosage and consultations.",
      accent: "teal",
    },
  ];

  const stats = [
    { number: "50,000+", label: "Patients Served", subtext: "Across major pin codes" },
    { number: "15,000+", label: "Authentic Products", subtext: "Medicines & wellness essentials" },
    { number: "99.8%", label: "On-Time Delivery", subtext: "Tracked dispatch in real-time" },
    { number: "4.9 / 5.0", label: "Patient Rating", subtext: "Verified Google & Practo reviews" },
  ];

  useEffect(() => {
    const fetchMedicinesAndWishlist = async () => {
      try {
        setLoading(true);
        const medicinePromise = API.get("/medicines?limit=12");
        const token = localStorage.getItem("token");

        const requests = [medicinePromise];
        if (token) {
          requests.push(API.get("/auth/me"));
        }

        const responses = await Promise.all(requests);
        const medicineRes = responses[0];
        const profileRes = responses[1];

        const fetchedItems = medicineRes?.data?.medicines;
        if (Array.isArray(fetchedItems)) {
          setProducts(fetchedItems);
        } else {
          setProducts([]);
        }

        if (profileRes) {
          const profile = profileRes?.data?.profile || profileRes?.data?.user || {};
          const wishlist = profile?.wishlist || [];
          const ids = wishlist.map((item) =>
            typeof item === "object" ? item._id : item
          );
          setWishlistIds(ids);
        } else {
          setWishlistIds([]);
        }
      } catch (error) {
        console.error("Error fetching medicines/wishlist:", error);
        setProducts([]);
        setWishlistIds([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMedicinesAndWishlist();
  }, []);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "All") return products;
    return products.filter((p) =>
      p.category?.toLowerCase().includes(selectedCategory.toLowerCase())
    );
  }, [products, selectedCategory]);

  const handleAddToCart = (medicine) => {
    const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingItemIndex = existingCart.findIndex(
      (item) => item._id === medicine._id
    );

    if (existingItemIndex !== -1) {
      existingCart[existingItemIndex].quantity = (existingCart[existingItemIndex].quantity || 1) + 1;
    } else {
      existingCart.push({
        _id: medicine._id,
        name: medicine.name,
        price: medicine.price,
        image: medicine.image || "",
        category: medicine.category || "",
        description: medicine.description || "",
        prescriptionRequired: medicine.prescriptionRequired || false,
        stock: medicine.stock || 0,
        quantity: 1,
      });
    }

    localStorage.setItem("cart", JSON.stringify(existingCart));
    window.dispatchEvent(new Event("cartChanged"));
    navigate("/cart");
  };

  const handleWishlistToggle = async (medicine) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const isWishlisted = wishlistIds.includes(medicine._id);
      if (isWishlisted) {
        await API.delete(`/wishlist/${medicine._id}`);
        setWishlistIds((prev) => prev.filter((id) => id !== medicine._id));
      } else {
        await API.post("/wishlist", { medicineId: medicine._id });
        setWishlistIds((prev) => [...prev, medicine._id]);
      }
    } catch (error) {
      console.error("Wishlist update error:", error);
    }
  };

  return (
    <>
      {/* Popular Medicines Section */}
      <section className="relative overflow-hidden bg-slate-50/50 py-16 sm:py-20 lg:py-24 border-t border-slate-200/70">
        <div className="relative z-10 mx-auto w-full max-w-7xl 2xl:max-w-400 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-6"
          >
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/40 bg-emerald-50 px-3.5 py-1 text-xs font-bold text-emerald-800 mb-3">
                <Pill size={14} className="text-emerald-600" />
                Featured Health Essentials
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
                Top Prescriptions & Wellness
              </h2>
              <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-xl">
                Verified clinical formulations, supplements, and diagnostics with guaranteed freshness and safe packaging.
              </p>
            </div>

            {/* Filter and View Mode Switcher */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              {/* Category Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none max-w-full">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? "bg-slate-900 text-white shadow-md shadow-slate-900/15"
                        : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* 3D vs Grid Mode Toggle */}
              <div className="flex items-center p-1 rounded-xl bg-slate-200/80 border border-slate-300/60 shrink-0">
                <button
                  onClick={() => setViewMode("3d")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    viewMode === "3d"
                      ? "bg-white text-emerald-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                  title="3D Depth Deck View"
                >
                  <Layers size={14} />
                  <span>3D Deck</span>
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    viewMode === "grid"
                      ? "bg-white text-emerald-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid size={14} />
                  <span>Grid</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Product Showcase (3D Depth Carousel vs Standard Grid) */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-slate-200 bg-white p-4 animate-pulse h-80 flex flex-col justify-between"
                >
                  <div className="h-40 bg-slate-100 rounded-xl mb-4" />
                  <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-slate-100 rounded w-1/2 mb-4" />
                  <div className="h-10 bg-slate-100 rounded-xl" />
                </div>
              ))}
            </div>
          ) : viewMode === "3d" ? (
            /* 3D Perspective Depth Deck Carousel */
            <div className="relative w-full h-[520px] sm:h-[560px] py-2 flex items-center justify-center">
              <DepthCarousel
                items={filteredProducts}
                depth={220}
                spread={95}
                tilt={22}
                tiltDirection="right"
                perspective={1400}
                visibleCards={4}
                falloff={0.2}
                blur={6}
                autoplay={true}
                autoplayDelay={3500}
                loop={true}
                cardWidth={310}
                cardHeight={440}
                radius={24}
                tint="#059669"
                duration={700}
                ease="power3.out"
                showControls={true}
                showIndicators={true}
                onAddToCart={handleAddToCart}
                onWishlistToggle={handleWishlistToggle}
                wishlistIds={wishlistIds}
              />
            </div>
          ) : (
            /* Grid View */
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6"
            >
              {filteredProducts.slice(0, 8).map((product) => (
                <motion.div key={product._id} variants={itemVariants}>
                  <MedicineCard
                    medicine={product}
                    onAddToCart={handleAddToCart}
                    onWishlistToggle={handleWishlistToggle}
                    isWishlisted={wishlistIds.includes(product._id)}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Bottom Link to Full Catalog */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="mt-12 flex justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/products")}
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-700 border-2 border-emerald-500 font-bold text-sm shadow-md transition cursor-pointer"
            >
              <span>Explore All 15,000+ Healthcare Products</span>
              <ArrowRight size={16} />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Why Choose MediCare Section */}
      <section className="relative overflow-hidden bg-white py-16 sm:py-20 lg:py-24 border-t border-slate-200/70">
        <div className="relative z-10 mx-auto w-full max-w-7xl 2xl:max-w-400 px-4 sm:px-6 lg:px-8">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto mb-14"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/40 bg-emerald-50 px-3.5 py-1 text-xs font-bold text-emerald-800 mb-3">
              <Shield size={14} className="text-emerald-600" />
              Clinical Excellence & Reliability
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Why 50,000+ Families Choose MediCare
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600">
              We combine accredited pharmaceutical science with rapid home delivery logistics to bring genuine care to your doorstep.
            </p>
          </motion.div>

          {/* 6 Core Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08, duration: 0.4 }}
                  className="rounded-3xl border border-slate-200/90 bg-slate-50/50 hover:bg-white p-7 transition-all duration-300 hover:shadow-xl hover:border-emerald-300 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100/70 text-emerald-700 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition duration-300 shadow-xs">
                    <Icon size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {feat.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {feat.description}
                  </p>
                </motion.div>
              );
            })}
          </div>

          {/* Stats Bar */}
          <div className="mt-16 rounded-3xl bg-linear-to-r from-slate-900 via-slate-800 to-emerald-950 p-8 sm:p-12 text-white shadow-xl shadow-slate-950/10">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center divide-y sm:divide-y-0 sm:divide-x divide-slate-800">
              {stats.map((st, i) => (
                <div key={i} className={i !== 0 ? "pt-6 sm:pt-0 sm:pl-6" : ""}>
                  <p className="text-3xl sm:text-4xl font-extrabold text-emerald-400">
                    {st.number}
                  </p>
                  <p className="text-sm sm:text-base font-bold text-white mt-1">
                    {st.label}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {st.subtext}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default MedicalShopSections;