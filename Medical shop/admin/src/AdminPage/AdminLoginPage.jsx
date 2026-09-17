/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  RotateCcw,
  Eye,
  EyeOff,
} from "lucide-react";
import API from "../api/axios";
import { saveAdminAuth } from "../utils/auth";

const pageVariants = {
  initial: { opacity: 0, y: 15 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    y: -15,
    transition: { duration: 0.2, ease: "easeInOut" },
  },
};

const MODE = {
  PASSWORD: "PASSWORD",
  EMAIL_OTP: "EMAIL_OTP",
};

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/admin";

  const [mode, setMode] = useState(MODE.PASSWORD);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpStep, setOtpStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer]);

  const clearAlerts = () => {
    setMessage("");
    setError("");
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    clearAlerts();

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setError("Please enter your admin email and password.");
      return;
    }

    try {
      setLoading(true);
      const response = await API.post("/admin/login", {
        email: cleanEmail,
        password: cleanPassword,
      });

      if (response.data?.token) {
        saveAdminAuth(
          response.data.token,
          response.data.user || { email: cleanEmail, role: "admin", name: "Admin" }
        );

        setMessage("Admin authenticated successfully! Security alert email dispatched. Redirecting...");
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 600);
      } else {
        setError(response.data?.message || "Invalid admin credentials.");
      }
    } catch (err) {
      console.error("Admin login error:", err);
      setError(
        err.response?.data?.message ||
          "Invalid email or password. Please verify your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSendAdminOtp = async (e) => {
    if (e) e.preventDefault();
    clearAlerts();

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setError("Please enter a valid admin email address.");
      return;
    }

    try {
      setLoading(true);
      const response = await API.post("/admin/send-otp", { email: cleanEmail });

      setOtp("");
      setOtpStep(2);
      setTimer(30);

      setMessage(
        response.data?.message ||
          `Verification code sent to ${cleanEmail}. Please check your inbox or spam folder.`
      );
    } catch (err) {
      console.error("Send admin OTP error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to send admin verification code. Please check your email."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAdminOtp = async (e) => {
    e.preventDefault();
    clearAlerts();

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = String(otp).replace(/\D/g, "").slice(0, 6);

    if (!cleanEmail) {
      setError("Admin email address is missing. Please restart.");
      setOtpStep(1);
      return;
    }

    if (cleanOtp.length !== 6) {
      setError("Please enter the 6-digit verification code sent to your email.");
      return;
    }

    try {
      setLoading(true);
      const response = await API.post("/admin/verify-otp", {
        email: cleanEmail,
        otp: cleanOtp,
      });

      if (response.data?.token) {
        saveAdminAuth(
          response.data.token,
          response.data.user || { email: cleanEmail, role: "admin", name: "Admin" }
        );

        setMessage("Admin verified successfully! Security alert email dispatched. Redirecting...");
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 600);
      } else {
        setError(response.data?.message || "Invalid verification code.");
      }
    } catch (err) {
      console.error("Verify admin OTP error:", err);
      setError(
        err.response?.data?.message ||
          "Invalid verification code. Please check your email."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 via-white to-slate-50 py-10 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-5xl rounded-[32px] border border-slate-200/80 bg-white shadow-2xl shadow-emerald-950/5 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
        {/* Left Hero Banner */}
        <div className="lg:col-span-5 bg-linear-to-br from-emerald-700 via-teal-800 to-slate-900 p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-56 h-56 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-56 h-56 bg-teal-400/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-md px-3.5 py-1 text-xs font-semibold text-emerald-100 mb-6">
              <Sparkles size={14} />
              MediCare Admin Console
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              Control Center, Verified &amp; Secured.
            </h1>

            <p className="mt-4 text-emerald-100 text-sm leading-relaxed">
              Sign in securely using your administrator credentials or verify via email
              code to oversee inventory, live delivery routes, and prescriptions.
            </p>
          </div>

          <div className="mt-8 space-y-3.5 relative z-10">
            <div className="flex items-center gap-3 rounded-2xl bg-white/10 backdrop-blur-sm p-3.5 text-xs text-emerald-50">
              <div className="h-8 w-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <ShieldCheck size={16} />
              </div>
              <div>
                <p className="font-bold">Full Administrative Clearance</p>
                <p className="text-[11px] text-emerald-200">
                  Real-time pharmacy &amp; order management
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-white/10 backdrop-blur-sm p-3.5 text-xs text-emerald-50">
              <div className="h-8 w-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <Mail size={16} />
              </div>
              <div>
                <p className="font-bold">Security Alert Protection</p>
                <p className="text-[11px] text-emerald-200">
                  Instant login notification sent to admin email
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Authentication Form Area */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between">
          <div>
            {/* Mode Switcher Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-6">
              <button
                type="button"
                onClick={() => {
                  setMode(MODE.PASSWORD);
                  clearAlerts();
                }}
                className={`pb-2 px-3 text-sm font-bold transition border-b-2 ${
                  mode === MODE.PASSWORD
                    ? "border-emerald-600 text-emerald-700"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode(MODE.EMAIL_OTP);
                  setOtpStep(1);
                  clearAlerts();
                }}
                className={`pb-2 px-3 text-sm font-bold transition border-b-2 ${
                  mode === MODE.EMAIL_OTP
                    ? "border-emerald-600 text-emerald-700"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                Email Code Login
              </button>
            </div>

            {/* Alert Messages */}
            {message && (
              <div className="mb-5 rounded-2xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs font-semibold text-emerald-800 flex items-center gap-2">
                <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
                <span>{message}</span>
              </div>
            )}

            {error && (
              <div className="mb-5 rounded-2xl bg-rose-50 border border-rose-200 p-3.5 text-xs font-semibold text-rose-700 flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Form 1: Admin Password Login */}
            {mode === MODE.PASSWORD && (
              <motion.div
                key="admin-password-form"
                variants={pageVariants}
                initial="initial"
                animate="animate"
              >
                <div className="mb-6">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    Welcome Back, Admin
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Sign in with your registered admin email address and password.
                  </p>
                </div>

                <form onSubmit={handlePasswordLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Admin Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 transition">
                      <Mail size={18} className="text-slate-400 mr-2.5 shrink-0" />
                      <input
                        type="email"
                        required
                        autoComplete="off"
                        placeholder="Enter admin email (e.g. admin@medicare.com)"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 placeholder:font-normal"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Admin Password <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setMode(MODE.EMAIL_OTP);
                          setOtpStep(1);
                          clearAlerts();
                        }}
                        className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="flex items-center rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 transition">
                      <Lock size={18} className="text-slate-400 mr-2.5 shrink-0" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        autoComplete="new-password"
                        placeholder="Enter admin password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 placeholder:font-normal"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-slate-400 hover:text-slate-600 transition ml-2"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-6 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md shadow-emerald-500/20 disabled:opacity-50 transition flex items-center justify-center gap-2 mt-2 cursor-pointer"
                  >
                    {loading ? (
                      <span>Verifying credentials...</span>
                    ) : (
                      <>
                        <span>Sign In to Dashboard</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {/* Form 2: Admin Email Code OTP Login */}
            {mode === MODE.EMAIL_OTP && (
              <motion.div
                key="admin-email-otp-form"
                variants={pageVariants}
                initial="initial"
                animate="animate"
              >
                {otpStep === 1 ? (
                  <div>
                    <div className="mb-6">
                      <div className="h-11 w-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                        <KeyRound size={20} />
                      </div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                        Admin Email Verification
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        We will send a 6-digit verification code directly to your admin email address.
                      </p>
                    </div>

                    <form onSubmit={handleSendAdminOtp} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Admin Email Address <span className="text-red-500">*</span>
                        </label>
                        <div className="flex items-center rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 transition">
                          <Mail size={18} className="text-slate-400 mr-2.5 shrink-0" />
                          <input
                            type="email"
                            required
                            autoComplete="off"
                            placeholder="Enter admin email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 placeholder:font-normal"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 px-6 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md shadow-emerald-500/20 disabled:opacity-50 transition flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {loading ? (
                          <span>Sending Code...</span>
                        ) : (
                          <>
                            <span>Send Verification Code</span>
                            <ArrowRight size={16} />
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                ) : (
                  <div>
                    <div className="mb-6">
                      <div className="h-11 w-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                        <Lock size={20} />
                      </div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                        Enter Admin Email Code
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        We sent a 6-digit verification code to <strong className="text-slate-800">{email}</strong>
                      </p>
                    </div>

                    <form onSubmit={handleVerifyAdminOtp} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          6-Digit Verification Code <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          autoFocus
                          placeholder="Enter 6-digit code"
                          value={otp}
                          onChange={(e) =>
                            setOtp(String(e.target.value).replace(/\D/g, "").slice(0, 6))
                          }
                          maxLength={6}
                          className="w-full text-center tracking-widest text-2xl font-bold py-3.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition placeholder:text-slate-300 placeholder:text-base placeholder:tracking-normal placeholder:font-normal"
                        />
                        <p className="text-[11px] text-slate-500 mt-1.5 text-center">
                          Please check your email inbox or spam folder for the 6-digit code.
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 px-6 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md shadow-emerald-500/20 disabled:opacity-50 transition flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {loading ? "Verifying..." : "Verify Code & Sign In"}
                      </button>

                      <div className="flex items-center justify-between text-xs pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setOtpStep(1);
                            setOtp("");
                            clearAlerts();
                          }}
                          className="text-slate-500 hover:text-slate-800 font-semibold flex items-center gap-1 transition cursor-pointer"
                        >
                          <RotateCcw size={13} />
                          <span>Change Email</span>
                        </button>

                        <button
                          type="button"
                          disabled={timer > 0 || loading}
                          onClick={() => handleSendAdminOtp()}
                          className="font-bold text-emerald-600 hover:text-emerald-700 disabled:opacity-40 transition cursor-pointer"
                        >
                          {timer > 0 ? `Resend code in ${timer}s` : "Resend Code"}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>256-Bit Encrypted Admin Session</span>
            </div>
            <a
              href="http://localhost:5173"
              className="text-slate-400 hover:text-emerald-600 font-medium transition"
            >
              Customer Storefront &rarr;
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
