/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  Star,
  Heart,
  ShoppingCart,
  BadgePercent,
  ShieldCheck,
  Truck,
  X,
  Pill,
  Zap,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { formatImageUrl } from "../utils/imageUrl";

const fallbackProducts = [];

const pageVariants = {
  initial: { opacity: 0, y: 32, scale: 0.985, filter: "blur(6px)" },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: -28,
    scale: 0.975,
    filter: "blur(8px)",
    transition: { duration: 0.32, ease: [0.4, 0, 1, 1] },
  },
};

const ProductCard = ({
  product,
  navigate,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
  addingCartId,
  addedCartId,
}) => {
  const productId = product._id || product.id;
  const imageSrc = formatImageUrl(product.image, "/images/medicine.png");

  return (
    <motion.div
      layout
      whileHover={{ y: -6 }}
      transition={{ duration: 0.22 }}
      className="group overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm hover:shadow-lg flex flex-col justify-between"
    >
      <div className="relative p-5 sm:p-6">
        <div className="absolute left-4 top-4 z-10 flex flex-col gap-1">
          {product.badge && (
            <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-[11px] font-semibold text-red-500 sm:text-xs">
              {product.badge}
            </span>
          )}
          {product.prescriptionRequired && (
            <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200">
              Rx Required
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => onToggleWishlist(product)}
          className={`absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
            isWishlisted
              ? "border-rose-200 bg-rose-50 text-rose-500"
              : "border-slate-200 bg-white/90 hover:bg-rose-50 hover:text-rose-500"
          }`}
          aria-label="Add to wishlist"
        >
          <Heart size={18} className={isWishlisted ? "fill-current" : ""} />
        </button>

        <div className="flex aspect-4/3 items-center justify-center rounded-3xl bg-linear-to-br from-sky-50 to-emerald-50 p-5 sm:p-6">
          <img
            src={imageSrc}
            alt={product.name || "Product image"}
            onError={(e) => {
              e.currentTarget.src = "/images/placeholder.png";
            }}
            className="h-28 w-28 object-contain transition-transform duration-300 group-hover:scale-105 sm:h-32 sm:w-32 md:h-36 md:w-36"
          />
        </div>
      </div>

      <div className="px-5 pb-5 sm:px-6 sm:pb-6 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-semibold text-emerald-600 sm:text-sm">
              {product.category || "General"}
            </p>
            {product.brand && (
              <p className="text-[11px] font-medium text-slate-400">
                {product.brand}
              </p>
            )}
          </div>

          <h3 className="line-clamp-2 min-h-12 text-base font-semibold text-slate-900 sm:text-lg">
            {product.name}
          </h3>

          <p className="mt-2 line-clamp-2 text-sm text-slate-500">
            {product.description || "No description available for this product."}
          </p>

          <div className="mt-3 flex items-center gap-1">
            <Star size={15} className="fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium text-slate-700">
              {product.rating ?? 4.0}
            </span>
            <span className="text-xs text-slate-400">
              ({product.reviewCount ?? 0})
            </span>
          </div>
        </div>

        <div>
          <div className="mt-4 flex items-end gap-2">
            <span className="text-xl font-bold text-slate-900 sm:text-2xl">
              ₹{product.price ?? 0}
            </span>
            {product.oldPrice ? (
              <span className="text-sm text-slate-400 line-through">
                ₹{product.oldPrice}
              </span>
            ) : null}
          </div>

          <div className="mt-2">
            {product.inStock ? (
              <span className="inline-flex items-center text-xs sm:text-sm font-medium text-emerald-600">
                In Stock {product.stock ? `(${product.stock})` : ""}
              </span>
            ) : (
              <span className="inline-flex items-center text-xs sm:text-sm font-medium text-red-500">
                Out of Stock
              </span>
            )}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => onAddToCart(product, false)}
              className="flex h-11 items-center justify-center gap-1.5 rounded-xl border border-emerald-600 bg-emerald-50/60 px-2 sm:px-3 text-xs sm:text-sm font-bold text-emerald-800 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
              disabled={!product.inStock || addingCartId === productId}
            >
              <ShoppingCart size={15} />
              <span>{addingCartId === productId ? "Adding..." : addedCartId === productId ? "✓ Added" : "Add to Cart"}</span>
            </button>

            <button
              type="button"
              onClick={() => onAddToCart(product, true)}
              className="flex h-11 items-center justify-center gap-1.5 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 px-2 sm:px-3 text-xs sm:text-sm font-bold text-white shadow-sm shadow-emerald-500/20 transition disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
              disabled={!product.inStock || addingCartId === productId}
            >
              <Zap size={15} />
              <span>Buy Now</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const FilterSidebar = ({
  categories,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
  onlyInStock,
  onStockToggle,
  onReset,
}) => {
  return (
    <div className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-center gap-2">
        <SlidersHorizontal size={18} className="text-emerald-600" />
        <h3 className="font-semibold text-slate-900">Filters</h3>
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="mb-3 text-sm font-semibold text-slate-800">Category</h4>
          <div className="space-y-2">
            {categories.map((item) => (
              <button
                type="button"
                key={item}
                onClick={() => onCategoryChange(item)}
                className={`w-full rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                  selectedCategory === item
                    ? "bg-emerald-100 font-medium text-emerald-700"
                    : "bg-slate-50 text-slate-700 hover:bg-emerald-50"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold text-slate-800">Sort By</h4>
          <div className="space-y-2">
            {[
              { label: "Featured", value: "featured" },
              { label: "Price: Low to High", value: "low" },
              { label: "Price: High to Low", value: "high" },
              { label: "Top Rated", value: "rating" },
            ].map((item) => (
              <button
                type="button"
                key={item.value}
                onClick={() => onSortChange(item.value)}
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

        <div>
          <button
            type="button"
            onClick={onStockToggle}
            className={`w-full rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              onlyInStock
                ? "bg-emerald-100 text-emerald-700"
                : "bg-slate-50 text-slate-700 hover:bg-emerald-50"
            }`}
          >
            {onlyInStock ? "Showing In Stock Only" : "Show In Stock Only"}
          </button>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
};

const ProductsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  const initialSearch = searchParams.get("search") || "";
  const initialCategory = searchParams.get("category") || "All";
  const initialSort = searchParams.get("sort") || "featured";
  const initialInStock = searchParams.get("inStock") === "true";

  const [searchInput, setSearchInput] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState(initialSort);
  const [onlyInStock, setOnlyInStock] = useState(initialInStock);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [wishlistIds, setWishlistIds] = useState([]);
  const [addingCartId, setAddingCartId] = useState(null);
  const [addedCartId, setAddedCartId] = useState(null);

  useEffect(() => {
    setSearchInput(initialSearch);
    setSelectedCategory(initialCategory);
    setSortBy(initialSort);
    setOnlyInStock(initialInStock);
  }, [initialSearch, initialCategory, initialSort, initialInStock]);

  const updateUrlParams = ({
    nextSearch = searchInput,
    nextCategory = selectedCategory,
    nextSort = sortBy,
    nextInStock = onlyInStock,
  } = {}) => {
    const params = new URLSearchParams();

    if (nextSearch.trim()) params.set("search", nextSearch.trim());
    if (nextCategory !== "All") params.set("category", nextCategory);
    if (nextSort !== "featured") params.set("sort", nextSort);
    if (nextInStock) params.set("inStock", "true");

    navigate(`/products${params.toString() ? `?${params.toString()}` : ""}`);
  };

  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setPageError("");

        const params = {};
        if (initialSearch.trim()) params.search = initialSearch.trim();
        if (initialCategory !== "All") params.category = initialCategory;
        if (initialSort && initialSort !== "featured") params.sort = initialSort;
        if (initialInStock) params.inStock = true;

        const { data } = await API.get("/medicines", { params });

        let normalizedProducts = [];

        if (Array.isArray(data?.medicines)) {
          normalizedProducts = data.medicines;
        } else if (Array.isArray(data)) {
          normalizedProducts = data;
        } else if (Array.isArray(data?.products)) {
          normalizedProducts = data.products;
        } else if (Array.isArray(data?.data)) {
          normalizedProducts = data.data;
        }

        const mappedProducts = normalizedProducts.map((item) => ({
          ...item,
          inStock:
            item.inStock !== undefined
              ? item.inStock
              : Number(item.stock || 0) > 0,
        }));

        if (isMounted) {
          setProducts(mappedProducts);
        }
      } catch (error) {
        if (isMounted) {
          setPageError("No products currently available or server offline.");
          setProducts([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, [initialSearch, initialCategory, initialSort, initialInStock]);

  useEffect(() => {
    const fetchWishlist = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setWishlistIds([]);
        return;
      }
      try {
        const response = await API.get("/wishlist/my");
        const items = response?.data?.wishlist || [];
        setWishlistIds(items.map((item) => item._id));
      } catch (error) {
        setWishlistIds([]);
      }
    };

    fetchWishlist();
  }, []);

  const derivedCategories = useMemo(() => {
    const source = products;
    const unique = [...new Set(source.map((item) => item.category).filter(Boolean))].sort();
    return ["All", ...unique];
  }, [products]);

  const safeSelectedCategory = useMemo(() => {
    return derivedCategories.includes(selectedCategory) ? selectedCategory : "All";
  }, [derivedCategories, selectedCategory]);

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    if (initialSearch.trim()) {
      const keyword = initialSearch.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name?.toLowerCase().includes(keyword) ||
          product.category?.toLowerCase().includes(keyword) ||
          product.description?.toLowerCase().includes(keyword)
      );
    }

    if (safeSelectedCategory !== "All") {
      filtered = filtered.filter(
        (product) => product.category === safeSelectedCategory
      );
    }

    if (onlyInStock) {
      filtered = filtered.filter((product) => product.inStock);
    }

    if (sortBy === "low") {
      filtered.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    } else if (sortBy === "high") {
      filtered.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    } else if (sortBy === "rating") {
      filtered.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    }

    return filtered;
  }, [products, initialSearch, safeSelectedCategory, sortBy, onlyInStock]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    updateUrlParams({ nextCategory: category });
    setMobileFiltersOpen(false);
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    updateUrlParams({ nextSort: value });
  };

  const handleStockToggle = () => {
    const nextValue = !onlyInStock;
    setOnlyInStock(nextValue);
    updateUrlParams({ nextInStock: nextValue });
  };

  const resetFilters = () => {
    setSearchInput("");
    setSelectedCategory("All");
    setSortBy("featured");
    setOnlyInStock(false);
    setMobileFiltersOpen(false);
    navigate("/products");
  };

  const handleSearchSubmit = () => {
    updateUrlParams({ nextSearch: searchInput });
  };

  const handleAddToCart = async (product, goToCart = false) => {
    const productId = product._id || product.id;

    try {
      setAddingCartId(productId);

      await API.post("/cart/add", {
        medicineId: productId,
        quantity: 1,
      });

      window.dispatchEvent(new Event("cartChanged"));

      if (goToCart) {
        navigate("/cart");
      } else {
        setAddedCartId(productId);
        setTimeout(() => setAddedCartId(null), 1800);
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      alert(error.response?.data?.message || "Failed to add item to cart");
    } finally {
      setAddingCartId(null);
    }
  };

  const handleToggleWishlist = async (product) => {
    try {
      const medicineId = product._id || product.id;

      if (wishlistIds.includes(medicineId)) {
        await API.delete(`/wishlist/remove/${medicineId}`);
        setWishlistIds((prev) => prev.filter((id) => id !== medicineId));
      } else {
        await API.post("/wishlist/add", { medicineId });
        setWishlistIds((prev) => [...prev, medicineId]);
      }
    } catch (error) {
      console.error("Wishlist error:", error);
      alert(error.response?.data?.message || "Failed to update wishlist");
    }
  };

  return (
    <motion.section
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-slate-50/60 py-8 sm:py-10 lg:py-12"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-5 md:px-6">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 sm:text-sm">
                <BadgePercent size={16} />
                Healthcare Store
              </div>

              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl md:text-4xl">
                Medicines & Healthcare Products
              </h1>

              <p className="mt-2 text-sm text-slate-600 sm:text-base">
                Browse medicines, devices, wellness essentials, and personal care
                products with a responsive layout for all devices.
              </p>
            </div>

            <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3 lg:w-auto">
              <div className="flex items-center gap-2 rounded-2xl border border-emerald-100 bg-white px-4 py-3 shadow-sm">
                <ShieldCheck size={18} className="shrink-0 text-emerald-600" />
                <span className="text-sm text-slate-700">Genuine Products</span>
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-emerald-100 bg-white px-4 py-3 shadow-sm">
                <Truck size={18} className="shrink-0 text-blue-600" />
                <span className="text-sm text-slate-700">Fast Delivery</span>
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-emerald-100 bg-white px-4 py-3 shadow-sm">
                <BadgePercent size={18} className="shrink-0 text-orange-500" />
                <span className="text-sm text-slate-700">Daily Offers</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-3xl border border-emerald-100 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search medicines, products, categories..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
                className="h-12 w-full rounded-2xl border border-slate-300 bg-slate-50 pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white"
              />
            </div>

            <button
              type="button"
              onClick={handleSearchSubmit}
              className="h-12 rounded-2xl bg-linear-to-r from-emerald-500 to-teal-500 px-5 text-sm font-semibold text-white"
            >
              Search
            </button>

            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 text-sm font-medium text-slate-700 lg:hidden"
            >
              <SlidersHorizontal size={16} />
              Filters
            </button>

            <button
              type="button"
              onClick={resetFilters}
              className="h-12 rounded-2xl border border-slate-300 bg-white px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Reset
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {initialSearch ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 sm:text-sm">
                Search: {initialSearch}
              </span>
            ) : null}

            {safeSelectedCategory !== "All" ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 sm:text-sm">
                Category: {safeSelectedCategory}
              </span>
            ) : null}

            {onlyInStock ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 sm:text-sm">
                In Stock Only
              </span>
            ) : null}
          </div>
        </div>

        {pageError ? (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            {pageError}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)] xl:gap-8">
          <aside className="hidden lg:block">
            <div className="sticky top-36">
              <FilterSidebar
                categories={derivedCategories}
                selectedCategory={safeSelectedCategory}
                onCategoryChange={handleCategoryChange}
                sortBy={sortBy}
                onSortChange={handleSortChange}
                onlyInStock={onlyInStock}
                onStockToggle={handleStockToggle}
                onReset={resetFilters}
              />
            </div>
          </aside>

          <div className="min-w-0">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-slate-500">
                {loading
                  ? "Loading products..."
                  : `${filteredProducts.length} product${
                      filteredProducts.length !== 1 ? "s" : ""
                    } found`}
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
                {[...Array(6)].map((_, index) => (
                  <div
                    key={index}
                    className="overflow-hidden rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm"
                  >
                    <div className="aspect-4/3 animate-pulse rounded-3xl bg-slate-100" />
                    <div className="mt-4 h-4 animate-pulse rounded bg-slate-100" />
                    <div className="mt-2 h-4 w-2/3 animate-pulse rounded bg-slate-100" />
                    <div className="mt-4 h-10 animate-pulse rounded-xl bg-slate-100" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <motion.div
                layout
                className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-2"
              >
                <AnimatePresence mode="popLayout">
                  {filteredProducts.map((product) => (
                    <motion.div
                      key={product._id || product.id}
                      layout
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -18, scale: 0.96 }}
                      transition={{ duration: 0.25 }}
                    >
                      <ProductCard
                        product={product}
                        navigate={navigate}
                        onAddToCart={handleAddToCart}
                        onToggleWishlist={handleToggleWishlist}
                        isWishlisted={wishlistIds.includes(product._id || product.id)}
                        addingCartId={addingCartId}
                        addedCartId={addedCartId}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <div className="rounded-3xl border border-dashed border-emerald-200 bg-white p-8 text-center sm:p-10">
                <h3 className="text-lg font-semibold text-slate-900 sm:text-xl">
                  No products found
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 sm:text-base">
                  Try changing the search term, category, or stock filter to see
                  more products.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-5 rounded-2xl bg-linear-to-r from-emerald-500 to-teal-500 px-5 py-3 font-semibold text-white"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </div>

        <AnimatePresence>
          {mobileFiltersOpen ? (
            <motion.div
              className="fixed inset-0 z-50 bg-black/40 p-4 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFiltersOpen(false)}
            >
              <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 40, opacity: 0 }}
                transition={{ duration: 0.25 }}
                onClick={(e) => e.stopPropagation()}
                className="mx-auto mt-16 max-w-md"
              >
                <div className="mb-3 flex items-center justify-between rounded-t-3xl bg-white px-5 py-4">
                  <h3 className="font-semibold text-slate-900">Filters</h3>
                  <button
                    type="button"
                    onClick={() => setMobileFiltersOpen(false)}
                    className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
                  >
                    <X size={18} />
                  </button>
                </div>

                <FilterSidebar
                  categories={derivedCategories}
                  selectedCategory={safeSelectedCategory}
                  onCategoryChange={handleCategoryChange}
                  sortBy={sortBy}
                  onSortChange={handleSortChange}
                  onlyInStock={onlyInStock}
                  onStockToggle={handleStockToggle}
                  onReset={resetFilters}
                />
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.section>
  );
};

export default ProductsPage;