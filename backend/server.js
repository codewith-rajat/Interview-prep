import http from "http";
import { Server } from "socket.io";
import app from "./app.js";

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// 🔥 SOCKET LOGIC
// Track active users in each room
const activeRooms = new Map(); // roomId => Set of socketIds

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // join room
  socket.on("join-room", ({ roomId, userId, userName }) => {
    socket.join(roomId);
    console.log(`User ${userId} (${socket.id}) joined room: ${roomId}`);
    
    // Track user in room
    if (!activeRooms.has(roomId)) {
      activeRooms.set(roomId, new Map());
    }
    activeRooms.get(roomId).set(socket.id, { userId, userName, muted: false, videoOn: true });
    
    // Notify others that someone joined
    socket.to(roomId).emit("user-joined", { socketId: socket.id, userId, userName });
    
    // Send current room state to new user
    const roomUsers = Array.from(activeRooms.get(roomId).entries()).map(([sId, data]) => ({
      socketId: sId,
      userId: data.userId,
      userName: data.userName,
      muted: data.muted,
      videoOn: data.videoOn
    }));
    socket.emit("room-users", roomUsers);
  });

  // WebRTC Signaling
  socket.on("offer", ({ roomId, offer, to }) => {
    io.to(to).emit("offer", { offer, from: socket.id });
  });

  socket.on("answer", ({ roomId, answer, to }) => {
    io.to(to).emit("answer", { answer, from: socket.id });
  });

  socket.on("ice-candidate", ({ roomId, candidate, to }) => {
    io.to(to).emit("ice-candidate", { candidate, from: socket.id });
  });

  // Chat messages
  socket.on("chat", ({ roomId, message, user }) => {
    console.log(`[${roomId}] ${user.name}: ${message}`);
    io.to(roomId).emit("chat", { 
      message, 
      user: { id: user.id, name: user.name }, 
      timestamp: new Date(),
      from: socket.id 
    });
  });

  // Control events (mute, video, record, screen share)
  socket.on("mute", ({ roomId, muted }) => {
    const roomUsers = activeRooms.get(roomId);
    if (roomUsers && roomUsers.has(socket.id)) {
      roomUsers.get(socket.id).muted = muted;
    }
    io.to(roomId).emit("user-mute", { socketId: socket.id, muted });
  });

  socket.on("video", ({ roomId, videoOn }) => {
    const roomUsers = activeRooms.get(roomId);
    if (roomUsers && roomUsers.has(socket.id)) {
      roomUsers.get(socket.id).videoOn = videoOn;
    }
    io.to(roomId).emit("user-video", { socketId: socket.id, videoOn });
  });

  socket.on("start-recording", ({ roomId }) => {
    io.to(roomId).emit("recording-started", { from: socket.id, timestamp: new Date() });
  });

  socket.on("stop-recording", ({ roomId }) => {
    io.to(roomId).emit("recording-stopped", { from: socket.id, timestamp: new Date() });
  });

  socket.on("start-screen-share", ({ roomId }) => {
    io.to(roomId).emit("screen-share-started", { from: socket.id });
  });

  socket.on("stop-screen-share", ({ roomId }) => {
    io.to(roomId).emit("screen-share-stopped", { from: socket.id });
  });

  socket.on("screen-share-signal", ({ roomId, signal, to }) => {
    io.to(to).emit("screen-share-signal", { signal, from: socket.id });
  });

  // User leaves room
  socket.on("leave-room", ({ roomId }) => {
    socket.leave(roomId);
    const roomUsers = activeRooms.get(roomId);
    if (roomUsers) {
      roomUsers.delete(socket.id);
      io.to(roomId).emit("user-left", { socketId: socket.id });
      if (roomUsers.size === 0) {
        activeRooms.delete(roomId);
      }
    }
    console.log(`User ${socket.id} left room: ${roomId}`);
  });

  socket.on("disconnect", () => {
    // Clean up user from all rooms
    for (const [roomId, roomUsers] of activeRooms.entries()) {
      if (roomUsers.has(socket.id)) {
        roomUsers.delete(socket.id);
        io.to(roomId).emit("user-left", { socketId: socket.id });
        if (roomUsers.size === 0) {
          activeRooms.delete(roomId);
        }
      }
    }
    console.log("User disconnected:", socket.id);
  });
});

// ❌ app.listen hata diya
// ✅ server.listen use karna hai
server.listen(5001, () => {
  console.log("Server running on port 5001");
});