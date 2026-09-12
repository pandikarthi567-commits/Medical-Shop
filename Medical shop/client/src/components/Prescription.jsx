/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileText,
  ShieldCheck,
  CheckCircle2,
  User,
  Phone,
  ClipboardList,
  AlertCircle,
  Clock,
  Sparkles,
  Camera,
  HelpCircle,
} from "lucide-react";
import API from "../api/axios";

const Prescription = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [filePreview, setFilePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  const [formDataState, setFormDataState] = useState({
    fullName: "",
    phone: "",
    medicineDetails: "",
    notes: "",
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoadingProfile(true);
        setError("");
        const response = await API.get("/auth/me");
        const profile = response?.data?.profile || response?.data?.user;

        if (profile) {
          setFormDataState((prev) => ({
            ...prev,
            fullName: profile.name || "",
            phone: profile.phone || "",
          }));
        }
      } catch (err) {
        // Guest user or offline, ignore
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/pdf",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Please upload a valid JPG, PNG, or PDF file.");
      setSelectedFile(null);
      setFileName("");
      setFilePreview(null);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File size exceeds 10MB limit.");
      return;
    }

    setError("");
    setSelectedFile(file);
    setFileName(file.name);

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => setFilePreview(event.target.result);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormDataState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError("Please attach your doctor's prescription file.");
      return;
    }

    if (!formDataState.fullName.trim() || !formDataState.phone.trim()) {
      setError("Patient name and phone number are required.");
      return;
    }

    const cleanedPhone = formDataState.phone.replace(/\D/g, "").slice(-10);
    if (!/^\d{10}$/.test(cleanedPhone)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccessMessage("");

      const formData = new FormData();
      formData.append("prescription", selectedFile);
      formData.append("fullName", formDataState.fullName);
      formData.append("phone", cleanedPhone);
      formData.append("medicineDetails", formDataState.medicineDetails);
      formData.append("notes", formDataState.notes);

      await API.post("/prescriptions/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccessMessage(
        "Prescription uploaded successfully! Our licensed pharmacist will review it and call you within 15 minutes."
      );
      setSelectedFile(null);
      setFileName("");
      setFilePreview(null);
      setFormDataState((prev) => ({
        ...prev,
        medicineDetails: "",
        notes: "",
      }));
    } catch (err) {
      console.error("Prescription upload error:", err);
      setError(
        err?.response?.data?.message ||
          "Failed to upload prescription. Please check file format and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 py-8 sm:py-10 lg:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-2xl mx-auto mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 mb-3">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>Govt. Verified Chemist Prescription Desk</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Upload Doctor’s Prescription
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            Have a prescription from your doctor? Simply take a photo or upload the PDF. Our pharmacists will verify and arrange rapid delivery.
          </p>
        </motion.div>

        {/* 3-Step Process Flow Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-extrabold text-sm shrink-0">
              1
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Upload Rx Note</h4>
              <p className="text-[11px] text-slate-500">Take a photo or upload PDF</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-extrabold text-sm shrink-0">
              2
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Pharmacist Review</h4>
              <p className="text-[11px] text-slate-500">Doctor verification & dosage call</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-extrabold text-sm shrink-0">
              3
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Tamper-Proof Delivery</h4>
              <p className="text-[11px] text-slate-500">Doorstep delivery with sealed pack</p>
            </div>
          </div>
        </div>

        {/* Main Upload Grid */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Left Col: Upload Card (Col 7) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-7 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs"
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* File Drop Area */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Prescription Document / Photo *
                </label>
                <label className="relative flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 sm:p-8 bg-slate-50 hover:bg-emerald-50/40 transition cursor-pointer text-center">
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                  <div className="h-14 w-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                    <Upload size={24} />
                  </div>
                  <p className="text-sm font-bold text-slate-800">
                    {fileName ? fileName : "Click to browse or drag & drop prescription"}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Supports JPG, PNG, or PDF files up to 10MB
                  </p>
                </label>

                {filePreview && (
                  <div className="mt-3 p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-3">
                    <img
                      src={filePreview}
                      alt="Prescription preview"
                      className="h-12 w-12 rounded-lg object-cover border"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800 truncate">{fileName}</p>
                      <p className="text-[10px] text-emerald-600 font-semibold">Image verified & ready</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Patient Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Patient Full Name *
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      name="fullName"
                      required
                      value={formDataState.fullName}
                      onChange={handleInputChange}
                      placeholder="e.g. Rajesh Kumar"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Contact Mobile Number *
                  </label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      name="phone"
                      required
                      maxLength={10}
                      value={formDataState.phone}
                      onChange={handleInputChange}
                      placeholder="9876543210"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>
              </div>

              {/* Medicines Required */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Specific Medicines / Days (Optional)
                </label>
                <textarea
                  name="medicineDetails"
                  rows={2}
                  value={formDataState.medicineDetails}
                  onChange={handleInputChange}
                  placeholder="e.g. Please provide for 30 days, or only the cardiac tablets..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {/* Pharmacist Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Delivery Notes / Allergies (Optional)
                </label>
                <textarea
                  name="notes"
                  rows={2}
                  value={formDataState.notes}
                  onChange={handleInputChange}
                  placeholder="e.g. Allergic to penicillin, please call after 2 PM..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {/* Error or Success alerts */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2"
                  >
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}

                {successMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-start gap-2.5"
                  >
                    <CheckCircle2 size={18} className="shrink-0 text-emerald-600 mt-0.5" />
                    <span>{successMessage}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 px-6 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md shadow-emerald-500/20 disabled:opacity-50 transition flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <span>Encrypting & Uploading...</span>
                ) : (
                  <>
                    <Upload size={16} />
                    <span>Submit Prescription for Review</span>
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>

          {/* Right Col: Guidelines & Safety Note (Col 5) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-5 space-y-6"
          >
            {/* Valid Prescription Tips */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Camera size={18} className="text-emerald-600" />
                <span>Tips for Valid Prescription</span>
              </h3>

              <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>Ensure doctor’s name, clinic seal, and registration number are clearly visible.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>Patient name, age, and date of consultation must be legible.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>Avoid uploading cropped or blurry photos for faster verification.</span>
                </div>
              </div>
            </div>

            {/* Privacy & Cold Pack Guarantee */}
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50/60 p-6 text-emerald-900 shadow-xs space-y-3">
              <div className="flex items-center gap-2 font-bold text-sm">
                <ShieldCheck size={18} className="text-emerald-700" />
                <span>100% Confidential & Secure</span>
              </div>
              <p className="text-xs leading-relaxed text-emerald-800">
                Your medical history and prescriptions are encrypted under healthcare privacy protocols. Only authorized registered pharmacists can inspect your documents.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Prescription;