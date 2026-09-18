import axios from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://medical-shop-eaju.onrender.com/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export { api as API };
export default api;