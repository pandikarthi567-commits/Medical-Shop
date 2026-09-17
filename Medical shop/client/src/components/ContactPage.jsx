/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone,
  Mail,
  MapPin,
  Clock3,
  Send,
  MessageCircle,
  ShieldCheck,
  ChevronDown,
  CheckCircle2,
  Headphones,
  Sparkles,
  ExternalLink,
  MessageSquare,
  HelpCircle,
  FileText,
  Pill,
  Truck,
  CreditCard,
  Award,
  ArrowRight,
  HeartPulse,
  User,
  Check,
} from "lucide-react";
import PageWrapper from "./LandingPage/PageWrapper";

const supportChannels = [
  {
    id: "phone",
    title: "Pharmacist Helpline",
    subtitle: "Speak directly with our on-duty clinical pharmacist",
    value: "+91 98765 43210",
    actionLabel: "Call Pharmacist",
    actionHref: "tel:+919876543210",
    availability: "Daily: 8:00 AM – 10:00 PM",
    icon: Phone,
    colorScheme: {
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      text: "text-emerald-700",
      button: "bg-emerald-600 hover:bg-emerald-700 text-white",
      badge: "bg-emerald-100/80 text-emerald-800",
    },
  },
  {
    id: "whatsapp",
    title: "WhatsApp Priority Chat",
    subtitle: "Instant medicine queries, Rx uploads & order status",
    value: "+91 96005 09567",
    actionLabel: "Chat on WhatsApp",
    actionHref: "https://wa.me/919600509567?text=Hello%20MediCare%20Support,%20I%20need%20assistance.",
    availability: "Average response: < 3 mins",
    icon: MessageCircle,
    colorScheme: {
      bg: "bg-teal-50",
      border: "border-teal-100",
      text: "text-teal-700",
      button: "bg-teal-600 hover:bg-teal-700 text-white",
      badge: "bg-teal-100/80 text-teal-800",
    },
  },
  {
    id: "email",
    title: "Official Email Desk",
    subtitle: "Inquiries, corporate billing & bulk prescription orders",
    value: "support@medicare.com",
    actionLabel: "Send Email",
    actionHref: "mailto:support@medicare.com?subject=MediCare%20Support%20Inquiry",
    availability: "Replies within 2 business hours",
    icon: Mail,
    colorScheme: {
      bg: "bg-blue-50",
      border: "border-blue-100",
      text: "text-blue-700",
      button: "bg-blue-600 hover:bg-blue-700 text-white",
      badge: "bg-blue-100/80 text-blue-800",
    },
  },
  {
    id: "location",
    title: "Central Dispensary",
    subtitle: "Licensed hub & temperature-controlled drug warehouse",
    value: "Virudhunagar & Madurai, Tamil Nadu",
    actionLabel: "Get Directions",
    actionHref: "https://maps.google.com/?q=Virudhunagar+Tamil+Nadu",
    availability: "Pincode coverage: 626001 & 625020",
    icon: MapPin,
    colorScheme: {
      bg: "bg-rose-50",
      border: "border-rose-100",
      text: "text-rose-700",
      button: "bg-slate-900 hover:bg-slate-800 text-white",
      badge: "bg-rose-100/80 text-rose-800",
    },
  },
];

const inquiryCategories = [
  { id: "prescription", label: "Prescription Help", icon: FileText },
  { id: "delivery", label: "Order & Express Delivery", icon: Truck },
  { id: "medicines", label: "Medicine Availability", icon: Pill },
  { id: "billing", label: "Payment & Refunds", icon: CreditCard },
  { id: "general", label: "General Support", icon: HelpCircle },
];

const faqList = [
  {
    question: "How do I order prescription medicines on MediCare?",
    answer:
      "You can easily search for your required medicines, add them to your cart, and upload a valid doctor's prescription note during checkout or via the 'Upload Prescription' page. Our registered clinical pharmacist will verify the dosage before dispatch.",
  },
  {
    question: "How fast is express delivery in Madurai and Virudhunagar?",
    answer:
      "All intra-city orders placed before 7:00 PM are delivered within 45 to 90 minutes via our temperature-controlled delivery fleet. Outstation and suburban orders are delivered within 24 to 48 hours.",
  },
  {
    question: "Are all medicines genuine and batch-certified?",
    answer:
      "Yes, 100%. All medicines in our inventory are procured directly from certified pharmaceutical manufacturers (CDSCO compliant) and stored under strict temperature & humidity controls.",
  },
  {
    question: "Can I return or exchange ordered medicines?",
    answer:
      "Medicines that are sealed and untampered can be returned within 48 hours of delivery if they are damaged or incorrect. Temperature-sensitive refrigerated items (such as Insulin) cannot be returned due to safety compliance.",
  },
  {
    question: "How do I track my delivery rider in real-time?",
    answer:
      "Navigate to the 'Live Tracking' tab in your user profile or top header bar. You will see GPS live radar updates and direct contact options for your assigned delivery rider.",
  },
];

const ContactPage = () => {
  const [currentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });

  const [activeCategory, setActiveCategory] = useState("prescription");
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    phone: currentUser?.phone || "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setFormData({
        name: currentUser?.name || "",
        email: currentUser?.email || "",
        phone: currentUser?.phone || "",
        subject: "",
        message: "",
      });
      setTimeout(() => setSubmitted(false), 6000);
    }, 1000);
  };

  return (
    <PageWrapper className="min-h-screen bg-slate-50/50 py-6 sm:py-8 lg:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Hero Header Card */}
        <div className="relative overflow-hidden rounded-3xl sm:rounded-4xl bg-linear-to-r from-emerald-700 via-teal-700 to-slate-900 text-white p-6 sm:p-10 lg:p-12 shadow-2xl shadow-emerald-950/10">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div
              className="w-full h-full"
              style={{
                backgroundImage:
                  "radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />
          </div>

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1 text-xs font-bold tracking-wide text-emerald-200 backdrop-blur-md border border-white/10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <span>24/7 Priority Healthcare Support Desk</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              We&apos;re Here to Support Your Health &amp; Wellness
            </h1>

            <p className="text-sm sm:text-base text-emerald-100 font-medium leading-relaxed max-w-2xl">
              Have questions about your prescription, medicine dosage, or live order dispatch?
              Our certified clinical team and support specialists are always ready to assist you.
            </p>

            {/* Quick Metrics */}
            <div className="pt-2 flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm font-semibold text-emerald-50">
              <div className="flex items-center gap-2">
                <Clock3 size={16} className="text-emerald-300" />
                <span>Mon – Sun, 8:00 AM – 10:00 PM</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-300" />
                <span>CDSCO Verified Dispensary</span>
              </div>
              <div className="flex items-center gap-2">
                <HeartPulse size={16} className="text-emerald-300" />
                <span>Licensed Pharmacists On Duty</span>
              </div>
            </div>
          </div>
        </div>

        {/* Support Channels Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {supportChannels.map((channel, idx) => {
            const IconComponent = channel.icon;
            return (
              <motion.div
                key={channel.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.08 }}
                className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs hover:border-emerald-300 hover:shadow-lg transition-all duration-300"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`h-12 w-12 rounded-2xl flex items-center justify-center ${channel.colorScheme.bg} ${channel.colorScheme.text} border ${channel.colorScheme.border} group-hover:scale-110 transition-transform`}
                    >
                      <IconComponent size={22} />
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${channel.colorScheme.badge}`}
                    >
                      {channel.availability}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-1">
                    {channel.title}
                  </h3>
                  <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                    {channel.subtitle}
                  </p>

                  <p className="text-sm font-black text-slate-900 font-mono tracking-tight mb-5">
                    {channel.value}
                  </p>
                </div>

                <a
                  href={channel.actionHref}
                  target={channel.actionHref.startsWith("http") ? "_blank" : "_self"}
                  rel="noreferrer"
                  className={`w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition shadow-xs ${channel.colorScheme.button}`}
                >
                  <span>{channel.actionLabel}</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </a>
              </motion.div>
            );
          })}
        </div>

        {/* Main Interactive Contact Section (Form + FAQs) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Interactive Contact Form (Col 7) */}
          <div className="lg:col-span-7 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 lg:p-10 shadow-xs space-y-6">
            <div>
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider mb-1">
                <MessageSquare size={15} />
                <span>Get in Touch with Our Team</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Send Us a Direct Message
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Select your query topic below and fill out the details. Our health officers will respond promptly.
              </p>
            </div>

            {/* Success Notification */}
            <AnimatePresence>
              {submitted && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-3"
                >
                  <div className="p-1.5 rounded-xl bg-emerald-600 text-white shrink-0 mt-0.5">
                    <Check size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">Message Received Successfully!</h4>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      Thank you for contacting MediCare. A registered pharmacist or support agent will review your inquiry and contact you shortly.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Query Category Selector Pills */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                What can we help you with? <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {inquiryCategories.map((cat) => {
                  const CatIcon = cat.icon;
                  const isSelected = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setActiveCategory(cat.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                        isSelected
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/20"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700"
                      }`}
                    >
                      <CatIcon size={14} />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Your Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Subash"
                      className="w-full pl-3.5 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-semibold outline-none focus:bg-white focus:border-emerald-500 focus:ring-3 focus:ring-emerald-500/15 transition"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g. name@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-semibold outline-none focus:bg-white focus:border-emerald-500 focus:ring-3 focus:ring-emerald-500/15 transition"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Contact Phone (+91)
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    maxLength={10}
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-semibold outline-none focus:bg-white focus:border-emerald-500 focus:ring-3 focus:ring-emerald-500/15 transition font-mono"
                  />
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Subject / Order ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="e.g. Inquiry regarding order #MED-1042"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-semibold outline-none focus:bg-white focus:border-emerald-500 focus:ring-3 focus:ring-emerald-500/15 transition"
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Detailed Medical or Order Query <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Please describe your query in detail including medicine names, batch numbers, or any specific healthcare questions..."
                  className="w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-medium outline-none focus:bg-white focus:border-emerald-500 focus:ring-3 focus:ring-emerald-500/15 transition leading-relaxed resize-none"
                />
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  <span>Your medical details &amp; contact info are strictly confidential.</span>
                </p>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-md shadow-emerald-700/20 hover:from-emerald-700 hover:to-teal-700 active:scale-98 transition cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Sending Message...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Query</span>
                      <Send size={15} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: FAQs, Urgent Care Card & Store Map Preview (Col 5) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Urgent Support Banner */}
            <div className="rounded-3xl bg-linear-to-br from-slate-900 via-emerald-950 to-slate-900 p-6 sm:p-7 text-white shadow-xl relative overflow-hidden">
              <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />

              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/30">
                  <Headphones size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Need Urgent Assistance?</h3>
                  <p className="text-xs text-emerald-300">Live Pharmacist Desk</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                For critical medicine dosage inquiries or emergency prescription refills, call our direct medical helpline immediately.
              </p>

              <div className="flex items-center gap-3">
                <a
                  href="tel:+919876543210"
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black shadow-md transition"
                >
                  <Phone size={14} />
                  <span>Call +91 98765 43210</span>
                </a>

                <a
                  href="https://wa.me/919600509567"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition"
                  title="WhatsApp Chat"
                >
                  <MessageCircle size={18} />
                </a>
              </div>
            </div>

            {/* Interactive FAQs Accordion */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <HelpCircle size={18} className="text-emerald-600" />
                  <h3 className="text-base font-bold text-slate-900">Frequently Asked Questions</h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  Quick Answers
                </span>
              </div>

              <div className="space-y-2.5">
                {faqList.map((faq, index) => {
                  const isOpen = openFaqIndex === index;
                  return (
                    <div
                      key={faq.question}
                      className="rounded-2xl border border-slate-100 bg-slate-50/50 overflow-hidden transition"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaqIndex(isOpen ? -1 : index)}
                        className="w-full flex items-center justify-between p-3.5 text-left text-xs font-bold text-slate-800 hover:text-emerald-700 transition cursor-pointer"
                      >
                        <span className="pr-2">{faq.question}</span>
                        <ChevronDown
                          size={16}
                          className={`shrink-0 text-slate-400 transition-transform duration-200 ${
                            isOpen ? "rotate-180 text-emerald-600" : ""
                          }`}
                        />
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <p className="px-3.5 pb-3.5 text-xs text-slate-600 leading-relaxed border-t border-slate-100/60 pt-2">
                              {faq.answer}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Dispensary Hub Card */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="flex items-center gap-2 mb-3">
                <MapPin size={18} className="text-rose-500" />
                <h3 className="text-sm font-bold text-slate-900">Registered Pharmacy Dispensary</h3>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                <p className="font-bold text-slate-900">MediCare Super Speciality Pharmacy</p>
                <p className="text-slate-600">
                  1/1033, Mallikittangi Street, Pandiyan Nagar, Virudhunagar - 626001, Tamil Nadu, India.
                </p>
                <div className="pt-2 flex items-center justify-between border-t border-slate-200/60 text-[11px] text-slate-500">
                  <span>Drug License: TN/VNR/2026/DL-402</span>
                  <span className="text-emerald-700 font-bold">Open Daily</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default ContactPage;