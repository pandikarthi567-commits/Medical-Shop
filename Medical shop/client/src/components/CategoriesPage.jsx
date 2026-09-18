/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable no-unused-vars */
import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Grid3X3,
  ChevronRight,
  Heart,
  ShoppingCart,
  Star,
  Sparkles,
  ShieldCheck,
  Truck,
  BadgePercent,
  SlidersHorizontal,
  LayoutGrid,
  Pill,
  Baby,
  HeartPulse,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { getImageUrl } from "../utils/imageUrl";

const iconMap = {
  Grid3X3,
  Heart,
  Sparkles,
  ShieldCheck,
  LayoutGrid,
  Pill,
  Baby,
  HeartPulse,
};

const pageVariants = {
  initial: { opacity: 0, y: 24, scale: 0.985 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    y: -18,
    scale: 0.985,
    transition: { duration: 0.3, ease: "easeInOut" },
  },
};

const cardVariants = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -18, scale: 0.96 },
};

const safeText = (value) => (typeof value === "string" ? value : "");

const CategoryCard = ({ item, navigate }) => {
  const Icon = iconMap[item.icon] || Pill;
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      layout
      whileHover={{ y: -6 }}
      transition={{ duration: 0.22 }}
      className="group relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-2xs hover:shadow-xl transition-all"
    >
      <div
        className={`absolute inset-x-0 top-0 h-1.5 bg-linear-to-r ${
          item.color || "from-emerald-600 to-teal-600"
        }`}
      />

      <div className="p-4 sm:p-5 lg:p-6 flex flex-col justify-between h-full">
        <div>
          <div className="flex items-start justify-between gap-3">
            <div
              className={`inline-flex h-12 w-12 sm:h-13 sm:w-13 rounded-2xl bg-linear-to-r ${
                item.color || "from-emerald-600 to-teal-600"
              } text-white items-center justify-center shadow-md shrink-0`}
            >
              <Icon size={22} />
            </div>

            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-[11px] sm:text-xs font-bold uppercase tracking-wider ${
                item.inStockCount > 0 || item.highlight === "In Stock"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-slate-100 text-slate-600 border border-slate-200"
              }`}
            >
              {item.highlight || (item.itemCount > 0 ? "In Stock" : "Limited")}
            </span>
          </div>

          <div className="mt-4 flex items-center justify-center rounded-2xl bg-linear-to-br from-slate-50 to-emerald-50/50 p-4 min-h-36 sm:min-h-40 border border-slate-100">
            {item.image && !imgError && item.image !== "/images/healthcare.png" ? (
              <img
                src={getImageUrl(item.image)}
                alt={item.title || "Category"}
                onError={() => setImgError(true)}
                className="h-24 w-24 sm:h-28 sm:w-28 object-contain transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-emerald-600 gap-2 py-4">
                <Pill size={40} className="text-emerald-500 opacity-90" />
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Verified Pharmacy
                </span>
              </div>
            )}
          </div>

          <div className="mt-4">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 truncate">
              {item.title || "Category"}
            </h3>

            <p className="mt-1.5 text-xs sm:text-sm text-slate-500 line-clamp-2 leading-relaxed">
              {item.description ||
                `Explore authentic ${item.title} medicines and health essentials.`}
            </p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
          <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
            {item.itemCount || 0} {item.itemCount === 1 ? "item" : "items"}
          </span>

          <button
            onClick={() => {
              navigate(
                `/products?category=${encodeURIComponent(item.title || "")}`
              );
            }}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-700 group-hover:text-emerald-600 transition-colors cursor-pointer"
          >
            Explore
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const FeaturedProductCard = ({ item, navigate }) => {
  return (
    <motion.div
      layout
      whileHover={{ y: -6 }}
      transition={{ duration: 0.22 }}
      className="group rounded-2xl border border-emerald-100 bg-white shadow-sm hover:shadow-lg overflow-hidden"
    >
      <div className="relative p-4 sm:p-5">
        <div className="absolute top-3 left-3 z-10">
          <span className="inline-flex rounded-full bg-red-50 text-red-500 px-2.5 py-1 text-[11px] sm:text-xs font-semibold">
            {item.badge || "Featured"}
          </span>
        </div>

        <button
          className="absolute top-3 right-3 z-10 h-9 w-9 rounded-full bg-white/90 border border-slate-200 flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-colors"
          aria-label="Add to wishlist"
        >
          <Heart size={18} />
        </button>

        <div className="aspect-square rounded-2xl bg-linear-to-br from-sky-50 to-emerald-50 flex items-center justify-center p-4 sm:p-5">
          <img
            src={item.image || "/images/healthcare.png"}
            alt={item.name || "Featured product"}
            className="h-24 w-24 sm:h-28 sm:w-28 object-contain transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </div>

      <div className="px-4 sm:px-5 pb-4 sm:pb-5">
        <p className="text-xs sm:text-sm text-emerald-600 font-medium mb-1">
          {item.category || "General"}
        </p>

        <h3 className="text-sm sm:text-base font-semibold text-slate-900 line-clamp-2 min-h-11 sm:min-h-12">
          {item.name || "Unnamed product"}
        </h3>

        <div className="flex items-center gap-1 mt-2">
          <Star size={15} className="fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium text-slate-700">
            {item.rating ?? 0}
          </span>
          <span className="text-xs text-slate-400">
            ({item.reviewCount || 0})
          </span>
        </div>

        <div className="flex items-end gap-2 mt-3">
          <span className="text-lg sm:text-xl font-bold text-slate-900">
            ₹{item.price ?? 0}
          </span>
          {item.oldPrice ? (
            <span className="text-sm text-slate-400 line-through">
              ₹{item.oldPrice}
            </span>
          ) : null}
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => navigate(`/product/${item._id}`)}
            className="flex-1 h-11 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            View
          </button>

          <button
            disabled={!item.inStock}
            className="flex-1 h-11 rounded-xl bg-linear-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <ShoppingCart size={16} />
            Add
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const CategoriesPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const initialSearch = searchParams.get("search") || "";

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [errorCategories, setErrorCategories] = useState("");
  const [errorFeatured, setErrorFeatured] = useState("");

  const filteredCategories = useMemo(() => {
    const keyword = safeText(searchTerm).toLowerCase().trim();

    if (!keyword) return categories;

    return categories.filter((item) => {
      const title = safeText(item?.title).toLowerCase();
      const description = safeText(item?.description).toLowerCase();
      return title.includes(keyword) || description.includes(keyword);
    });
  }, [categories, searchTerm]);

  const fetchCategories = async (searchValue = "") => {
    try {
      setLoadingCategories(true);
      setErrorCategories("");

      const params = {};
      if (safeText(searchValue).trim()) {
        params.search = safeText(searchValue).trim();
      }

      const response = await API.get("/medicines/categories/summary", { params });
      const data = response.data;

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch categories");
      }

      const normalizedCategories = (data.categories || []).map((item, index) => ({
        id:
          item.id ||
          item._id ||
          item.slug ||
          item.title ||
          item.name ||
          `category-${index}`,
        title: item.title || item.name || "Untitled Category",
        description: item.description || "",
        image: item.image || item.iconImage || "/images/healthcare.png",
        icon: item.icon || "Grid3X3",
        color: item.color || "from-emerald-500 to-teal-500",
        highlight: item.highlight || "Featured",
        itemCount: Number(item.itemCount || item.count || 0),
        slug:
          item.slug ||
          safeText(item.title || item.name)
            .toLowerCase()
            .replace(/\s+/g, "-"),
      }));

      setCategories(normalizedCategories);
    } catch (error) {
      setErrorCategories(error.response?.data?.message || error.message || "Failed to load categories");
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchFeaturedProducts = async () => {
    try {
      setLoadingFeatured(true);
      setErrorFeatured("");

      const response = await API.get("/medicines/featured/list");
      const data = response.data;

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch featured products");
      }

      setFeaturedProducts(data.medicines || []);
    } catch (error) {
      if (error.response?.status === 404) {
        setFeaturedProducts([]);
        setErrorFeatured("Featured products endpoint not found");
        return;
      }
      setErrorFeatured(error.response?.data?.message || error.message || "Failed to load featured products");
      setFeaturedProducts([]);
    } finally {
      setLoadingFeatured(false);
    }
  };

  useEffect(() => {
    fetchCategories(initialSearch);
    fetchFeaturedProducts();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();

    const params = new URLSearchParams(location.search);

    if (safeText(searchTerm).trim()) {
      params.set("search", safeText(searchTerm).trim());
    } else {
      params.delete("search");
    }

    const queryString = params.toString();
    navigate(queryString ? `/categories?${queryString}` : "/categories");
    fetchCategories(searchTerm);
  };

  const resetSearch = () => {
    setSearchTerm("");
    navigate("/categories");
    fetchCategories("");
  };

  return (
    <motion.section
      key={location.pathname + location.search}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-slate-50/60 py-8 sm:py-10 lg:py-12"
    >
      <div className="max-w-7xl 2xl:max-w-400 mx-auto px-4 sm:px-5 md:px-6">
        <div className="relative overflow-hidden rounded-3xl sm:rounded-4xl bg-linear-to-r from-blue-600 via-cyan-500 to-emerald-500 text-white p-5 sm:p-7 md:p-8 lg:p-10 shadow-xl">
          <div className="absolute inset-0 opacity-15">
            <div
              className="w-full h-full"
              style={{
                backgroundImage:
                  "radial-gradient(circle, rgba(255,255,255,.35) 1px, transparent 1px)",
                backgroundSize: "32px 32px",
              }}
            />
          </div>

          <div className="relative grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/20 text-xs sm:text-sm font-medium mb-4">
                <Grid3X3 size={16} />
                Explore by Category
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl xl:text-5xl font-bold leading-tight">
                Discover Health Categories
                <span className="block text-cyan-50/95">
                  Designed for Every Need
                </span>
              </h1>

              <p className="mt-3 sm:mt-4 text-sm sm:text-base md:text-lg text-white/90 max-w-2xl">
                Browse medicine, healthcare, devices, baby care, personal care,
                and more with a fully responsive categories experience.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
                <div className="rounded-2xl bg-white/10 border border-white/15 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={18} className="shrink-0" />
                    <span className="text-sm font-medium">Trusted Brands</span>
                  </div>
                </div>
                <div className="rounded-2xl bg-white/10 border border-white/15 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Truck size={18} className="shrink-0" />
                    <span className="text-sm font-medium">Fast Delivery</span>
                  </div>
                </div>
                <div className="rounded-2xl bg-white/10 border border-white/15 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <BadgePercent size={18} className="shrink-0" />
                    <span className="text-sm font-medium">Best Offers</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative h-62.5 sm:h-77.5 md:h-87.5 lg:h-100">
              <motion.div
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 5, repeat: Infinity }}
                className="absolute top-4 left-2 sm:left-4 bg-white text-slate-800 rounded-2xl p-4 shadow-xl w-45 sm:w-55"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={18} className="text-cyan-600" />
                  <span className="font-semibold text-sm sm:text-base">
                    Smart Discovery
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500">
                  Browse care collections in one clean view.
                </p>
              </motion.div>

              <motion.div
                animate={{ y: [10, -10, 10] }}
                transition={{ duration: 5, repeat: Infinity }}
                className="absolute bottom-4 right-2 sm:right-4 bg-white text-slate-800 rounded-2xl p-4 shadow-xl w-47.5 sm:w-57.5"
              >
                <div className="flex items-center gap-2 mb-2">
                  <BadgePercent size={18} className="text-emerald-600" />
                  <span className="font-semibold text-sm sm:text-base">
                    Category Offers
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500">
                  Find top deals and curated product types.
                </p>
              </motion.div>

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-40 w-40 sm:h-52 sm:w-52 md:h-60 md:w-60 rounded-full bg-white/20 border border-white/20 backdrop-blur-md flex items-center justify-center shadow-2xl">
                  <Grid3X3 className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/70 bg-white/80 backdrop-blur-md shadow-sm p-4 sm:p-5 mt-6 sm:mt-8">
          <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
            <form
              onSubmit={handleSearchSubmit}
              className="flex-1 flex flex-col sm:flex-row gap-3"
            >
              <div className="flex-1 flex items-center rounded-2xl border border-emerald-100 bg-slate-50 px-4 h-12 sm:h-13">
                <Search size={18} className="text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search categories, care types, essentials..."
                  className="ml-2 w-full bg-transparent outline-none text-sm sm:text-base"
                />
              </div>

              <button
                type="submit"
                className="h-12 sm:h-13 px-5 sm:px-6 rounded-2xl bg-linear-to-r from-emerald-500 to-teal-500 text-white font-semibold text-sm sm:text-base"
              >
                Search
              </button>
            </form>

            <button
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="lg:hidden h-12 px-4 rounded-2xl border border-emerald-200 bg-white text-slate-700 flex items-center justify-center gap-2 font-medium"
            >
              <SlidersHorizontal size={18} />
              Quick Actions
            </button>

            <div className="hidden lg:flex items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-50 border border-emerald-100 px-4 h-12 text-sm text-slate-600">
                <span>Total Categories:</span>
                <span className="font-semibold text-slate-900">
                  {filteredCategories.length}
                </span>
              </div>

              <button
                onClick={() => navigate("/products")}
                className="h-12 px-5 rounded-2xl border border-emerald-200 bg-white text-slate-700 font-medium hover:bg-emerald-50 transition-colors"
              >
                View All Products
              </button>
            </div>
          </div>

          <AnimatePresence>
            {mobileSearchOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="lg:hidden overflow-hidden"
              >
                <div className="pt-3 flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 h-12 rounded-2xl border border-emerald-100 bg-slate-50 px-4 flex items-center text-sm text-slate-600">
                    Total Categories:
                    <span className="ml-2 font-semibold text-slate-900">
                      {filteredCategories.length}
                    </span>
                  </div>

                  <button
                    onClick={() => navigate("/products")}
                    className="h-12 px-5 rounded-2xl border border-emerald-200 bg-white text-slate-700 font-medium"
                  >
                    View All Products
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-8 sm:mt-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-5 sm:mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-slate-900">
                Popular Categories
              </h2>
              <p className="mt-1 text-sm sm:text-base text-slate-500">
                Responsive category cards with smooth page transition support.
              </p>
            </div>

            <button
              onClick={resetSearch}
              className="w-full sm:w-auto h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Reset Search
            </button>
          </div>

          {loadingCategories ? (
            <div className="rounded-3xl border border-dashed border-emerald-200 bg-white p-8 sm:p-10 text-center">
              <h3 className="text-lg sm:text-xl font-semibold text-slate-900">
                Loading categories...
              </h3>
            </div>
          ) : errorCategories ? (
            <div className="rounded-3xl border border-dashed border-red-200 bg-white p-8 sm:p-10 text-center">
              <h3 className="text-lg sm:text-xl font-semibold text-slate-900">
                Failed to load categories
              </h3>
              <p className="mt-2 text-sm sm:text-base text-slate-500 max-w-md mx-auto">
                {errorCategories}
              </p>
            </div>
          ) : filteredCategories.length > 0 ? (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-5 xl:gap-6"
            >
              <AnimatePresence mode="popLayout">
                {filteredCategories.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    variants={cardVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.25 }}
                  >
                    <CategoryCard item={item} navigate={navigate} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="rounded-3xl border border-dashed border-emerald-200 bg-white p-8 sm:p-10 text-center">
              <h3 className="text-lg sm:text-xl font-semibold text-slate-900">
                No categories found
              </h3>
              <p className="mt-2 text-sm sm:text-base text-slate-500 max-w-md mx-auto">
                Try a different search term to explore category collections.
              </p>
              <button
                onClick={resetSearch}
                className="mt-5 px-5 py-3 rounded-2xl bg-linear-to-r from-emerald-500 to-teal-500 text-white font-semibold"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>

        <div className="mt-10 sm:mt-12 rounded-[28px] border border-emerald-100 bg-white shadow-sm p-5 sm:p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-slate-900">
                Featured Essentials
              </h2>
              <p className="mt-1 text-sm sm:text-base text-slate-500">
                Popular picks from across top categories.
              </p>
            </div>

            <button
              onClick={() => navigate("/offers")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-linear-to-r from-blue-600 to-emerald-500 text-white font-semibold"
            >
              View Offers
              <ChevronRight size={18} />
            </button>
          </div>

          {loadingFeatured ? (
            <div className="rounded-3xl border border-dashed border-emerald-200 bg-slate-50 p-8 text-center">
              <h3 className="text-lg font-semibold text-slate-900">
                Loading featured products...
              </h3>
            </div>
          ) : errorFeatured ? (
            <div className="rounded-3xl border border-dashed border-red-200 bg-slate-50 p-8 text-center">
              <h3 className="text-lg font-semibold text-slate-900">
                Failed to load featured products
              </h3>
              <p className="mt-2 text-sm text-slate-500">{errorFeatured}</p>
            </div>
          ) : featuredProducts.length > 0 ? (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5"
            >
              <AnimatePresence mode="popLayout">
                {featuredProducts.map((item, index) => (
                  <motion.div
                    key={item._id || `featured-${index}`}
                    layout
                    variants={cardVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.25 }}
                  >
                    <FeaturedProductCard item={item} navigate={navigate} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="rounded-3xl border border-dashed border-emerald-200 bg-slate-50 p-8 text-center">
              <h3 className="text-lg font-semibold text-slate-900">
                No featured products available
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Featured products are not configured yet.
              </p>
            </div>
          )}
        </div>

        <div className="mt-10 sm:mt-12 rounded-[28px] bg-linear-to-r from-slate-900 to-slate-800 text-white p-5 sm:p-6 lg:p-8 shadow-lg">
          <div className="flex flex-col lg:flex-row gap-5 lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <h3 className="text-xl sm:text-2xl font-semibold">
                Find the right healthcare products faster
              </h3>
              <p className="mt-2 text-sm sm:text-base text-slate-300">
                Use category browsing to quickly reach medicines, wellness products,
                devices, and care essentials with smooth route transitions.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <button
                onClick={() => navigate("/products")}
                className="w-full lg:w-auto px-5 py-3 rounded-2xl bg-white text-slate-900 font-semibold"
              >
                Browse Products
              </button>

              <button
                onClick={() => navigate("/healthcare")}
                className="w-full lg:w-auto px-5 py-3 rounded-2xl border border-white/20 bg-white/10 text-white font-semibold"
              >
                Healthcare Page
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default CategoriesPage;