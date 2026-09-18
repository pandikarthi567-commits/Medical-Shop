/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Clock3,
  BadgeCheck,
  ArrowUp,
  CreditCard,
  Building2,
  FileText,
  Send,
  Sparkles,
  Truck,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  X,
  Stethoscope,
  Lock,
  Award,
} from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaLinkedinIn,
  FaWhatsapp,
} from "react-icons/fa";

const modalData = {
  privacy: {
    title: "Privacy & Health Data Protection Policy",
    icon: Lock,
    content: (
      <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
        <p>
          At <strong>MediCare Pharmacy</strong>, protecting your sensitive health records, prescriptions, and financial data is our highest priority. All patient records are encrypted at rest with AES-256 and transmitted using end-to-end TLS 1.3 encryption.
        </p>
        <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
          <p className="font-bold text-emerald-900 text-xs uppercase tracking-wide mb-1">
            Data Compliance Assurance
          </p>
          <p className="text-xs text-emerald-800">
            We adhere strictly to the Digital Personal Data Protection Act (DPDPA), Information Technology Rules 2011, and National Digital Health Mission (NDHM) guidelines. We never sell your health history to third parties.
          </p>
        </div>
        <p>
          Your prescription images are accessible solely by certified dispensing pharmacists on duty for verification and dosage validation.
        </p>
      </div>
    ),
  },
  terms: {
    title: "Terms of Sale & Dispensing Regulations",
    icon: FileText,
    content: (
      <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
        <p>
          MediCare operates strictly in compliance with the <strong>Drugs and Cosmetics Act, 1940</strong> and <strong>Pharmacy Act, 1948</strong> under Retail Drug License <span className="font-mono font-bold text-slate-800">DL-TN-MDU-2024-00892</span>.
        </p>
        <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm">
          <li>Prescription medications (Schedule H, H1, and X) require a valid, non-expired prescription by a Registered Medical Practitioner.</li>
          <li>Our pharmacists reserve the right to verify prescriptions with your prescribing physician.</li>
          <li>Orders placed through cash-on-delivery are confirmed via SMS/OTP verification prior to dispatch.</li>
        </ul>
      </div>
    ),
  },
  returns: {
    title: "Return, Replacement & Refund Policy",
    icon: RotateCcw,
    content: (
      <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
        <p>
          We stand by the 100% authenticity and quality of every medication dispatched from our certified dispensaries.
        </p>
        <div className="grid sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <p className="font-bold text-slate-900 mb-1">Eligible for 7-Day Return:</p>
            <p className="text-slate-600">Damaged packaging, wrong batch received, or near-expiry medicines (less than 3 months).</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <p className="font-bold text-slate-900 mb-1">Non-Returnable Items:</p>
            <p className="text-slate-600">Opened syrups, cold-chain temperature items (Insulins, Vaccines), and injectable vials once received.</p>
          </div>
        </div>
        <p className="text-xs text-slate-500">
          Refunds are processed to the original payment source within 3-5 business days upon pickup and pharmacist inspection.
        </p>
      </div>
    ),
  },
  prescriptionGuidelines: {
    title: "Prescription Safety & Verification Rules",
    icon: Stethoscope,
    content: (
      <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
        <p>
          To ensure patient safety, our clinical team strictly validates every uploaded document according to CDSCO regulations.
        </p>
        <div className="space-y-2 text-xs">
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-900">
            <CheckCircle2 size={16} className="text-emerald-600 mt-0.5 shrink-0" />
            <span>Must include Doctor's full name, medical registration council number, and clinic/hospital seal.</span>
          </div>
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-900">
            <CheckCircle2 size={16} className="text-emerald-600 mt-0.5 shrink-0" />
            <span>Must clearly display patient full name, age, gender, date of consultation, and signature.</span>
          </div>
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-900">
            <CheckCircle2 size={16} className="text-emerald-600 mt-0.5 shrink-0" />
            <span>Medicine names, dosage strengths (e.g. 500mg), and frequency/duration must be clearly legible.</span>
          </div>
        </div>
      </div>
    ),
  },
};

const socialLinks = [
  { icon: FaFacebookF, href: "https://facebook.com", label: "Facebook", bg: "hover:bg-blue-600 hover:border-blue-600" },
  { icon: FaInstagram, href: "https://instagram.com", label: "Instagram", bg: "hover:bg-pink-600 hover:border-pink-600" },
  { icon: FaTwitter, href: "https://twitter.com", label: "Twitter", bg: "hover:bg-sky-500 hover:border-sky-500" },
  { icon: FaLinkedinIn, href: "https://linkedin.com", label: "LinkedIn", bg: "hover:bg-blue-700 hover:border-blue-700" },
  { icon: FaWhatsapp, href: "https://wa.me/919876543210", label: "WhatsApp", bg: "hover:bg-emerald-600 hover:border-emerald-600" },
];

const Footer = () => {
  const [email, setEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState("idle"); // idle | loading | success
  const [activeModal, setActiveModal] = useState(null);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    setNewsletterStatus("loading");
    setTimeout(() => {
      setNewsletterStatus("success");
      setEmail("");
    }, 900);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative bg-slate-900 text-slate-300 overflow-hidden font-sans border-t border-slate-800">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Trust Badges Strip */}
      <div className="relative z-10 border-b border-slate-800 bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 shadow-xs">
                <ShieldCheck size={22} />
              </div>
              <div>
                <p className="font-bold text-white text-sm">100% Genuine</p>
                <p className="text-xs text-slate-400">CDSCO Licensed & Sourced</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0 shadow-xs">
                <BadgeCheck size={22} />
              </div>
              <div>
                <p className="font-bold text-white text-sm">Certified Pharmacists</p>
                <p className="text-xs text-slate-400">24/7 Clinical Review</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 shadow-xs">
                <Truck size={22} />
              </div>
              <div>
                <p className="font-bold text-white text-sm">Express Doorstep</p>
                <p className="text-xs text-slate-400">Cold-Chain Temperature</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0 shadow-xs">
                <RotateCcw size={22} />
              </div>
              <div>
                <p className="font-bold text-white text-sm">Easy Returns</p>
                <p className="text-xs text-slate-400">7-Day Hassle-Free Policy</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-10">
        {/* Newsletter Subscription Strip */}
        <div className="mb-12 p-6 sm:p-8 rounded-3xl bg-linear-to-r from-slate-800/90 via-slate-800/60 to-emerald-950/40 border border-slate-700/70 shadow-xl shadow-black/20 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="max-w-xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-3">
              <Sparkles size={13} className="text-emerald-400" />
              <span>Stay Healthy & Save More</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Get 15% OFF on your first prescription
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
              Subscribe to our health bulletin for seasonal disease alerts, medication tips, and exclusive pharmacy coupon codes.
            </p>
          </div>

          <div className="w-full lg:w-auto min-w-[320px] sm:min-w-[400px]">
            {newsletterStatus === "success" ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm font-semibold"
              >
                <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
                <span>Thank you! Welcome coupon <strong>MEDICARE15</strong> sent to your inbox.</span>
              </motion.div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address..."
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-400 text-sm focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 transition shadow-inner"
                  />
                </div>
                <button
                  type="submit"
                  disabled={newsletterStatus === "loading"}
                  className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition disabled:opacity-70 shrink-0 cursor-pointer"
                >
                  <span>{newsletterStatus === "loading" ? "Joining..." : "Subscribe"}</span>
                  <Send size={15} />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* 5-Column Structured Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Col 1: Brand & Accreditation (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            <Link to="/" className="flex items-center gap-3 group inline-flex">
              <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-linear-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-md shadow-emerald-500/25 group-hover:scale-105 transition">
                <Heart className="w-5 h-5 fill-slate-950 text-slate-950" />
              </div>
              <div>
                <span className="font-extrabold text-2xl text-white tracking-tight">
                  Medi<span className="text-emerald-400">Care</span>
                </span>
                <p className="text-[11px] text-emerald-400 font-semibold tracking-wide flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Govt. Licensed Pharmacy
                </p>
              </div>
            </Link>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Empowering individuals and families across India with verified medications, certified healthcare equipment, chronic care refills, and personalized clinical guidance.
            </p>

            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-800 space-y-1.5 text-xs text-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Drug License No:</span>
                <span className="font-mono font-bold text-emerald-400">DL-TN-MDU-2024-00892</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Accredited By:</span>
                <span className="font-medium text-white">PCI & CDSCO India</span>
              </div>
            </div>

            {/* Social Connect Icons */}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                Official Channels
              </p>
              <div className="flex items-center gap-2">
                {socialLinks.map(({ icon: Icon, href, label, bg }, idx) => (
                  <motion.a
                    key={idx}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center justify-center w-9 h-9 rounded-xl border border-slate-700 bg-slate-800/80 text-slate-300 hover:text-white transition duration-200 ${bg}`}
                  >
                    <Icon className="w-4 h-4" />
                  </motion.a>
                ))}
              </div>
            </div>
          </div>

          {/* Col 2: Pharmacy & Shop (2 cols) */}
          <div className="lg:col-span-2 space-y-3.5">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Medicines & Store
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link to="/products" className="text-slate-400 hover:text-emerald-400 transition flex items-center gap-1.5">
                  <ChevronRight size={13} className="text-emerald-500" />
                  <span>All Medicines</span>
                </Link>
              </li>
              <li>
                <Link to="/categories" className="text-slate-400 hover:text-emerald-400 transition flex items-center gap-1.5">
                  <ChevronRight size={13} className="text-emerald-500" />
                  <span>Therapeutic Categories</span>
                </Link>
              </li>
              <li>
                <Link to="/offers" className="text-slate-400 hover:text-emerald-400 transition flex items-center gap-1.5">
                  <ChevronRight size={13} className="text-emerald-500" />
                  <span>Special Offers</span>
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">Hot</span>
                </Link>
              </li>
              <li>
                <Link to="/healthcare" className="text-slate-400 hover:text-emerald-400 transition flex items-center gap-1.5">
                  <ChevronRight size={13} className="text-emerald-500" />
                  <span>Health Devices</span>
                </Link>
              </li>
              <li>
                <Link to="/prescription" className="text-slate-400 hover:text-emerald-400 transition flex items-center gap-1.5">
                  <ChevronRight size={13} className="text-emerald-500" />
                  <span>Upload Prescription</span>
                </Link>
              </li>
              <li>
                <Link to="/track-order" className="text-slate-400 hover:text-emerald-400 transition flex items-center gap-1.5">
                  <ChevronRight size={13} className="text-emerald-500" />
                  <span>Track Express Order</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Compliance & Patient Info (2 cols) */}
          <div className="lg:col-span-2 space-y-3.5">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Safety & Policies
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <button
                  onClick={() => setActiveModal("prescriptionGuidelines")}
                  className="text-left text-slate-400 hover:text-emerald-400 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronRight size={13} className="text-emerald-500" />
                  <span>Prescription Guidelines</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveModal("returns")}
                  className="text-left text-slate-400 hover:text-emerald-400 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronRight size={13} className="text-emerald-500" />
                  <span>Return & Refunds</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveModal("privacy")}
                  className="text-left text-slate-400 hover:text-emerald-400 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronRight size={13} className="text-emerald-500" />
                  <span>Privacy & Health Data</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveModal("terms")}
                  className="text-left text-slate-400 hover:text-emerald-400 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronRight size={13} className="text-emerald-500" />
                  <span>Terms of Dispensing</span>
                </button>
              </li>
              <li>
                <Link to="/contact" className="text-slate-400 hover:text-emerald-400 transition flex items-center gap-1.5">
                  <ChevronRight size={13} className="text-emerald-500" />
                  <span>Contact Pharmacist</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Dispensary Hub & 24/7 Hotline Card (4 cols) */}
          <div className="lg:col-span-4">
            <div className="rounded-3xl bg-linear-to-b from-slate-800/90 to-slate-900 border border-slate-700/80 p-5 sm:p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-700/70">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-sm font-bold text-white">
                    Dispensary & Headquarters
                  </h4>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  24/7 Active
                </span>
              </div>

              <div className="space-y-3.5 text-xs sm:text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-white">MediCare Healthcare Complex</p>
                    <p className="text-xs text-slate-400 leading-relaxed mt-0.5">
                      KK Nagar Main Road, Madurai, Tamil Nadu 625020, India
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-white">24/7 Pharmacist Hotline</p>
                    <a
                      href="tel:+919876543210"
                      className="text-xs text-emerald-400 hover:text-emerald-300 transition font-bold block mt-0.5"
                    >
                      +91 98765 43210 <span className="font-normal text-slate-400">(Toll-Free)</span>
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-white">Clinical & Support Email</p>
                    <a
                      href="mailto:support@medicare.com"
                      className="text-xs text-slate-300 hover:text-emerald-300 transition block mt-0.5"
                    >
                      support@medicare.com
                    </a>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Instant Order via WhatsApp:</span>
                <a
                  href="https://wa.me/919876543210?text=Hi%20MediCare%2C%20I%20want%20to%20order%20medicines"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 text-xs font-bold transition border border-emerald-500/40"
                >
                  <FaWhatsapp size={14} />
                  <span>Chat Now</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Accepted Payment Gateways & Verified Security Strip */}
        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap justify-center md:justify-start">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Accepted Modes:
            </span>
            <div className="flex items-center gap-2 text-slate-300 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 font-semibold">UPI</span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 font-semibold">GPay</span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 font-semibold">PhonePe</span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 font-semibold">Visa</span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 font-semibold">MasterCard</span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 font-semibold">RuPay</span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 font-semibold">Cash On Delivery</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Lock size={13} className="text-emerald-400" />
            <span>256-Bit SSL Bank Grade Security</span>
            <span className="text-slate-600">•</span>
            <span>PCI-DSS Compliant</span>
          </div>
        </div>

        {/* Bottom Legal Copyright & Smooth Back-to-Top */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p className="text-center sm:text-left">
            © {new Date().getFullYear()} MediCare Healthcare & Pharmacy Ltd. All rights reserved. Registered Retail Chemist & Druggist.
          </p>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveModal("privacy")}
              className="hover:text-emerald-400 transition cursor-pointer"
            >
              Privacy
            </button>
            <button
              onClick={() => setActiveModal("terms")}
              className="hover:text-emerald-400 transition cursor-pointer"
            >
              Terms of Sale
            </button>
            <button
              onClick={() => setActiveModal("returns")}
              className="hover:text-emerald-400 transition cursor-pointer"
            >
              Refunds
            </button>

            <button
              onClick={scrollToTop}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-300 transition font-bold border border-slate-700 shadow-xs cursor-pointer ml-2"
              aria-label="Back to Top"
            >
              <span>Top</span>
              <ArrowUp size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Policy & Guidelines Modal */}
      <AnimatePresence>
        {activeModal && modalData[activeModal] && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-xl rounded-3xl bg-white p-6 sm:p-7 shadow-2xl text-slate-900 border border-slate-200 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
                    {React.createElement(modalData[activeModal].icon, { size: 20 })}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    {modalData[activeModal].title}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveModal(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <div>{modalData[activeModal].content}</div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setActiveModal(null)}
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition cursor-pointer"
                >
                  Close Window
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </footer>
  );
};

export default Footer;