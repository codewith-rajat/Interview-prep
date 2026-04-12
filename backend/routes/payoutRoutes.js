import express from "express";
import auth from "../middlewares/auth.js";
import requireRole from "../middlewares/requireRole.js";
import {
  requestWithdrawal,
  getAllPayouts,
  approvePayout,
  rejectPayout,
  getWithdrawalHistory,
} from "../controllers/payoutController.js";

const router = express.Router();

// INTERVIEWER: Request withdrawal
router.post("/", auth.protect, requireRole("interviewer"), requestWithdrawal);

// INTERVIEWER: Get withdrawal history
router.get("/history", auth.protect, requireRole("interviewer"), getWithdrawalHistory);

// ADMIN: Get all payouts
router.get("/admin/all", auth.protect, requireRole("admin"), getAllPayouts);

// ADMIN: Approve payout
router.patch("/admin/:id/approve", auth.protect, requireRole("admin"), approvePayout);

// ADMIN: Reject payout
router.patch("/admin/:id/reject", auth.protect, requireRole("admin"), rejectPayout);

export default router;
