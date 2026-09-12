// socket/index.js
export const initSocket = (server) => {
  const io = new (await import("socket.io")).Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true
    }
  });

  io.on("connection", (socket) => {
    socket.on("join:order", ({ orderId }) => {
      socket.join(`order:${orderId}`);
    });

    socket.on("join:admin", () => {
      socket.join("admin:orders");
    });

    socket.on("disconnect", () => {});
  });

  return io;
};

export const emitOrderStatus = (io, order) => {
  io.to(`order:${order._id}`).emit("order:status-updated", {
    orderId: order._id,
    status: order.status,
    statusHistory: order.statusHistory,
    updatedAt: new Date()
  });

  io.to("admin:orders").emit("admin:order-updated", {
    orderId: order._id,
    status: order.status,
    updatedAt: new Date()
  });
};

export const emitOrderLocation = (io, order) => {
  io.to(`order:${order._id}`).emit("order:location-updated", {
    orderId: order._id,
    liveLocation: order.liveLocation,
    etaMinutes: order.etaMinutes
  });
};

export const emitOrderAssignment = (io, order) => {
  io.to(`order:${order._id}`).emit("order:assigned-rider", {
    orderId: order._id,
    riderId: order.riderId
  });
};