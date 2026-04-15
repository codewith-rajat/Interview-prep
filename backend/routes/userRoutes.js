import express from "express";
import auth from "../middlewares/auth.js";
import * as userController from "../controllers/userController.js";

const router = express.Router();

router.get("/me", auth.protect, userController.getMyProfile);
router.patch("/update-profile", auth.protect, userController.updateProfile);
router.patch("/session-duration", auth.protect, userController.updateSessionDuration);

export default router;