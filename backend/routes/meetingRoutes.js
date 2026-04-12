import express from "express";
import auth from "../middlewares/auth.js";
import requireRole from "../middlewares/requireRole.js";
import * as meetingController from "../controllers/meetingController.js";

const router = express.Router();

// Get meeting room details (both participants can access)
router.get("/room/:roomId", auth.protect, meetingController.getMeetingDetails);

// Get interview details with feedback
router.get("/:interviewId", auth.protect, meetingController.getInterviewWithFeedback);

// Submit feedback (interviewer only)
router.post("/:interviewId/feedback", auth.protect, requireRole("interviewer"), meetingController.submitFeedback);

export default router;
