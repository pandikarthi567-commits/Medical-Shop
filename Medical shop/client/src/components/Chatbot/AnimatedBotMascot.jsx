/* eslint-disable no-unused-vars */
import React from "react";
import { motion } from "framer-motion";

const AnimatedBotMascot = ({ size = "md", isHovered = false, showStatus = true }) => {
  // Dimensions based on size prop
  const dimensions = {
    sm: { width: 40, height: 40, scale: 0.7 },
    md: { width: 56, height: 56, scale: 1 },
    lg: { width: 88, height: 88, scale: 1.5 },
    xl: { width: 110, height: 110, scale: 1.8 },
  }[size] || { width: 56, height: 56, scale: 1 };

  return (
    <motion.div
      className="relative flex items-center justify-center select-none"
      style={{ width: dimensions.width, height: dimensions.height }}
      animate={{ y: [0, -3.5, 0] }}
      transition={{
        repeat: Infinity,
        duration: 3,
        ease: "easeInOut",
      }}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-md"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Soft Background Radial Aura */}
        <circle cx="50" cy="50" r="46" fill="url(#botAuraGradient)" opacity="0.4" />

        {/* Antenna Stem */}
        <line
          x1="50"
          y1="18"
          x2="50"
          y2="28"
          stroke="#059669"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Antenna Bulb / Signal Light */}
        <motion.circle
          cx="50"
          cy="14"
          r="6"
          fill="#10b981"
          stroke="#ffffff"
          strokeWidth="2"
          animate={{
            scale: [1, 1.25, 1],
            fill: ["#10b981", "#34d399", "#10b981"],
          }}
          transition={{
            repeat: Infinity,
            duration: 1.8,
            ease: "easeInOut",
          }}
        />

        {/* Head / Body Container */}
        <rect
          x="20"
          y="26"
          width="60"
          height="52"
          rx="22"
          fill="url(#botHeadGradient)"
          stroke="#047857"
          strokeWidth="2"
        />

        {/* Head Inner Screen / Visor */}
        <rect
          x="27"
          y="35"
          width="46"
          height="28"
          rx="12"
          fill="#064e3b"
          stroke="#022c22"
          strokeWidth="1.5"
        />

        {/* Visor Glare/Gloss Accent */}
        <path
          d="M30 38C35 37 55 37 68 40"
          stroke="#34d399"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.6"
        />

        {/* Left Eye (Animated Blink & Look) */}
        <motion.ellipse
          cx="41"
          cy="48"
          rx="4.5"
          ry="5.5"
          fill="#10b981"
          animate={{
            scaleY: [1, 1, 0.1, 1, 1],
            scaleX: [1, 1, 1.2, 1, 1],
          }}
          transition={{
            repeat: Infinity,
            repeatDelay: 3.2,
            duration: 0.25,
          }}
        />
        {/* Left Eye Pupil Sparkle */}
        <circle cx="42.5" cy="46.5" r="1.5" fill="#ffffff" />

        {/* Right Eye (Animated Blink & Look) */}
        <motion.ellipse
          cx="59"
          cy="48"
          rx="4.5"
          ry="5.5"
          fill="#10b981"
          animate={{
            scaleY: [1, 1, 0.1, 1, 1],
            scaleX: [1, 1, 1.2, 1, 1],
          }}
          transition={{
            repeat: Infinity,
            repeatDelay: 3.2,
            duration: 0.25,
          }}
        />
        {/* Right Eye Pupil Sparkle */}
        <circle cx="60.5" cy="46.5" r="1.5" fill="#ffffff" />

        {/* Cute Smiling Mouth */}
        <motion.path
          d="M46 54C48 57 52 57 54 54"
          stroke="#34d399"
          strokeWidth="2"
          strokeLinecap="round"
          animate={
            isHovered
              ? { d: "M44 53C47 59 53 59 56 53" }
              : { d: "M46 54C48 57 52 57 54 54" }
          }
          transition={{ duration: 0.2 }}
        />

        {/* Cute Rosy Cheeks */}
        <circle cx="33" cy="51" r="2.5" fill="#f43f5e" opacity="0.45" />
        <circle cx="67" cy="51" r="2.5" fill="#f43f5e" opacity="0.45" />

        {/* Medical Cross Badge on Bottom/Chest */}
        <circle cx="50" cy="70" r="6" fill="#059669" />
        <path
          d="M50 67V73M47 70H53"
          stroke="#ffffff"
          strokeWidth="1.8"
          strokeLinecap="round"
        />

        {/* Left Ear / Headphone Cup */}
        <rect
          x="15"
          y="42"
          width="5.5"
          height="16"
          rx="2.7"
          fill="#059669"
          stroke="#047857"
          strokeWidth="1"
        />

        {/* Right Ear / Headphone Cup */}
        <rect
          x="79.5"
          y="42"
          width="5.5"
          height="16"
          rx="2.7"
          fill="#059669"
          stroke="#047857"
          strokeWidth="1"
        />

        {/* Cute Waving Right Arm */}
        <motion.g
          animate={{
            rotate: [0, 16, -6, 16, 0],
          }}
          transition={{
            repeat: Infinity,
            repeatDelay: 4.5,
            duration: 1.4,
            ease: "easeInOut",
          }}
          style={{ originX: "78px", originY: "65px" }}
        >
          <path
            d="M78 64C84 63 90 58 92 52"
            stroke="#059669"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <circle cx="92" cy="51" r="3.5" fill="#10b981" />
        </motion.g>

        {/* Left Arm Resting */}
        <path
          d="M22 64C17 68 15 74 18 78"
          stroke="#059669"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <circle cx="18" cy="78" r="3" fill="#10b981" />

        {/* Gradients */}
        <defs>
          <linearGradient id="botHeadGradient" x1="20" y1="26" x2="80" y2="78" gradientUnits="userSpaceOnUse">
            <stop stopColor="#ffffff" />
            <stop offset="0.6" stopColor="#f0fdf4" />
            <stop offset="1" stopColor="#dcfce7" />
          </linearGradient>

          <radialGradient id="botAuraGradient" cx="50" cy="50" r="46" gradientUnits="userSpaceOnUse">
            <stop stopColor="#34d399" />
            <stop offset="1" stopColor="#10b981" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>

      {/* Online Status Dot */}
      {showStatus && (
        <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white shadow-xs"></span>
        </span>
      )}
    </motion.div>
  );
};

export default AnimatedBotMascot;
