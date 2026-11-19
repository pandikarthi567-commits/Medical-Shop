/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect } from "react";
import { ArrowLeft, Send, Sparkles } from "lucide-react";
import { askUniversalChatbot } from "./chatbotService";
import AnimatedBotMascot from "./AnimatedBotMascot";

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
        text: `Hello ${userName}! 👋 I'm Dr. MediBot, your AI Pharmacy & Healthcare assistant.\n\nConnected to Universal Chatbot AI Engine. Ask me about medicine stock, prices, prescriptions, order tracking, or dosage advice.`,
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

  const sendMessage = async (textToSend) => {
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

    try {
      // Send question to Universal Chatbot API with provided API Key & Bearer Token
      const result = await askUniversalChatbot(text);

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
    } catch (err) {
      console.error("[Chatbot Error]", err);
      const fallbackReply = {
        id: "bot-" + Date.now(),
        sender: "bot",
        text: "Thank you for reaching out! Our medical team and licensed pharmacists are reviewing your inquiry. Please check back shortly or browse the Help Center.",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, fallbackReply]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/70 text-slate-800 font-sans">
      {/* 1. Header with Website Emerald Gradient */}
      {!inConversation ? (
        // Header when browsing Messages view
        <div className="px-5 py-4 bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white flex items-center justify-between shadow-sm">
          <div className="w-6"></div>
          <h2 className="text-[17px] font-bold text-white text-center flex-1">
            Messages
          </h2>
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
      ) : (
        // Header when in Active Chat
        <div className="px-4 py-3 bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setInConversation(false)}
              className="p-1.5 -ml-1 text-emerald-100 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-9 h-9 rounded-full bg-emerald-950/60 border border-emerald-300 flex items-center justify-center overflow-hidden shrink-0">
              <AnimatedBotMascot size="sm" showStatus={false} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-bold text-white leading-tight">
                  Dr. MediBot
                </p>
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
              </div>
              <p className="text-[11px] text-emerald-100/90 font-medium">
                Universal AI Engine • Connected
              </p>
            </div>
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
      )}

      {/* 2. Body View */}
      {!inConversation ? (
        // Empty State: Featuring the Animated Bot Mascot
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center select-none bg-white">
          {/* Animated Mascot Presentation */}
          <div className="mb-4 relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-100 via-teal-50 to-white flex items-center justify-center border-2 border-emerald-200/80 shadow-lg shadow-emerald-500/10">
              <AnimatedBotMascot size="lg" showStatus={true} />
            </div>
          </div>

          {/* Heading */}
          <h3 className="text-[20px] font-bold text-slate-900 tracking-tight mb-1.5">
            No messages yet
          </h3>

          {/* Subtext */}
          <p className="text-sm text-slate-500 max-w-[280px] mb-7 leading-relaxed">
            Dr. MediBot is connected to the Universal Chatbot AI Engine to answer your questions in English, Tamil, and Tanglish.
          </p>

          {/* Website Theme Emerald Button */}
          <button
            onClick={() => handleStartQuestion()}
            className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-700 hover:to-teal-700 active:scale-98 text-white px-7 py-3.5 rounded-full font-bold text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-600/30 hover:shadow-xl transition-all duration-150 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-emerald-200" />
            <span>Ask a question</span>
            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-white ml-0.5">
              <span className="text-[12px] font-bold leading-none">?</span>
            </div>
          </button>
        </div>
      ) : (
        // Active Chat Messages Area
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/50">
          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            {messages.map((msg) => {
              const isUser = msg.sender === "user";
              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 ${
                    isUser ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  {!isUser && (
                    <div className="w-7 h-7 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center overflow-hidden shrink-0 mb-1">
                      <AnimatedBotMascot size="sm" showStatus={false} />
                    </div>
                  )}

                  <div
                    className={`flex flex-col ${
                      isUser ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`max-w-[84%] px-4 py-2.5 rounded-2xl text-[13.5px] leading-relaxed ${
                        isUser
                          ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-br-xs shadow-md shadow-emerald-700/15"
                          : "bg-white text-slate-800 border border-emerald-100 rounded-bl-xs shadow-xs"
                      }`}
                    >
                      <p className="whitespace-pre-line">{msg.text}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 px-1">
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center overflow-hidden shrink-0">
                  <AnimatedBotMascot size="sm" showStatus={false} />
                </div>
                <div className="flex items-center gap-1.5 bg-white border border-emerald-150 rounded-2xl px-3.5 py-2.5 w-fit shadow-xs">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce"></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggestion Chips */}
          <div className="px-4 py-2 bg-white/80 backdrop-blur-xs border-t border-slate-100 flex gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => sendMessage("Dolo 650 irukka?")}
              className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/70 px-3 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer font-medium"
            >
              💊 Dolo 650 irukka?
            </button>
            <button
              onClick={() => sendMessage("Track my medicine order status")}
              className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/70 px-3 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer font-medium"
            >
              📦 Track Order
            </button>
            <button
              onClick={() => sendMessage("How do I upload a doctor prescription?")}
              className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/70 px-3 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer font-medium"
            >
              📄 Upload Prescription
            </button>
            <button
              onClick={() => sendMessage("What are the available fever medicines?")}
              className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/70 px-3 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer font-medium"
            >
              🩺 Fever Medicines
            </button>
          </div>

          {/* Bottom Chat Input Bar */}
          <div className="p-3 bg-white border-t border-slate-200">
            <div className="flex items-center gap-2 bg-slate-50 rounded-2xl px-3.5 py-1.5 border border-slate-200 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/15 focus-within:bg-white transition-all">
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Dr. MediBot in English / Tanglish..."
                className="flex-1 bg-transparent border-none outline-none text-sm text-slate-800 placeholder-slate-400 py-1"
              />
              <button
                type="button"
                onClick={() => sendMessage()}
                disabled={!inputVal.trim()}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  inputVal.trim()
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 cursor-pointer shadow-md shadow-emerald-600/30"
                    : "text-slate-300 cursor-not-allowed"
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
