import React, { useState, useEffect } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Boxes,
  Clock,
  Users,
  Truck,
  BarChart3,
  Settings,
  Search,
  Bell,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  LogOut,
  ExternalLink,
  ShieldCheck,
  Navigation,
} from "lucide-react";
import { clearAdminSession, getAdminUser } from "../../utils/auth";

const navItems = [
  {
    name: "Dashboard",
    path: "/admin",
    icon: LayoutDashboard,
    hasChevron: false,
    exact: true,
  },
  {
    name: "Sales",
    path: "/admin/sales",
    icon: ShoppingCart,
    hasChevron: true,
  },
  {
    name: "Purchase",
    path: "/admin/purchases",
    icon: Package,
    hasChevron: true,
  },
  {
    name: "Inventory",
    path: "/admin/medicines",
    icon: Boxes,
    hasChevron: true,
  },
  {
    name: "Expiry Management",
    path: "/admin/expiry-management",
    icon: Clock,
    hasChevron: true,
  },
  {
    name: "Customers",
    path: "/admin/customers",
    icon: Users,
    hasChevron: false,
  },
  {
    name: "Suppliers",
    path: "/admin/suppliers",
    icon: Truck,
    hasChevron: false,
  },
  {
    name: "Live Tracking",
    path: "/admin/live-tracking",
    icon: Navigation,
    hasChevron: false,
  },
  {
    name: "Reports",
    path: "/admin/reports",
    icon: BarChart3,
    hasChevron: true,
  },
  {
    name: "Settings",
    path: "/admin/offers",
    icon: Settings,
    hasChevron: true,
  },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");

  const adminUser = getAdminUser() || {
    name: "Admin",
    email: "pandikarthi567@gmail.com",
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    clearAdminSession();
    navigate("/admin/login");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/admin/medicines?q=${encodeURIComponent(searchQuery)}`);
  };

  const isNavActive = (item) => {
    if (item.exact) {
      return (
        location.pathname === item.path ||
        (item.path === "/admin" && location.pathname === "/admin/dashboard")
      );
    }
    if (item.path === "/admin/sales") {
      return (
        location.pathname === "/admin/sales" ||
        location.pathname.startsWith("/admin/orders")
      );
    }
    return location.pathname.startsWith(item.path);
  };

  // Format date e.g. "Wed, 03 Sep 2026"
  const formattedDate = currentTime.toLocaleDateString("en-US", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  // Format time e.g. "09:45 AM"
  const formattedTime = currentTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div className="min-h-screen bg-[#f4faf8] flex text-slate-800 font-sans">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Left Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#e5f0eb] flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="px-6 py-5 border-b border-[#f0f6f3] flex items-center justify-between">
          <Link to="/admin" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
              >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                <path d="M12 7v6" />
                <path d="M9 10h6" />
              </svg>
            </div>
            <div>
              <div className="text-lg font-black tracking-tight text-slate-900 leading-tight">
                MediCare<span className="text-emerald-600">+</span>
              </div>
              <div className="text-[11px] font-medium text-slate-400">
                Medical Shop Admin
              </div>
            </div>
          </Link>

          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-3.5 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isNavActive(item);

            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`relative group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                  active
                    ? "bg-[#e6f7f2] text-emerald-600 shadow-2xs font-bold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-emerald-600 rounded-r-full" />
                )}
                <div className="flex items-center gap-3">
                  <Icon
                    size={18}
                    className={`transition-colors ${
                      active ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600"
                    }`}
                  />
                  <span>{item.name}</span>
                </div>

                {item.hasChevron && (
                  <ChevronRight
                    size={15}
                    className={`transition-colors ${
                      active ? "text-emerald-500" : "text-slate-300 group-hover:text-slate-400"
                    }`}
                  />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Pill Capsule Card */}
        <div className="p-4 pt-0">
          <div className="rounded-2xl bg-linear-to-b from-[#e8faf4] to-[#e0f7ef] border border-[#bbf0df]/70 p-4 text-center shadow-2xs">
            {/* 3D Capsule Illustration */}
            <div className="mx-auto mb-2.5 flex items-center justify-center">
              <div className="relative w-16 h-12 flex items-center justify-center">
                <svg
                  viewBox="0 0 100 80"
                  className="w-14 h-14 drop-shadow-md"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g transform="rotate(-35 50 40)">
                    {/* Left half - mint */}
                    <path
                      d="M20 40 C20 28 30 20 42 20 L50 20 L50 60 L42 60 C30 60 20 52 20 40 Z"
                      fill="#10b981"
                    />
                    <path
                      d="M25 35 C25 28 32 25 40 25 L45 25"
                      stroke="#a7f3d0"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    {/* Right half - teal/light mint */}
                    <path
                      d="M50 20 L58 20 C70 20 80 28 80 40 C80 52 70 60 58 60 L50 60 Z"
                      fill="#6ee7b7"
                    />
                    {/* Divider line */}
                    <line
                      x1="50"
                      y1="20"
                      x2="50"
                      y2="60"
                      stroke="#047857"
                      strokeWidth="2"
                    />
                  </g>
                </svg>
              </div>
            </div>

            <p className="text-xs font-bold text-slate-800 tracking-tight">
              Good Health
            </p>
            <p className="text-[11px] font-medium text-slate-500 mt-0.5">
              Brighter Tomorrow
            </p>
            <div className="w-6 h-0.5 bg-emerald-500 rounded-full mx-auto mt-2" />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#e5f0eb] px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          {/* Left: Hamburger & Search */}
          <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-2xl">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>

            {/* Search Input matching reference image */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-lg">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search medicines, customers, invoices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-24 py-2 rounded-xl bg-slate-50/80 border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:outline-hidden transition"
              />
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition cursor-pointer"
              >
                Search
              </motion.button>
            </form>
          </div>

          {/* Right: Notifications, Admin profile, Live Date & Time */}
          <div className="flex items-center gap-3 sm:gap-5 shrink-0">
            {/* Notification Bell */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                type="button"
                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition relative cursor-pointer"
                aria-label="Notifications"
              >
                <Bell size={19} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
              </motion.button>
            </div>

            {/* Admin Profile Pill & Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-slate-50 transition cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center border border-slate-200">
                  {(adminUser.name?.[0] || "A").toUpperCase()}
                  {adminUser.name?.split(" ")?.[1]?.[0]?.toUpperCase() || "D"}
                </div>
                <span className="hidden sm:inline text-xs font-semibold text-slate-800">
                  {adminUser.name || "Admin"}
                </span>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {/* Profile Dropdown Menu */}
              {profileDropdownOpen && (
                <div
                  onMouseLeave={() => setProfileDropdownOpen(false)}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                >
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {adminUser.name || "Admin"}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {adminUser.email}
                    </p>
                    <span className="mt-1 inline-block px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                      Active Administrator
                    </span>
                  </div>

                  <a
                    href="http://localhost:5173"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
                  >
                    <ExternalLink size={14} className="text-slate-400" />
                    <span>View Customer Store</span>
                  </a>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition text-left cursor-pointer"
                  >
                    <LogOut size={14} />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>

            {/* Date & Time display */}
            <div className="hidden md:block text-right pl-2 border-l border-slate-200">
              <div className="text-xs font-semibold text-slate-700 leading-tight">
                {formattedDate}
              </div>
              <div className="text-[11px] font-medium text-slate-400 leading-tight mt-0.5">
                {formattedTime}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-7 max-w-[1600px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
