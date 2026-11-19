/* eslint-disable no-unused-vars */
import React from "react";
import { Search, ChevronRight, Send, Sparkles, ShieldCheck } from "lucide-react";
import { quickLinks } from "./chatbotData";
import AnimatedBotMascot from "./AnimatedBotMascot";

const HomeTab = ({
  userName = "Pandi",
  onSelectAction,
  onNavigateToTab,
  onOpenArticle,
  onClose,
}) => {
  return (
    <div className="flex flex-col h-full overflow-y-auto bg-gradient-to-b from-emerald-700 via-teal-800 to-emerald-950 text-white font-sans">
      {/* Top Header Section */}
      <div className="pt-5 px-5 pb-4 relative">
        {/* Subtle Decorative Background Glows */}
        <div className="absolute top-0 right-10 w-44 h-44 bg-teal-400/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute top-10 left-4 w-32 h-32 bg-emerald-400/10 rounded-full blur-xl pointer-events-none" />

        {/* Top Brand & Avatars Row */}
        <div className="flex items-center justify-between mb-5 relative z-10">
          {/* Brand Logo & Name (Matches MediCare RX Website) */}
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-400 flex items-center justify-center shadow-md shadow-emerald-900/30">
              <svg className="w-5 h-5 text-white fill-white" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
            <div className="leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg text-white tracking-tight">
                  Medi<span className="text-emerald-300">Care</span>
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 uppercase tracking-wider">
                  RX
                </span>
              </div>
              <p className="text-[10px] text-emerald-200/80 font-medium">
                24/7 AI Pharmacy Assistant
              </p>
            </div>
          </div>

          {/* Right Action: Avatars + Close */}
          <div className="flex items-center gap-2.5">
            {/* Team Avatars with Bot Mascot */}
            <div className="flex items-center -space-x-2">
              {/* Animated Mini Bot Mascot */}
              <div className="w-8 h-8 rounded-full bg-emerald-900/80 border-2 border-emerald-300 flex items-center justify-center shadow-md overflow-hidden z-20">
                <AnimatedBotMascot size="sm" showStatus={false} />
              </div>

              {/* Doctor Avatar */}
              <div className="w-7 h-7 rounded-full border-2 border-emerald-400/80 bg-teal-600 flex items-center justify-center shadow-sm text-[11px] font-bold text-white z-10">
                Dr
              </div>

              {/* Pharmacist Avatar */}
              <div className="w-7 h-7 rounded-full border-2 border-emerald-400/80 bg-cyan-600 flex items-center justify-center shadow-sm text-[10px] font-bold text-white">
                Rx
              </div>
            </div>

            {/* Close (x) Button */}
            <button
              onClick={onClose}
              className="text-emerald-100 hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/15 cursor-pointer ml-1"
              aria-label="Close"
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        {/* Greetings Section */}
        <div className="space-y-0.5 mb-4 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-[11px] font-medium text-emerald-200 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Dr. MediBot is Online</span>
          </div>
          <h2 className="text-[23px] font-bold tracking-tight text-white leading-tight">
            Hello {userName || "Pandi"}!
          </h2>
          <h3 className="text-[20px] font-semibold tracking-tight text-emerald-100/90 leading-tight">
            How can we help your health?
          </h3>
        </div>

        {/* Featured Card with Animated Bot Mascot */}
        <div
          onClick={() => onNavigateToTab("messages")}
          className="bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-xl shadow-emerald-950/20 text-slate-800 cursor-pointer hover:bg-white hover:scale-[1.01] hover:shadow-2xl transition-all duration-200 border border-emerald-100 group flex items-center justify-between relative z-10"
        >
          <div className="flex items-center gap-3">
            {/* Animated Bot Mascot Preview */}
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-100 to-teal-50 flex items-center justify-center border border-emerald-200 shrink-0">
              <AnimatedBotMascot size="sm" showStatus={false} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="font-bold text-[13.5px] text-slate-900 group-hover:text-emerald-700 transition-colors">
                  Chat with Dr. MediBot
                </p>
                <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              </div>
              <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                Instant medicine, prescription & order answers
              </p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/30 group-hover:scale-110 transition-transform shrink-0">
            <Send className="w-3.5 h-3.5 ml-0.5" />
          </div>
        </div>
      </div>

      {/* Lower White Card Section (Website Theme Matching) */}
      <div className="flex-1 bg-white rounded-t-3xl pt-5 px-5 pb-6 text-slate-800 shadow-2xl border-t border-slate-100">
        {/* Search for help bar */}
        <div
          onClick={() => onNavigateToTab("help")}
          className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 flex items-center justify-between cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/30 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all shadow-xs mb-4"
        >
          <span className="text-sm font-medium text-slate-600">
            Search medicines, orders, help...
          </span>
          <Search className="w-5 h-5 text-emerald-600" />
        </div>

        {/* Quick Links List */}
        <div className="space-y-1 divide-y divide-slate-100">
          {quickLinks.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.action === "chat") {
                  onSelectAction(item.prompt);
                } else if (item.articleId) {
                  onOpenArticle(item.articleId);
                }
              }}
              className="w-full py-3.5 px-2 flex items-center justify-between text-left hover:bg-emerald-50/70 rounded-xl transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 group-hover:scale-125 transition-transform shrink-0"></span>
                <span className="text-sm font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors pr-2">
                  {item.title}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-1 transition-transform shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeTab;
