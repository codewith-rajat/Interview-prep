import express from "express";
import { 
  createInterview, 
  getAllInterviews, 
  getUpcomingInterviews,
  respondToInterview,
  completeInterview,
  getPastInterviews
} from "../controllers/interviewController.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

router.post("/", auth.protect, createInterview);
router.get("/", auth.protect, getAllInterviews);
router.get("/upcoming", auth.protect, getUpcomingInterviews);
router.get("/past", auth.protect, getPastInterviews);
router.patch("/:id/respond", auth.protect, respondToInterview);
router.patch("/:id/complete", auth.protect, completeInterview);

export default router;