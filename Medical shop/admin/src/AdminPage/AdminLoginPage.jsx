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
  Eye,
  EyeOff,
  Send,
  Loader2,
  Check,
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
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
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

        setMessage("Admin authenticated successfully! Redirecting...");
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
      setOtpSending(true);
      const response = await API.post("/admin/send-otp", { email: cleanEmail });

      setOtpSent(true);
      setTimer(30);
      setMessage(
        response.data?.message ||
          `Verification code sent to ${cleanEmail}. Please check your inbox.`
      );
    } catch (err) {
      console.error("Send admin OTP error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to send admin verification code. Please check your email."
      );
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyAdminOtp = async (e) => {
    if (e) e.preventDefault();
    clearAlerts();

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = String(otp).replace(/\D/g, "").slice(0, 6);

    if (!cleanEmail) {
      setError("Admin email address is missing. Please enter your email.");
      return;
    }

    if (cleanOtp.length !== 6) {
      setError("Please enter the 6-digit verification code sent to your email.");
      return;
    }

    try {
      setVerifying(true);
      const response = await API.post("/admin/verify-otp", {
        email: cleanEmail,
        otp: cleanOtp,
      });

      if (response.data?.token) {
        setIsVerified(true);
        saveAdminAuth(
          response.data.token,
          response.data.user || { email: cleanEmail, role: "admin", name: "Admin" }
        );

        setMessage("Admin verified successfully! Access granted. Redirecting...");
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
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-900 via-slate-950 to-slate-900 py-10 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-5xl rounded-[32px] border border-slate-800 bg-slate-900/95 shadow-2xl shadow-emerald-950/20 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px] backdrop-blur-xl">
        {/* Left Hero Banner */}
        <div className="lg:col-span-5 bg-linear-to-br from-emerald-800 via-teal-900 to-slate-950 p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800">
          <div className="absolute -right-16 -top-16 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-56 h-56 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-md px-3.5 py-1 text-xs font-semibold text-emerald-300 mb-6">
              <Sparkles size={14} />
              MediCare Admin Console
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight text-white">
              Control Center, Verified &amp; Secured.
            </h1>

            <p className="mt-4 text-emerald-100/70 text-sm leading-relaxed">
              Sign in securely using your administrator credentials or verify via real-time email
              code to oversee live inventory, orders, and prescriptions.
            </p>
          </div>

          <div className="mt-8 space-y-3.5 relative z-10">
            <div className="flex items-center gap-3 rounded-2xl bg-slate-800/60 border border-slate-700/50 backdrop-blur-sm p-3.5 text-xs text-emerald-50">
              <div className="h-8 w-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck size={16} />
              </div>
              <div>
                <p className="font-bold text-slate-200">Full Administrative Clearance</p>
                <p className="text-[11px] text-emerald-400/80">
                  Real-time pharmacy &amp; order management
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-slate-800/60 border border-slate-700/50 backdrop-blur-sm p-3.5 text-xs text-emerald-50">
              <div className="h-8 w-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
                <Mail size={16} />
              </div>
              <div>
                <p className="font-bold text-slate-200">Instant Email Delivery</p>
                <p className="text-[11px] text-sky-400/80">
                  Ultra-fast OTP dispatched directly to admin inbox
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Authentication Form Area */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between bg-slate-900/60">
          <div>
            {/* Mode Switcher Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-4 mb-6">
              <button
                type="button"
                onClick={() => {
                  setMode(MODE.PASSWORD);
                  clearAlerts();
                }}
                className={`pb-2 px-3 text-sm font-bold transition border-b-2 cursor-pointer ${
                  mode === MODE.PASSWORD
                    ? "border-emerald-500 text-emerald-400"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode(MODE.EMAIL_OTP);
                  clearAlerts();
                }}
                className={`pb-2 px-3 text-sm font-bold transition border-b-2 cursor-pointer ${
                  mode === MODE.EMAIL_OTP
                    ? "border-emerald-500 text-emerald-400"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                Email Code Login
              </button>
            </div>

            {/* Alert Messages */}
            {message && (
              <div className="mb-5 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 p-3.5 text-xs font-semibold text-emerald-300 flex items-center gap-2">
                <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
                <span>{message}</span>
              </div>
            )}

            {error && (
              <div className="mb-5 rounded-2xl bg-rose-950/40 border border-rose-800/60 p-3.5 text-xs font-semibold text-rose-300 flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0 text-rose-400" />
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
                  <h2 className="text-2xl font-black text-white tracking-tight">
                    Welcome Back, Admin
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    Sign in with your registered admin email address and password.
                  </p>
                </div>

                <form onSubmit={handlePasswordLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Admin Email Address <span className="text-red-400">*</span>
                    </label>
                    <div className="flex items-center rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 transition">
                      <Mail size={18} className="text-slate-400 mr-2.5 shrink-0" />
                      <input
                        type="email"
                        required
                        autoComplete="off"
                        placeholder="Enter admin email (e.g. admin@medicare.com)"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-transparent text-sm font-semibold text-white outline-none placeholder:text-slate-500 placeholder:font-normal"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                        Admin Password <span className="text-red-400">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setMode(MODE.EMAIL_OTP);
                          clearAlerts();
                        }}
                        className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition cursor-pointer"
                      >
                        Sign in via Email Code?
                      </button>
                    </div>
                    <div className="flex items-center rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 transition">
                      <Lock size={18} className="text-slate-400 mr-2.5 shrink-0" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        autoComplete="new-password"
                        placeholder="Enter admin password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-transparent text-sm font-semibold text-white outline-none placeholder:text-slate-500 placeholder:font-normal"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-slate-400 hover:text-slate-200 transition ml-2 cursor-pointer"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-6 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-950/40 disabled:opacity-50 transition flex items-center justify-center gap-2 mt-2 cursor-pointer active:scale-[0.99]"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 size={16} className="animate-spin" />
                        <span>Verifying credentials...</span>
                      </div>
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

            {/* Form 2: Admin Email Code OTP Login (Job Portal Style Inline Layout) */}
            {mode === MODE.EMAIL_OTP && (
              <motion.div
                key="admin-email-otp-form"
                variants={pageVariants}
                initial="initial"
                animate="animate"
              >
                <div className="mb-6">
                  <div className="h-11 w-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                    <KeyRound size={20} />
                  </div>
                  <h2 className="text-2xl font-black text-white tracking-tight">
                    Admin Email Verification
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    Send a 6-digit verification code to your admin email address and verify inline.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Email ID Field + Inline Send/Resend OTP Button */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Email ID <span className="text-red-400">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 flex items-center rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 transition">
                        <Mail size={18} className="text-slate-400 mr-2.5 shrink-0" />
                        <input
                          type="email"
                          required
                          placeholder="e.g. pandikarthi567@gmail.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={otpSending || isVerified}
                          className="w-full bg-transparent text-sm font-semibold text-white outline-none placeholder:text-slate-500 placeholder:font-normal"
                        />
                      </div>
                      <button
                        type="button"
                        disabled={otpSending || (otpSent && timer > 0) || !email || isVerified}
                        onClick={handleSendAdminOtp}
                        className="shrink-0 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs shadow-md shadow-sky-500/20 disabled:opacity-40 transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                      >
                        {otpSending ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            <span>Sending...</span>
                          </>
                        ) : otpSent ? (
                          <>
                            <Send size={13} />
                            <span>{timer > 0 ? `Resend OTP (${timer}s)` : "Resend OTP"}</span>
                          </>
                        ) : (
                          <>
                            <Send size={13} />
                            <span>Send OTP</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* OTP Field + Inline Verify Button */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Enter Email OTP <span className="text-red-400">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 flex items-center rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 transition">
                        <KeyRound size={18} className="text-slate-400 mr-2.5 shrink-0" />
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="Enter 6-digit email OTP"
                          value={otp}
                          onChange={(e) =>
                            setOtp(String(e.target.value).replace(/\D/g, "").slice(0, 6))
                          }
                          maxLength={6}
                          disabled={verifying || isVerified}
                          className="w-full bg-transparent text-sm font-bold tracking-widest text-white outline-none placeholder:text-slate-500 placeholder:tracking-normal placeholder:font-normal"
                        />
                      </div>
                      <button
                        type="button"
                        disabled={verifying || otp.length !== 6 || isVerified}
                        onClick={handleVerifyAdminOtp}
                        className={`shrink-0 px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                          isVerified
                            ? "bg-emerald-500 text-white shadow-emerald-500/20"
                            : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20 disabled:opacity-40"
                        }`}
                      >
                        {verifying ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            <span>Verifying...</span>
                          </>
                        ) : isVerified ? (
                          <>
                            <Check size={14} />
                            <span>Verified ✓</span>
                          </>
                        ) : (
                          <>
                            <Check size={14} />
                            <span>Verify</span>
                          </>
                        )}
                      </button>
                    </div>
                    {otpSent && (
                      <p className="text-[11px] text-slate-400 mt-1.5">
                        6-digit code dispatched to <strong className="text-emerald-400">{email}</strong>. Check inbox or spam.
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          <div className="pt-6 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span>256-Bit Encrypted Admin Session</span>
            </div>
            <a
              href="http://localhost:5173"
              className="text-slate-400 hover:text-emerald-400 font-medium transition"
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
