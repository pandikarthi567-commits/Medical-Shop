/* eslint-disable no-unused-vars */
import React from "react";
import { Search, ChevronRight, Send } from "lucide-react";
import { quickLinks } from "./chatbotData";

const HomeTab = ({
  userName = "Pandi",
  onSelectAction,
  onNavigateToTab,
  onOpenArticle,
  onClose,
}) => {
  return (
    <div className="flex flex-col h-full overflow-y-auto bg-gradient-to-b from-[#001e2b] via-[#022c2a] to-[#043d39] text-white">
      {/* Top Header Section */}
      <div className="pt-5 px-6 pb-4">
        {/* Top Brand & Avatars Row */}
        <div className="flex items-center justify-between mb-8">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-2">
            {/* Iconic Leaf / Health Logo */}
            <svg
              className="w-5 h-7 text-[#00ED64]"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2C12 2 11.2 5.5 9 8.8C6.8 12.1 6 14.8 6 17.5C6 20.2 8.7 22.5 12 22.5C15.3 22.5 18 20.2 18 17.5C18 14.8 17.2 12.1 15 8.8C12.8 5.5 12 2 12 2Z" />
              <path
                d="M12 2.5V22C11.6 22 10.8 19.5 10.8 16.5C10.8 13.5 11.8 10 12 7"
                stroke="#001E2B"
                strokeWidth="0.8"
              />
            </svg>
            <span className="font-semibold text-xl tracking-tight text-white font-sans">
              MongoDB<span className="text-[#00ED64]">.</span>
            </span>
          </div>

          {/* Right Action: Avatars + "M" badge + Close */}
          <div className="flex items-center gap-3">
            {/* Overlapping Avatars */}
            <div className="flex items-center -space-x-2">
              {/* Avatar 1: Blue head & shoulders */}
              <div className="w-8 h-8 rounded-full border-2 border-[#38bdf8] bg-[#0284c7] flex items-center justify-center shadow-md">
                <svg
                  className="w-4 h-4 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                >
                  <circle cx="12" cy="7" r="4" />
                  <path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
                </svg>
              </div>

              {/* Avatar 2: Glasses person */}
              <div className="w-8 h-8 rounded-full border-2 border-[#38bdf8] bg-[#0284c7] flex items-center justify-center shadow-md">
                <svg
                  className="w-4 h-4 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="9" cy="8" r="2.5" />
                  <circle cx="15" cy="8" r="2.5" />
                  <path d="M11.5 8h1" />
                  <path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
                </svg>
              </div>

              {/* Avatar 3: Black circle with "M" */}
              <div className="w-8 h-8 rounded-full bg-black border border-gray-700 flex items-center justify-center font-bold text-sm text-white shadow-md">
                M
              </div>
            </div>

            {/* Close (x) Button */}
            <button
              onClick={onClose}
              className="text-gray-300 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10 cursor-pointer"
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

        {/* Greetings */}
        <div className="space-y-1 mb-6">
          <h2 className="text-[26px] font-bold tracking-tight text-white leading-tight">
            Hello {userName || "Pandi"}!
          </h2>
          <h2 className="text-[26px] font-bold tracking-tight text-white leading-tight">
            How can we help?
          </h2>
        </div>

        {/* White Welcome / Hero Card */}
        <div
          onClick={() => onNavigateToTab("messages")}
          className="bg-white rounded-2xl p-4 shadow-lg text-gray-900 cursor-pointer hover:shadow-xl transition-all duration-200 border border-emerald-500/10 group flex items-center justify-between"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <p className="font-semibold text-sm text-gray-800">
                Send us a message
              </p>
            </div>
            <p className="text-xs text-gray-500">
              We typically reply in under 2 minutes
            </p>
          </div>
          <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center text-[#00684a] group-hover:bg-[#00684a] group-hover:text-white transition-colors">
            <Send className="w-4 h-4 ml-0.5" />
          </div>
        </div>
      </div>

      {/* Lower White Card Section */}
      <div className="flex-1 bg-white rounded-t-3xl pt-5 px-5 pb-6 text-gray-900 shadow-inner">
        {/* Search for help bar */}
        <div
          onClick={() => onNavigateToTab("help")}
          className="bg-[#f7f9fa] border border-gray-200/90 rounded-2xl px-4 py-3 flex items-center justify-between cursor-pointer hover:border-gray-300 transition-colors shadow-2xs mb-4"
        >
          <span className="text-sm font-medium text-gray-700">
            Search for help
          </span>
          <Search className="w-5 h-5 text-[#00684a]" />
        </div>

        {/* Quick Links List */}
        <div className="space-y-1 divide-y divide-gray-100">
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
              className="w-full py-3.5 px-2 flex items-center justify-between text-left hover:bg-gray-50/80 rounded-xl transition-colors group cursor-pointer"
            >
              <span className="text-sm font-medium text-gray-800 group-hover:text-[#00684a] transition-colors pr-3">
                {item.title}
              </span>
              <ChevronRight className="w-4 h-4 text-[#00684a] group-hover:translate-x-0.5 transition-transform shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeTab;
