/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageWrapper from "../components/LandingPage/PageWrapper";

const highlights = [
  {
    icon: ShieldCheck,
    title: "Trusted Products",
    description: "All offers apply to quality healthcare and wellness products.",
  },
  {
    icon: Truck,
    title: "Quick Delivery",
    description: "Fast and secure doorstep delivery on eligible orders.",
  },
  {
    icon: Wallet,
    title: "Extra Savings",
    description: "Use promo codes and seasonal discounts to save more.",
  },
];

const colorClasses = [
  "from-emerald-500 to-teal-500",
  "from-blue-500 to-cyan-500",
  "from-orange-500 to-red-500",
  "from-pink-500 to-rose-500",
  "from-violet-500 to-fuchsia-500",
  "from-purple-500 to-indigo-500",
];

const OffersPage = () => {
  const navigate = useNavigate();

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch("http://localhost:5000/api/offers/public");
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch offers");
        }

        setOffers(data.offers || []);
      } catch (err) {
        console.error("Fetch offers error:", err);
        setError(err.message || "Unable to load offers");
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  const formatDiscount = (offer) => {
    if (offer.discountType === "percentage") {
      return `${offer.discountValue}% OFF`;
    }
    return `₹${offer.discountValue} OFF`;
  };

  return (
    <PageWrapper className="min-h-screen bg-slate-50/60 py-8 sm:py-10 lg:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-5 md:px-6 2xl:max-w-400">
        {/* Hero */}
        <div className="mb-8 sm:mb-10 lg:mb-12">
          <div className="overflow-hidden rounded-[28px] border border-white/70 bg-white/80 shadow-sm backdrop-blur-md">
            <div className="grid items-center gap-8 px-5 py-8 sm:px-6 sm:py-10 md:px-8 lg:grid-cols-2 lg:px-10 lg:py-12">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 sm:text-sm">
                  <BadgePercent size={16} />
                  Limited Time Deals
                </div>

                <h1 className="text-3xl font-bold leading-tight text-slate-900 sm:text-4xl md:text-5xl">
                  Best Offers on Medicines & Healthcare
                </h1>

                <p className="mt-4 max-w-xl text-sm text-slate-600 sm:text-base md:text-lg">
                  Explore pharmacy deals, daily discounts, combo packs, and
                  healthcare savings designed for every shopper.
                </p>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={() => navigate("/products")}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-emerald-500 to-teal-500 px-6 text-sm font-semibold text-white sm:text-base"
                  >
                    Shop Offers
                    <ChevronRight size={18} />
                  </button>

                  <button
                    onClick={() => navigate("/contact")}
                    className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 sm:text-base"
                  >
                    Need Help?
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:gap-5">
                <div className="rounded-3xl bg-linear-to-br from-emerald-500 to-teal-500 p-5 text-white shadow-lg sm:p-6">
                  <Tag className="mb-3" size={24} />
                  <h3 className="text-lg font-bold sm:text-xl">Live Offers</h3>
                  <p className="mt-2 text-sm text-white/90">
                    Fresh discounts directly from admin dashboard.
                  </p>
                </div>

                <div className="rounded-3xl bg-white p-5 shadow-lg sm:p-6">
                  <Gift className="mb-3 text-pink-500" size={24} />
                  <h3 className="text-lg font-bold text-slate-900 sm:text-xl">
                    Promo Codes
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">
                    Apply valid coupon codes before checkout.
                  </p>
                </div>

                <div className="rounded-3xl bg-white p-5 shadow-lg sm:p-6">
                  <Clock3 className="mb-3 text-orange-500" size={24} />
                  <h3 className="text-lg font-bold text-slate-900 sm:text-xl">
                    Time Limited
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">
                    Only currently active offers are shown here.
                  </p>
                </div>

                <div className="rounded-3xl bg-linear-to-br from-blue-500 to-indigo-500 p-5 text-white shadow-lg sm:p-6">
                  <ShoppingBag className="mb-3" size={24} />
                  <h3 className="text-lg font-bold sm:text-xl">Save More</h3>
                  <p className="mt-2 text-sm text-white/90">
                    Enjoy extra savings on eligible orders.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Highlights */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {highlights.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm"
              >
                <div className="mb-3 inline-flex rounded-2xl bg-emerald-50 p-3 text-emerald-600">
                  <Icon size={20} />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600">{item.description}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Offer cards */}
        <div>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                Today’s Active Offers
              </h2>
              <p className="mt-1 text-sm text-slate-600 sm:text-base">
                Pick the best deal and continue shopping.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="py-10 text-center text-slate-600">Loading offers...</div>
          ) : error ? (
            <div className="py-10 text-center text-red-600">{error}</div>
          ) : offers.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white py-12 text-center text-slate-600">
              No active offers available right now.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {offers.map((offer, index) => (
                <motion.div
                  key={offer._id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06 }}
                  whileHover={{ y: -6 }}
                  className="overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm hover:shadow-lg"
                >
                  <div
                    className={`bg-linear-to-r ${
                      colorClasses[index % colorClasses.length]
                    } p-5 text-white sm:p-6`}
                  >
                    <div className="inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                      {formatDiscount(offer)}
                    </div>
                    <h3 className="mt-4 text-xl font-bold leading-snug">
                      {offer.title}
                    </h3>
                  </div>

                  <div className="p-5 sm:p-6">
                    <p className="text-sm text-slate-600 sm:text-base">
                      {offer.description || "Exclusive limited-time savings for you."}
                    </p>

                    <div className="mt-4 rounded-2xl border border-dashed border-emerald-200 bg-emerald-50 px-4 py-3">
                      <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Coupon Code
                      </span>
                      <p className="mt-1 text-base font-bold text-emerald-700 sm:text-lg">
                        {offer.code}
                      </p>
                    </div>

                    {offer.minOrderAmount > 0 && (
                      <p className="mt-3 text-sm text-slate-500">
                        Minimum order: ₹{offer.minOrderAmount}
                      </p>
                    )}

                    {offer.validTill && (
                      <p className="mt-1 text-sm text-slate-500">
                        Valid till: {new Date(offer.validTill).toLocaleDateString()}
                      </p>
                    )}

                    <button
                      onClick={() => navigate("/products")}
                      className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-emerald-500 to-teal-500 text-sm font-semibold text-white"
                    >
                      Avail Offer
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

export default OffersPage;