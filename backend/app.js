import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import interviewRoutes from "./routes/interviewRoutes.js";
import discoveryRoutes from "./routes/discoveryRoutes.js";
import startExpireJob from "./utils/expirePendingInterviews.js";
import availabilityRoutes from "./routes/availabilityRoutes.js";
import meetingRoutes from "./routes/meetingRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import payoutRoutes from "./routes/payoutRoutes.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/discovery", discoveryRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/meeting", meetingRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/payouts", payoutRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    startExpireJob();
  })
  .catch(err => console.log(err));
export default app;
