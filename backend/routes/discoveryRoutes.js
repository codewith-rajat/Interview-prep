import express from "express";
import auth from "../middlewares/auth.js";
import * as discoveryController from "../controllers/discoveryController.js";

const router = express.Router();

router.get("/interviewers", discoveryController.searchInterviewers);

router.get("/interviewers/:id", auth.protect, discoveryController.getInterviewerById);

export default router;