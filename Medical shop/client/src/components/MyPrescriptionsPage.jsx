/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Upload,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Camera,
  Plus,
  ArrowRight,
  Sparkles,
  Phone,
  User,
  ExternalLink,
  Eye,
  RefreshCw,
} from "lucide-react";
import API from "../api/axios";
import { getImageUrl } from "../utils/imageUrl";

const MyPrescriptionsPage = () => {
  const [activeTab, setActiveTab] = useState("upload"); // "upload" or "history"
  const [prescriptions, setPrescriptions] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Form states
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [fileName, setFileName] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [medicineDetails, setMedicineDetails] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await API.get("/auth/me");
        const user = data.profile || data.user;
        if (user) {
          if (user.name) setFullName(user.name);
          if (user.phone) setPhone(user.phone);
        }
      } catch (e) {
        // ignore
      }
    };
    fetchProfile();
    fetchMyPrescriptions();
  }, []);

  const fetchMyPrescriptions = async () => {
    try {
      setLoadingHistory(true);
      const { data } = await API.get("/prescriptions/my-prescriptions");
      setPrescriptions(data.prescriptions || []);
    } catch (err) {
      console.error("Fetch prescriptions error:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      setError("Please upload a valid image (JPG, PNG) or PDF document.");
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
      reader.onload = () => setFilePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!selectedFile) {
      setError("Please attach your doctor prescription image or PDF.");
      return;
    }

    if (!fullName.trim()) {
      setError("Please enter the patient's full name.");
      return;
    }

    const cleanPhone = String(phone).replace(/\D/g, "").slice(-10);
    if (!cleanPhone || cleanPhone.length !== 10) {
      setError("Please enter a valid 10-digit contact phone number.");
      return;
    }

    if (!medicineDetails.trim()) {
      setError("Please specify required medicine names or duration from prescription.");
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("prescription", selectedFile);
      formData.append("fullName", fullName.trim());
      formData.append("phone", cleanPhone);
      formData.append("medicineDetails", medicineDetails.trim());
      formData.append("notes", notes.trim());

      const { data } = await API.post("/prescriptions/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage("Prescription uploaded successfully! Our registered chemist is verifying it.");
      setSelectedFile(null);
      setFilePreview(null);
      setFileName("");
      setMedicineDetails("");
      setNotes("");
      fetchMyPrescriptions();
      setActiveTab("history");
    } catch (err) {
      console.error("Upload prescription error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to upload prescription. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 via-white to-slate-50 py-8 sm:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 mb-2">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>Certified Pharmacist Validation</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              My Prescriptions
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Upload doctor prescriptions for batch verification, pharmacist validation, and automated doorstep dispatch.
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
            <button
              onClick={() => {
                setActiveTab("upload");
                setError("");
                setMessage("");
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === "upload"
                  ? "bg-white text-emerald-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Upload size={14} />
              <span>Upload New</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("history");
                setError("");
                setMessage("");
                fetchMyPrescriptions();
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === "history"
                  ? "bg-white text-emerald-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileText size={14} />
              <span>My History ({prescriptions.length})</span>
            </button>
          </div>
        </div>

        {/* Alerts */}
        {message && (
          <div className="mb-6 flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-bold text-emerald-800">
            <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs font-bold text-rose-800">
            <AlertCircle size={16} className="shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Tab 1: Upload Form */}
        {activeTab === "upload" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Left Upload Form */}
            <div className="lg:col-span-7 rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-1">
                Attach Doctor Prescription
              </h2>
              <p className="text-xs text-slate-500 mb-6">
                Upload clear photo or PDF scan of your original prescription.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* File Dropzone */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Prescription Document (JPG, PNG, PDF) <span className="text-red-500">*</span>
                  </label>
                  <label
                    htmlFor="prescription-upload-input"
                    className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition text-center ${
                      selectedFile
                        ? "border-emerald-500 bg-emerald-50/30"
                        : "border-slate-300 hover:border-emerald-500 bg-slate-50/60"
                    }`}
                  >
                    <input
                      id="prescription-upload-input"
                      type="file"
                      accept="image/jpeg,image/png,image/jpg,application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    {filePreview ? (
                      <div className="relative mb-3">
                        <img
                          src={filePreview}
                          alt="Prescription Preview"
                          className="h-32 w-auto max-w-full rounded-xl object-contain border border-emerald-200"
                        />
                      </div>
                    ) : (
                      <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                        <Camera size={22} />
                      </div>
                    )}
                    <span className="text-xs font-bold text-slate-800">
                      {fileName || "Click to browse or drag & drop prescription"}
                    </span>
                    <span className="text-[11px] text-slate-400 mt-1">
                      Max file size: 10MB (Clear handwriting / clinic stamp recommended)
                    </span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Patient Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 transition">
                      <User size={16} className="text-slate-400 mr-2 shrink-0" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Karthik Pandian"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-transparent text-xs font-semibold text-slate-900 outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 transition">
                      <Phone size={16} className="text-slate-400 mr-2 shrink-0" />
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        placeholder="10-digit mobile number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-transparent text-xs font-semibold text-slate-900 outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Required Medicines / Dosage Request <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="e.g. Paracetamol 650mg (10 tabs), Amoxicillin 500mg, or 'All medicines in prescription for 30 days'"
                    value={medicineDetails}
                    onChange={(e) => setMedicineDetails(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-hidden transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Additional Instructions / Doctor Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Preferred brand substitutions or delivery timing instructions"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-hidden transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 disabled:opacity-50 transition cursor-pointer"
                >
                  {submitting ? (
                    <span>Uploading &amp; Verifying Prescription...</span>
                  ) : (
                    <>
                      <span>Submit Prescription to Pharmacist</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Right Guide & Safety */}
            <div className="lg:col-span-5 space-y-4">
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 mb-3">
                  <ShieldCheck size={18} className="text-emerald-600" />
                  Prescription Safety Guarantee
                </h3>
                <ul className="space-y-2.5 text-xs text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span>Every prescription is reviewed by a Govt. Registered Pharmacist.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span>Exact batch verification &amp; expiry check before cold dispatch.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span>Pharmacist will call your phone if clarification is needed.</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-3xl bg-linear-to-br from-emerald-600 to-teal-700 text-white p-6 shadow-md">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-[10px] font-bold mb-3">
                  <Sparkles size={12} />
                  Express 30-Min Delivery
                </div>
                <h4 className="font-black text-base mb-1">
                  Need Emergency Prescription Medicines?
                </h4>
                <p className="text-xs text-emerald-100 leading-relaxed mb-4">
                  Upload your prescription and choose Express Dispatch at checkout for rapid cold-pack doorstep delivery.
                </p>
                <Link
                  to="/products"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-emerald-800 text-xs font-bold hover:bg-emerald-50 transition"
                >
                  <span>Explore Pharmacy Store</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 2: Prescription History */}
        {activeTab === "history" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {loadingHistory ? (
              <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="h-28 rounded-2xl bg-slate-100 animate-pulse border border-slate-200"
                  />
                ))}
              </div>
            ) : prescriptions.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
                <div className="h-16 w-16 mx-auto rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                  <FileText size={30} />
                </div>
                <h3 className="font-bold text-base text-slate-900">
                  No Prescriptions Uploaded Yet
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
                  You haven&apos;t uploaded any doctor prescriptions yet. Upload your prescription to order verified medicines.
                </p>
                <button
                  onClick={() => setActiveTab("upload")}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Upload size={14} />
                  <span>Upload Your First Prescription</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {prescriptions.map((rx) => {
                  const dateStr = rx.createdAt
                    ? new Date(rx.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Recently uploaded";

                  const isApproved = rx.status === "approved" || rx.status === "verified";
                  const isDispensed = rx.status === "dispensed";

                  return (
                    <div
                      key={rx._id}
                      className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
                          <FileText size={22} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900">
                              {rx.fullName || "Patient Prescription"}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                                isApproved
                                  ? "bg-emerald-100 text-emerald-800"
                                  : isDispensed
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {rx.status?.toUpperCase() || "UNDER REVIEW"}
                            </span>
                          </div>

                          <p className="text-xs text-slate-600 mt-1">
                            <strong className="text-slate-700">Medicines: </strong>
                            {rx.medicineDetails}
                          </p>

                          <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                            <Clock size={12} />
                            <span>Uploaded on {dateStr}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {rx.fileUrl && (
                          <a
                            href={getImageUrl(rx.fileUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition"
                          >
                            <Eye size={14} />
                            <span>View Document</span>
                          </a>
                        )}

                        <Link
                          to="/products"
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
                        >
                          <span>Order Medicines</span>
                          <ArrowRight size={13} />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MyPrescriptionsPage;
