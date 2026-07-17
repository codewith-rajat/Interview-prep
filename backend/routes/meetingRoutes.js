import express from "express";
import auth from "../middlewares/auth.js";
import requireRole from "../middlewares/requireRole.js";
import * as meetingController from "../controllers/meetingController.js";

const router = express.Router();
router.get("/room/:roomId", auth.protect, meetingController.getMeetingDetails);
router.get("/:interviewId", auth.protect, meetingController.getInterviewWithFeedback);
router.post("/:interviewId/feedback", auth.protect, requireRole("interviewer"), meetingController.submitFeedback);

export default router;
