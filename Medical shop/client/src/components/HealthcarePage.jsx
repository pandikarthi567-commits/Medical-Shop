/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable no-unused-vars */
import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  HeartPulse,
  ShieldCheck,
  Truck,
  BadgePercent,
  Star,
  Heart,
  ShoppingCart,
  SlidersHorizontal,
  X,
  ChevronRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../api/axios";

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

const formatPrice = (price) => `₹${Number(price || 0).toFixed(0)}`;

const getCategoryName = (category) => {
  if (typeof category === "string") return category;
  if (category && typeof category === "object") return category.name || "Unknown";
  return "Unknown";
};

const getCategorySlug = (category) => {
  if (typeof category === "string") return category;
  if (category && typeof category === "object") return category.slug || category.name || "unknown";
  return "unknown";
};

const HealthcareCard = ({ item, navigate }) => {
  return (
    <motion.div
      layout
      whileHover={{ y: -6 }}
      transition={{ duration: 0.22 }}
      className="group overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm hover:shadow-lg"
    >
      <div className="relative p-4 sm:p-5">
        {item.badge ? (
          <div className="absolute top-3 left-3 z-10">
            <span className="inline-flex rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-500 sm:text-xs">
              {item.badge}
            </span>
          </div>
        ) : null}

        <button
          className="absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white/90 transition-colors hover:bg-rose-50 hover:text-rose-500"
          aria-label="Add to wishlist"
        >
          <Heart size={18} />
        </button>

        <div className="flex aspect-square items-center justify-center rounded-2xl bg-linear-to-br from-emerald-50 via-white to-cyan-50 p-4 sm:p-5">
          <img
            src={item.image || "/images/healthcare.png"}
            alt={item.name}
            className="h-24 w-24 object-contain transition-transform duration-300 group-hover:scale-105 sm:h-28 sm:w-28 md:h-32 md:w-32"
          />
        </div>
      </div>

      <div className="px-4 pb-4 sm:px-5 sm:pb-5">
        <p className="mb-1 text-xs font-medium text-emerald-600 sm:text-sm">
          {typeof item.category === "object" ? item.category?.name : item.category}
        </p>

        <h3 className="min-h-11 line-clamp-2 text-sm font-semibold text-slate-900 sm:min-h-12 sm:text-base">
          {item.name}
        </h3>

        <p className="mt-1 text-xs text-slate-500 sm:text-sm">
          {item.brand || "Generic Brand"}
        </p>

        <div className="mt-2 flex items-center gap-1">
          <Star size={15} className="fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium text-slate-700">
            {Number(item.rating || 0).toFixed(1)}
          </span>
          <span className="text-xs text-slate-400">
            ({item.reviewCount || 0})
          </span>
        </div>

        <div className="mt-3 flex items-end gap-2">
          <span className="text-lg font-bold text-slate-900 sm:text-xl">
            {formatPrice(item.price)}
          </span>
          {item.oldPrice ? (
            <span className="text-sm text-slate-400 line-through">
              {formatPrice(item.oldPrice)}
            </span>
          ) : null}
        </div>

        <div className="mt-3">
          {item.inStock ? (
            <span className="text-xs font-medium text-emerald-600 sm:text-sm">
              In Stock
            </span>
          ) : (
            <span className="text-xs font-medium text-red-500 sm:text-sm">
              Out of Stock
            </span>
          )}
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => navigate(`/product/${item._id}`)}
            className="h-11 flex-1 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            View
          </button>

          <button
            disabled={!item.inStock}
            className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-linear-to-r from-emerald-500 to-teal-500 text-sm font-semibold text-white disabled:opacity-50"
          >
            <ShoppingCart size={16} />
            Add
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const FilterPanel = ({
  categories,
  selectedCategory,
  setSelectedCategory,
  sortBy,
  setSortBy,
  onlyInStock,
  setOnlyInStock,
}) => {
  return (
    <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-center gap-2">
        <SlidersHorizontal size={18} className="text-emerald-600" />
        <h3 className="font-semibold text-slate-900">Filters</h3>
      </div>

      <div className="space-y-5">
        <div>
          <h4 className="mb-3 text-sm font-semibold text-slate-800">Category</h4>
          <div className="space-y-2">
            {categories.map((item) => {
              const categoryName = getCategoryName(item);
              const categorySlug = getCategorySlug(item);

              return (
                <button
                  key={categorySlug}
                  onClick={() => setSelectedCategory(categoryName)}
                  className={`w-full rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                    selectedCategory === categoryName
                      ? "bg-emerald-100 font-medium text-emerald-700"
                      : "bg-slate-50 text-slate-700 hover:bg-emerald-50"
                  }`}
                >
                  {categoryName}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold text-slate-800">Sort By</h4>
          <div className="space-y-2">
            {[
              { label: "Latest", value: "latest" },
              { label: "Price: Low to High", value: "low" },
              { label: "Price: High to Low", value: "high" },
              { label: "Top Rated", value: "rating" },
              { label: "Name: A to Z", value: "name-asc" },
              { label: "Expiry Soon", value: "expiry" },
            ].map((item) => (
              <button
                key={item.value}
                onClick={() => setSortBy(item.value)}
                className={`w-full rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                  sortBy === item.value
                    ? "bg-emerald-100 font-medium text-emerald-700"
                    : "bg-slate-50 text-slate-700 hover:bg-emerald-50"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => setOnlyInStock(!onlyInStock)}
          className={`w-full rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
            onlyInStock
              ? "bg-emerald-100 text-emerald-700"
              : "bg-slate-50 text-slate-700 hover:bg-emerald-50"
          }`}
        >
          {onlyInStock ? "Showing In Stock Only" : "Show In Stock Only"}
        </button>
      </div>
    </div>
  );
};

const HealthcarePage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "All"
  );
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "latest");
  const [onlyInStock, setOnlyInStock] = useState(
    searchParams.get("inStock") === "true"
  );
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([{ name: "All", slug: "all" }]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const updateUrlParams = (overrides = {}) => {
    const params = new URLSearchParams(location.search);

    const next = {
      search: searchTerm.trim(),
      category: selectedCategory,
      sort: sortBy,
      inStock: onlyInStock ? "true" : "",
      ...overrides,
    };

    Object.entries(next).forEach(([key, value]) => {
      if (!value || value === "All" || value === "latest" || value === "false") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    const queryString = params.toString();
    navigate(queryString ? `/healthcare?${queryString}` : "/healthcare");
  };

  const fetchCategories = async () => {
    try {
      const res = await API.get("/medicines/categories/list");
      const data = res.data;

      if (data.success) {
        const incomingCategories = Array.isArray(data.categories) ? data.categories : [];

        const normalizedCategories = incomingCategories.map((item) => {
          if (typeof item === "string") {
            return { name: item, slug: item.toLowerCase().replace(/\s+/g, "-") };
          }

          return {
            name: item?.name || "Unknown",
            slug:
              item?.slug ||
              item?.name?.toLowerCase().replace(/\s+/g, "-") ||
              "unknown",
          };
        });

        const hasAll = normalizedCategories.some((item) => item.name === "All");

        setCategories(
          hasAll
            ? normalizedCategories
            : [{ name: "All", slug: "all" }, ...normalizedCategories]
        );
      }
    } catch (err) {
      console.error(err);
      setCategories([{ name: "All", slug: "all" }]);
    }
  };

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        limit: 50,
      };

      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (selectedCategory !== "All") params.category = selectedCategory;
      if (onlyInStock) params.inStock = "true";
      if (sortBy && sortBy !== "latest") params.sort = sortBy;

      const res = await API.get("/medicines", { params });
      const data = res.data;

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch medicines");
      }

      setProducts(data.medicines || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Something went wrong");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchMedicines();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedCategory, sortBy, onlyInStock]);

  useEffect(() => {
    setSearchTerm(searchParams.get("search") || "");
    setSelectedCategory(searchParams.get("category") || "All");
    setSortBy(searchParams.get("sort") || "latest");
    setOnlyInStock(searchParams.get("inStock") === "true");
  }, [searchParams]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateUrlParams({ search: searchTerm.trim() });
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setSortBy("latest");
    setOnlyInStock(false);
    navigate("/healthcare");
  };

  return (
    <AnimatePresence mode="wait">
      <motion.section
        key={location.pathname + location.search}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="min-h-screen bg-slate-50/60 py-8 sm:py-10 lg:py-12"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-5 md:px-6 2xl:max-w-400">
          <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-emerald-500 via-teal-500 to-cyan-500 p-5 text-white shadow-xl sm:p-7 md:p-8 lg:p-10">
            <div className="absolute inset-0 opacity-15">
              <div
                className="h-full w-full"
                style={{
                  backgroundImage:
                    "radial-gradient(circle, rgba(255,255,255,.35) 1px, transparent 1px)",
                  backgroundSize: "30px 30px",
                }}
              />
            </div>

            <div className="relative grid grid-cols-1 items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-1.5 text-xs font-medium sm:text-sm">
                  <HeartPulse size={16} />
                  Trusted Healthcare Collection
                </div>

                <h1 className="text-2xl font-bold leading-tight sm:text-3xl md:text-4xl xl:text-5xl">
                  Healthcare Essentials
                  <span className="block text-emerald-50/95">
                    for Everyday Wellness
                  </span>
                </h1>

                <p className="mt-3 max-w-2xl text-sm text-white/90 sm:mt-4 sm:text-base md:text-lg">
                  Explore supplements, immunity boosters, nutrition products, and
                  wellness essentials designed for daily health support.
                </p>

                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={18} className="shrink-0" />
                      <span className="text-sm font-medium">Quality Assured</span>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Truck size={18} className="shrink-0" />
                      <span className="text-sm font-medium">Quick Delivery</span>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <BadgePercent size={18} className="shrink-0" />
                      <span className="text-sm font-medium">Best Value Deals</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative h-65 sm:h-80 md:h-90 lg:h-105">
                <motion.div
                  animate={{ y: [-10, 10, -10] }}
                  transition={{ duration: 5, repeat: Infinity }}
                  className="absolute top-4 left-2 w-45 rounded-2xl bg-white p-4 text-slate-800 shadow-xl sm:left-4 sm:w-55"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <Sparkles size={18} className="text-emerald-600" />
                    <span className="text-sm font-semibold sm:text-base">
                      Wellness Picks
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 sm:text-sm">
                    Daily nutrition and immunity support products.
                  </p>
                </motion.div>

                <motion.div
                  animate={{ y: [10, -10, 10] }}
                  transition={{ duration: 5, repeat: Infinity }}
                  className="absolute right-2 bottom-4 w-47.5 rounded-2xl bg-white p-4 text-slate-800 shadow-xl sm:right-4 sm:w-57.5"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-teal-600" />
                    <span className="text-sm font-semibold sm:text-base">
                      Safe & Genuine
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 sm:text-sm">
                    Carefully selected healthcare essentials.
                  </p>
                </motion.div>

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-40 w-40 items-center justify-center rounded-full border border-white/20 bg-white/20 backdrop-blur-md shadow-2xl sm:h-52 sm:w-52 md:h-60 md:w-60">
                    <HeartPulse className="h-16 w-16 text-white sm:h-20 sm:w-20 md:h-24 md:w-24" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 mb-6 rounded-3xl border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur-md sm:mt-8 sm:mb-8 sm:p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <form
                onSubmit={handleSearchSubmit}
                className="flex flex-1 flex-col gap-3 sm:flex-row"
              >
                <div className="flex h-12 flex-1 items-center rounded-2xl border border-emerald-100 bg-slate-50 px-4 sm:h-13">
                  <Search size={18} className="shrink-0 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search supplements, wellness items, nutrition..."
                    className="ml-2 w-full bg-transparent text-sm outline-none sm:text-base"
                  />
                </div>

                <button
                  type="submit"
                  className="h-12 rounded-2xl bg-linear-to-r from-emerald-500 to-teal-500 px-5 text-sm font-semibold text-white sm:h-13 sm:px-6 sm:text-base"
                >
                  Search
                </button>
              </form>

              <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
                <button
                  onClick={() => setMobileFiltersOpen(true)}
                  className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-white px-4 font-medium text-slate-700 lg:hidden"
                >
                  <SlidersHorizontal size={18} />
                  Filters
                </button>

                <div className="hidden h-12 items-center gap-2 rounded-2xl border border-emerald-100 bg-slate-50 px-4 lg:flex">
                  <span className="text-sm text-slate-500">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      updateUrlParams({ sort: e.target.value });
                    }}
                    className="bg-transparent text-sm font-medium text-slate-700 outline-none"
                  >
                    <option value="latest">Latest</option>
                    <option value="low">Price: Low to High</option>
                    <option value="high">Price: High to Low</option>
                    <option value="rating">Top Rated</option>
                    <option value="name-asc">Name: A to Z</option>
                    <option value="expiry">Expiry Soon</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)] xl:gap-8">
            <aside className="hidden lg:block">
              <div className="sticky top-36">
                <FilterPanel
                  categories={categories}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={(value) => {
                    setSelectedCategory(value);
                    updateUrlParams({ category: value });
                  }}
                  sortBy={sortBy}
                  setSortBy={(value) => {
                    setSortBy(value);
                    updateUrlParams({ sort: value });
                  }}
                  onlyInStock={onlyInStock}
                  setOnlyInStock={(value) => {
                    setOnlyInStock(value);
                    updateUrlParams({ inStock: value ? "true" : "" });
                  }}
                />
              </div>
            </aside>

            <div className="min-w-0">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">
                    Explore Healthcare Products
                  </h2>
                  <p className="mt-1 text-sm text-slate-500 sm:text-base">
                    Showing {products.length} items
                  </p>
                </div>

                <div className="lg:hidden">
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      updateUrlParams({ sort: e.target.value });
                    }}
                    className="h-11 w-full rounded-xl border border-emerald-100 bg-white px-4 text-sm outline-none sm:w-auto"
                  >
                    <option value="latest">Latest</option>
                    <option value="low">Price: Low to High</option>
                    <option value="high">Price: High to Low</option>
                    <option value="rating">Top Rated</option>
                    <option value="name-asc">Name: A to Z</option>
                    <option value="expiry">Expiry Soon</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="rounded-3xl border border-dashed border-emerald-200 bg-white p-8 text-center sm:p-10">
                  <h3 className="text-lg font-semibold text-slate-900 sm:text-xl">
                    Loading products...
                  </h3>
                </div>
              ) : error ? (
                <div className="rounded-3xl border border-dashed border-red-200 bg-white p-8 text-center sm:p-10">
                  <h3 className="text-lg font-semibold text-slate-900 sm:text-xl">
                    Failed to load products
                  </h3>
                  <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 sm:text-base">
                    {error}
                  </p>
                </div>
              ) : products.length > 0 ? (
                <motion.div
                  layout
                  className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3 xl:gap-6 2xl:grid-cols-4"
                >
                  <AnimatePresence mode="popLayout">
                    {products.map((item) => (
                      <motion.div
                        key={item._id}
                        layout
                        variants={cardVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: 0.25 }}
                      >
                        <HealthcareCard item={item} navigate={navigate} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <div className="rounded-3xl border border-dashed border-emerald-200 bg-white p-8 text-center sm:p-10">
                  <h3 className="text-lg font-semibold text-slate-900 sm:text-xl">
                    No healthcare items found
                  </h3>
                  <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 sm:text-base">
                    Try updating the search term or changing filters to find more products.
                  </p>
                  <button
                    onClick={resetFilters}
                    className="mt-5 rounded-2xl bg-linear-to-r from-emerald-500 to-teal-500 px-5 py-3 font-semibold text-white"
                  >
                    Reset Filters
                  </button>
                </div>
              )}

              <div className="mt-8 rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm sm:mt-10 sm:p-6 lg:p-8">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="max-w-2xl">
                    <h3 className="text-lg font-semibold text-slate-900 sm:text-xl">
                      Support your daily wellness routine
                    </h3>
                    <p className="mt-2 text-sm text-slate-500 sm:text-base">
                      Choose trusted healthcare essentials with responsive browsing,
                      better filtering, and clean page transitions.
                    </p>
                  </div>

                  <button
                    onClick={() => navigate("/products")}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-blue-600 to-emerald-500 px-5 py-3 font-semibold text-white lg:w-auto"
                  >
                    Browse All Products
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {mobileFiltersOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileFiltersOpen(false)}
                className="fixed inset-0 z-50 bg-slate-900/40 lg:hidden"
              />

              <motion.div
                initial={{ opacity: 0, y: "100%" }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: "100%" }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-[28px] bg-white shadow-2xl lg:hidden"
              >
                <div className="sticky top-0 flex items-center justify-between rounded-t-[28px] border-b border-slate-100 bg-white px-4 py-4 sm:px-5">
                  <h3 className="text-base font-semibold text-slate-900 sm:text-lg">
                    Filters
                  </h3>
                  <button
                    onClick={() => setMobileFiltersOpen(false)}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100"
                    aria-label="Close filters"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="p-4 sm:p-5">
                  <FilterPanel
                    categories={categories}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    onlyInStock={onlyInStock}
                    setOnlyInStock={setOnlyInStock}
                  />

                  <button
                    onClick={() => {
                      updateUrlParams();
                      setMobileFiltersOpen(false);
                    }}
                    className="mt-4 h-12 w-full rounded-2xl bg-linear-to-r from-emerald-500 to-teal-500 font-semibold text-white"
                  >
                    Apply Filters
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.section>
    </AnimatePresence>
  );
};

export default HealthcarePage;