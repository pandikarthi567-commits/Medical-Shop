/* eslint-disable no-unused-vars */
import React, { useState, useMemo } from "react";
import { Search, ChevronRight, ArrowLeft, MessageSquare, BookOpen } from "lucide-react";
import { helpCollections } from "./chatbotData";

const HelpTab = ({
  onClose,
  selectedArticleId,
  onSelectAction,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeArticle, setActiveArticle] = useState(() => {
    if (!selectedArticleId) return null;
    for (const col of helpCollections) {
      const art = col.articles.find((a) => a.id === selectedArticleId);
      if (art) return { ...art, collectionTitle: col.title };
    }
    return null;
  });

  // Filter collections and articles based on search query
  const filteredCollections = useMemo(() => {
    if (!searchQuery.trim()) return helpCollections;
    const q = searchQuery.toLowerCase();
    return helpCollections
      .map((col) => {
        const matchingArticles = col.articles.filter(
          (a) =>
            a.title.toLowerCase().includes(q) ||
            a.summary.toLowerCase().includes(q) ||
            a.content.toLowerCase().includes(q)
        );
        const colMatches =
          col.title.toLowerCase().includes(q) ||
          (col.subtitle && col.subtitle.toLowerCase().includes(q));

        if (colMatches || matchingArticles.length > 0) {
          return {
            ...col,
            matchingArticles: matchingArticles.length > 0 ? matchingArticles : col.articles,
          };
        }
        return null;
      })
      .filter(Boolean);
  }, [searchQuery]);

  const handleSelectArticle = (art, colTitle) => {
    setActiveArticle({ ...art, collectionTitle: colTitle });
  };

  return (
    <div className="flex flex-col h-full bg-white text-slate-800 font-sans">
      {/* 1. Header with Website Emerald Gradient */}
      <div className="px-5 py-4 bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white flex items-center justify-between shadow-sm">
        {activeArticle ? (
          <button
            onClick={() => setActiveArticle(null)}
            className="p-1 -ml-1 text-emerald-100 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : (
          <div className="w-6"></div>
        )}

        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-emerald-200" />
          <h2 className="text-[17px] font-bold text-white text-center">
            Help Center
          </h2>
        </div>

        <button
          onClick={onClose}
          className="text-emerald-100 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      {/* 2. Content */}
      {activeArticle ? (
        // Detailed Article View
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md uppercase tracking-wider">
            {activeArticle.collectionTitle}
          </span>
          <h3 className="text-xl font-extrabold text-slate-900 leading-snug">
            {activeArticle.title}
          </h3>
          <p className="text-sm text-slate-500 font-medium">
            {activeArticle.summary}
          </p>
          <div className="border-t border-slate-100 pt-3">
            <p className="text-sm text-slate-700 leading-relaxed">
              {activeArticle.content}
            </p>
          </div>

          <div className="pt-6 border-t border-slate-100">
            <p className="text-xs text-slate-500 mb-2 font-medium">
              Need personalized medical or order help?
            </p>
            <button
              onClick={() =>
                onSelectAction(`I have a question about: ${activeArticle.title}`)
              }
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-3.5 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Ask Dr. MediBot about this</span>
            </button>
          </div>
        </div>
      ) : (
        // Collections List
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Search bar */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 flex items-center justify-between shadow-2xs focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/15 focus-within:bg-white transition-all">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search help articles & FAQs..."
              className="w-full bg-transparent border-none outline-none text-sm text-slate-800 placeholder-slate-400 pr-2"
            />
            <Search className="w-5 h-5 text-emerald-600 shrink-0" />
          </div>

          {/* Subheading */}
          <div className="pt-1">
            <h4 className="text-[16px] font-bold text-slate-900">
              {filteredCollections.length} Help Collections
            </h4>
          </div>

          {/* Collections List */}
          <div className="space-y-1 divide-y divide-slate-100">
            {filteredCollections.map((col) => (
              <div
                key={col.id}
                onClick={() => handleSelectArticle(col.articles[0], col.title)}
                className="py-3.5 px-2 flex items-center justify-between cursor-pointer hover:bg-emerald-50/70 rounded-xl transition-all group"
              >
                <div className="space-y-0.5 pr-3">
                  <h5 className="text-[14.5px] font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {col.title}
                  </h5>
                  {col.subtitle && (
                    <p className="text-xs text-slate-600 font-normal">
                      {col.subtitle}
                    </p>
                  )}
                  <span className="inline-block text-[11px] font-semibold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded">
                    {col.articlesCount} articles
                  </span>
                </div>

                <ChevronRight className="w-5 h-5 text-emerald-600 group-hover:translate-x-1 transition-transform shrink-0" />
              </div>
            ))}

            {filteredCollections.length === 0 && (
              <div className="py-12 text-center text-slate-400">
                <p className="text-sm">No articles match your query.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpTab;
