/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Quote,
  ShieldCheck,
  CheckCircle2,
  Heart,
  Plus,
  MessageSquarePlus,
  X,
  Send,
  Sparkles,
  MapPin,
  User,
  Loader2,
  Layers,
  LayoutGrid,
} from "lucide-react";
import API from "../../api/axios";
import ReviewDepthCarousel from "./ReviewDepthCarousel";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

const ModernTestimonials = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [viewMode, setViewMode] = useState("3d"); // "3d" | "grid"

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    role: "Verified Patient Buyer",
    location: "Tamil Nadu, India",
    content: "",
    rating: 5,
    verifiedBadge: "Verified Patient Buyer",
  });

  // Fetch reviews from MongoDB backend
  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await API.get("/reviews");
      if (Array.isArray(data?.reviews)) {
        setReviews(data.reviews);
      } else if (Array.isArray(data)) {
        setReviews(data);
      } else {
        setReviews([]);
      }
    } catch (err) {
      console.error("Failed to load patient reviews:", err);
      setError("Unable to load reviews at the moment.");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();

    // Auto-fill user name if logged in
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed?.name) {
          setFormData((prev) => ({
            ...prev,
            name: parsed.name,
          }));
        }
      }
    } catch (e) {
      // ignore
    }
  }, [fetchReviews]);

  // Handle Review Submission
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.content.trim()) {
      alert("Please fill in your name and review message.");
      return;
    }

    try {
      setSubmitting(true);
      const { data } = await API.post("/reviews", formData);

      if (data?.review) {
        setReviews((prev) => [data.review, ...prev]);
      } else {
        await fetchReviews();
      }

      // Reset form & close modal
      setFormData({
        name: "",
        role: "Verified Patient Buyer",
        location: "Tamil Nadu, India",
        content: "",
        rating: 5,
        verifiedBadge: "Verified Patient Buyer",
      });
      setShowModal(false);
    } catch (err) {
      console.error("Submit review error:", err);
      alert(err?.response?.data?.message || "Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Compute live averages strictly from database
  const averageRating = reviews.length
    ? (
        reviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0) /
        reviews.length
      ).toFixed(1)
    : "5.0";

  return (
    <section className="relative overflow-hidden bg-white py-16 sm:py-20 lg:py-24 border-t border-slate-200/70">
      {/* Ambient background glow */}
      <div className="absolute -left-20 top-20 w-80 h-80 bg-emerald-100/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -right-20 bottom-10 w-80 h-80 bg-teal-100/30 rounded-full blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-7xl 2xl:max-w-400 px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-10 sm:mb-12"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/40 bg-emerald-50 px-3.5 py-1 text-xs font-bold text-emerald-800 mb-3">
            <Heart size={14} className="text-emerald-600 fill-emerald-600" />
            Patient Testimonials & Reviews
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Real Reviews From{" "}
            <span className="bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Verified Patients
            </span>
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600">
            Real experiences and authentic ratings shared by patients and caregivers across India.
          </p>

          {/* Action Row: Write Review CTA + 3D/Grid Switcher */}
          <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 rounded-full bg-linear-to-r from-emerald-600 to-teal-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:from-emerald-700 hover:to-teal-700 transition hover:shadow-lg active:scale-95 cursor-pointer"
            >
              <MessageSquarePlus size={16} />
              <span>Share Your Review</span>
            </button>

            {/* View Mode Switcher (Visible only when reviews exist) */}
            {reviews.length > 0 && (
              <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200">
                <button
                  type="button"
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
                  type="button"
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
            )}
          </div>
        </motion.div>

        {/* Loading State */}
        {loading ? (
          <div className="py-16 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-emerald-600 mb-3" />
            <p className="text-sm font-medium text-slate-500">Loading patient reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          /* Clean Empty State when 0 reviews exist in DB */
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-dashed border-emerald-200 bg-emerald-50/40 p-10 sm:p-14 text-center max-w-2xl mx-auto"
          >
            <div className="mx-auto mb-4 inline-flex rounded-2xl bg-emerald-100 p-4 text-emerald-700">
              <Sparkles size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              Be The First Patient To Share Your Experience!
            </h3>
            <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto">
              Your valuable feedback helps other patients find genuine healthcare support and verified medicines.
            </p>
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-black transition cursor-pointer"
            >
              <Plus size={16} />
              Write First Review
            </button>
          </motion.div>
        ) : viewMode === "3d" ? (
          /* 3D Depth Deck Carousel for Genuine Database Reviews */
          <div className="relative w-full h-[500px] sm:h-[540px] py-2 flex items-center justify-center">
            <ReviewDepthCarousel
              reviews={reviews}
              depth={220}
              spread={95}
              tilt={22}
              tiltDirection="right"
              perspective={1400}
              visibleCards={Math.min(4, reviews.length)}
              falloff={0.2}
              blur={6}
              cardWidth={330}
              cardHeight={440}
              radius={26}
              tint="#059669"
              duration={700}
              autoplay={reviews.length > 1}
              autoplayDelay={3800}
              loop={reviews.length > 1}
              showControls={reviews.length > 1}
              showIndicators={reviews.length > 1}
            />
          </div>
        ) : (
          /* Genuine Database Reviews Grid View */
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {reviews.map((item) => (
              <motion.div
                key={item._id || item.id || item.name}
                variants={cardVariants}
                whileHover={{ y: -6 }}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-slate-50/60 p-6 sm:p-7 shadow-xs hover:shadow-xl hover:border-emerald-300 transition-all duration-300"
              >
                <div>
                  {/* Rating & Quote Icon */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1">
                      {[...Array(Number(item.rating) || 5)].map((_, i) => (
                        <Star
                          key={i}
                          size={15}
                          className="fill-amber-400 text-amber-400"
                        />
                      ))}
                    </div>
                    <Quote className="h-6 w-6 text-emerald-600/30 group-hover:text-emerald-600/60 transition-colors" />
                  </div>

                  {/* Review Content */}
                  <p className="text-sm text-slate-700 leading-relaxed italic mb-6">
                    &ldquo;{item.content}&rdquo;
                  </p>
                </div>

                {/* Author Info */}
                <div className="pt-4 border-t border-slate-200/70">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-11 w-11 rounded-2xl bg-linear-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0"
                    >
                      {item.name
                        ? item.name
                            .split(" ")
                            .filter(Boolean)
                            .map((n) => n[0])
                            .join("")
                            .substring(0, 2)
                            .toUpperCase()
                        : "VP"}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-slate-900 truncate">
                        {item.name}
                      </h4>
                      <p className="text-xs text-slate-500 truncate">
                        {item.role || "Verified Buyer"}
                      </p>
                      {item.location ? (
                        <p className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                          <MapPin size={10} />
                          <span>{item.location}</span>
                        </p>
                      ) : null}
                      <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                        <CheckCircle2 size={12} className="text-emerald-600" />
                        <span>{item.verifiedBadge || "Verified Patient"}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Aggregate Ratings Banner */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12 sm:mt-16 rounded-2xl border border-slate-200 bg-linear-to-r from-emerald-50/80 via-slate-50 to-teal-50/80 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="flex items-center gap-4 text-left">
            <div className="h-14 w-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shrink-0">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                NABH & CDSCO Pharmacy Compliant
              </h3>
              <p className="text-sm text-slate-600">
                Licensed operations, authentic batch verification, and tamper-proof sealed packaging.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 shrink-0">
            <div className="text-center">
              <p className="text-2xl font-black text-slate-900">
                {averageRating} / 5.0
              </p>
              <p className="text-xs text-slate-500 font-medium">
                {reviews.length} {reviews.length === 1 ? "Patient Review" : "Patient Reviews"}
              </p>
            </div>
            <div className="h-8 w-px bg-slate-300" />
            <div className="text-center">
              <p className="text-2xl font-black text-emerald-600">100%</p>
              <p className="text-xs text-slate-500 font-medium">Genuine Medicines</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Write a Review Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="absolute top-5 right-5 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
              >
                <X size={20} />
              </button>

              <div className="mb-6 text-left">
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 mb-2">
                  <Sparkles size={13} />
                  Write a Review
                </div>
                <h3 className="text-2xl font-bold text-slate-900">
                  Share Your Experience
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  How was your experience ordering medicines and health products with us?
                </p>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-4 text-left">
                {/* Rating Stars Selection */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Your Rating
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData({ ...formData, rating: star })}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 transition-transform hover:scale-110 cursor-pointer"
                      >
                        <Star
                          size={28}
                          className={`${
                            (hoverRating || formData.rating) >= star
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-300"
                          } transition-colors`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-sm font-bold text-slate-700">
                      {formData.rating} out of 5 Stars
                    </span>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Your Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g. Karthik Pandian"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50"
                  />
                </div>

                {/* Role / Tag */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Your Role / Tag
                    </label>
                    <input
                      type="text"
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({ ...formData, role: e.target.value })
                      }
                      placeholder="e.g. Patient / Caregiver"
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      City / Location
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      placeholder="e.g. Chennai, Tamil Nadu"
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50"
                    />
                  </div>
                </div>

                {/* Content */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Review / Feedback Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    placeholder="Write about the medicine quality, delivery speed, customer service, or doctor prescription experience..."
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 resize-none"
                  />
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-emerald-700 transition disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send size={15} />
                    )}
                    {submitting ? "Submitting..." : "Submit Review"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default ModernTestimonials;