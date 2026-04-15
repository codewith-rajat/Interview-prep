import { io } from "socket.io-client";

// ✅ Use environment variable for Socket.io server URL
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5001";
const socket = io(SOCKET_URL);

export default socket;