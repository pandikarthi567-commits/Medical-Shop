/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HomeTab from "./HomeTab";
import MessagesTab from "./MessagesTab";
import HelpTab from "./HelpTab";
import AnimatedBotMascot from "./AnimatedBotMascot";
import { askUniversalChatbot } from "./chatbotService";

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("home"); // "home" | "messages" | "help"
  const [inConversation, setInConversation] = useState(false);
  const [messages, setMessages] = useState([]);
  const [selectedArticleId, setSelectedArticleId] = useState(null);
  const [showTooltip, setShowTooltip] = useState(true);

  // Initialize user name with fallback to Pandi
  const [userName] = useState(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "null");
      return user?.name || user?.firstName || "Pandi";
    } catch {
      return "Pandi";
    }
  });

  // Handle quick action prompt from Home tab
  const handleSelectAction = async (promptText) => {
    setActiveTab("messages");
    setInConversation(true);

    if (messages.length === 0) {
      const welcomeMsg = {
        id: "msg-welcome",
        sender: "bot",
        text: `Hello ${userName}! 👋 I'm Dr. MediBot.\n\nConnected to Universal Chatbot AI Engine. How can I help you today?`,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages([welcomeMsg]);
    }

    const userMsg = {
      id: "usr-" + Date.now(),
      sender: "user",
      text: promptText,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const result = await askUniversalChatbot(promptText);
      const botReply = {
        id: "bot-" + Date.now(),
        sender: "bot",
        text: result.answer,
        source: result.source,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, botReply]);
    } catch {
      const botReply = {
        id: "bot-" + Date.now(),
        sender: "bot",
        text: "Thanks for reaching out! Our medical team and pharmacists are reviewing your inquiry. Please check the Help Center for immediate answers.",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, botReply]);
    }
  };

  // Handle opening an article from Home
  const handleOpenArticle = (articleId) => {
    setSelectedArticleId(articleId);
    setActiveTab("help");
  };

  return (
    <>
      {/* 1. Floating Chat Widget Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 35, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 25, scale: 0.94 }}
            transition={{ type: "spring", damping: 25, stiffness: 320 }}
            className="fixed z-[9999] bottom-20 sm:bottom-6 right-3 sm:right-6 w-[94vw] max-w-[395px] h-[615px] max-h-[86vh] bg-white rounded-[28px] shadow-2xl border border-emerald-200/70 flex flex-col overflow-hidden font-sans select-none"
            style={{
              boxShadow:
                "0 22px 50px -10px rgba(6, 78, 59, 0.28), 0 0 1px 1px rgba(16, 185, 129, 0.15)",
            }}
          >
            {/* Main Tab Content View */}
            <div className="flex-1 overflow-hidden relative">
              {activeTab === "home" && (
                <HomeTab
                  userName={userName}
                  onSelectAction={handleSelectAction}
                  onNavigateToTab={(tab) => {
                    setActiveTab(tab);
                    if (tab === "messages") setInConversation(false);
                  }}
                  onOpenArticle={handleOpenArticle}
                  onClose={() => setIsOpen(false)}
                />
              )}

              {activeTab === "messages" && (
                <MessagesTab
                  messages={messages}
                  setMessages={setMessages}
                  inConversation={inConversation}
                  setInConversation={setInConversation}
                  onClose={() => setIsOpen(false)}
                  userName={userName}
                />
              )}

              {activeTab === "help" && (
                <HelpTab
                  onClose={() => setIsOpen(false)}
                  selectedArticleId={selectedArticleId}
                  onSelectAction={handleSelectAction}
                />
              )}
            </div>

            {/* 3. Bottom Navigation Bar (Website Theme Matching) */}
            <div className="h-[66px] bg-white border-t border-slate-150 px-5 flex items-center justify-around shrink-0 shadow-xs">
              {/* Home Tab */}
              <button
                onClick={() => {
                  setActiveTab("home");
                  setSelectedArticleId(null);
                }}
                className={`flex flex-col items-center justify-center gap-1 py-1.5 px-3 rounded-xl transition-all cursor-pointer ${
                  activeTab === "home"
                    ? "text-emerald-700 font-bold bg-emerald-50/90 shadow-2xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <div className={activeTab === "home" ? "text-emerald-600" : "text-slate-400"}>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill={activeTab === "home" ? "currentColor" : "none"} stroke="currentColor" strokeWidth={activeTab === "home" ? "0" : "2"}>
                    <path d="M12 2.5L2 11.5h3.2V21a1 1 0 0 0 1 1h11.6a1 1 0 0 0 1-1v-9.5H22L12 2.5zm0 14.5c-2.4 0-4.2-1.3-4.2-2.8h8.4c0 1.5-1.8 2.8-4.2 2.8z" />
                  </svg>
                </div>
                <span className="text-[11.5px] leading-tight">Home</span>
              </button>

              {/* Messages Tab */}
              <button
                onClick={() => {
                  setActiveTab("messages");
                  setSelectedArticleId(null);
                }}
                className={`flex flex-col items-center justify-center gap-1 py-1.5 px-3 rounded-xl transition-all cursor-pointer ${
                  activeTab === "messages"
                    ? "text-emerald-700 font-bold bg-emerald-50/90 shadow-2xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <div className={activeTab === "messages" ? "text-emerald-600" : "text-slate-400"}>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill={activeTab === "messages" ? "currentColor" : "none"} stroke="currentColor" strokeWidth={activeTab === "messages" ? "0" : "2"}>
                    <path d="M4 3h16a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H7.2L3 21.5V5a2 2 0 0 1 2-2zm3 6v2h10V9H7zm0 4v2h6v-2H7z" />
                  </svg>
                </div>
                <span className="text-[11.5px] leading-tight">Messages</span>
              </button>

              {/* Help Tab */}
              <button
                onClick={() => {
                  setActiveTab("help");
                }}
                className={`flex flex-col items-center justify-center gap-1 py-1.5 px-3 rounded-xl transition-all cursor-pointer ${
                  activeTab === "help"
                    ? "text-emerald-700 font-bold bg-emerald-50/90 shadow-2xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <div className={activeTab === "help" ? "text-emerald-600" : "text-slate-400"}>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" fill={activeTab === "help" ? "#059669" : "none"} />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke={activeTab === "help" ? "#ffffff" : "currentColor"} />
                    <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="2.5" stroke={activeTab === "help" ? "#ffffff" : "currentColor"} />
                  </svg>
                </div>
                <span className="text-[11.5px] leading-tight">Help</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Floating Circular Launcher Trigger Button with Animated Bot Mascot */}
      <div className="fixed z-[9999] bottom-20 sm:bottom-6 right-4 sm:right-6 flex items-center gap-3">
        {/* Floating Speech Bubble Callout Tooltip */}
        <AnimatePresence>
          {!isOpen && showTooltip && (
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1, y: [0, -3, 0] }}
              exit={{ opacity: 0, x: 10, scale: 0.9 }}
              transition={{
                y: { repeat: Infinity, duration: 3, ease: "easeInOut" },
                opacity: { duration: 0.3 },
              }}
              onClick={() => {
                setIsOpen(true);
                setShowTooltip(false);
              }}
              className="hidden sm:flex items-center gap-2 bg-white text-slate-800 text-xs font-semibold px-3.5 py-2 rounded-2xl shadow-xl shadow-emerald-950/15 border border-emerald-200/80 cursor-pointer hover:border-emerald-400 group"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Need help? Chat with Dr. MediBot!</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTooltip(false);
                }}
                className="text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
                aria-label="Dismiss tooltip"
              >
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Animated Bot Launcher Button */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen) setShowTooltip(false);
          }}
          className={`relative rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 ${
            isOpen
              ? "w-13 h-13 bg-slate-900 text-white shadow-xl border-2 border-emerald-400"
              : "w-16 h-16 bg-gradient-to-tr from-emerald-700 via-teal-600 to-emerald-500 shadow-2xl border-2 border-white/90 p-1"
          }`}
          style={{
            boxShadow: isOpen
              ? "0 10px 25px -5px rgba(15, 23, 42, 0.4)"
              : "0 14px 35px -8px rgba(5, 150, 105, 0.45), 0 0 20px 2px rgba(16, 185, 129, 0.25)",
          }}
          aria-label="Toggle Support Chatbot"
        >
          {isOpen ? (
            <svg
              className="w-6 h-6 text-white"
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
          ) : (
            <div className="w-full h-full flex items-center justify-center relative">
              {/* Animated Robot / Medical Bot Mascot */}
              <AnimatedBotMascot size="md" showStatus={false} />

              {/* Pulsing Green Status Ring */}
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-80"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400 border-2 border-white"></span>
              </span>
            </div>
          )}
        </motion.button>
      </div>
    </>
  );
};

export default ChatbotWidget;
