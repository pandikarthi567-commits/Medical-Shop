/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BadgePercent,
  Tag,
  Gift,
  Clock3,
  ShoppingBag,
  ChevronRight,
  ShieldCheck,
  Truck,
  Wallet,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Percent,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import PageWrapper from "../components/LandingPage/PageWrapper";

const highlights = [
  {
    icon: ShieldCheck,
    title: "100% Genuine Pharmacy",
    description: "All promo discounts apply to verified & authentic medicines.",
  },
  {
    icon: Truck,
    title: "Express Doorstep Delivery",
    description: "Apply offers and enjoy fast delivery straight to your home.",
  },
  {
    icon: Wallet,
    title: "Maximum Savings",
    description: "Combine flat and percentage discounts on eligible carts.",
  },
];

const colorPalettes = [
  {
    gradient: "from-emerald-600 to-teal-600",
    badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    couponBg: "bg-emerald-50/80 border-emerald-200 text-emerald-800",
    btnGrad: "from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700",
  },
  {
    gradient: "from-cyan-600 to-blue-600",
    badgeBg: "bg-blue-50 text-blue-700 border-blue-200",
    couponBg: "bg-blue-50/80 border-blue-200 text-blue-800",
    btnGrad: "from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700",
  },
  {
    gradient: "from-indigo-600 to-violet-600",
    badgeBg: "bg-indigo-50 text-indigo-700 border-indigo-200",
    couponBg: "bg-indigo-50/80 border-indigo-200 text-indigo-800",
    btnGrad: "from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700",
  },
  {
    gradient: "from-teal-600 to-emerald-700",
    badgeBg: "bg-teal-50 text-teal-700 border-teal-200",
    couponBg: "bg-teal-50/80 border-teal-200 text-teal-800",
    btnGrad: "from-teal-600 to-emerald-700 hover:from-teal-700 hover:to-emerald-800",
  },
];

const OffersPage = () => {
  const navigate = useNavigate();

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await API.get("/offers/public");
        const data = res.data;

        if (!data.success && !data.offers) {
          throw new Error(data.message || "Failed to fetch offers");
        }

        setOffers(data.offers || []);
      } catch (err) {
        console.error("Fetch offers error:", err);
        setError(
          err.response?.data?.message || err.message || "Unable to load offers"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  const handleCopyCode = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleApplyAndShop = (code) => {
    if (code) {
      localStorage.setItem("selectedOfferCode", code);
    }
    navigate("/products");
  };

  const formatDiscount = (offer) => {
    if (offer.discountType === "percentage") {
      return `${offer.discountValue}% OFF`;
    }
    return `₹${offer.discountValue} FLAT OFF`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Limited Period";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "Limited Period";
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <PageWrapper className="min-h-screen bg-[#f8fafc] py-6 sm:py-8 lg:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="relative mb-8 sm:mb-10 overflow-hidden rounded-3xl border border-emerald-100/80 bg-linear-to-br from-white via-emerald-50/30 to-teal-50/20 p-6 sm:p-8 lg:p-10 shadow-sm">
          {/* Background ambient decorative shapes */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative z-10 grid items-center gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="mb-3.5 inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-800 shadow-2xs">
                <Sparkles size={14} className="text-emerald-600 animate-pulse" />
                Live Pharmacy Deals & Promo Coupons
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
                Best Offers on <br className="hidden sm:inline" />
                <span className="bg-linear-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  Medicines & Healthcare
                </span>
              </h1>

              <p className="mt-3.5 max-w-xl text-sm sm:text-base text-slate-600 leading-relaxed">
                Save big on prescription medicines, wellness supplements, daily
                essentials, and medical equipment. Direct admin-verified
                promotions tailored for your health.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => navigate("/products")}
                  className="inline-flex h-11 sm:h-12 items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 px-6 text-sm sm:text-base font-bold text-white shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <ShoppingBag size={18} />
                  Shop Medicines
                  <ChevronRight size={18} />
                </button>

                <button
                  onClick={() => navigate("/contact")}
                  className="inline-flex h-11 sm:h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 px-5 text-sm sm:text-base font-semibold text-slate-700 shadow-2xs transition-colors cursor-pointer"
                >
                  Need Help?
                </button>
              </div>
            </div>

            {/* Quick Promo Stat Cards */}
            <div className="grid grid-cols-2 gap-3.5 sm:gap-4 lg:col-span-5">
              <div className="rounded-2xl bg-linear-to-br from-emerald-600 to-teal-600 p-4 sm:p-5 text-white shadow-md shadow-emerald-600/15">
                <div className="flex items-center justify-between">
                  <Tag size={22} className="opacity-90" />
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider">
                    Instant
                  </span>
                </div>
                <h3 className="mt-3 text-base sm:text-lg font-bold">Active Promos</h3>
                <p className="mt-1 text-xs text-white/80">
                  Updated in real-time from Admin Portal.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white p-4 sm:p-5 shadow-sm">
                <Gift size={22} className="text-pink-500 mb-1" />
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Promo Codes
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Copy coupon code and apply at checkout.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white p-4 sm:p-5 shadow-sm">
                <Clock3 size={22} className="text-amber-500 mb-1" />
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Time-Limited
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Verified valid expiry dates on all deals.
                </p>
              </div>

              <div className="rounded-2xl bg-linear-to-br from-cyan-600 to-blue-600 p-4 sm:p-5 text-white shadow-md shadow-blue-600/15">
                <Percent size={22} className="opacity-90" />
                <h3 className="mt-3 text-base sm:text-lg font-bold">Extra Savings</h3>
                <p className="mt-1 text-xs text-white/80">
                  Huge discounts on bulk & monthly refills.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Value Pillars */}
        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {highlights.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-white p-4 sm:p-5 shadow-2xs"
              >
                <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600 shrink-0">
                  <Icon size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {item.title}
                  </h4>
                  <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Offers Section */}
        <div className="space-y-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Current Live Pharmacy Offers
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Choose a coupon code below, copy it, and apply during checkout.
              </p>
            </div>

            <span className="self-start sm:self-auto rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
              {offers.length} Active {offers.length === 1 ? "Offer" : "Offers"}
            </span>
          </div>

          {/* Offer Loading State */}
          {loading && (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 py-6">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="animate-pulse rounded-3xl border border-slate-200 bg-white p-6 space-y-4"
                >
                  <div className="h-6 w-1/3 rounded-full bg-slate-200" />
                  <div className="h-8 w-3/4 rounded-xl bg-slate-200" />
                  <div className="h-12 w-full rounded-2xl bg-slate-100" />
                  <div className="h-10 w-full rounded-xl bg-slate-200" />
                </div>
              ))}
            </div>
          )}

          {/* Offer Error State */}
          {!loading && error && (
            <div className="rounded-3xl border border-red-200 bg-red-50/80 p-8 text-center">
              <AlertCircle size={32} className="mx-auto text-red-500 mb-2" />
              <h3 className="text-base font-bold text-red-900">
                Unable to load promotional offers
              </h3>
              <p className="mt-1 text-xs text-red-600">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          )}

          {/* Offer Empty State */}
          {!loading && !error && offers.length === 0 && (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white py-16 px-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <Tag size={28} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                No active offers available right now
              </h3>
              <p className="mx-auto mt-1 max-w-md text-xs sm:text-sm text-slate-500">
                Check back soon! Our team adds seasonal discounts, prescription
                promos, and festival deals regularly.
              </p>
              <button
                onClick={() => navigate("/products")}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-emerald-700 cursor-pointer shadow-md shadow-emerald-600/20"
              >
                Browse All Medicines
                <ArrowRight size={15} />
              </button>
            </div>
          )}

          {/* Offer Cards Grid */}
          {!loading && !error && offers.length > 0 && (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {offers.map((offer, index) => {
                const palette =
                  colorPalettes[index % colorPalettes.length];
                const isCopied = copiedCode === offer.code;

                return (
                  <motion.div
                    key={offer._id || index}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -4 }}
                    className="group relative flex flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xs hover:shadow-xl hover:border-emerald-200 transition-all duration-200"
                  >
                    {/* Header Banner */}
                    <div
                      className={`relative overflow-hidden bg-linear-to-r ${palette.gradient} p-5 text-white`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-xs font-black tracking-wide uppercase">
                          <BadgePercent size={14} />
                          {formatDiscount(offer)}
                        </div>

                        {offer.validTill && (
                          <div className="flex items-center gap-1 text-[11px] font-medium text-white/90 bg-black/20 px-2.5 py-0.5 rounded-full">
                            <Clock3 size={12} />
                            <span>Ends {formatDate(offer.validTill)}</span>
                          </div>
                        )}
                      </div>

                      <h3 className="mt-3 text-lg sm:text-xl font-black tracking-tight leading-snug">
                        {offer.title}
                      </h3>
                    </div>

                    {/* Card Body */}
                    <div className="flex flex-1 flex-col justify-between p-5">
                      <div>
                        <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                          {offer.description ||
                            "Special discount code curated exclusively for your healthcare orders."}
                        </p>

                        {/* Interactive Coupon Box with Copy Action */}
                        <div className="mt-4 flex items-center justify-between rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/70 p-3">
                          <div className="min-w-0 flex-1">
                            <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                              Coupon Code
                            </span>
                            <span className="block text-base sm:text-lg font-black tracking-wider text-slate-900 truncate">
                              {offer.code}
                            </span>
                          </div>

                          <button
                            onClick={() => handleCopyCode(offer.code)}
                            className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                              isCopied
                                ? "bg-emerald-600 text-white"
                                : "bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-100/60"
                            }`}
                            title="Copy code"
                          >
                            {isCopied ? (
                              <>
                                <Check size={14} />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy size={14} />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Offer Constraints */}
                        <div className="mt-3.5 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-500">
                          {Number(offer.minOrderAmount || 0) > 0 ? (
                            <span className="rounded-md bg-slate-100 px-2 py-0.5">
                              Min Order: ₹{offer.minOrderAmount}
                            </span>
                          ) : (
                            <span className="rounded-md bg-slate-100 px-2 py-0.5">
                              No Min Order
                            </span>
                          )}

                          {Number(offer.maxDiscount || 0) > 0 && (
                            <span className="rounded-md bg-slate-100 px-2 py-0.5">
                              Max Saving: ₹{offer.maxDiscount}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => handleApplyAndShop(offer.code)}
                        className={`mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-linear-to-r ${palette.btnGrad} text-xs sm:text-sm font-bold text-white shadow-md transition-all active:scale-[0.98] cursor-pointer`}
                      >
                        <span>Apply & Shop Now</span>
                        <ArrowRight size={15} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

export default OffersPage;