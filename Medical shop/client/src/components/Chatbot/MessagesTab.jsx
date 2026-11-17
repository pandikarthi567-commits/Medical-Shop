/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { cannedResponses } from "./chatbotData";

const MessagesTab = ({
  messages,
  setMessages,
  inConversation,
  setInConversation,
  onClose,
  userName = "Pandi",
}) => {
  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (inConversation) {
      scrollToBottom();
    }
  }, [messages, inConversation, isTyping]);

  const handleStartQuestion = (initialPrompt = "") => {
    setInConversation(true);
    if (messages.length === 0) {
      const welcomeMsg = {
        id: "msg-welcome",
        sender: "bot",
        text: `Hello ${userName}! 👋 How can we help you today? You can ask about medicine stock, order tracking, prescriptions, or payment.`,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages([welcomeMsg]);
    }

    if (initialPrompt) {
      setTimeout(() => {
        sendMessage(initialPrompt);
      }, 200);
    }
  };

  const sendMessage = (textToSend) => {
    const text = textToSend || inputVal.trim();
    if (!text) return;

    const userMsg = {
      id: "usr-" + Date.now(),
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal("");
    setIsTyping(true);

    // Simulate smart bot response
    setTimeout(() => {
      let replyText = cannedResponses.default;
      const lower = text.toLowerCase();

      if (lower.includes("order") || lower.includes("track") || lower.includes("delivery")) {
        replyText = cannedResponses.order;
      } else if (lower.includes("prescription") || lower.includes("doctor") || lower.includes("rx")) {
        replyText = cannedResponses.prescription;
      } else if (lower.includes("password") || lower.includes("login") || lower.includes("reset")) {
        replyText = cannedResponses.password;
      } else if (lower.includes("cluster") || lower.includes("mongo") || lower.includes("database")) {
        replyText = cannedResponses.cluster;
      } else if (lower.includes("refund") || lower.includes("cancel") || lower.includes("payment")) {
        replyText = cannedResponses.refund;
      } else if (lower.includes("doctor") || lower.includes("pharmacist") || lower.includes("consult")) {
        replyText = cannedResponses.doctor;
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
      setIsTyping(false);
    }, 900);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white text-gray-900">
      {/* 1. Header */}
      {!inConversation ? (
        // Header when browsing Messages view (Matches Screenshot 2)
        <div className="px-5 py-4 border-b border-gray-150 flex items-center justify-between relative">
          <div className="w-6"></div>
          <h2 className="text-[17px] font-semibold text-gray-900 text-center flex-1">
            Messages
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
      ) : (
        // Header when in Active Chat
        <div className="px-4 py-3 border-b border-gray-150 flex items-center justify-between bg-white shadow-2xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setInConversation(false)}
              className="p-1.5 -ml-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-[#001e2b] text-white flex items-center justify-center font-bold text-xs">
                M
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute -bottom-0.5 -right-0.5 border-2 border-white"></span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 leading-tight">
                Support Team
              </p>
              <p className="text-[11px] text-emerald-600 font-medium">
                Active now
              </p>
            </div>
          </div>
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
      )}

      {/* 2. Body View */}
      {!inConversation ? (
        // Empty State (Matches Screenshot 2 Exactly)
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center select-none">
          {/* Centered Message Icon */}
          <div className="mb-4">
            <svg
              className="w-12 h-12 text-[#001e2b]"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H7l-5 4V6c0-1.1.9-2 2-2z" />
            </svg>
          </div>

          {/* Heading */}
          <h3 className="text-[20px] font-bold text-gray-900 tracking-tight mb-2">
            No messages
          </h3>

          {/* Subtext */}
          <p className="text-sm text-gray-500 max-w-[260px] mb-8 leading-relaxed">
            Messages from the team will be shown here
          </p>

          {/* Green "Ask a question" Button */}
          <button
            onClick={() => handleStartQuestion()}
            className="bg-[#005a3c] hover:bg-[#004a31] active:scale-98 text-white px-6 py-3.5 rounded-full font-medium text-sm flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg transition-all duration-150 cursor-pointer"
          >
            <span>Ask a question</span>
            {/* White question circle badge */}
            <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[#005a3c]">
              <span className="text-[12px] font-bold leading-none">?</span>
            </div>
          </button>
        </div>
      ) : (
        // Active Chat Messages Area
        <div className="flex-1 flex flex-col overflow-hidden bg-[#fafbfc]">
          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            {messages.map((msg) => {
              const isUser = msg.sender === "user";
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    isUser ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[82%] px-4 py-2.5 rounded-2xl text-[13.5px] leading-relaxed ${
                      isUser
                        ? "bg-[#005a3c] text-white rounded-br-xs shadow-xs"
                        : "bg-white text-gray-800 border border-gray-150 rounded-bl-xs shadow-2xs"
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 px-1">
                    {msg.timestamp}
                  </span>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-1.5 bg-white border border-gray-150 rounded-2xl px-3.5 py-2.5 w-fit shadow-2xs">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggestion Chips */}
          <div className="px-4 py-2 bg-white/70 border-t border-gray-100 flex gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => sendMessage("Track my current order")}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer"
            >
              📦 Track Order
            </button>
            <button
              onClick={() => sendMessage("How do I upload a prescription?")}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer"
            >
              📄 Upload Prescription
            </button>
            <button
              onClick={() => sendMessage("Can I talk to a pharmacist?")}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer"
            >
              💊 Pharmacist Advice
            </button>
          </div>

          {/* Bottom Chat Input Bar */}
          <div className="p-3 bg-white border-t border-gray-150">
            <div className="flex items-center gap-2 bg-[#f4f6f8] rounded-2xl px-3 py-1.5 border border-gray-200 focus-within:border-[#00684a] focus-within:bg-white transition-colors">
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Write a message..."
                className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 placeholder-gray-400 py-1"
              />
              <button
                type="button"
                onClick={() => sendMessage()}
                disabled={!inputVal.trim()}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  inputVal.trim()
                    ? "bg-[#005a3c] text-white hover:bg-[#004a31] cursor-pointer"
                    : "text-gray-300 cursor-not-allowed"
                }`}
                aria-label="Send message"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesTab;
