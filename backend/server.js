import http from "http";
import { Server } from "socket.io";
import app, { allowedOrigins } from "./app.js";

const server = http.createServer(app);

// 🔥 IMPORTANT: Render stability fix
server.keepAliveTimeout = 120000;
server.headersTimeout = 120000;

// ✅ Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

// 🔥 ACTIVE ROOMS
const activeRooms = new Map();

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join room
  socket.on("join-room", (roomId) => {
    socket.join(roomId);

    if (!activeRooms.has(roomId)) {
      activeRooms.set(roomId, new Map());
    }

    activeRooms.get(roomId).set(socket.id, {
      socketId: socket.id,
      muted: false,
      videoOn: true,
    });

    socket.to(roomId).emit("user-joined", { socketId: socket.id });

    const roomUsers = Array.from(activeRooms.get(roomId).entries()).map(
      ([id, data]) => ({
        socketId: id,
        muted: data.muted,
        videoOn: data.videoOn,
      })
    );

    socket.emit("room-users", roomUsers);
  });

  // WebRTC
  socket.on("offer", ({ roomId, offer }) => {
    socket.to(roomId).emit("offer", offer);
  });

  socket.on("answer", ({ roomId, answer }) => {
    socket.to(roomId).emit("answer", answer);
  });

  socket.on("ice-candidate", ({ roomId, candidate }) => {
    socket.to(roomId).emit("ice-candidate", candidate);
  });

  // Chat
  socket.on("chat-message", ({ roomId, message }) => {
    io.to(roomId).emit("chat-message", {
      ...message,
      socketId: socket.id,
    });
  });

  // Controls
  socket.on("mute", ({ roomId, muted }) => {
    const room = activeRooms.get(roomId);
    if (room?.has(socket.id)) {
      room.get(socket.id).muted = muted;
    }
    io.to(roomId).emit("user-mute", { socketId: socket.id, muted });
  });

  socket.on("video", ({ roomId, videoOn }) => {
    const room = activeRooms.get(roomId);
    if (room?.has(socket.id)) {
      room.get(socket.id).videoOn = videoOn;
    }
    io.to(roomId).emit("user-video", { socketId: socket.id, videoOn });
  });

  // Screen share
  socket.on("screen-share-start", ({ roomId }) => {
    io.to(roomId).emit("screen-share-started", { from: socket.id });
  });

  socket.on("screen-share-stop", ({ roomId }) => {
    io.to(roomId).emit("screen-share-stopped", { from: socket.id });
  });

  // Leave room
  socket.on("leave-room", (roomId) => {
    socket.leave(roomId);

    const room = activeRooms.get(roomId);
    if (room) {
      room.delete(socket.id);
      io.to(roomId).emit("user-left", { socketId: socket.id });

      if (room.size === 0) {
        activeRooms.delete(roomId);
      }
    }
  });

  // Disconnect cleanup
  socket.on("disconnect", () => {
    for (const [roomId, room] of activeRooms.entries()) {
      if (room.has(socket.id)) {
        room.delete(socket.id);
        io.to(roomId).emit("user-left", { socketId: socket.id });

        if (room.size === 0) {
          activeRooms.delete(roomId);
        }
      }
    }

    console.log("User disconnected:", socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});