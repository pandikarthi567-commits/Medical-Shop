import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "https://medical-shop-eaju.onrender.com";

export const adminSocket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true,
  transports: ["websocket", "polling"],
});

export const connectAdminSocket = (token) => {
  if (token) {
    adminSocket.auth = { token };
  }
  if (!adminSocket.connected) {
    adminSocket.connect();
  }
  return adminSocket;
};

export default adminSocket;
