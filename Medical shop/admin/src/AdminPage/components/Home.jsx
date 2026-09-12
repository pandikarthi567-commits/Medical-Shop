/* eslint-disable no-unused-vars */
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  HeartPulse,
  Pill,
  Sparkles,
  Clock3,
  Stethoscope,
} from "lucide-react";
import PageTransition, { fadeUpItem } from "../components/PageTransition";

const categories = [
  { id: 1, name: "Tablets", icon: Pill, desc: "Pain relief, fever care, and daily dosage medicines." },
  { id: 2, name: "Syrups", icon: HeartPulse, desc: "Cough, cold, and child-friendly liquid medications." },
  { id: 3, name: "Vitamins", icon: Sparkles, desc: "Daily nutrition, immunity, and wellness supplements." },
  { id: 4, name: "First Aid", icon: ShieldCheck, desc: "Bandages, creams, antiseptics, and essentials." },
];

const featuredMedicines = [
  {
    id: 1,
    name: "Paracetamol 500mg",
    price: 25,
    image:
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80",
    description: "Effective relief for fever and mild pain.",
  },
  {
    id: 2,
    name: "Vitamin C Tablets",
    price: 120,
    image:
      "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?auto=format&fit=crop&w=800&q=80",
    description: "Supports immunity and daily wellness.",
  },
  {
    id: 3,
    name: "Cough Syrup",
    price: 95,
    image:
      "https://images.unsplash.com/photo-1628771065518-0d82f1938462?auto=format&fit=crop&w=800&q=80",
    description: "Fast relief from dry and wet cough.",
  },
  {
    id: 4,
    name: "Antiseptic Cream",
    price: 70,
    image:
      "https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&w=800&q=80",
    description: "Helps protect minor cuts and wounds.",
  },
];

const featurePoints = [
  {
    icon: ShieldCheck,
    title: "Genuine Products",
    desc: "All medicines and healthcare items are sourced from trusted suppliers.",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    desc: "Quick and reliable doorstep delivery for essential orders.",
  },
  {
    icon: Clock3,
    title: "Simple Ordering",
    desc: "Search, add to cart, checkout, and track your order with ease.",
  },
];

const Home = () => {
  return (
    <PageTransition className="min-h-screen bg-linear-to-br from-slate-50 via-white to-emerald-50 text-slate-900">
      <section className="relative overflow-hidden bg-linear-to-r from-emerald-700 via-emerald-600 to-teal-500 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.12),transparent_30%)]" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 sm:py-16 md:py-20 lg:grid-cols-2 lg:px-8 lg:py-24">
          <motion.div
            variants={fadeUpItem}
            initial="initial"
            animate="animate"
            className="max-w-2xl"
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-50 backdrop-blur-md sm:text-xs">
              <Stethoscope size={15} />
              Trusted online medical shop
            </div>

            <h1 className="text-3xl font-bold leading-tight sm:text-4xl md:text-5xl lg:text-6xl">
              Medicines delivered to your doorstep
            </h1>

            <p className="mt-5 max-w-xl text-sm text-emerald-50/90 sm:text-base md:text-lg">
              Order healthcare essentials, prescription support, wellness products,
              and daily medicines with easy browsing, secure checkout, and fast delivery.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                to="/shop"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-white px-6 text-sm font-semibold text-emerald-700 shadow-lg transition hover:bg-emerald-50"
              >
                Shop Now
                <ArrowRight size={18} />
              </Link>

              <Link
                to="/admin/login"
                className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/30 bg-white/10 px-6 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white hover:text-emerald-700"
              >
                Admin Login
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                { label: "Orders Delivered", value: "10K+" },
                { label: "Healthcare Products", value: "500+" },
                { label: "Customer Support", value: "24/7" },
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.08 }}
                  className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md"
                >
                  <p className="text-lg font-bold sm:text-xl">{item.value}</p>
                  <p className="mt-1 text-xs text-emerald-50/80 sm:text-sm">{item.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="rounded-3xl border border-white/15 bg-white/10 p-3 shadow-2xl backdrop-blur-xl sm:rounded-[30px] sm:p-4">
              <img
                src="https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=1000&q=80"
                alt="Medical products"
                className="h-60 w-full rounded-[20px] object-cover sm:h-80 sm:rounded-3xl md:h-95 lg:h-107.5"
              />
            </div>

            <div className="absolute -bottom-4 left-3 right-3 rounded-2xl bg-white px-4 py-3 text-slate-900 shadow-xl sm:-bottom-5 sm:left-6 sm:right-auto sm:max-w-xs">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500 sm:text-xs">
                Delivery Promise
              </p>
              <p className="mt-1 text-xs font-semibold sm:text-sm">
                Fast, secure, and reliable healthcare delivery
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
        <motion.div
          variants={fadeUpItem}
          initial="initial"
          animate="animate"
          className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Shop by Category</h2>
            <p className="mt-2 text-sm text-slate-600 sm:text-base">
              Explore products based on your healthcare needs
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.07 }}
                whileHover={{ y: -6 }}
                className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm transition hover:shadow-lg sm:p-6"
              >
                <div className="mb-4 inline-flex rounded-2xl bg-emerald-50 p-3 text-emerald-600">
                  <Icon size={24} />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{category.name}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{category.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
        <motion.div
          variants={fadeUpItem}
          initial="initial"
          animate="animate"
          className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Featured Medicines</h2>
            <p className="mt-2 text-sm text-slate-600 sm:text-base">
              Popular and commonly ordered healthcare products
            </p>
          </div>

          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 transition hover:text-emerald-700"
          >
            View All
            <ArrowRight size={16} />
          </Link>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredMedicines.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ y: -8 }}
              className="group overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-sm transition hover:shadow-xl"
            >
              <div className="overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-52 w-full object-cover transition duration-500 group-hover:scale-105 sm:h-56"
                />
              </div>

              <div className="p-5">
                <h3 className="text-lg font-bold text-slate-900">{item.name}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>

                <div className="mt-5 flex items-center justify-between gap-3">
                  <span className="text-lg font-bold text-emerald-600 sm:text-xl">
                    ₹{item.price}
                  </span>

                  <button className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700">
                    Add to Cart
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-3 lg:px-8 lg:py-14">
          {featurePoints.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className="rounded-3xl bg-slate-50 p-6"
              >
                <div className="mb-4 inline-flex rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                  <Icon size={22} />
                </div>
                <h3 className="text-xl font-bold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-600 sm:text-base">{item.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>
    </PageTransition>
  );
};

export default Home;