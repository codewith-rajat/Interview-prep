import express from "express";
import auth from "../middlewares/auth.js";
import * as discoveryController from "../controllers/discoveryController.js";

const router = express.Router();

// Public endpoint - browse interviewers without auth
router.get("/interviewers", discoveryController.searchInterviewers);

// Protected endpoint - get interviewer details (for booking)
router.get("/interviewers/:id", auth.protect, discoveryController.getInterviewerById);

export default router;