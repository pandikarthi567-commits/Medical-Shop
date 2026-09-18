const SERVER_URL = (
  import.meta.env.VITE_API_URL || "https://medical-shop-eaju.onrender.com/api"
).replace(/\/api\/?$/, "");

export const formatImageUrl = (imagePath, fallback = "") => {
  if (!imagePath || typeof imagePath !== "string") return fallback;
  const trimmed = imagePath.trim();
  if (!trimmed) return fallback;

  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:")
  ) {
    return trimmed;
  }

  if (trimmed.startsWith("/uploads/")) {
    return `${SERVER_URL}${trimmed}`;
  }

  if (trimmed.startsWith("uploads/")) {
    return `${SERVER_URL}/${trimmed}`;
  }

  return trimmed;
};

export const getImageUrl = formatImageUrl;

export default formatImageUrl;
