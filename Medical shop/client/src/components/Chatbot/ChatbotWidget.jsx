/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HomeTab from "./HomeTab";
import MessagesTab from "./MessagesTab";
import HelpTab from "./HelpTab";

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("home"); // "home" | "messages" | "help"
  const [inConversation, setInConversation] = useState(false);
  const [messages, setMessages] = useState([]);
  const [selectedArticleId, setSelectedArticleId] = useState(null);

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
  const handleSelectAction = (promptText) => {
    setActiveTab("messages");
    setInConversation(true);

    if (messages.length === 0) {
      const welcomeMsg = {
        id: "msg-welcome",
        sender: "bot",
        text: `Hello ${userName}! 👋 How can we help you today with your order or questions?`,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages([welcomeMsg]);
    }

    // Append user query
    setTimeout(() => {
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

      // Bot answer
      setTimeout(() => {
        let replyText =
          "Thanks for reaching out! Our team has received your request and will assist you right away. You can also track your orders live or check prescription guidelines in Help.";
        if (promptText.toLowerCase().includes("track")) {
          replyText =
            "📦 You can track your medicine orders under **Profile > My Orders** or check the **Track Order** page. If an order has been dispatched, you can view the live rider location in real-time!";
        } else if (promptText.toLowerCase().includes("prescription")) {
          replyText =
            "📄 To upload a prescription, go to the **Prescription** section. Our registered pharmacists verify valid doctor prescriptions within 15 minutes and prepare your medicine order.";
        }

        const botReply = {
          id: "bot-" + Date.now(),
          sender: "bot",
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setMessages((prev) => [...prev, botReply]);
      }, 800);
    }, 150);
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
            initial={{ opacity: 0, y: 30, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 25, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed z-50 bottom-20 sm:bottom-6 right-3 sm:right-6 w-[94vw] max-w-[390px] h-[610px] max-h-[86vh] bg-white rounded-[28px] shadow-2xl border border-gray-200/80 flex flex-col overflow-hidden font-sans select-none"
            style={{
              boxShadow:
                "0 20px 40px -10px rgba(0, 30, 43, 0.28), 0 0 2px 1px rgba(0, 0, 0, 0.05)",
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

            {/* 3. Bottom Navigation Bar (Matches Screenshots 1, 2, and 3) */}
            <div className="h-[68px] bg-white border-t border-gray-150 px-6 flex items-center justify-around shrink-0">
              {/* Home Tab */}
              <button
                onClick={() => {
                  setActiveTab("home");
                  setSelectedArticleId(null);
                }}
                className="flex flex-col items-center justify-center gap-1 group py-1 cursor-pointer"
              >
                {activeTab === "home" ? (
                  // Active Home Icon: Filled Green with Smile
                  <div className="text-[#00684a]">
                    <svg
                      className="w-6 h-6"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2.5L2 11.5h3.2V21a1 1 0 0 0 1 1h11.6a1 1 0 0 0 1-1v-9.5H22L12 2.5zm0 14.5c-2.4 0-4.2-1.3-4.2-2.8h8.4c0 1.5-1.8 2.8-4.2 2.8z" />
                    </svg>
                  </div>
                ) : (
                  // Inactive Home Icon: Outlined with Smile
                  <div className="text-gray-500 group-hover:text-gray-800 transition-colors">
                    <svg
                      className="w-6 h-6"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M3 11L12 3.5L21 11V20a1.5 1.5 0 0 1-1.5 1.5H4.5A1.5 1.5 0 0 1 3 20V11z" />
                      <path
                        d="M8.5 14.5c.8 1.4 2 2 3.5 2s2.7-.6 3.5-2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                )}
                <span
                  className={`text-[12px] font-medium transition-colors ${
                    activeTab === "home"
                      ? "text-[#00684a] font-semibold"
                      : "text-gray-500 group-hover:text-gray-800"
                  }`}
                >
                  Home
                </span>
              </button>

              {/* Messages Tab */}
              <button
                onClick={() => {
                  setActiveTab("messages");
                  setSelectedArticleId(null);
                }}
                className="flex flex-col items-center justify-center gap-1 group py-1 relative cursor-pointer"
              >
                {activeTab === "messages" ? (
                  // Active Messages Icon: Filled Green
                  <div className="text-[#00684a]">
                    <svg
                      className="w-6 h-6"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M4 3h16a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H7.2L3 21.5V5a2 2 0 0 1 2-2zm3 6v2h10V9H7zm0 4v2h6v-2H7z" />
                    </svg>
                  </div>
                ) : (
                  // Inactive Messages Icon: Outlined
                  <div className="text-gray-500 group-hover:text-gray-800 transition-colors">
                    <svg
                      className="w-6 h-6"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      <line x1="8" y1="9" x2="16" y2="9" />
                      <line x1="8" y1="13" x2="12" y2="13" />
                    </svg>
                  </div>
                )}
                <span
                  className={`text-[12px] font-medium transition-colors ${
                    activeTab === "messages"
                      ? "text-[#00684a] font-semibold"
                      : "text-gray-500 group-hover:text-gray-800"
                  }`}
                >
                  Messages
                </span>
              </button>

              {/* Help Tab */}
              <button
                onClick={() => {
                  setActiveTab("help");
                }}
                className="flex flex-col items-center justify-center gap-1 group py-1 cursor-pointer"
              >
                {activeTab === "help" ? (
                  // Active Help Icon: Solid Green Circle with White ?
                  <div className="w-6 h-6 rounded-full bg-[#00684a] flex items-center justify-center text-white">
                    <span className="text-[13px] font-bold leading-none">
                      ?
                    </span>
                  </div>
                ) : (
                  // Inactive Help Icon: Outlined Circle
                  <div className="text-gray-500 group-hover:text-gray-800 transition-colors">
                    <svg
                      className="w-6 h-6"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                      <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="2.5" />
                    </svg>
                  </div>
                )}
                <span
                  className={`text-[12px] font-medium transition-colors ${
                    activeTab === "help"
                      ? "text-[#00684a] font-semibold"
                      : "text-gray-500 group-hover:text-gray-800"
                  }`}
                >
                  Help
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Floating Circular Launcher Trigger Button */}
      <div className="fixed z-50 bottom-20 sm:bottom-6 right-4 sm:right-6">
        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl cursor-pointer transition-all duration-200 ${
            isOpen
              ? "bg-[#001e2b] text-white border-2 border-white/20"
              : "bg-gradient-to-tr from-[#001e2b] to-[#005a3c] text-[#00ED64] border-2 border-[#00ED64]/40"
          }`}
          style={{
            boxShadow:
              "0 10px 25px -5px rgba(0, 30, 43, 0.4), 0 8px 10px -6px rgba(0, 237, 100, 0.2)",
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
            <div className="relative flex items-center justify-center">
              {/* Chat bubble icon */}
              <svg
                className="w-7 h-7 text-[#00ED64]"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2C6.477 2 2 6.141 2 11.25c0 2.87 1.433 5.437 3.684 7.086L4.5 22l4.135-1.772C9.775 20.407 10.865 20.5 12 20.5c5.523 0 10-4.141 10-9.25S17.523 2 12 2zm-3 10.25a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5zm4 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5zm4 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5z" />
              </svg>

              {/* Online Green Indicator Dot */}
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-[#001e2b]"></span>
              </span>
            </div>
          )}
        </motion.button>
      </div>
    </>
  );
};

export default ChatbotWidget;
