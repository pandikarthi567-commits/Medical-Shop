/* eslint-disable no-unused-vars */
import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone,
  ShieldCheck,
  ArrowRight,
  User,
  RotateCcw,
  Sparkles,
  Lock,
  CheckCircle2,
  AlertCircle,
  Truck,
  HeartPulse,
} from "lucide-react";
import api from "../api/axios";

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.25, ease: "easeInOut" },
  },
};

const normalizePhone = (value = "") =>
  String(value).replace(/\D/g, "").slice(0, 10);

const normalizeOtp = (value = "") =>
  String(value).replace(/\D/g, "").slice(0, 6);

const Login = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [testOtp, setTestOtp] = useState("");
  const [timer, setTimer] = useState(0);

  const cleanPhone = useMemo(() => normalizePhone(phone), [phone]);
  const cleanOtp = useMemo(() => normalizeOtp(otp), [otp]);

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer]);

  const clearInfo = () => {
    setMessage("");
    setError("");
  };

  const handleSendOtp = async () => {
    clearInfo();

    if (cleanPhone.length !== 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.post("/auth/send-otp", { phone: cleanPhone });

      setPhone(cleanPhone);
      setOtp("");
      setStep(2);
      setTimer(30);

      if (data?.otpForTesting) {
        setTestOtp(String(data.otpForTesting));
        setMessage(`OTP sent successfully! (Test OTP: ${data.otpForTesting})`);
      } else {
        setMessage(data?.message || "OTP sent successfully to your mobile");
      }
    } catch (err) {
      console.error("Send OTP error:", err);
      setError(err?.response?.data?.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    clearInfo();

    if (cleanPhone.length !== 10) {
      setError("Please enter a valid 10-digit mobile number");
      setStep(1);
      return;
    }

    if (cleanOtp.length !== 6) {
      setError("Please enter the 6-digit verification OTP");
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.post("/auth/verify-otp", {
        phone: cleanPhone,
        otp: cleanOtp,
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("authChanged"));

      setMessage(data?.message || "Login successful! Redirecting...");
      setTimeout(() => {
        navigate("/profile", { replace: true });
      }, 500);
    } catch (err) {
      console.error("Verify OTP error:", err);
      setError(err?.response?.data?.message || "OTP verification failed. Please recheck.");
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSubmit = (e) => {
    e.preventDefault();
    if (!loading) handleSendOtp();
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    if (!loading) handleVerifyOtp();
  };

  const handleChangePhone = () => {
    setStep(1);
    setOtp("");
    setTestOtp("");
    setMessage("");
    setError("");
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-slate-50/60 py-8 sm:py-10 lg:py-12 px-4 sm:px-6"
    >
      <div className="mx-auto w-full max-w-5xl">
        <div className="overflow-hidden rounded-3xl sm:rounded-4xl border border-slate-200/80 bg-white shadow-xl shadow-slate-900/5 grid lg:grid-cols-12 min-h-[580px]">
          {/* Left Col: Healthcare Branding (Col 5) */}
          <div className="lg:col-span-5 relative flex flex-col justify-between bg-linear-to-br from-emerald-600 via-teal-600 to-emerald-800 text-white p-8 sm:p-10">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div
                className="w-full h-full"
                style={{
                  backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)",
                  backgroundSize: "24px 24px",
                }}
              />
            </div>

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/20 text-xs font-bold tracking-wide mb-6">
                <HeartPulse size={14} className="text-emerald-200" />
                <span>MediCare Patient Portal</span>
              </div>

              <h1 className="text-2xl sm:text-3xl xl:text-4xl font-black tracking-tight leading-tight">
                Your Health, Verified & Delivered.
              </h1>

              <p className="mt-3 text-xs sm:text-sm text-emerald-50/90 leading-relaxed">
                Sign in securely to manage doctor prescriptions, track real-time deliveries, and access authentic pharmaceuticals.
              </p>
            </div>

            {/* Trust Badges */}
            <div className="relative z-10 space-y-3 pt-8">
              <div className="flex items-center gap-3 rounded-2xl bg-white/10 backdrop-blur-md p-3.5 border border-white/15 text-xs">
                <ShieldCheck size={20} className="shrink-0 text-emerald-200" />
                <div>
                  <p className="font-bold">Govt. Registered Chemist</p>
                  <p className="text-[11px] text-emerald-100">100% Genuine batch verified medicines</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-white/10 backdrop-blur-md p-3.5 border border-white/15 text-xs">
                <Truck size={20} className="shrink-0 text-emerald-200" />
                <div>
                  <p className="font-bold">Express 30-Min Delivery</p>
                  <p className="text-[11px] text-emerald-100">Cold-pack protected doorstep dispatch</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Col: Interactive Login / OTP Form (Col 7) */}
          <div className="lg:col-span-7 flex items-center justify-center p-6 sm:p-10 lg:p-12 bg-white">
            <div className="w-full max-w-md">
              <AnimatePresence mode="wait">
                {step === 1 ? (
                  /* Step 1: Mobile Number Input */
                  <motion.div
                    key="step-1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5">
                      <Phone size={22} />
                    </div>

                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                      Sign in with Mobile
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1 mb-6">
                      Enter your 10-digit phone number to receive a secure login OTP.
                    </p>

                    {/* Alerts */}
                    {error && (
                      <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-700 flex items-center gap-2">
                        <AlertCircle size={15} className="shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    <form onSubmit={handlePhoneSubmit} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Mobile Number
                        </label>
                        <div className="flex items-center rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition">
                          <span className="text-sm font-bold text-slate-700 pr-2.5 border-r border-slate-200 mr-2.5">
                            +91
                          </span>
                          <input
                            type="tel"
                            inputMode="numeric"
                            placeholder="Enter 10-digit mobile number"
                            value={phone}
                            onChange={(e) => setPhone(normalizePhone(e.target.value))}
                            maxLength={10}
                            className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 placeholder:font-normal"
                          />
                        </div>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 px-6 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md shadow-emerald-500/20 disabled:opacity-50 transition flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <span>Sending OTP...</span>
                        ) : (
                          <>
                            <span>Continue</span>
                            <ArrowRight size={16} />
                          </>
                        )}
                      </motion.button>
                    </form>
                  </motion.div>
                ) : (
                  /* Step 2: OTP Verification */
                  <motion.div
                    key="step-2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5">
                      <Lock size={22} />
                    </div>

                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                      Enter Verification Code
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1 mb-5">
                      We sent a 6-digit code to <strong className="text-slate-800">+91 {cleanPhone}</strong>
                    </p>

                    {/* Alerts */}
                    {message && (
                      <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-emerald-800 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={15} className="shrink-0 text-emerald-600" />
                          <span>{message}</span>
                        </div>
                        {testOtp && (
                          <button
                            type="button"
                            onClick={() => setOtp(testOtp)}
                            className="px-2 py-1 rounded bg-emerald-200 text-emerald-900 font-bold text-[10px] hover:bg-emerald-300 transition"
                          >
                            Auto-Fill
                          </button>
                        )}
                      </div>
                    )}

                    {error && (
                      <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-700 flex items-center gap-2">
                        <AlertCircle size={15} className="shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    <form onSubmit={handleOtpSubmit} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          6-Digit OTP Code
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="••••••"
                          value={otp}
                          onChange={(e) => setOtp(normalizeOtp(e.target.value))}
                          maxLength={6}
                          className="w-full text-center tracking-widest text-xl font-bold py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                        />
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 px-6 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md shadow-emerald-500/20 disabled:opacity-50 transition flex items-center justify-center gap-2"
                      >
                        {loading ? "Verifying..." : "Verify & Sign In"}
                      </motion.button>

                      <div className="flex items-center justify-between text-xs pt-2">
                        <button
                          type="button"
                          onClick={handleChangePhone}
                          className="text-slate-500 hover:text-slate-800 font-semibold flex items-center gap-1 transition"
                        >
                          <RotateCcw size={13} />
                          <span>Change Mobile</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={timer > 0 || loading}
                          className="text-emerald-600 hover:text-emerald-700 font-bold disabled:text-slate-400 transition"
                        >
                          {timer > 0 ? `Resend code in ${timer}s` : "Resend OTP"}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Patient Note */}
              <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-500">
                <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                <span>256-Bit Encrypted Healthcare Patient Session</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Login;