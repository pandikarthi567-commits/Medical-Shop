// utils/generateOrderId.js
const generateOrderId = () => {
  const now = new Date();
  const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
    now.getDate()
  ).padStart(2, "0")}`;
  const randomPart = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `MED-${datePart}-${randomPart}`;
};

module.exports = { generateOrderId };