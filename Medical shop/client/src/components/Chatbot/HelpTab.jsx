/* eslint-disable no-unused-vars */
import React, { useState, useMemo } from "react";
import { Search, ChevronRight, ArrowLeft, MessageSquare } from "lucide-react";
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
    <div className="flex flex-col h-full bg-white text-gray-900">
      {/* 1. Header (Matches Screenshot 3) */}
      <div className="px-5 py-4 border-b border-gray-150 flex items-center justify-between relative bg-white">
        {activeArticle ? (
          <button
            onClick={() => setActiveArticle(null)}
            className="p-1 -ml-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : (
          <div className="w-6"></div>
        )}

        <h2 className="text-[17px] font-semibold text-gray-900 text-center flex-1">
          Help
        </h2>

        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-700 p-1 rounded-full transition-colors cursor-pointer"
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
          <span className="text-xs font-semibold text-[#00684a] uppercase tracking-wider">
            {activeArticle.collectionTitle}
          </span>
          <h3 className="text-xl font-bold text-gray-900 leading-snug">
            {activeArticle.title}
          </h3>
          <p className="text-sm text-gray-500 font-medium">
            {activeArticle.summary}
          </p>
          <div className="border-t border-gray-150 pt-3">
            <p className="text-sm text-gray-700 leading-relaxed">
              {activeArticle.content}
            </p>
          </div>

          <div className="pt-6 border-t border-gray-150">
            <p className="text-xs text-gray-500 mb-2">Still need assistance?</p>
            <button
              onClick={() =>
                onSelectAction(`I have a question about: ${activeArticle.title}`)
              }
              className="w-full bg-[#005a3c] hover:bg-[#004a31] text-white py-3 px-4 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Ask our team about this</span>
            </button>
          </div>
        </div>
      ) : (
        // Collections List (Matches Screenshot 3 Exactly)
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Search bar */}
          <div className="bg-[#f4f6f8] border border-gray-200/90 rounded-2xl px-4 py-3 flex items-center justify-between shadow-2xs focus-within:border-gray-300 focus-within:bg-white transition-all">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for help"
              className="w-full bg-transparent border-none outline-none text-sm text-gray-800 placeholder-gray-500 pr-2"
            />
            <Search className="w-5 h-5 text-[#00684a] shrink-0" />
          </div>

          {/* Subheading (e.g. "12 collections") */}
          <div className="pt-2">
            <h4 className="text-[17px] font-bold text-gray-900">
              {filteredCollections.length} collections
            </h4>
          </div>

          {/* Collections List */}
          <div className="space-y-1 divide-y divide-gray-100">
            {filteredCollections.map((col) => (
              <div
                key={col.id}
                onClick={() => handleSelectArticle(col.articles[0], col.title)}
                className="py-4 px-1 flex items-center justify-between cursor-pointer hover:bg-gray-50/90 rounded-xl transition-colors group"
              >
                <div className="space-y-1 pr-3">
                  <h5 className="text-[15px] font-semibold text-gray-900 group-hover:text-[#00684a] transition-colors">
                    {col.title}
                  </h5>
                  {col.subtitle && (
                    <p className="text-sm text-gray-700 font-normal">
                      {col.subtitle}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    {col.articlesCount} articles
                  </p>
                </div>

                <ChevronRight className="w-5 h-5 text-[#00684a] group-hover:translate-x-0.5 transition-transform shrink-0" />
              </div>
            ))}

            {filteredCollections.length === 0 && (
              <div className="py-12 text-center text-gray-400">
                <p className="text-sm">No help articles match your search.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpTab;
