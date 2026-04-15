import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import interviewRoutes from "./routes/interviewRoutes.js";
import discoveryRoutes from "./routes/discoveryRoutes.js";
import availabilityRoutes from "./routes/availabilityRoutes.js";
import meetingRoutes from "./routes/meetingRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import payoutRoutes from "./routes/payoutRoutes.js";

import startExpireJob from "./utils/expirePendingInterviews.js";

dotenv.config();

const app = express();

// 🌍 Allowed Origins
export const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://interview-prep-pi-azure.vercel.app"
];

// ✅ CORS (safe for REST + Socket.IO handshake)
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(null, true); // IMPORTANT: don't block Socket.IO
    },
    credentials: true,
  })
);

// Middleware
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/discovery", discoveryRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/meeting", meetingRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/payouts", payoutRoutes);

// MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    startExpireJob();
  })
  .catch((err) => console.log(err));

export default app;