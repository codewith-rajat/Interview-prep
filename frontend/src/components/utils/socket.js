import { io } from "socket.io-client";

// IMPORTANT: must match backend (Render HTTPS URL)
const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  "https://interview-prep-axy6.onrender.com";

const socket = io(SOCKET_URL, {
  transports: ["websocket", "polling"],
  withCredentials: true,
});

export default socket;