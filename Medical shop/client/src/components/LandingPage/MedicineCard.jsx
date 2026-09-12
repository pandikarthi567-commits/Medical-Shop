/* eslint-disable no-unused-vars */
import React from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Heart, Star, Pill, ShieldCheck, Check } from "lucide-react";

const MedicineCard = ({
  medicine,
  onAddToCart,
  onWishlistToggle,
  isWishlisted = false,
}) => {
  const isLowStock = medicine.stock > 0 && medicine.stock <= 10;
  const isOutOfStock = medicine.stock === 0;
  const originalPrice = medicine.price ? Math.round(medicine.price * 1.25) : 0;

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all duration-300"
    >
      {/* Top Media & Badges */}
      <div className="relative h-52 overflow-hidden bg-linear-to-br from-slate-50 via-emerald-50/40 to-teal-50/30 flex items-center justify-center p-4">
        {/* Discount Badge */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-xs">
            20% OFF
          </span>
          {medicine.prescriptionRequired && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
              Rx Required
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.85 }}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onWishlistToggle?.(medicine);
          }}
          className={`absolute top-3 right-3 z-10 h-9 w-9 rounded-full flex items-center justify-center shadow-md transition-all ${
            isWishlisted
              ? "bg-rose-500 text-white"
              : "bg-white/90 text-slate-400 hover:text-rose-500 hover:bg-white"
          }`}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} />
        </motion.button>

        {/* Medicine Product Image */}
        {medicine.image ? (
          <img
            src={medicine.image}
            alt={medicine.name}
            loading="lazy"
            className="h-full w-full object-contain p-2 transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-emerald-600/70 group-hover:text-emerald-600 transition-colors">
            <div className="p-4 rounded-2xl bg-emerald-100/50 mb-1">
              <Pill size={42} className="transform -rotate-45" />
            </div>
            <span className="text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
              Authentic Pack
            </span>
          </div>
        )}

        {/* Stock Status Pill */}
        <div className="absolute bottom-2.5 left-3">
          <span
            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${
              isOutOfStock
                ? "bg-slate-200 text-slate-700"
                : isLowStock
                ? "bg-amber-100 text-amber-800"
                : "bg-emerald-100 text-emerald-800"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isOutOfStock ? "bg-slate-500" : isLowStock ? "bg-amber-500" : "bg-emerald-500"
              }`}
            />
            {isOutOfStock ? "Out of Stock" : isLowStock ? `Only ${medicine.stock} left` : "In Stock"}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
        <div>
          {/* Category */}
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold tracking-wider text-emerald-700 uppercase">
              {medicine.category || "General Healthcare"}
            </span>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-600">
              <Star size={13} className="fill-amber-400 text-amber-400" />
              <span>4.8</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-base font-bold text-slate-900 line-clamp-1 group-hover:text-emerald-600 transition-colors">
            {medicine.name}
          </h3>

          {/* Description */}
          <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {medicine.description || "Clinical grade healthcare product, certified authentic and direct from manufacturer."}
          </p>
        </div>

        {/* Pricing & Cart Action */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-xl font-extrabold text-slate-900">
              ₹{medicine.price}
            </span>
            {originalPrice > medicine.price && (
              <span className="text-xs text-slate-400 line-through">
                ₹{originalPrice}
              </span>
            )}
            <span className="text-[11px] font-bold text-emerald-600">
              Save ₹{originalPrice - medicine.price}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              type="button"
              disabled={isOutOfStock}
              onClick={() => onAddToCart?.(medicine)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs sm:text-sm font-bold shadow-sm disabled:opacity-50 transition"
            >
              <ShoppingCart size={16} />
              <span>{isOutOfStock ? "Out of Stock" : "Add to Cart"}</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MedicineCard;