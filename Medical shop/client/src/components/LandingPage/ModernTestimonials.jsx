/* eslint-disable no-unused-vars */
import React from "react";
import { motion } from "framer-motion";
import { Star, Quote, ShieldCheck, CheckCircle2, Heart } from "lucide-react";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.12,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const testimonials = [
  {
    name: "Dr. Vikram Sethi",
    role: "Senior Consultant Physician, MD",
    location: "Apollo Clinics Network",
    content:
      "I routinely recommend MediCare to my patients for chronic conditions. Their authentic batch verification and strict cold-chain insulin storage exceed industry standards.",
    rating: 5,
    verifiedBadge: "Verified Medical Doctor",
    avatarBg: "bg-emerald-600",
    initials: "VS",
  },
  {
    name: "Priya Natarajan",
    role: "Caregiver & Family Member",
    location: "Madurai, Tamil Nadu",
    content:
      "Ordering monthly diabetic medicines and BP monitors for my elderly parents is now seamless. Genuine medicines, sealed packages, and fast doorstep delivery every time.",
    rating: 5,
    verifiedBadge: "Verified Patient Buyer",
    avatarBg: "bg-teal-600",
    initials: "PN",
  },
  {
    name: "Rajeshwar Rao",
    role: "Senior Citizen",
    location: "Chennai, Tamil Nadu",
    content:
      "I simply uploaded a picture of my doctor's prescription. A licensed pharmacist called to explain dosages and my medicines reached my home in under 45 minutes.",
    rating: 5,
    verifiedBadge: "Prescription User",
    avatarBg: "bg-cyan-700",
    initials: "RR",
  },
  {
    name: "Ananya Deshmukh",
    role: "Mother & Working Professional",
    location: "Bangalore, Karnataka",
    content:
      "From baby essentials and pediatric vitamins to first-aid supplies, MediCare has become our household's trusted digital chemist. Super reliable app experience!",
    rating: 5,
    verifiedBadge: "Repeat Customer",
    avatarBg: "bg-slate-800",
    initials: "AD",
  },
];

const ModernTestimonials = () => {
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
          className="text-center max-w-3xl mx-auto mb-14 sm:mb-16"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/40 bg-emerald-50 px-3.5 py-1 text-xs font-bold text-emerald-800 mb-3">
            <Heart size={14} className="text-emerald-600 fill-emerald-600" />
            Patient Testimonials & Reviews
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Trusted by Over{" "}
            <span className="bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              50,000+ Happy Families
            </span>
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600">
            Real feedback from patients, caregivers, and medical professionals across India.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {testimonials.map((item, index) => (
            <motion.div
              key={item.name}
              variants={cardVariants}
              whileHover={{ y: -6 }}
              className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-slate-50/60 p-6 sm:p-7 shadow-xs hover:shadow-xl hover:border-emerald-300 transition-all duration-300"
            >
              <div>
                {/* Rating & Quote Icon */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(item.rating)].map((_, i) => (
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
                    className={`h-11 w-11 rounded-full ${item.avatarBg} text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0`}
                  >
                    {item.initials}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm text-slate-900 truncate">
                      {item.name}
                    </h4>
                    <p className="text-xs text-slate-500 truncate">{item.role}</p>
                    <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                      <CheckCircle2 size={12} className="text-emerald-600" />
                      <span>{item.verifiedBadge}</span>
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

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
                Licensed operations, authentic barcode verification, and tamper-proof security seals.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 shrink-0">
            <div className="text-center">
              <p className="text-2xl font-black text-slate-900">4.9 / 5.0</p>
              <p className="text-xs text-slate-500 font-medium">Over 12,000+ Reviews</p>
            </div>
            <div className="h-8 w-px bg-slate-300" />
            <div className="text-center">
              <p className="text-2xl font-black text-emerald-600">99.8%</p>
              <p className="text-xs text-slate-500 font-medium">On-Time Accuracy</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ModernTestimonials;