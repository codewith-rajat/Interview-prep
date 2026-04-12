import express from "express";
import auth from "../middlewares/auth.js";
import requireRole from "../middlewares/requireRole.js";
import * as interviewController from "../controllers/interviewController.js";

const router = express.Router();

/* ===================================
   ADMIN ROUTES
=================================== */

// Create session
router.post("/create",auth.protect,requireRole("interviewee"),interviewController.createInterview);

// Delete session
router.delete("/:id",auth.protect,requireRole("admin"),interviewController.deleteInterview);

/* ===================================
   ADMIN + INTERVIEWER
=================================== */
router.get("/all",auth.protect,requireRole("admin", "interviewer"),interviewController.getAllInterviews);

/* ===================================
   INTERVIEWEE + INTERVIEWER ROUTES
=================================== */
router.get("/my",auth.protect,requireRole("interviewee", "interviewer"),interviewController.getMyInterviews);

/* ===================================
   EITHER ROLE CAN CANCEL (Authorization handled in controller)
=================================== */
// Accept / Reject / Cancel (Interviewee can also cancel)
router.patch("/:id/respond",auth.protect,interviewController.respondToInterview);

// Complete + Feedback
router.patch("/:id/complete",auth.protect,requireRole("interviewer"),interviewController.completeInterview);

export default router;