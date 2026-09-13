const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const setupSockets = (io) => {
  // Connected users map: userId -> socketId
  const connectedUsers = new Map();
  const connectedMechanics = new Map();

  io.on("connection", (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // ===== USER JOINS =====
    socket.on("join", ({ userId, role }) => {
      if (!userId) return;
      socket.userId = userId;
      socket.role = role;
      socket.join(`user:${userId}`);

      if (role === "MECHANIC") {
        connectedMechanics.set(userId, socket.id);
        socket.join("mechanics");
      } else {
        connectedUsers.set(userId, socket.id);
      }
      console.log(`✅ ${role} joined room user:${userId}`);
    });

    // ===== MECHANIC LOCATION UPDATE =====
    socket.on("mechanic:location", async ({ mechanicId, lat, lng, requestId }) => {
      try {
        if (!mechanicId || !lat || !lng) return;
        // Broadcast to customer tracking this breakdown
        if (requestId) {
          io.to(`tracking:${requestId}`).emit("mechanic:location:update", {
            mechanicId,
            lat,
            lng,
            timestamp: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.error("Socket location update error:", err.message);
      }
    });

    // ===== CUSTOMER JOINS TRACKING ROOM =====
    socket.on("tracking:join", ({ requestId }) => {
      if (!requestId) return;
      socket.join(`tracking:${requestId}`);
      console.log(`📍 User joined tracking room: tracking:${requestId}`);
    });

    // ===== MECHANIC ACCEPTS REQUEST =====
    socket.on("request:accepted", ({ requestId, mechanicId, customerId }) => {
      if (customerId) {
        io.to(`user:${customerId}`).emit("request:mechanic_assigned", {
          requestId,
          mechanicId,
          message: "A mechanic has accepted your request!",
        });
      }
    });

    // ===== REQUEST STATUS UPDATE =====
    socket.on("request:status", ({ requestId, status, customerId }) => {
      if (customerId) {
        io.to(`user:${customerId}`).emit("request:status_update", {
          requestId,
          status,
          timestamp: new Date().toISOString(),
        });
      }
    });

    // ===== CHAT =====
    socket.on("chat:message", ({ requestId, senderId, receiverId, message, senderName }) => {
      const chatData = {
        requestId,
        senderId,
        senderName,
        message,
        timestamp: new Date().toISOString(),
      };
      if (receiverId) io.to(`user:${receiverId}`).emit("chat:message", chatData);
      if (senderId) io.to(`user:${senderId}`).emit("chat:message", chatData);
    });

    // ===== DISCONNECT =====
    socket.on("disconnect", () => {
      if (socket.userId) {
        connectedUsers.delete(socket.userId);
        connectedMechanics.delete(socket.userId);
        console.log(`❌ Disconnected: ${socket.userId}`);
      }
    });
  });

  // Helper methods attached to io
  io.emitToUser = (userId, event, data) => {
    io.to(`user:${userId}`).emit(event, data);
  };

  io.emitToMechanics = (event, data) => {
    io.to("mechanics").emit(event, data);
  };
};

module.exports = setupSockets;
