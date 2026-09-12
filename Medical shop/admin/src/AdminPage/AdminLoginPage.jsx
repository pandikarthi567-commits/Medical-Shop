import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Lock,
  Mail,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import API from "../api/axios";
import { saveAdminAuth } from "../utils/auth";

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/admin";

  const [email, setEmail] = useState("pandikarthi567@gmail.com");
  const [password, setPassword] = useState("Karthik@2005");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loginSuccess, setLoginSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await API.post("/admin/login", {
        email: email.trim().toLowerCase(),
        password: password.trim(),
      });

      if (response.data?.token) {
        setLoginSuccess(true);
        saveAdminAuth(
          response.data.token,
          response.data.user || { email, role: "admin", name: "Admin" }
        );

        setTimeout(() => {
          navigate(from, { replace: true });
        }, 800);
      } else {
        setError(response.data?.message || "Invalid credentials.");
      }
    } catch (err) {
      console.error("Admin login error:", err);
      setError(
        err.response?.data?.message ||
          "Invalid email or password. Please verify your credentials with the database."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50/60 via-slate-50 to-teal-50/40 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Decorative ambient blurred blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] right-[-5%] w-[450px] h-[450px] rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[450px] h-[450px] rounded-full bg-teal-200/30 blur-3xl" />
      </div>

      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-6 sm:p-8 md:p-10 shadow-xl shadow-slate-200/50 backdrop-blur-md">
          {/* Logo Header */}
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-600/25">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-8 h-8"
              >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                <path d="M12 7v6" />
                <path d="M9 10h6" />
              </svg>
            </div>

            <div className="flex items-center justify-center gap-1.5">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                MediCare<span className="text-emerald-600">+</span>
              </h1>
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-1">
              Medical Shop Admin Console
            </p>
          </div>

          {/* Alert messages */}
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/90 p-4 text-xs font-medium text-rose-800">
              <AlertCircle size={18} className="shrink-0 text-rose-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {loginSuccess && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-800">
              <CheckCircle2 size={18} className="shrink-0 text-emerald-600 mt-0.5" />
              <div>
                <p className="font-bold">Credentials matched database!</p>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  Security login alert email dispatched. Redirecting to dashboard...
                </p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="admin@medicare.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-10 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-3 focus:ring-emerald-500/15 focus:outline-hidden transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Admin Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-10 pr-11 py-3 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-3 focus:ring-emerald-500/15 focus:outline-hidden transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || loginSuccess}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-bold text-white hover:bg-emerald-700 active:scale-[0.99] transition-all shadow-md shadow-emerald-600/20 disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Verifying with Database...</span>
                  </>
                ) : loginSuccess ? (
                  <>
                    <CheckCircle2 size={18} />
                    <span>Opening Dashboard...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Info note */}
          <div className="mt-6 rounded-2xl bg-emerald-50/80 border border-emerald-100 p-3.5 text-[11px] text-emerald-800 leading-relaxed">
            <p className="flex items-center gap-1.5 font-bold text-emerald-900 mb-1">
              <ShieldCheck size={14} className="text-emerald-600" /> Database Authentication & Alert
            </p>
            Your email & password are authenticated directly with MongoDB. Upon successful login, a security alert is dispatched to your registered email.
          </div>

          <div className="mt-6 text-center">
            <a
              href="http://localhost:5173"
              className="text-xs font-semibold text-slate-500 hover:text-emerald-600 transition"
            >
              ← Back to Customer Storefront
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
