/* eslint-disable no-unused-vars */
import React from "react";
import { motion } from "framer-motion";
import {
  Search,
  FileCheck2,
  PackageCheck,
  Truck,
  ArrowRight,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Find Medicines or Upload Rx",
    description:
      "Search our catalog of 15,000+ medicines or simply take a photo of your doctor's prescription.",
    badge: "Takes 30 secs",
  },
  {
    number: "02",
    icon: FileCheck2,
    title: "Pharmacist Verification",
    description:
      "Licensed chemists verify valid dosages, interactions, and confirm genuine batch serials.",
    badge: "100% Verified",
  },
  {
    number: "03",
    icon: PackageCheck,
    title: "Hygienic Cold-Pack",
    description:
      "Tamper-proof safety sealing with temperature monitoring for insulin and sensitive products.",
    badge: "Sealed & Safe",
  },
  {
    number: "04",
    icon: Truck,
    title: "Fast Doorstep Delivery",
    description:
      "Real-time GPS rider tracking to your doorstep with flexible payments including COD and UPI.",
    badge: "Express Arrival",
  },
];

const ModernProcess = () => {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden bg-slate-50/70 py-16 sm:py-20 lg:py-24 border-t border-slate-200/80">
      {/* Background ambient accents */}
      <div className="absolute top-1/2 left-0 w-72 h-72 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-teal-100/40 rounded-full blur-3xl pointer-events-none" />

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
            <Clock size={14} className="text-emerald-600" />
            Simple & Transparent
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How MediCare Works in{" "}
            <span className="bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              4 Simple Steps
            </span>
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600">
            From prescription upload to doorstep arrival, enjoy an effortless and secure healthcare experience.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative"
        >
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                variants={itemVariants}
                whileHover={{ y: -6 }}
                className="group relative rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs hover:shadow-xl hover:border-emerald-300 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Top Step Header */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300 flex items-center justify-center shadow-xs">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-2xl font-black text-slate-200 group-hover:text-emerald-500/40 transition-colors">
                      {step.number}
                    </span>
                  </div>

                  <span className="inline-block px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-bold mb-3">
                    {step.badge}
                  </span>

                  <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors">
                    {step.title}
                  </h3>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                  <ShieldCheck size={14} />
                  <span>Certified Process</span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="mt-12 sm:mt-14 flex flex-col sm:flex-row items-center justify-center gap-4 text-center"
        >
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/products")}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
          >
            <span>Start Your Order Now</span>
            <ArrowRight size={16} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/prescription")}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-700 border-2 border-emerald-500/40 font-bold text-sm shadow-sm transition"
          >
            Upload Prescription
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default ModernProcess;