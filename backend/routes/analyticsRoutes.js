import express from "express";
import auth from "../middlewares/auth.js";
import requireRole from "../middlewares/requireRole.js";
import * as analyticsController from "../controllers/analyticsController.js";

const router = express.Router();

// Get overall admin analytics
router.get("/", auth.protect, requireRole("admin"), analyticsController.getAnalytics);

// Get monthly chart data
router.get("/chart/monthly", auth.protect, requireRole("admin"), analyticsController.getMonthlyChartData);

// Get stats for a specific interviewer
router.get("/interviewer/:interviewerId", auth.protect, analyticsController.getInterviewerStats);

export default router;
