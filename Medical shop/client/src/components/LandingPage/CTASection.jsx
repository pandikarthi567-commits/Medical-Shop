/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Phone,
  Send,
  CheckCircle2,
  Download,
  FileUp,
  Clock,
  ShieldCheck,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const CTASection = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    // Simulate real-world API call
    await new Promise((resolve) => setTimeout(resolve, 800));

    setLoading(false);
    setSubscribed(true);
    setEmail("");

    setTimeout(() => {
      setSubscribed(false);
    }, 4000);
  };

  return (
    <section className="relative overflow-hidden py-16 sm:py-20 lg:py-24 bg-linear-to-b from-white via-slate-900 to-slate-950 text-white">
      {/* Dynamic ambient radial glows */}
      <div className="absolute top-0 left-1/2 w-full max-w-7xl h-96 bg-radial from-emerald-600/20 via-transparent to-transparent -translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 mx-auto w-full max-w-7xl 2xl:max-w-400 px-4 sm:px-6 lg:px-8">
        {/* Top Dual Card Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-14 sm:mb-16">
          {/* Card 1: Fast Prescription Upload */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            whileHover={{ y: -4 }}
            className="rounded-3xl border border-emerald-500/30 bg-linear-to-br from-emerald-950/80 via-slate-900 to-slate-900/90 p-8 sm:p-10 shadow-2xl backdrop-blur-md flex flex-col justify-between"
          >
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3.5 py-1 text-xs font-bold text-emerald-300 mb-4">
                <FileUp size={14} className="text-emerald-400" />
                Prescription Required?
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
                Upload Your Prescription & Let Our Pharmacists Handle The Rest
              </h3>
              <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
                Skip typing medicine names! Simply upload a photo of your doctor’s note. We verify doses, confirm stock, and deliver in tamper-proof boxes.
              </p>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/prescription")}
                className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition"
              >
                <FileUp size={18} />
                <span>Upload Doctor’s Rx</span>
                <ArrowRight size={16} />
              </motion.button>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
                <span>End-to-End HIPAA & Privacy Protected</span>
              </div>
            </div>
          </motion.div>

          {/* Card 2: 24/7 Pharmacist Helpline & Support */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            whileHover={{ y: -4 }}
            className="rounded-3xl border border-slate-700/80 bg-linear-to-br from-slate-900 via-slate-900 to-slate-950 p-8 sm:p-10 shadow-2xl backdrop-blur-md flex flex-col justify-between"
          >
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/20 border border-cyan-400/30 px-3.5 py-1 text-xs font-bold text-cyan-300 mb-4">
                <Clock size={14} className="text-cyan-400" />
                Available 24 Hours • 7 Days
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
                Need Help With Dosage or Medicine Substitutes?
              </h3>
              <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
                Connect with our licensed duty pharmacist directly over the phone or WhatsApp for free guidance on drug interactions and timing.
              </p>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <a
                href="tel:+919876543210"
                className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-md flex items-center justify-center gap-2 transition"
              >
                <Phone size={18} className="text-emerald-600" />
                <span>Call +91 98765 43210</span>
              </a>
              <button
                onClick={() => navigate("/contact")}
                className="px-5 py-3.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-200 font-semibold text-sm transition flex items-center justify-center gap-2"
              >
                <MessageSquare size={17} />
                <span>Ask a Pharmacist</span>
              </button>
            </div>
          </motion.div>
        </div>

        {/* Newsletter & App Download Section */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 sm:p-10 lg:p-12 shadow-2xl"
        >
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-6">
              <h4 className="text-xl sm:text-2xl font-bold text-white mb-2">
                Join 50,000+ Subscribers For Health Alerts & Discounts
              </h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Get monthly refill reminders, seasonal wellness tips, and exclusive coupon codes for your essential medications.
              </p>
            </div>

            {/* Right Newsletter Input */}
            <div className="lg:col-span-6">
              <form onSubmit={handleSubscribe} className="relative">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  <div className="relative flex-1">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="email"
                      required
                      placeholder="Enter your email address..."
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder:text-slate-400 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 shrink-0 disabled:opacity-60"
                  >
                    {loading ? (
                      <span>Subscribing...</span>
                    ) : (
                      <>
                        <span>Get Coupons</span>
                        <Send size={15} />
                      </>
                    )}
                  </motion.button>
                </div>

                <AnimatePresence>
                  {subscribed && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="mt-3 flex items-center gap-2 text-xs font-semibold text-emerald-400"
                    >
                      <CheckCircle2 size={16} />
                      <span>Thank you! Your 15% welcome voucher has been sent to your inbox.</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;