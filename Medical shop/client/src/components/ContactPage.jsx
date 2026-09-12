/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Phone,
  Mail,
  MapPin,
  Clock3,
  Send,
  MessageCircle,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import PageWrapper from "../components/LandingPage/PageWrapper";

const contactCards = [
  {
    icon: Phone,
    title: "Call Support",
    value: "+91 98765 43210",
    note: "Available for order help and product support.",
    color: "text-emerald-600 bg-emerald-50",
  },
  {
    icon: Mail,
    title: "Email Us",
    value: "support@medicare.com",
    note: "Send queries related to orders, delivery, or products.",
    color: "text-blue-600 bg-blue-50",
  },
  {
    icon: MapPin,
    title: "Our Location",
    value: "Madurai, Tamil Nadu",
    note: "Serving customers with healthcare and pharmacy support.",
    color: "text-orange-500 bg-orange-50",
  },
];

const faqs = [
  "How can I track my order?",
  "Do you deliver prescription medicines?",
  "Can I cancel or replace an order?",
  "How long does delivery take?",
];

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Message submitted successfully!");
  };

  return (
    <PageWrapper className="min-h-screen bg-slate-50/60 py-8 sm:py-10 lg:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-5 md:px-6 2xl:max-w-400">
        {/* Header */}
        <div className="mb-8 sm:mb-10">
          <div className="overflow-hidden rounded-[28px] border border-white/70 bg-white/80 shadow-sm backdrop-blur-md">
            <div className="grid gap-8 px-5 py-8 sm:px-6 sm:py-10 md:px-8 lg:grid-cols-2 lg:px-10 lg:py-12">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 sm:text-sm">
                  <MessageCircle size={16} />
                  Contact Support
                </div>

                <h1 className="text-3xl font-bold leading-tight text-slate-900 sm:text-4xl md:text-5xl">
                  We’re Here to Help You
                </h1>

                <p className="mt-4 max-w-xl text-sm text-slate-600 sm:text-base md:text-lg">
                  Reach out for order support, product inquiries, prescription
                  help, and general healthcare assistance.
                </p>

                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
                    <div className="mb-2 inline-flex rounded-xl bg-emerald-50 p-2 text-emerald-600">
                      <Clock3 size={18} />
                    </div>
                    <h3 className="font-semibold text-slate-900">Working Hours</h3>
                    <p className="mt-1 text-sm text-slate-600">
                      Mon - Sun, 8:00 AM to 10:00 PM
                    </p>
                  </div>

                  <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
                    <div className="mb-2 inline-flex rounded-xl bg-blue-50 p-2 text-blue-600">
                      <ShieldCheck size={18} />
                    </div>
                    <h3 className="font-semibold text-slate-900">Safe Support</h3>
                    <p className="mt-1 text-sm text-slate-600">
                      Reliable assistance for medicines and delivery.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-1">
                {contactCards.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.07 }}
                      className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm"
                    >
                      <div className={`mb-3 inline-flex rounded-2xl p-3 ${item.color}`}>
                        <Icon size={20} />
                      </div>
                      <h3 className="font-semibold text-slate-900">{item.title}</h3>
                      <p className="mt-1 text-base font-medium text-slate-800">
                        {item.value}
                      </p>
                      <p className="mt-2 text-sm text-slate-600">{item.note}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.2fr)_380px]">
          {/* Form */}
          <div className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-6 lg:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Send a Message</h2>
              <p className="mt-2 text-sm text-slate-600 sm:text-base">
                Fill out the form and our team will get back to you soon.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-emerald-400"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-emerald-400"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Phone Number
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Enter subject"
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-emerald-400"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Write your message"
                  rows={6}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-400"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-emerald-500 to-teal-500 px-6 text-sm font-semibold text-white sm:text-base"
                >
                  Send Message
                  <Send size={18} />
                </button>
              </div>
            </form>
          </div>

          {/* FAQ / Help */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-6">
              <h3 className="text-xl font-bold text-slate-900">Quick Help</h3>
              <p className="mt-2 text-sm text-slate-600">
                Common customer questions and support topics.
              </p>

              <div className="mt-5 space-y-3">
                {faqs.map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
                  >
                    <span className="text-sm font-medium text-slate-700">{item}</span>
                    <ChevronRight size={18} className="text-slate-400" />
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-linear-to-br from-emerald-500 to-teal-500 p-6 text-white shadow-lg">
              <h3 className="text-xl font-bold">Need urgent support?</h3>
              <p className="mt-2 text-sm text-white/90">
                Contact our support line for order or medicine-related assistance.
              </p>

              <div className="mt-5 inline-flex h-11 items-center justify-center rounded-2xl bg-white px-5 text-sm font-semibold text-emerald-700">
                Call Now: +91 98765 43210
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default ContactPage;