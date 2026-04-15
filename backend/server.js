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
  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    console.log(`🔗 User (${socket.id}) joined room: ${roomId}`);
    
    // Track user in room
    if (!activeRooms.has(roomId)) {
      activeRooms.set(roomId, new Map());
    }
    activeRooms.get(roomId).set(socket.id, { socketId: socket.id, muted: false, videoOn: true });
    
    // Get count of users in room
    const usersInRoom = activeRooms.get(roomId).size;
    console.log(`📊 Room ${roomId} now has ${usersInRoom} user(s)`);
    
    // Notify others that someone joined
    socket.to(roomId).emit("user-joined", { socketId: socket.id });
    
    // Send current room state to new user
    const roomUsers = Array.from(activeRooms.get(roomId).entries()).map(([sId, data]) => ({
      socketId: sId,
      muted: data.muted,
      videoOn: data.videoOn
    }));
    socket.emit("room-users", roomUsers);
  });

  // WebRTC Signaling
  socket.on("offer", ({ roomId, offer }) => {
    console.log(`🎬 OFFER: ${socket.id} → room ${roomId}`);
    socket.to(roomId).emit("offer", offer);
  });

  socket.on("answer", ({ roomId, answer }) => {
    console.log(`📞 ANSWER: ${socket.id} → room ${roomId}`);
    socket.to(roomId).emit("answer", answer);
  });

  socket.on("ice-candidate", ({ roomId, candidate }) => {
    console.log(`❄️ ICE: ${socket.id} → room ${roomId}`);
    socket.to(roomId).emit("ice-candidate", candidate);
  });

  // 💬 Chat messages - Enhanced to work with frontend format
  socket.on("chat-message", ({ roomId, message }) => {
    console.log(`[${roomId}] Chat from ${socket.id}: ${message.content}`);
    // Broadcast message to all users in room with socketId for identification
    io.to(roomId).emit("chat-message", { 
      senderId: message.senderId,
      senderName: message.senderName,
      content: message.content, 
      timestamp: message.timestamp,
      socketId: socket.id  // 🔑 Use socketId for identifying sender
    });
  });

  // Legacy chat format support
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

  // 📺 Screen Share - Enhanced to work with frontend format
  socket.on("screen-share-start", ({ roomId }) => {
    console.log(`📺 Screen share STARTED by ${socket.id} in room ${roomId}`);
    io.to(roomId).emit("screen-share-started", { from: socket.id });
  });

  socket.on("screen-share-stop", ({ roomId }) => {
    console.log(`📺 Screen share STOPPED by ${socket.id} in room ${roomId}`);
    io.to(roomId).emit("screen-share-stopped", { from: socket.id });
  });

  // Legacy screen share events (keep for compatibility)
  socket.on("start-screen-share", ({ roomId }) => {
    console.log(`📺 Legacy: Screen share STARTED by ${socket.id} in room ${roomId}`);
    io.to(roomId).emit("screen-share-started", { from: socket.id });
  });

  socket.on("stop-screen-share", ({ roomId }) => {
    console.log(`📺 Legacy: Screen share STOPPED by ${socket.id} in room ${roomId}`);
    io.to(roomId).emit("screen-share-stopped", { from: socket.id });
  });

  socket.on("screen-share-signal", ({ roomId, signal, to }) => {
    io.to(to).emit("screen-share-signal", { signal, from: socket.id });
  });

  // User leaves room
  socket.on("leave-room", (roomId) => {
    socket.leave(roomId);
    const roomUsers = activeRooms.get(roomId);
    if (roomUsers) {
      roomUsers.delete(socket.id);
      io.to(roomId).emit("user-left", { socketId: socket.id });
      if (roomUsers.size === 0) {
        activeRooms.delete(roomId);
      }
    }
    console.log(`🚪 User ${socket.id} left room: ${roomId}`);
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
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});

// ❌ app.listen hata diya
// ✅ server.listen use karna hai
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});