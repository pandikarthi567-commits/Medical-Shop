// config/cashfree.js
const axios = require("axios");

const CASHFREE_BASE_URL =
  process.env.CASHFREE_ENV === "PRODUCTION"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";

const cashfreeClient = axios.create({
  baseURL: CASHFREE_BASE_URL,
  headers: {
    "x-client-id": process.env.CASHFREE_APP_ID,
    "x-client-secret": process.env.CASHFREE_SECRET_KEY,
    "x-api-version": "2025-01-01",
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

module.exports = { cashfreeClient };