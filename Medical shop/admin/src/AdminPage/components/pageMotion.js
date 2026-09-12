// Framer Motion animation variants – fast, non-blocking, content-first

// Page-level: very quick fade + tiny upward slide. NO stagger/beforeChildren delay.
export const pageVariants = {
  initial: { opacity: 0, y: 6 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.18,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    y: -4,
    transition: { duration: 0.12, ease: "easeIn" },
  },
};

// Container that staggers children – fast stagger (20ms gap)
export const containerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0,
    },
  },
};

// Individual card / section item – snappy fade-up
export const itemVariants = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: "easeOut" },
  },
  exit: { opacity: 0, y: -6, transition: { duration: 0.12 } },
};

// Card hover lift – subtle, no layout shift
export const cardHoverVariants = {
  rest: { y: 0 },
  hover: {
    y: -2,
    transition: { duration: 0.15, ease: "easeOut" },
  },
};

// Spread on motion.button – tight spring
export const buttonMotion = {
  whileHover: { scale: 1.025 },
  whileTap: { scale: 0.965 },
  transition: { type: "spring", stiffness: 500, damping: 30 },
};

// For small icon buttons
export const iconButtonMotion = {
  whileHover: { scale: 1.12 },
  whileTap: { scale: 0.88 },
  transition: { type: "spring", stiffness: 600, damping: 25 },
};

// Modal pop-in
export const modalVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 400, damping: 28 },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 8,
    transition: { duration: 0.15 },
  },
};

// Table rows – stagger index-based but very fast
export const tableRowVariants = {
  initial: { opacity: 0, y: 5 },
  animate: (custom = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.16,
      delay: Math.min(custom * 0.02, 0.25),
      ease: "easeOut",
    },
  }),
  exit: { opacity: 0, transition: { duration: 0.1 } },
};

// Backward-compat alias used by LowStockPage / AdminOffersPage
export const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.12 } },
};

