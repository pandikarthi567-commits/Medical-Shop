/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
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
  Truck,
  MapPin,
  Send,
  Loader2,
  Check,
} from "lucide-react";
import api from "../api/axios";

const GoogleIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.97 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

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
  const [oauthLoading, setOauthLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(0);

  // Quick Google OAuth modal state (for prompt / direct testing if Google Client ID is pending setup)
  const [showOAuthModal, setShowOAuthModal] = useState(false);
  const [oauthEmail, setOauthEmail] = useState("");
  const [oauthName, setOauthName] = useState("");

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

  // Initialize Google Identity Services (GSI) for Google One Tap & Credentials
  useEffect(() => {
    if (typeof window !== "undefined" && window.google?.accounts?.id && googleClientId) {
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response) => {
            if (response?.credential) {
              await handleGoogleAuth(response.credential);
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Softly prompt One Tap if user is already signed into Google in Chrome
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed()) {
            console.info("Google One Tap suppressed:", notification.getNotDisplayedReason());
          }
        });
      } catch (gisErr) {
        console.warn("Could not initialize Google Identity Services:", gisErr);
      }
    }
  }, [googleClientId]);

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

  // Process Google OAuth payload to server
  const handleGoogleAuth = async (credentialOrProfile) => {
    try {
      setOauthLoading(true);
      clearAlerts();
      let payload = {};

      if (typeof credentialOrProfile === "string") {
        payload = { credential: credentialOrProfile };
      } else if (credentialOrProfile?.credential) {
        payload = { credential: credentialOrProfile.credential };
      } else {
        payload = { profile: credentialOrProfile };
      }

      const { data } = await api.post("/auth/google", payload);

      if (data?.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        window.dispatchEvent(new Event("authChanged"));

        setMessage(
          mode === MODE.REGISTER
            ? "🎉 Google Account linked successfully! Welcome to MediCare."
            : "Welcome back! Signed in with Google successfully."
        );
        setShowOAuthModal(false);

        setTimeout(() => {
          navigate("/profile", { replace: true });
        }, 500);
      }
    } catch (err) {
      console.error("Google OAuth error:", err);
      setError(
        err?.response?.data?.message ||
          "Google authentication failed. Please try again or use standard email signup."
      );
    } finally {
      setOauthLoading(false);
    }
  };

  const triggerGoogleLogin = () => {
    clearAlerts();

    // 1. Use Google OAuth2 Token Client (Popup flow)
    if (typeof window !== "undefined" && window.google?.accounts?.oauth2 && googleClientId) {
      try {
        setOauthLoading(true);
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: googleClientId,
          scope: "openid email profile",
          callback: async (tokenResponse) => {
            if (tokenResponse?.access_token) {
              try {
                // Fetch verified profile from Google UserInfo endpoint
                const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                  headers: {
                    Authorization: `Bearer ${tokenResponse.access_token}`,
                  },
                });
                const googleProfile = await res.json();
                if (googleProfile?.email) {
                  await handleGoogleAuth(googleProfile);
                } else {
                  setOauthLoading(false);
                  setShowOAuthModal(true);
                }
              } catch (fetchErr) {
                console.warn("Could not fetch userinfo from Google:", fetchErr);
                setOauthLoading(false);
                setShowOAuthModal(true);
              }
            } else {
              setOauthLoading(false);
            }
          },
          error_callback: (err) => {
            setOauthLoading(false);
            if (err?.type === "popup_closed") {
              console.info("Google OAuth popup closed by user or origin check.");
              setError(
                "Google Sign-In popup was closed. If the popup closed automatically, verify that http://localhost:5174 is in Authorized JavaScript origins in Google Cloud Console, or enter your email below to sign in."
              );
            } else if (err?.type === "popup_failed_to_open") {
              setError("Popup was blocked by your browser. Please allow popups for localhost or enter your email below.");
            } else {
              console.warn("Google OAuth popup notice:", err);
              setError("Google Sign-In could not complete (" + (err.message || err.type || "error") + "). Please use the email form below.");
            }
            setShowOAuthModal(true);
          },
        });

        tokenClient.requestAccessToken({ prompt: "select_account" });
        return;
      } catch (err) {
        console.warn("Error initializing tokenClient:", err);
        setOauthLoading(false);
      }
    }

    // 2. Direct fallback modal
    setShowOAuthModal(true);
  };

  const handleManualOAuthSubmit = (e) => {
    e.preventDefault();
    if (!oauthEmail || !oauthEmail.includes("@")) {
      setError("Please enter a valid Google email address");
      return;
    }
    const cleanEmail = oauthEmail.trim().toLowerCase();
    const cleanName = oauthName.trim() || cleanEmail.split("@")[0];

    handleGoogleAuth({
      email: cleanEmail,
      name: cleanName,
      sub: `google_oauth_${Date.now()}`,
      picture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
        cleanEmail
      )}`,
    });
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
              Sign in securely using Google OAuth, email and password, or receive an instant
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
                    Sign in with Google OAuth or your registered email address and password.
                  </p>
                </div>

                {/* Google OAuth Button */}
                <div className="mb-5">
                  <button
                    type="button"
                    onClick={triggerGoogleLogin}
                    disabled={oauthLoading}
                    className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50/80 hover:border-slate-300 text-slate-700 font-bold text-sm shadow-xs transition cursor-pointer active:scale-[0.99] disabled:opacity-50"
                  >
                    {oauthLoading ? (
                      <Loader2 size={18} className="animate-spin text-emerald-600" />
                    ) : (
                      <GoogleIcon className="w-5 h-5" />
                    )}
                    <span>
                      {oauthLoading ? "Connecting to Google..." : "Sign in with Google"}
                    </span>
                  </button>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-3 text-slate-400 font-semibold tracking-wider">
                        Or continue with email
                      </span>
                    </div>
                  </div>
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
                    Sign up with 1-click Google OAuth or register with your email details.
                  </p>
                </div>

                {/* Google OAuth Signup Button */}
                <div className="mb-5">
                  <button
                    type="button"
                    onClick={triggerGoogleLogin}
                    disabled={oauthLoading}
                    className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50/80 hover:border-slate-300 text-slate-700 font-bold text-sm shadow-xs transition cursor-pointer active:scale-[0.99] disabled:opacity-50"
                  >
                    {oauthLoading ? (
                      <Loader2 size={18} className="animate-spin text-emerald-600" />
                    ) : (
                      <GoogleIcon className="w-5 h-5" />
                    )}
                    <span>
                      {oauthLoading ? "Connecting to Google..." : "Sign up with Google"}
                    </span>
                  </button>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-3 text-slate-400 font-semibold tracking-wider">
                        Or create account with email
                      </span>
                    </div>
                  </div>
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

            {/* Form 3: Email OTP Verification */}
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

      {/* Instant Google OAuth Modal (for 1-click signup & testing) */}
      <AnimatePresence>
        {showOAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 relative"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
                    <GoogleIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      {mode === MODE.REGISTER ? "Google Account Sign Up" : "Google Sign In"}
                    </h3>
                    <p className="text-[11px] text-slate-500">Sign in to MediCare</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowOAuthModal(false)}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition cursor-pointer text-lg"
                >
                  ✕
                </button>
              </div>

              <div className="py-4 space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Enter your Google account email below to {mode === MODE.REGISTER ? "instantly create an account" : "sign in"}. Your profile picture and verified details will be automatically connected.
                </p>

                <form onSubmit={handleManualOAuthSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Google Account Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Karthik Pandian"
                      value={oauthName}
                      onChange={(e) => setOauthName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Google Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. yourname@gmail.com"
                      value={oauthEmail}
                      onChange={(e) => setOauthEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={oauthLoading}
                    className="w-full mt-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                  >
                    {oauthLoading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <>
                        <GoogleIcon className="w-4 h-4 brightness-200" />
                        <span>Continue with Google</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                <ShieldCheck size={13} className="text-emerald-600" />
                <span>Encrypted OAuth Token Exchange</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Login;