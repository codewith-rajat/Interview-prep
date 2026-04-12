import User from "../models/User.js";
import Payout from "../models/Payout.js";
import sendEmail from "../utils/sendEmail.js";

// ===== INTERVIEWER: REQUEST WITHDRAWAL =====
export const requestWithdrawal = async (req, res) => {
  try {
    const { credits, paymentMethod, paymentDetail } = req.body;
    const userId = req.user.id;

    // Validation
    if (!credits || credits <= 0) {
      return res.status(400).json({ message: "Invalid credit amount" });
    }
    if (!paymentMethod || !paymentDetail) {
      return res.status(400).json({ message: "Payment details required" });
    }

    const user = await User.findById(userId);
    if (user.role !== "interviewer") {
      return res.status(403).json({ message: "Only interviewers can withdraw" });
    }

    if (credits > user.creditBalance) {
      return res.status(400).json({ message: "Insufficient credit balance" });
    }

    // Calculate amounts
    const PLATFORM_FEE = 0.2; // 20%
    const platformFee = (credits * PLATFORM_FEE * 5).toFixed(2);
    const netAmount = (credits * (1 - PLATFORM_FEE) * 5).toFixed(2);

    // Create payout request
    const payout = new Payout({
      interviewer: userId,
      credits,
      platformFee,
      netAmount,
      paymentMethod,
      paymentDetail,
    });

    await payout.save();

    // Deduct credits from user
    user.creditBalance -= credits;
    await user.save();

    // Send admin notification email
    const adminEmail = process.env.ADMIN_EMAIL || "admin@interviewplatform.com";
    const reviewUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/admin/payouts/${payout._id}`;

    await sendEmail({
      to: adminEmail,
      subject: `Withdrawal Request — ${user.name} · ${credits} credits`,
      html: `
        <h2>New Withdrawal Request</h2>
        <p><strong>${user.name}</strong> (${user.email}) has requested a withdrawal.</p>
        
        <h3>Details:</h3>
        <ul>
          <li>Credits: ${credits}</li>
          <li>Platform Fee (20%): $${platformFee}</li>
          <li>Net Payout: $${netAmount}</li>
          <li>Method: ${paymentMethod}</li>
          <li>Details: ${paymentDetail}</li>
        </ul>
        
        <p><a href="${reviewUrl}">Review & Approve</a></p>
      `,
    });

    res.status(201).json({
      message: "Withdrawal request submitted successfully",
      payout,
    });
  } catch (error) {
    console.error("Withdrawal error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== ADMIN: GET ALL PAYOUTS =====
export const getAllPayouts = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = status ? { status } : {};
    const payouts = await Payout.find(filter)
      .populate("interviewer", "name email")
      .sort({ requestedAt: -1 });

    res.json(payouts);
  } catch (error) {
    console.error("Error fetching payouts:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ===== ADMIN: APPROVE PAYOUT =====
export const approvePayout = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;
    const { adminNotes } = req.body;

    const payout = await Payout.findById(id).populate("interviewer");
    if (!payout) {
      return res.status(404).json({ message: "Payout not found" });
    }

    payout.status = "APPROVED";
    payout.approvedBy = adminId;
    payout.approvedAt = new Date();
    payout.adminNotes = adminNotes || "";

    await payout.save();

    // Send confirmation email to interviewer
    await sendEmail({
      to: payout.interviewer.email,
      subject: "Withdrawal Approved ✓",
      html: `
        <h2>Your withdrawal has been approved!</h2>
        <p>We'll process your payout of <strong>$${payout.netAmount}</strong> within 1-3 business days.</p>
        
        <h3>Details:</h3>
        <ul>
          <li>Credits: ${payout.credits}</li>
          <li>Net Payout: $${payout.netAmount}</li>
          <li>Method: ${payout.paymentMethod}</li>
        </ul>
        
        <p>Thank you for teaching on our platform!</p>
      `,
    });

    res.json({ message: "Payout approved", payout });
  } catch (error) {
    console.error("Error approving payout:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ===== ADMIN: REJECT PAYOUT =====
export const rejectPayout = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const payout = await Payout.findById(id).populate("interviewer");
    if (!payout) {
      return res.status(404).json({ message: "Payout not found" });
    }

    payout.status = "REJECTED";
    payout.adminNotes = reason || "";
    await payout.save();

    // Refund credits to user
    const user = await User.findById(payout.interviewer._id);
    user.creditBalance += payout.credits;
    await user.save();

    // Send rejection email
    await sendEmail({
      to: payout.interviewer.email,
      subject: "Withdrawal Request Update",
      html: `
        <h2>Your withdrawal request has been rejected</h2>
        <p>Reason: ${reason || "No reason provided"}</p>
        <p>Credits have been refunded to your account.</p>
      `,
    });

    res.json({ message: "Payout rejected", payout });
  } catch (error) {
    console.error("Error rejecting payout:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ===== INTERVIEWER: GET WITHDRAWAL HISTORY =====
export const getWithdrawalHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const payouts = await Payout.find({ interviewer: userId }).sort({
      requestedAt: -1,
    });

    res.json(payouts);
  } catch (error) {
    console.error("Error fetching history:", error);
    res.status(500).json({ message: "Server error" });
  }
};
