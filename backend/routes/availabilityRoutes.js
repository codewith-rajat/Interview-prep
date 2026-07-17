import express from "express";
import { setAvailability, getAvailabilities, getAvailableSlots } from "../controllers/availabilityController.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

router.post("/", auth.protect, setAvailability);
router.get("/", auth.protect, getAvailabilities);
router.get("/slots", getAvailableSlots); 

export default router;