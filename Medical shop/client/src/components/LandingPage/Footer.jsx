/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
  ShieldCheck,
  Clock3,
  BadgeCheck,
  ArrowUp,
  AlertCircle,
  CreditCard,
  Building2,
  FileText,
} from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaLinkedinIn,
} from "react-icons/fa";

const detailContent = {
  contact: {
    title: "Registered Pharmacy Address & Hotline",
    content: (
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 mt-0.5 text-emerald-500 shrink-0" />
          <div>
            <p className="font-bold text-slate-900 text-sm">Dispensary & Headquarters</p>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              MediCare Healthcare Complex, KK Nagar Main Road, Madurai, Tamil Nadu 625020
            </p>
            <p className="text-xs text-emerald-700 font-semibold mt-1">
              Drug License: DL-TN-MDU-2024-00892
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Mail className="w-5 h-5 mt-0.5 text-emerald-500 shrink-0" />
          <div>
            <p className="font-bold text-slate-900 text-sm">Customer & Pharmacist Email</p>
            <a
              href="mailto:support@medicare.com"
              className="text-xs sm:text-sm text-slate-600 hover:text-emerald-600 transition"
            >
              support@medicare.com
            </a>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Phone className="w-5 h-5 mt-0.5 text-emerald-500 shrink-0" />
          <div>
            <p className="font-bold text-slate-900 text-sm">24/7 Helpline & WhatsApp Orders</p>
            <a
              href="tel:+919876543210"
              className="text-xs sm:text-sm text-slate-600 hover:text-emerald-600 transition font-medium"
            >
              +91 98765 43210 (Toll Free 24/7)
            </a>
          </div>
        </div>
      </div>
    ),
  },

  about: {
    title: "About MediCare Pharmacy Network",
    content: (
      <div className="space-y-3 text-xs sm:text-sm leading-relaxed text-slate-600">
        <p>
          MediCare is a licensed digital pharmacy offering authentic branded medicines, chronic care subscriptions, health monitors, and certified pharmacist guidance.
        </p>
        <p>
          We partner exclusively with verified pharmaceutical manufacturers ensuring all formulations adhere to WHO-GMP standards with strict cold-chain maintenance.
        </p>
        <p className="font-semibold text-emerald-800">
          Serving over 50,000+ satisfied families across India with trust and integrity.
        </p>
      </div>
    ),
  },

  faq: {
    title: "Frequently Asked Questions",
    content: (
      <div className="space-y-3 text-xs sm:text-sm text-slate-600">
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <p className="font-bold text-slate-900">How fast is emergency medicine delivery?</p>
          <p className="text-xs mt-0.5">Express orders are dispatched in 20-30 minutes for urban pin codes.</p>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <p className="font-bold text-slate-900">Are all medicines 100% genuine?</p>
          <p className="text-xs mt-0.5">Yes, every pack is traceable via manufacturer batch serials.</p>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <p className="font-bold text-slate-900">Can I pay Cash on Delivery (COD)?</p>
          <p className="text-xs mt-0.5">Yes, we support COD, UPI, Credit/Debit cards, and NetBanking.</p>
        </div>
      </div>
    ),
  },

  guidelines: {
    title: "Prescription & Safety Guidelines",
    content: (
      <div className="space-y-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
        <p>
          Schedule H and H1 medications strictly mandate a legible prescription from a Registered Medical Practitioner (RMP).
        </p>
        <p>
          Our in-house clinical pharmacists inspect dates, doctor registration numbers, and dosage limits before dispensing any scheduled drugs.
        </p>
        <p className="text-emerald-800 font-semibold">
          Customer health and compliance are our non-negotiable priorities.
        </p>
      </div>
    ),
  },
};

const socialLinks = [
  { icon: FaFacebookF, href: "#", label: "Facebook" },
  { icon: FaInstagram, href: "#", label: "Instagram" },
  { icon: FaTwitter, href: "#", label: "Twitter" },
  { icon: FaLinkedinIn, href: "#", label: "LinkedIn" },
];

const Footer = () => {
  const [activeTab, setActiveTab] = useState("contact");

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative overflow-hidden bg-white border-t border-slate-200 text-slate-700">
      {/* Emergency Notice Ribbon */}
      <div className="bg-amber-50 border-b border-amber-200/80 px-4 py-2.5 text-amber-900 text-xs text-center">
        <div className="max-w-7xl 2xl:max-w-400 mx-auto flex items-center justify-center gap-2 flex-wrap font-medium">
          <AlertCircle size={15} className="text-amber-600 shrink-0" />
          <span>
            <strong>Emergency Medical Disclaimer:</strong> MediCare provides retail pharmacy dispensing. For critical emergency situations, immediately dial <strong>108 / 112</strong> or visit the nearest hospital casualty.
          </span>
        </div>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl 2xl:max-w-400 px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-12">
          {/* Brand & Accreditations (Col 4) */}
          <div className="lg:col-span-4 min-w-0">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-linear-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/20 shrink-0">
                <Heart className="w-5 h-5 fill-white" />
              </div>
              <div>
                <span className="font-extrabold text-2xl text-slate-900 tracking-tight">
                  Medi<span className="text-emerald-600">Care</span>
                </span>
                <p className="text-xs text-emerald-600 font-semibold">
                  Govt. Licensed Pharmacy
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              Empowering individuals and families with authentic medication, certified diagnostics, and compassionate healthcare solutions delivered securely to their homes.
            </p>

            {/* Quality badges */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>CDSCO Approved Sourcing & Barcode Tracking</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                <BadgeCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Registered Pharmacists on Duty 24/7</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                <Clock3 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Express Doorstep Delivery Network</span>
              </div>
            </div>

            {/* Social links */}
            <div>
              <p className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
                Connect With Us
              </p>
              <div className="flex items-center gap-2">
                {socialLinks.map(({ icon: Icon, href, label }, idx) => (
                  <motion.a
                    key={idx}
                    href={href}
                    aria-label={label}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50 transition"
                  >
                    <Icon className="w-4 h-4" />
                  </motion.a>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Navigation Switcher (Col 3) */}
          <div className="lg:col-span-3 min-w-0">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
              Pharmacy Info
            </h4>
            <div className="space-y-1.5">
              {[
                { key: "contact", label: "Contact & Dispensary" },
                { key: "about", label: "About Our Platform" },
                { key: "faq", label: "FAQ & Order Help" },
                { key: "guidelines", label: "Prescription Safety" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    activeTab === key
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <span>{label}</span>
                  <ChevronRight
                    size={15}
                    className={`transition-transform duration-200 ${
                      activeTab === key ? "translate-x-1 text-emerald-600" : "text-slate-400"
                    }`}
                  />
                </button>
              ))}
            </div>

            <div className="mt-6 pt-5 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Accepted Payments
              </p>
              <div className="flex flex-wrap gap-1.5 text-[11px] text-slate-600 font-medium">
                <span className="px-2 py-1 rounded bg-slate-100 border border-slate-200">UPI</span>
                <span className="px-2 py-1 rounded bg-slate-100 border border-slate-200">RuPay</span>
                <span className="px-2 py-1 rounded bg-slate-100 border border-slate-200">Visa</span>
                <span className="px-2 py-1 rounded bg-slate-100 border border-slate-200">Mastercard</span>
                <span className="px-2 py-1 rounded bg-slate-100 border border-slate-200">COD</span>
              </div>
            </div>
          </div>

          {/* Dynamic Content Panel (Col 5) */}
          <div className="lg:col-span-5 min-w-0">
            <div className="h-full rounded-2xl border border-slate-200 bg-slate-50/60 p-5 sm:p-6 shadow-xs">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <h4 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200/80">
                    {detailContent[activeTab].title}
                  </h4>
                  {detailContent[activeTab].content}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Bottom Legal Copyright & Back to Top */}
        <div className="mt-12 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p className="text-center sm:text-left font-medium">
            © {new Date().getFullYear()} MediCare Pharmacy Ltd. All rights reserved. Reg. Chemist & Druggist.
          </p>

          <div className="flex items-center gap-5">
            <a href="#" className="hover:text-emerald-600 transition">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-emerald-600 transition">
              Terms of Sale
            </a>
            <a href="#" className="hover:text-emerald-600 transition">
              Return & Refund
            </a>
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 transition font-bold text-slate-700"
              aria-label="Back to Top"
            >
              <span>Top</span>
              <ArrowUp size={13} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;