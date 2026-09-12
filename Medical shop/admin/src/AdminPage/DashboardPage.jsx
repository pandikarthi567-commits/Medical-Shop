import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShoppingCart, Package, Boxes, Users,
  Star, AlertCircle, Zap, Calendar, ChevronDown,
  Store, ArrowUpRight, BarChart2, PlusCircle, UserPlus, FileBarChart,
} from "lucide-react";
import API from "../api/axios";
import { itemVariants, buttonMotion, containerVariants } from "./components/pageMotion";

const monthlyData = [
  { label: "Jan", amount: 13.5, orders: 8 },
  { label: "Feb", amount: 6.5,  orders: 9 },
  { label: "Mar", amount: 9.8,  orders: 13 },
  { label: "Apr", amount: 12.8, orders: 16 },
  { label: "May", amount: 20.8, orders: 19 },
  { label: "Jun", amount: 12.2, orders: 12 },
  { label: "Jul", amount: 18.0, orders: 15 },
  { label: "Aug", amount: 12.8, orders: 13 },
  { label: "Sep", amount: 10.0, orders: 11 },
];

const categoryData = [
  { name: "Pain Relief",     pct: 20, color: "#10b981" },
  { name: "Antibiotics",     pct: 18, color: "#3b82f6" },
  { name: "Vitamins",        pct: 16, color: "#ec4899" },
  { name: "Chronic Care",    pct: 24, color: "#f97316" },
  { name: "Care & Wellness", pct: 12, color: "#eab308" },
  { name: "Others",          pct: 10, color: "#8b5cf6" },
];

const topSelling = [
  { rank: 1, color: "#10b981", name: "Paracetamol 500mg",  units: 520, revenue: "5,200" },
  { rank: 2, color: "#3b82f6", name: "Cetirizine 10mg",    units: 420, revenue: "4,200" },
  { rank: 3, color: "#f59e0b", name: "Amoxicillin 250mg",  units: 380, revenue: "3,800" },
  { rank: 4, color: "#8b5cf6", name: "Pantoprazole 40mg",  units: 310, revenue: "3,100" },
  { rank: 5, color: "#6366f1", name: "Azithromycin 500mg", units: 290, revenue: "2,900" },
];

const lowStockList = [
  { rank: 1, color: "#10b981", name: "Paracetamol 500mg",  stock: 5, expiry: "15 Sep 2026", type: "low" },
  { rank: 2, color: "#3b82f6", name: "Amoxicillin 250mg",  stock: 8, expiry: "22 Sep 2026", type: "low" },
  { rank: 3, color: "#f59e0b", name: "Cetirizine 10mg",    stock: 3, expiry: "30 Sep 2026", type: "low" },
  { rank: 4, color: "#8b5cf6", name: "Pantoprazole 40mg",  stock: 6, expiry: "05 Oct 2026", type: "expiring" },
  { rank: 5, color: "#6366f1", name: "Azithromycin 500mg", stock: 4, expiry: "12 Oct 2026", type: "expiring" },
];

const Sparkline = ({ color, bars = [40, 55, 45, 70, 60, 80, 75] }) => (
  <div className="flex items-end gap-[2px] h-5">
    {bars.map((h, i) => (
      <span key={i} style={{ height: `${h}%`, backgroundColor: color, opacity: 0.65 + i * 0.05 }}
        className="w-1.5 rounded-sm inline-block" />
    ))}
  </div>
);

const SalesChart = ({ data }) => {
  const [tooltip, setTooltip] = useState(null);
  const W = 560, H = 200, PL = 44, PR = 32, PT = 10, PB = 32;
  const iW = W - PL - PR, iH = H - PT - PB;
  const xOf = (i) => PL + (i / (data.length - 1)) * iW;
  const yAmt = (v) => PT + iH - (v / 24) * iH;
  const yOrd = (v) => PT + iH - (v / 24) * iH;
  const buildPath = (pts) => {
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
  const areaPath = `${amtPath} L ${xOf(data.length - 1)} ${PT + iH} L ${PL} ${PT + iH} Z`;
  const yTicks = [0, 6, 12, 18, 24];
  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[300px]" style={{ display: "block" }}>
        <defs>
          <linearGradient id="amtGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#10b981" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
        </defs>
        {yTicks.map((t) => (
          <g key={t}>
            <line x1={PL} y1={yAmt(t)} x2={W - PR} y2={yAmt(t)} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />
            <text x={PL - 4} y={yAmt(t) + 3.5} textAnchor="end" fontSize="9" fill="#94a3b8">{t}L</text>
            <text x={W - PR + 4} y={yAmt(t) + 3.5} textAnchor="start" fontSize="9" fill="#94a3b8">{t}</text>
          </g>
        ))}
        <path d={areaPath} fill="url(#amtGrad)" />
        <path d={ordPath} fill="none" stroke="#10b981" strokeWidth="1.8" strokeDasharray="5 4" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
        <path d={amtPath} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
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
            <text x={tooltip.x} y={tooltip.y - 22} textAnchor="middle" fontSize="9" fill="white" fontWeight="600">{tooltip.label}: {tooltip.amount}L</text>
            <text x={tooltip.x} y={tooltip.y - 12} textAnchor="middle" fontSize="8.5" fill="#86efac">{tooltip.orders} orders</text>
          </g>
        )}
      </svg>
      <div className="flex text-[10px] text-slate-400 mt-0.5 px-10">
        <span className="font-medium text-slate-500">Amount (Rs)</span>
        <span className="ml-auto font-medium text-slate-500">Orders</span>
      </div>
    </div>
  );
};

const DonutChart = ({ segments, totalOrders }) => {
  const R = 56, CX = 80, CY = 80, SW = 22, circ = 2 * Math.PI * R;
  let off = 0;
  const arcs = segments.map((s) => { const arc = { ...s, off, dash: (s.pct / 100) * circ }; off += arc.dash; return arc; });
  return (
    <div className="flex flex-col sm:flex-row items-center gap-5">
      <div className="shrink-0">
        <svg width={160} height={160} viewBox="0 0 160 160">
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="#f1f5f9" strokeWidth={SW} />
          {arcs.map((arc, i) => (
            <circle key={i} cx={CX} cy={CY} r={R} fill="none" stroke={arc.color} strokeWidth={SW}
              strokeDasharray={`${arc.dash} ${circ - arc.dash}`}
              strokeDashoffset={-arc.off}
              transform="rotate(-90 80 80)" strokeLinecap="butt" />
          ))}
          <text x={CX} y={CY - 8} textAnchor="middle" fontSize="9" fill="#94a3b8" fontWeight="500">Total Orders</text>
          <text x={CX} y={CY + 12} textAnchor="middle" fontSize="22" fill="#0f172a" fontWeight="700">{totalOrders}</text>
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

  useEffect(() => {
    API.get("/admin/dashboard")
      .then((res) => { if (res.data?.success) setDbData(res.data); })
      .catch(() => {});
  }, []);

  const totalSales     = dbData?.revenue       ? `Rs ${Number(dbData.revenue).toLocaleString("en-IN")}`      : "Rs 32,450";
  const totalPurchase  = dbData?.purchase      ? `Rs ${Number(dbData.purchase).toLocaleString("en-IN")}`     : "Rs 18,230";
  const totalStock     = dbData?.totalMedicines ? Number(dbData.totalMedicines).toLocaleString("en-IN")      : "1,248";
  const totalCustomers = dbData?.totalUsers    ? Number(dbData.totalUsers).toLocaleString("en-IN")           : "856";
  const totalOrders    = dbData?.totalOrders   || 100;
  const adminName      = dbData?.admin?.name   || "Admin";

  const kpiCards = [
    { id:"sales",     title:"Total Sales",       sub:"Today's Sales Revenue",    value:totalSales,     change:"+12%", changeLabel:"vs. yesterday",  icon:ShoppingCart, iconBg:"bg-emerald-50", iconColor:"text-emerald-600", sparkColor:"#10b981", bars:[35,55,45,70,60,85,75] },
    { id:"purchase",  title:"Total Purchase",     sub:"Today's Purchase Value",   value:totalPurchase,  change:"+8%",  changeLabel:"vs. yesterday",  icon:Package,      iconBg:"bg-blue-50",    iconColor:"text-blue-500",    sparkColor:"#3b82f6", bars:[40,50,42,60,55,72,65] },
    { id:"stock",     title:"Total Stock Items",  sub:"Medicines in Inventory",   value:totalStock,     change:"+4%",  changeLabel:"vs. last week",  icon:Boxes,        iconBg:"bg-orange-50",  iconColor:"text-orange-500",  sparkColor:"#f97316", bars:[55,60,52,65,58,70,68] },
    { id:"customers", title:"Total Customers",    sub:"Registered Customers",     value:totalCustomers, change:"+6%",  changeLabel:"vs. last month", icon:Users,        iconBg:"bg-purple-50",  iconColor:"text-purple-500",  sparkColor:"#8b5cf6", bars:[30,45,40,55,50,60,65] },
  ];

  const quickActions = [
    { label:"New Sale",     icon:ShoppingCart, to:"/admin/sales",     bg:"bg-emerald-50",  border:"border-emerald-200", text:"text-emerald-700", iconColor:"text-emerald-600" },
    { label:"New Purchase", icon:Package,      to:"/admin/purchases", bg:"bg-blue-50",     border:"border-blue-200",    text:"text-blue-700",    iconColor:"text-blue-500" },
    { label:"Add Medicine", icon:PlusCircle,   to:"/admin/inventory", bg:"bg-amber-50",    border:"border-amber-200",   text:"text-amber-700",   iconColor:"text-amber-500" },
    { label:"New Customer", icon:UserPlus,     to:"/admin/customers", bg:"bg-purple-50",   border:"border-purple-200",  text:"text-purple-700",  iconColor:"text-purple-500" },
    { label:"View Reports", icon:FileBarChart, to:"/admin/reports",   bg:"bg-slate-50",    border:"border-slate-200",   text:"text-slate-700",   iconColor:"text-slate-500" },
  ];

  return (
    <div className="space-y-5 pb-6">
      {/* 1. Welcome Banner */}
      <motion.div variants={containerVariants} initial="initial" animate="animate"
        className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <motion.div variants={itemVariants}>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
            Welcome Back, <span className="text-emerald-600">{adminName}!</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage your medical shop efficiently. Here's what's happening today.</p>
        </motion.div>
        <motion.div variants={itemVariants}
          className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-3 shadow-xs self-start lg:self-auto shrink-0">
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
      <motion.div variants={containerVariants} initial="initial" animate="animate"
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <motion.div key={card.id} variants={itemVariants}
              whileHover={{ y: -2, boxShadow: "0 8px 24px -6px rgba(0,0,0,0.10)" }}
              transition={{ duration: 0.18 }}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
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
      <motion.div variants={containerVariants} initial="initial" animate="animate"
        className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
                <span className="flex items-center gap-1"><span className="inline-block w-5 h-[2px] bg-emerald-500 rounded" /> Amount</span>
                <span className="flex items-center gap-1"><span className="inline-block w-4 border-t-2 border-dashed border-emerald-400" /> Orders</span>
              </div>
              <button className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 border border-slate-200 rounded-lg px-2.5 py-1 hover:border-emerald-300 transition-colors bg-white">
                <Calendar size={11} /> This Year <ChevronDown size={10} />
              </button>
            </div>
          </div>
          <SalesChart data={monthlyData} />
        </motion.div>

        {/* Donut Chart */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-bold text-slate-800">Order Status Distribution</h2>
            <button className="text-[11px] font-semibold text-emerald-600 hover:underline">View Details</button>
          </div>
          <DonutChart segments={categoryData} totalOrders={totalOrders} />
        </motion.div>
      </motion.div>

      {/* 4. Tables Row */}
      <motion.div variants={containerVariants} initial="initial" animate="animate"
        className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Selling */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="flex items-center justify-between px-5 pt-5 pb-1">
            <h2 className="text-[15px] font-bold text-slate-800 flex items-center gap-2">
              <Star size={14} className="text-amber-400 fill-amber-400" /> Top Selling Medicines
            </h2>
            <Link to="/admin/inventory" className="text-[11px] font-semibold text-emerald-600 hover:underline flex items-center gap-0.5">
              View All <ArrowUpRight size={11} />
            </Link>
          </div>
          <p className="text-[10px] text-slate-400 px-5 mb-3">Most sold medicines by units</p>
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[360px]">
              <thead>
                <tr className="bg-slate-50 border-y border-slate-100">
                  <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider py-2 pl-5 pr-2 w-8">#</th>
                  <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider py-2 px-2">Medicine Name</th>
                  <th className="text-right text-[10px] font-semibold text-slate-400 uppercase tracking-wider py-2 px-2">Units Sold</th>
                  <th className="text-right text-[10px] font-semibold text-slate-400 uppercase tracking-wider py-2 pl-2 pr-5">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {topSelling.map((med, i) => (
                  <motion.tr key={med.rank}
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.18, delay: i * 0.04 }}
                    className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 pl-5 pr-2">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-[10px] font-bold"
                        style={{ backgroundColor: med.color }}>{med.rank}</span>
                    </td>
                    <td className="py-2.5 px-2 text-[12.5px] font-medium text-slate-700">{med.name}</td>
                    <td className="py-2.5 px-2 text-right text-[12.5px] text-slate-600">{med.units}</td>
                    <td className="py-2.5 pl-2 pr-5 text-right text-[12.5px] font-semibold text-slate-800">Rs {med.revenue}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
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
                  <motion.tr key={med.rank}
                    initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.18, delay: i * 0.04 }}
                    className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 pl-5 pr-2">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-[10px] font-bold"
                        style={{ backgroundColor: med.color }}>{med.rank}</span>
                    </td>
                    <td className="py-2.5 px-2 text-[12.5px] font-medium text-slate-700">{med.name}</td>
                    <td className="py-2.5 px-2 text-center text-[12.5px] font-semibold text-slate-700">{med.stock}</td>
                    <td className="py-2.5 px-2 text-center text-[11.5px] text-slate-500">{med.expiry}</td>
                    <td className="py-2.5 pl-2 pr-5 text-center">
                      {med.type === "low"
                        ? <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-full px-2 py-0.5">Low Stock</span>
                        : <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">Expiring Soon</span>}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>

      {/* 5. Quick Actions */}
      <motion.div variants={itemVariants} initial="initial" animate="animate"
        className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
        <h2 className="text-[14px] font-bold text-slate-800 flex items-center gap-2 mb-4">
          <Zap size={14} className="text-amber-500 fill-amber-500" /> Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <motion.button key={action.label} {...buttonMotion}
                onClick={() => navigate(action.to)}
                className={`flex flex-col items-center justify-center gap-2 py-4 rounded-xl border ${action.bg} ${action.border} ${action.text} font-semibold text-[12px] cursor-pointer hover:brightness-95 transition-all w-full`}>
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
