import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  Package,
  Boxes,
  Users,
  Star,
  AlertCircle,
  Zap,
  Calendar,
  ChevronDown,
  ChevronRight,
  Store,
  ArrowUpRight,
  BarChart2,
  PlusCircle,
  UserPlus,
  FileBarChart,
  PackageX,
  TrendingUp,
} from "lucide-react";
import API from "../api/axios";
import { itemVariants, buttonMotion, containerVariants } from "./components/pageMotion";

// 3D Medicine Icon Components
const RedWhiteCapsule = () => (
  <svg width="28" height="28" viewBox="0 0 32 32" className="drop-shadow-xs shrink-0">
    <defs>
      <linearGradient id="capRed" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#ff4d4f" />
        <stop offset="70%" stopColor="#e02424" />
        <stop offset="100%" stopColor="#991b1b" />
      </linearGradient>
      <linearGradient id="capWhite" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="70%" stopColor="#f1f5f9" />
        <stop offset="100%" stopColor="#cbd5e1" />
      </linearGradient>
      <filter id="capShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="1" dy="1.5" stdDeviation="1.2" floodColor="#000000" floodOpacity="0.18" />
      </filter>
    </defs>
    <g transform="rotate(-40 16 16)" filter="url(#capShadow)">
      <path d="M12 6 C12 3.8 13.8 2 16 2 C18.2 2 20 3.8 20 6 L20 16 L12 16 Z" fill="url(#capRed)" />
      <path d="M12 16 L20 16 L20 26 C20 28.2 18.2 30 16 30 C13.8 30 12 28.2 12 26 Z" fill="url(#capWhite)" />
      <line x1="12" y1="16" x2="20" y2="16" stroke="#e2e8f0" strokeWidth="0.8" />
      <path d="M13.5 5 C13.5 4 14.5 3 15.5 3 C15.5 8 15.5 12 15.5 14 C14.5 14 13.5 13 13.5 12 Z" fill="#ffffff" opacity="0.6" />
    </g>
  </svg>
);

const WhiteTablet = () => (
  <svg width="28" height="28" viewBox="0 0 32 32" className="drop-shadow-xs shrink-0">
    <defs>
      <linearGradient id="tabWhite" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="50%" stopColor="#f8fafc" />
        <stop offset="100%" stopColor="#d1d5db" />
      </linearGradient>
      <filter id="tabShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="1" dy="1.5" stdDeviation="1.2" floodColor="#000000" floodOpacity="0.15" />
      </filter>
    </defs>
    <g filter="url(#tabShadow)">
      <ellipse cx="16" cy="16" rx="11" ry="11" fill="url(#tabWhite)" />
      <ellipse cx="16" cy="16" rx="9" ry="9" fill="none" stroke="#e2e8f0" strokeWidth="0.75" />
      <line x1="7" y1="16" x2="25" y2="16" stroke="#cbd5e1" strokeWidth="1.2" strokeLinecap="round" />
      <ellipse cx="13" cy="12" rx="4" ry="2.5" fill="#ffffff" opacity="0.85" transform="rotate(-30 13 12)" />
    </g>
  </svg>
);

const RedCapsule = () => (
  <svg width="28" height="28" viewBox="0 0 32 32" className="drop-shadow-xs shrink-0">
    <defs>
      <linearGradient id="capFullRed" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#ff4d4f" />
        <stop offset="60%" stopColor="#dc2626" />
        <stop offset="100%" stopColor="#991b1b" />
      </linearGradient>
      <filter id="capRedShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="1" dy="1.5" stdDeviation="1.2" floodColor="#000000" floodOpacity="0.18" />
      </filter>
    </defs>
    <g transform="rotate(-40 16 16)" filter="url(#capRedShadow)">
      <rect x="12" y="2" width="8" height="28" rx="4" fill="url(#capFullRed)" />
      <line x1="12" y1="16" x2="20" y2="16" stroke="#b91c1c" strokeWidth="0.8" />
      <path d="M13.5 5 C13.5 4 14.5 3 15.5 3 C15.5 8 15.5 12 15.5 14 C14.5 14 13.5 13 13.5 12 Z" fill="#ffffff" opacity="0.5" />
    </g>
  </svg>
);

const BlueCapsule = () => (
  <svg width="28" height="28" viewBox="0 0 32 32" className="drop-shadow-xs shrink-0">
    <defs>
      <linearGradient id="capBlue" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#60a5fa" />
        <stop offset="60%" stopColor="#2563eb" />
        <stop offset="100%" stopColor="#1e40af" />
      </linearGradient>
      <filter id="capBlueShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="1" dy="1.5" stdDeviation="1.2" floodColor="#000000" floodOpacity="0.18" />
      </filter>
    </defs>
    <g transform="rotate(-40 16 16)" filter="url(#capBlueShadow)">
      <rect x="12" y="2" width="8" height="28" rx="4" fill="url(#capBlue)" />
      <line x1="12" y1="16" x2="20" y2="16" stroke="#1d4ed8" strokeWidth="0.8" />
      <path d="M13.5 5 C13.5 4 14.5 3 15.5 3 C15.5 8 15.5 12 15.5 14 C14.5 14 13.5 13 13.5 12 Z" fill="#ffffff" opacity="0.55" />
    </g>
  </svg>
);

const YellowTablet = () => (
  <svg width="28" height="28" viewBox="0 0 32 32" className="drop-shadow-xs shrink-0">
    <defs>
      <linearGradient id="tabYellow" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="50%" stopColor="#facc15" />
        <stop offset="100%" stopColor="#ca8a04" />
      </linearGradient>
      <filter id="tabYelShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="1" dy="1.5" stdDeviation="1.2" floodColor="#000000" floodOpacity="0.15" />
      </filter>
    </defs>
    <g filter="url(#tabYelShadow)">
      <ellipse cx="16" cy="16" rx="11" ry="11" fill="url(#tabYellow)" />
      <ellipse cx="16" cy="16" rx="9" ry="9" fill="none" stroke="#eab308" strokeWidth="0.75" />
      <line x1="7" y1="16" x2="25" y2="16" stroke="#a16207" strokeWidth="1.2" strokeLinecap="round" />
      <ellipse cx="13" cy="12" rx="4" ry="2.5" fill="#ffffff" opacity="0.7" transform="rotate(-30 13 12)" />
    </g>
  </svg>
);

const ICONS = [RedWhiteCapsule, WhiteTablet, RedCapsule, BlueCapsule, YellowTablet];

const Sparkline = ({ color, bars = [10, 20, 15, 30, 25, 40, 35] }) => (
  <div className="flex items-end gap-[2px] h-5">
    {bars.map((h, i) => (
      <span
        key={i}
        style={{ height: `${Math.max(h, 15)}%`, backgroundColor: color, opacity: 0.65 + i * 0.05 }}
        className="w-1.5 rounded-sm inline-block"
      />
    ))}
  </div>
);

const SalesChart = ({ data }) => {
  const [tooltip, setTooltip] = useState(null);
  const W = 560, H = 200, PL = 44, PR = 32, PT = 10, PB = 32;
  const iW = W - PL - PR, iH = H - PT - PB;
  const maxVal = Math.max(...data.map((d) => Math.max(d.amount, d.orders)), 10);
  const xOf = (i) => (data.length <= 1 ? PL + iW / 2 : PL + (i / (data.length - 1)) * iW);
  const yAmt = (v) => PT + iH - (v / maxVal) * iH;
  const yOrd = (v) => PT + iH - (v / maxVal) * iH;

  const buildPath = (pts) => {
    if (pts.length === 0) return "";
    if (pts.length === 1) return `M ${pts[0][0]} ${pts[0][1]} L ${pts[0][0]} ${pts[0][1]}`;
    let d = `M ${pts[0][0]} ${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) {
      const [px, py] = pts[i - 1], [cx, cy] = pts[i], mx = (px + cx) / 2;
      d += ` C ${mx} ${py}, ${mx} ${cy}, ${cx} ${cy}`;
    }
    return d;
  };

  const amtPts = data.map((d, i) => [xOf(i), yAmt(d.amount)]);
  const ordPts = data.map((d, i) => [xOf(i), yOrd(d.orders)]);
  const amtPath = buildPath(amtPts);
  const ordPath = buildPath(ordPts);
  const areaPath =
    data.length > 1
      ? `${amtPath} L ${xOf(data.length - 1)} ${PT + iH} L ${PL} ${PT + iH} Z`
      : "";
  const yTicks = [0, Math.round(maxVal * 0.25), Math.round(maxVal * 0.5), Math.round(maxVal * 0.75), Math.round(maxVal)];

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[300px]" style={{ display: "block" }}>
        <defs>
          <linearGradient id="amtGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
        </defs>
        {yTicks.map((t) => (
          <g key={t}>
            <line x1={PL} y1={yAmt(t)} x2={W - PR} y2={yAmt(t)} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />
            <text x={PL - 4} y={yAmt(t) + 3.5} textAnchor="end" fontSize="9" fill="#94a3b8">{t}</text>
            <text x={W - PR + 4} y={yAmt(t) + 3.5} textAnchor="start" fontSize="9" fill="#94a3b8">{t}</text>
          </g>
        ))}
        {areaPath && <path d={areaPath} fill="url(#amtGrad)" />}
        {ordPath && (
          <path
            d={ordPath}
            fill="none"
            stroke="#10b981"
            strokeWidth="1.8"
            strokeDasharray="5 4"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.7"
          />
        )}
        {amtPath && (
          <path
            d={amtPath}
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        {amtPts.map(([x, y], i) => (
          <g key={i} onMouseEnter={() => setTooltip({ x, y, ...data[i] })} onMouseLeave={() => setTooltip(null)} style={{ cursor: "pointer" }}>
            <circle cx={x} cy={y} r={8} fill="transparent" />
            <circle cx={x} cy={y} r={3.5} fill="white" stroke="#10b981" strokeWidth="2" />
          </g>
        ))}
        {ordPts.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={3} fill="white" stroke="#10b981" strokeWidth="1.5" opacity="0.8" />
        ))}
        {data.map((d, i) => (
          <text key={i} x={xOf(i)} y={H - 4} textAnchor="middle" fontSize="9.5" fill="#94a3b8">{d.label}</text>
        ))}
        {tooltip && (
          <g>
            <rect x={tooltip.x - 46} y={tooltip.y - 36} width={92} height={28} rx={5} fill="#0f172a" opacity="0.88" />
            <text x={tooltip.x} y={tooltip.y - 22} textAnchor="middle" fontSize="9" fill="white" fontWeight="600">
              {tooltip.label}: {tooltip.amount}
            </text>
            <text x={tooltip.x} y={tooltip.y - 12} textAnchor="middle" fontSize="8.5" fill="#86efac">
              {tooltip.orders} orders
            </text>
          </g>
        )}
      </svg>
      <div className="flex text-[10px] text-slate-400 mt-0.5 px-10">
        <span className="font-medium text-slate-500">Amount (₹)</span>
        <span className="ml-auto font-medium text-slate-500">Orders</span>
      </div>
    </div>
  );
};

const DonutChart = ({ segments, totalOrders }) => {
  const R = 56, CX = 80, CY = 80, SW = 22, circ = 2 * Math.PI * R;
  let off = 0;
  const arcs = segments.map((s) => {
    const arc = { ...s, off, dash: (s.pct / 100) * circ };
    off += arc.dash;
    return arc;
  });

  if (segments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-slate-400 text-xs">
        <PackageX className="w-10 h-10 text-slate-300 mb-2" />
        <p>No category distribution data available.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-5">
      <div className="shrink-0">
        <svg width={160} height={160} viewBox="0 0 160 160">
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="#f1f5f9" strokeWidth={SW} />
          {arcs.map((arc, i) => (
            <circle
              key={i}
              cx={CX}
              cy={CY}
              r={R}
              fill="none"
              stroke={arc.color}
              strokeWidth={SW}
              strokeDasharray={`${arc.dash} ${circ - arc.dash}`}
              strokeDashoffset={-arc.off}
              transform="rotate(-90 80 80)"
              strokeLinecap="butt"
            />
          ))}
          <text x={CX} y={CY - 8} textAnchor="middle" fontSize="9" fill="#94a3b8" fontWeight="500">
            Total Orders
          </text>
          <text x={CX} y={CY + 12} textAnchor="middle" fontSize="22" fill="#0f172a" fontWeight="700">
            {totalOrders}
          </text>
        </svg>
      </div>
      <div className="grid grid-cols-1 gap-1.5 w-full">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
              <span className="text-[11px] text-slate-600">{seg.name}</span>
            </div>
            <span className="text-[11px] font-semibold text-slate-700">{seg.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const [dbData, setDbData] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [dashRes, medsRes, ordersRes] = await Promise.all([
          API.get("/admin/dashboard").catch(() => ({ data: {} })),
          API.get("/medicines/all").catch(() => API.get("/medicines")).catch(() => ({ data: [] })),
          API.get("/admin/orders").catch(() => API.get("/orders")).catch(() => ({ data: [] })),
        ]);

        if (dashRes.data?.success) {
          setDbData(dashRes.data);
        } else if (dashRes.data) {
          setDbData(dashRes.data);
        }

        const rawMeds =
          medsRes.data?.medicines ||
          medsRes.data?.data ||
          (Array.isArray(medsRes.data) ? medsRes.data : []);
        const cleanMeds = rawMeds.filter((m) => {
          const name = (m.name || "").toLowerCase();
          return !name.includes("(batch ") && !m.batchNo?.toLowerCase().startsWith("bch1");
        });
        setMedicines(cleanMeds);

        const rawOrders =
          ordersRes.data?.orders ||
          ordersRes.data?.data ||
          (Array.isArray(ordersRes.data) ? ordersRes.data : []);
        setOrders(rawOrders);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // KPI Calculations
  const totalSales = dbData?.revenue != null ? `₹ ${Number(dbData.revenue).toLocaleString("en-IN")}` : "₹ 0";
  const totalPurchase = dbData?.purchase != null ? `₹ ${Number(dbData.purchase).toLocaleString("en-IN")}` : "₹ 0";
  const totalStock = (dbData?.totalMedicines ?? medicines.length ?? 0).toLocaleString("en-IN");
  const totalCustomers = (dbData?.totalUsers ?? 0).toLocaleString("en-IN");
  const totalOrders = dbData?.totalOrders ?? orders.length ?? 0;
  const adminName = dbData?.admin?.name || "Admin";

  // Dynamic Top Selling calculation
  const topSellingMedicines = useMemo(() => {
    if (!orders || orders.length === 0) {
      // If no orders yet, display up to 5 medicines added by admin if available
      if (medicines.length > 0) {
        return medicines.slice(0, 5).map((m, idx) => ({
          rank: idx + 1,
          name: m.name || "Medicine",
          units: m.stock || 0,
          progress: Math.min(100, Math.max(10, (m.stock || 1) * 2)),
          badgeBg: "bg-emerald-50 text-emerald-600",
          barColor: "bg-emerald-500",
          icon: ICONS[idx % ICONS.length],
        }));
      }
      return [];
    }

    const counts = {};
    orders.forEach((o) => {
      if (Array.isArray(o.items)) {
        o.items.forEach((item) => {
          const name = item.name || item.medicineName || "Medicine";
          counts[name] = (counts[name] || 0) + Number(item.quantity || 1);
        });
      }
    });

    const sorted = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const maxUnits = sorted[0]?.[1] || 1;
    return sorted.map(([name, units], idx) => ({
      rank: idx + 1,
      name,
      units,
      progress: Math.round((units / maxUnits) * 100),
      badgeBg:
        idx === 0
          ? "bg-emerald-50 text-emerald-600"
          : idx === 1
          ? "bg-blue-50 text-blue-600"
          : idx === 2
          ? "bg-amber-50 text-amber-600"
          : "bg-purple-50 text-purple-600",
      barColor:
        idx === 0
          ? "bg-emerald-500"
          : idx === 1
          ? "bg-blue-600"
          : idx === 2
          ? "bg-amber-500"
          : "bg-purple-500",
      icon: ICONS[idx % ICONS.length],
    }));
  }, [orders, medicines]);

  // Dynamic Low Stock & Expiry List
  const lowStockList = useMemo(() => {
    const now = new Date();
    const thirtyDaysAhead = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const alerts = [];
    medicines.forEach((m) => {
      const stock = Number(m.stock || 0);
      const exp = m.expiryDate ? new Date(m.expiryDate) : null;
      const isExpiring = exp && exp <= thirtyDaysAhead;
      const isLow = stock <= 10;

      if (isLow || isExpiring) {
        alerts.push({
          rank: alerts.length + 1,
          name: m.name || "Medicine",
          stock: stock,
          expiry: exp && !isNaN(exp.getTime()) ? exp.toLocaleDateString("en-GB") : "N/A",
          type: isLow ? "low" : "expiring",
          color: isLow ? "#ef4444" : "#f59e0b",
        });
      }
    });

    return alerts.slice(0, 5);
  }, [medicines]);

  // Dynamic Category breakdown
  const categoryData = useMemo(() => {
    if (medicines.length === 0) return [];
    const catMap = {};
    medicines.forEach((m) => {
      const c = m.category || "General";
      catMap[c] = (catMap[c] || 0) + 1;
    });
    const colors = ["#10b981", "#3b82f6", "#ec4899", "#f97316", "#eab308", "#8b5cf6"];
    return Object.entries(catMap).map(([name, count], i) => ({
      name,
      pct: Math.round((count / medicines.length) * 100),
      color: colors[i % colors.length],
    }));
  }, [medicines]);

  // Monthly Sales Chart Data
  const monthlyData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentMonthIdx = new Date().getMonth();
    const result = [];
    for (let i = 0; i <= currentMonthIdx; i++) {
      result.push({
        label: months[i],
        amount: 0,
        orders: 0,
      });
    }

    orders.forEach((o) => {
      const dt = new Date(o.createdAt || o.date);
      if (!isNaN(dt.getTime()) && dt.getFullYear() === new Date().getFullYear()) {
        const m = dt.getMonth();
        if (result[m]) {
          result[m].orders += 1;
          result[m].amount += Number(o.totalAmount || 0);
        }
      }
    });

    return result.length > 0 ? result : [{ label: "Today", amount: 0, orders: 0 }];
  }, [orders]);

  const kpiCards = [
    {
      id: "sales",
      title: "Total Sales",
      sub: "Today's Sales Revenue",
      value: totalSales,
      change: "+0%",
      changeLabel: "verified",
      icon: ShoppingCart,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      sparkColor: "#10b981",
      bars: [20, 30, 25, 40, 35, 50, 45],
    },
    {
      id: "purchase",
      title: "Total Purchase",
      sub: "Today's Purchase Value",
      value: totalPurchase,
      change: "+0%",
      changeLabel: "verified",
      icon: Package,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-500",
      sparkColor: "#3b82f6",
      bars: [20, 25, 22, 35, 30, 42, 40],
    },
    {
      id: "stock",
      title: "Total Stock Items",
      sub: "Medicines in Inventory",
      value: totalStock,
      change: "+0%",
      changeLabel: "active items",
      icon: Boxes,
      iconBg: "bg-orange-50",
      iconColor: "text-orange-500",
      sparkColor: "#f97316",
      bars: [30, 35, 32, 45, 40, 50, 48],
    },
    {
      id: "customers",
      title: "Total Customers",
      sub: "Registered Customers",
      value: totalCustomers,
      change: "+0%",
      changeLabel: "verified users",
      icon: Users,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-500",
      sparkColor: "#8b5cf6",
      bars: [15, 25, 20, 35, 30, 40, 45],
    },
  ];

  const quickActions = [
    { label: "New Sale", icon: ShoppingCart, to: "/admin/sales", bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", iconColor: "text-emerald-600" },
    { label: "New Purchase", icon: Package, to: "/admin/purchases", bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", iconColor: "text-blue-500" },
    { label: "Add Medicine", icon: PlusCircle, to: "/admin/inventory", bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", iconColor: "text-amber-500" },
    { label: "New Customer", icon: UserPlus, to: "/admin/customers", bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700", iconColor: "text-purple-500" },
    { label: "View Reports", icon: FileBarChart, to: "/admin/reports", bg: "bg-slate-50", border: "border-slate-200", text: "text-slate-700", iconColor: "text-slate-500" },
  ];

  return (
    <div className="space-y-5 pb-6">
      {/* 1. Welcome Banner */}
      <motion.div variants={containerVariants} initial="initial" animate="animate" className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <motion.div variants={itemVariants}>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
            Welcome Back, <span className="text-emerald-600">{adminName}!</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage your medical shop efficiently. Here's what's happening today.</p>
        </motion.div>
        <motion.div
          variants={itemVariants}
          className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-3 shadow-xs self-start lg:self-auto shrink-0"
        >
          <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm shrink-0">
            <Store size={20} />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-800">MediCare+ Medical Shop</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Safe Medicines. Healthier Lives.</div>
          </div>
        </motion.div>
      </motion.div>

      {/* 2. KPI Cards */}
      <motion.div variants={containerVariants} initial="initial" animate="animate" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.id}
              variants={itemVariants}
              whileHover={{ y: -2, boxShadow: "0 8px 24px -6px rgba(0,0,0,0.10)" }}
              transition={{ duration: 0.18 }}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs"
            >
              <div className="flex items-start gap-4">
                <div className={`h-12 w-12 rounded-2xl ${card.iconBg} ${card.iconColor} flex items-center justify-center shrink-0`}>
                  <Icon size={22} strokeWidth={1.8} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider leading-tight">{card.title}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{card.sub}</p>
                  <p className="text-[22px] font-black text-slate-900 mt-1.5 leading-none">{card.value}</p>
                  <div className="flex items-center justify-between mt-2.5 gap-2">
                    <div className="flex items-center gap-1">
                      <ArrowUpRight size={12} className="text-emerald-500" />
                      <span className="text-[11px] font-bold text-emerald-600">{card.change}</span>
                      <span className="text-[10px] text-slate-400">{card.changeLabel}</span>
                    </div>
                    <Sparkline color={card.sparkColor} bars={card.bars} />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* 3. Charts Row */}
      <motion.div variants={containerVariants} initial="initial" animate="animate" className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sales Line Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="text-[15px] font-bold text-slate-800 flex items-center gap-2">
                <BarChart2 size={15} className="text-emerald-600" /> Sales Overview
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Monthly sales amount and orders trend</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="hidden sm:flex items-center gap-3 text-[10px] text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="inline-block w-5 h-[2px] bg-emerald-500 rounded" /> Amount
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-4 border-t-2 border-dashed border-emerald-400" /> Orders
                </span>
              </div>
              <button className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 border border-slate-200 rounded-lg px-2.5 py-1 hover:border-emerald-300 transition-colors bg-white">
                <Calendar size={11} /> This Year <ChevronDown size={10} />
              </button>
            </div>
          </div>
          <SalesChart data={monthlyData} />
        </motion.div>

        {/* Top Selling Medicines Widget */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-[16px] sm:text-[17px] font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="3" y="11" width="4" height="10" rx="1.5" />
                    <rect x="10" y="5" width="4" height="16" rx="1.5" />
                    <rect x="17" y="1" width="4" height="20" rx="1.5" />
                  </svg>
                  Top Selling Medicines
                </h2>
                <p className="text-[11.5px] text-slate-400 mt-0.5">Most sold medicines from verified orders</p>
              </div>
              <Link
                to="/admin/inventory"
                className="text-[12.5px] font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5 shrink-0 hover:underline transition-colors mt-0.5"
              >
                View All <ChevronRight size={14} className="stroke-[2.5]" />
              </Link>
            </div>

            {/* List of items */}
            {topSellingMedicines.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-xs">
                <PackageX className="w-9 h-9 mx-auto mb-2 text-slate-300" />
                <p>No medicines added or sold yet.</p>
                <Link to="/admin/inventory" className="text-emerald-600 font-semibold hover:underline mt-1 inline-block">
                  + Add Medicine
                </Link>
              </div>
            ) : (
              <div className="space-y-3.5">
                {topSellingMedicines.map((item, idx) => {
                  const IconComponent = item.icon;
                  return (
                    <motion.div
                      key={item.rank}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: idx * 0.05 }}
                      className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-50/80 transition-colors"
                    >
                      {/* Rank Badge */}
                      <div className={`w-7 h-7 rounded-full ${item.badgeBg} font-bold text-[12.5px] flex items-center justify-center shrink-0 shadow-2xs`}>
                        {item.rank}
                      </div>

                      {/* 3D Medicine Icon */}
                      <div className="w-8 h-8 flex items-center justify-center shrink-0">
                        <IconComponent />
                      </div>

                      {/* Name & Progress Bar */}
                      <div className="min-w-0 flex-1">
                        <h4 className="text-[14px] font-bold text-slate-800 leading-tight truncate">{item.name}</h4>
                        <div className="w-full bg-slate-100 rounded-full h-2 mt-1.5 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${item.progress}%` }}
                            transition={{ duration: 0.8, delay: 0.15 + idx * 0.08, ease: "easeOut" }}
                            className={`h-full rounded-full ${item.barColor}`}
                          />
                        </div>
                      </div>

                      {/* Units Count */}
                      <div className="text-right shrink-0 pl-2">
                        <div className="text-[14.5px] font-bold text-slate-900 leading-none">{item.units}</div>
                        <div className="text-[10.5px] text-slate-400 font-medium mt-0.5">units</div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* 4. Tables & Category Breakdown Row */}
      <motion.div variants={containerVariants} initial="initial" animate="animate" className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Category & Order Distribution */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-[15px] font-bold text-slate-800 flex items-center gap-2">
                <Star size={14} className="text-emerald-500 fill-emerald-500" /> Order & Category Distribution
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Medicine category distribution by database inventory</p>
            </div>
            <Link to="/admin/sales" className="text-[11px] font-semibold text-emerald-600 hover:underline">
              View Sales
            </Link>
          </div>
          <DonutChart segments={categoryData} totalOrders={totalOrders} />
        </motion.div>

        {/* Low Stock / Expiry */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="flex items-center justify-between px-5 pt-5 pb-1">
            <h2 className="text-[15px] font-bold text-slate-800 flex items-center gap-2">
              <AlertCircle size={14} className="text-rose-500" /> Low Stock / Expiry Alert
            </h2>
            <Link to="/admin/inventory" className="text-[11px] font-semibold text-emerald-600 hover:underline flex items-center gap-0.5">
              View All <ArrowUpRight size={11} />
            </Link>
          </div>
          <p className="text-[10px] text-slate-400 px-5 mb-3">Medicines running low or nearing expiry</p>
          <div className="w-full overflow-x-auto">
            {lowStockList.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                <p>No low stock or expiring medicines found in database.</p>
              </div>
            ) : (
              <table className="w-full min-w-[400px]">
                <thead>
                  <tr className="bg-slate-50 border-y border-slate-100">
                    <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider py-2 pl-5 pr-2 w-8">#</th>
                    <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider py-2 px-2">Medicine Name</th>
                    <th className="text-center text-[10px] font-semibold text-slate-400 uppercase tracking-wider py-2 px-2">Stock</th>
                    <th className="text-center text-[10px] font-semibold text-slate-400 uppercase tracking-wider py-2 px-2">Expiry Date</th>
                    <th className="text-center text-[10px] font-semibold text-slate-400 uppercase tracking-wider py-2 pl-2 pr-5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {lowStockList.map((med, i) => (
                    <motion.tr
                      key={med.rank}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.18, delay: i * 0.04 }}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="py-2.5 pl-5 pr-2">
                        <span
                          className="inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-[10px] font-bold"
                          style={{ backgroundColor: med.color }}
                        >
                          {med.rank}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-[12.5px] font-medium text-slate-700">{med.name}</td>
                      <td className="py-2.5 px-2 text-center text-[12.5px] font-semibold text-slate-700">{med.stock}</td>
                      <td className="py-2.5 px-2 text-center text-[11.5px] text-slate-500">{med.expiry}</td>
                      <td className="py-2.5 pl-2 pr-5 text-center">
                        {med.type === "low" ? (
                          <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-full px-2 py-0.5">
                            Low Stock
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                            Expiring Soon
                          </span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* 5. Quick Actions */}
      <motion.div variants={itemVariants} initial="initial" animate="animate" className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
        <h2 className="text-[14px] font-bold text-slate-800 flex items-center gap-2 mb-4">
          <Zap size={14} className="text-amber-500 fill-amber-500" /> Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.label}
                {...buttonMotion}
                onClick={() => navigate(action.to)}
                className={`flex flex-col items-center justify-center gap-2 py-4 rounded-xl border ${action.bg} ${action.border} ${action.text} font-semibold text-[12px] cursor-pointer hover:brightness-95 transition-all w-full`}
              >
                <Icon size={20} className={action.iconColor} strokeWidth={1.8} />
                {action.label}
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardPage;
