/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  HeartPulse,
  Truck,
  MapPin,
  Send,
  Loader2,
  Check,
} from "lucide-react";
import api from "../api/axios";

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
  LOGIN: "LOGIN",
  REGISTER: "REGISTER",
  EMAIL_OTP: "EMAIL_OTP",
};

const Login = () => {
  const navigate = useNavigate();

  const [mode, setMode] = useState(MODE.LOGIN);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    clearAlerts();

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      setError("Please enter your email and password");
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.post("/auth/login", {
        email: cleanEmail,
        password,
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("authChanged"));

      setMessage("Login successful! Redirecting...");
      setTimeout(() => {
        navigate("/profile", { replace: true });
      }, 500);
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err?.response?.data?.message || "Invalid email or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    clearAlerts();

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || !cleanEmail || !password) {
      setError("Please fill in your name, email, and password");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.post("/auth/register", {
        name: cleanName,
        email: cleanEmail,
        password,
        location: location.trim(),
      });

      if (data?.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        window.dispatchEvent(new Event("authChanged"));
      }

      setMessage("Account created successfully! Redirecting...");
      setTimeout(() => {
        navigate("/profile", { replace: true });
      }, 500);
    } catch (err) {
      console.error("Register error:", err);
      setError(
        err?.response?.data?.message || "Failed to create account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmailOtp = async (e) => {
    if (e) e.preventDefault();
    clearAlerts();

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      setOtpSending(true);
      const { data } = await api.post("/auth/send-otp", { email: cleanEmail });

      setOtpSent(true);
      setTimer(30);

      setMessage(`Verification code sent directly to ${cleanEmail}. Please check your inbox.`);
    } catch (err) {
      console.error("Send Email OTP error:", err);
      setError(
        err?.response?.data?.message || "Failed to send verification email. Please try again."
      );
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyEmailOtp = async (e) => {
    if (e) e.preventDefault();
    clearAlerts();

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = String(otp).replace(/\D/g, "").slice(0, 6);

    if (!cleanEmail) {
      setError("Email address is missing. Please enter your email.");
      return;
    }

    if (cleanOtp.length !== 6) {
      setError("Please enter the 6-digit verification code");
      return;
    }

    try {
      setVerifying(true);
      const { data } = await api.post("/auth/verify-otp", {
        email: cleanEmail,
        otp: cleanOtp,
      });

      setIsVerified(true);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("authChanged"));

      setMessage("Verification successful! Redirecting to profile...");
      setTimeout(() => {
        navigate("/profile", { replace: true });
      }, 500);
    } catch (err) {
      console.error("Verify Email OTP error:", err);
      setError(
        err?.response?.data?.message || "Invalid verification code. Please check your email."
      );
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 via-white to-slate-50 py-10 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-5xl rounded-[32px] border border-slate-200/80 bg-white shadow-2xl shadow-emerald-950/5 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
        {/* Left Hero Banner */}
        <div className="lg:col-span-5 bg-linear-to-br from-emerald-600 via-teal-700 to-emerald-800 p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-56 h-56 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-56 h-56 bg-teal-400/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-md px-3.5 py-1 text-xs font-semibold text-emerald-100 mb-6">
              <Sparkles size={14} />
              MediCare Patient Portal
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              Your Health, Verified &amp; Delivered.
            </h1>

            <p className="mt-4 text-emerald-100 text-sm leading-relaxed">
              Sign in securely using your email and password or receive an instant
              verification code to manage doctor prescriptions and orders.
            </p>
          </div>

          <div className="mt-8 space-y-3.5 relative z-10">
            <div className="flex items-center gap-3 rounded-2xl bg-white/10 backdrop-blur-sm p-3.5 text-xs text-emerald-50">
              <div className="h-8 w-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <ShieldCheck size={16} />
              </div>
              <div>
                <p className="font-bold">Govt. Registered Chemist</p>
                <p className="text-[11px] text-emerald-200">
                  100% Genuine batch verified medicines
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-white/10 backdrop-blur-sm p-3.5 text-xs text-emerald-50">
              <div className="h-8 w-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <Truck size={16} />
              </div>
              <div>
                <p className="font-bold">Express 30-Min Delivery</p>
                <p className="text-[11px] text-emerald-200">
                  Cold-pack protected doorstep dispatch
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
                  setMode(MODE.LOGIN);
                  clearAlerts();
                }}
                className={`pb-2 px-3 text-sm font-bold transition border-b-2 cursor-pointer ${
                  mode === MODE.LOGIN
                    ? "border-emerald-600 text-emerald-700"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode(MODE.REGISTER);
                  clearAlerts();
                }}
                className={`pb-2 px-3 text-sm font-bold transition border-b-2 cursor-pointer ${
                  mode === MODE.REGISTER
                    ? "border-emerald-600 text-emerald-700"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                Create Account
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode(MODE.EMAIL_OTP);
                  clearAlerts();
                }}
                className={`pb-2 px-3 text-sm font-bold transition border-b-2 cursor-pointer ${
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

            {/* Form 1: Email & Password Login */}
            {mode === MODE.LOGIN && (
              <motion.div
                key="login-form"
                variants={pageVariants}
                initial="initial"
                animate="animate"
              >
                <div className="mb-6">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    Welcome Back
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Sign in with your registered email address and password.
                  </p>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 transition">
                      <Mail size={18} className="text-slate-400 mr-2.5 shrink-0" />
                      <input
                        type="email"
                        required
                        autoComplete="off"
                        placeholder="e.g. user@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 placeholder:font-normal"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setMode(MODE.EMAIL_OTP);
                          clearAlerts();
                        }}
                        className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition cursor-pointer"
                      >
                        Sign in via Email Code?
                      </button>
                    </div>
                    <div className="flex items-center rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 transition">
                      <Lock size={18} className="text-slate-400 mr-2.5 shrink-0" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        autoComplete="new-password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 placeholder:font-normal"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-slate-400 hover:text-slate-600 transition ml-2 cursor-pointer"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-6 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md shadow-emerald-500/20 disabled:opacity-50 transition flex items-center justify-center gap-2 mt-2 cursor-pointer active:scale-[0.99]"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 size={16} className="animate-spin" />
                        <span>Signing in...</span>
                      </div>
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center text-xs text-slate-500">
                  <span>Don&apos;t have an account yet? </span>
                  <button
                    type="button"
                    onClick={() => {
                      setMode(MODE.REGISTER);
                      clearAlerts();
                    }}
                    className="font-bold text-emerald-600 hover:text-emerald-700 underline underline-offset-2 cursor-pointer"
                  >
                    Create Account
                  </button>
                </div>
              </motion.div>
            )}

            {/* Form 2: Register New Account */}
            {mode === MODE.REGISTER && (
              <motion.div
                key="register-form"
                variants={pageVariants}
                initial="initial"
                animate="animate"
              >
                <div className="mb-6">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    Create New Account
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Register with your details to start ordering authentic medicines.
                  </p>
                </div>

                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 transition">
                      <User size={18} className="text-slate-400 mr-2.5 shrink-0" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Karthik Pandian"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 placeholder:font-normal"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 transition">
                      <Mail size={18} className="text-slate-400 mr-2.5 shrink-0" />
                      <input
                        type="email"
                        required
                        placeholder="e.g. karthik@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 placeholder:font-normal"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Password (min. 6 characters) <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 transition">
                      <Lock size={18} className="text-slate-400 mr-2.5 shrink-0" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={6}
                        placeholder="Create a strong password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 placeholder:font-normal"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-slate-400 hover:text-slate-600 transition ml-2 cursor-pointer"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      City / Location (Optional)
                    </label>
                    <div className="flex items-center rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 transition">
                      <MapPin size={18} className="text-slate-400 mr-2.5 shrink-0" />
                      <input
                        type="text"
                        placeholder="e.g. Madurai, Tamil Nadu"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 placeholder:font-normal"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-6 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md shadow-emerald-500/20 disabled:opacity-50 transition flex items-center justify-center gap-2 mt-2 cursor-pointer active:scale-[0.99]"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 size={16} className="animate-spin" />
                        <span>Creating Account...</span>
                      </div>
                    ) : (
                      <>
                        <span>Create My Account</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center text-xs text-slate-500">
                  <span>Already have an account? </span>
                  <button
                    type="button"
                    onClick={() => {
                      setMode(MODE.LOGIN);
                      clearAlerts();
                    }}
                    className="font-bold text-emerald-600 hover:text-emerald-700 underline underline-offset-2 cursor-pointer"
                  >
                    Sign In here
                  </button>
                </div>
              </motion.div>
            )}

            {/* Form 3: Email OTP Verification (Job Portal Inline Format) */}
            {mode === MODE.EMAIL_OTP && (
              <motion.div
                key="email-otp-form"
                variants={pageVariants}
                initial="initial"
                animate="animate"
              >
                <div className="mb-6">
                  <div className="h-11 w-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                    <KeyRound size={20} />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    Email Verification Code
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Send a 6-digit verification code to your email and verify inline.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Email ID Field + Inline Send/Resend OTP Button */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Email ID <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 flex items-center rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 transition">
                        <Mail size={18} className="text-slate-400 mr-2.5 shrink-0" />
                        <input
                          type="email"
                          required
                          placeholder="e.g. yourname@gmail.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={otpSending || isVerified}
                          className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 placeholder:font-normal"
                        />
                      </div>
                      <button
                        type="button"
                        disabled={otpSending || (otpSent && timer > 0) || !email || isVerified}
                        onClick={handleSendEmailOtp}
                        className="shrink-0 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-md shadow-sky-500/20 disabled:opacity-50 transition flex items-center gap-1.5 cursor-pointer active:scale-95"
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
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Enter Email OTP <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 flex items-center rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 transition">
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
                          className="w-full bg-transparent text-sm font-bold tracking-widest text-slate-900 outline-none placeholder:text-slate-400 placeholder:tracking-normal placeholder:font-normal"
                        />
                      </div>
                      <button
                        type="button"
                        disabled={verifying || otp.length !== 6 || isVerified}
                        onClick={handleVerifyEmailOtp}
                        className={`shrink-0 px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                          isVerified
                            ? "bg-emerald-500 text-white shadow-emerald-500/20"
                            : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 disabled:opacity-50"
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
                      <p className="text-[11px] text-slate-500 mt-1.5">
                        6-digit code dispatched to <strong className="text-emerald-700">{email}</strong>. Check inbox or spam folder.
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          <div className="pt-6 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-400">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>256-Bit Encrypted Healthcare Patient Session</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;