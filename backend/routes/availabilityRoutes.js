import express from "express";
import auth from "../middlewares/auth.js";
import * as availabilityController from "../controllers/availabilityController.js";
import requireRole from "../middlewares/requireRole.js";

const router = express.Router();

// Recurring availability
router.post("/", auth.protect, requireRole("interviewer"), availabilityController.setAvailability);

// Custom availability (specific dates)
router.post("/custom", auth.protect, requireRole("interviewer"), availabilityController.setCustomAvailability);

// Get all availabilities for logged-in interviewer
router.get("/my-availabilities", auth.protect, requireRole("interviewer"), availabilityController.getAvailabilities);

// Get available slots for a specific date
router.get("/slots", auth.protect, availabilityController.getAvailableSlots);

// Delete availability
router.delete("/:availabilityId", auth.protect, requireRole("interviewer"), availabilityController.deleteAvailability);

export default router;