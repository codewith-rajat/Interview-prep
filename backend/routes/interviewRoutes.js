import express from "express";
import { 
  createInterview, 
  getAllInterviews, 
  getUpcomingInterviews,
  respondToInterview,
  completeInterview,
  getPastInterviews,
  debugInterview,
  generateAiQuestions,
  updateFeedbackNotes
} from "../controllers/interviewController.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

router.post("/", auth.protect, createInterview);
router.get("/", auth.protect, getAllInterviews);
router.get("/upcoming", auth.protect, getUpcomingInterviews);
router.get("/past", auth.protect, getPastInterviews);
router.get("/debug/check", auth.protect, debugInterview);
router.patch("/:id/respond", auth.protect, respondToInterview);
router.patch("/:id/complete", auth.protect, completeInterview);
router.get("/:id/ai-questions", auth.protect, generateAiQuestions);
router.patch("/:id/feedback-notes", auth.protect, updateFeedbackNotes);

export default router;