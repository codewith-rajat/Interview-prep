import InterviewSession from "../models/InterviewSessions.js";
import Availability from "../models/Availability.js";
import BookedSlots from "../models/BookedSlots.js";
import User from "../models/User.js";
import { v4 as uuidv4 } from "uuid";
import notificationService from "../services/notificationService.js";

// ✅ BOOK INTERVIEW
export const createInterview = async (req, res) => {
  try {
    const { interviewerId, scheduledAt, duration } = req.body;

    // ✅ auth check
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // ✅ required fields check
    if (!interviewerId || !scheduledAt || !duration) {
      return res.status(400).json({ message: "All fields required" });
    }

    const interviewTime = new Date(scheduledAt);

    // ❌ invalid date
    if (isNaN(interviewTime)) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    // ❌ past booking
    if (interviewTime < new Date()) {
      return res.status(400).json({ message: "Cannot book past time" });
    }

    // ❌ double booking check - compare by hour and minute
    const startOfSlot = new Date(interviewTime);
    startOfSlot.setSeconds(0, 0);
    
    const endOfSlot = new Date(startOfSlot);
    endOfSlot.setMinutes(endOfSlot.getMinutes() + duration);

    console.log(`🔍 Checking for existing interview: ${startOfSlot} to ${endOfSlot}`);

    const existing = await InterviewSession.findOne({
      interviewer: interviewerId,
      scheduledAt: { $gte: startOfSlot, $lt: endOfSlot },
      status: { $in: ["pending", "accepted", "scheduled"] } // Only check active interviews, NOT cancelled
    });

    if (existing) {
      console.log(`❌ Double booking detected! Existing interview:`, existing);
      return res.status(400).json({ message: "Slot already booked" });
    }

    console.log(`✅ No conflict found, proceeding with booking`);

    // ✅ create interview with roomId and scheduled status
    const interview = await InterviewSession.create({
      interviewer: interviewerId,
      interviewee: req.user.id,
      scheduledAt: interviewTime,
      duration,
      status: "scheduled",
      roomId: uuidv4()
    });

    // ✅ Create a BookedSlots record for this specific date/time
    const slotTime = `${String(interviewTime.getHours()).padStart(2, "0")}:${String(interviewTime.getMinutes()).padStart(2, "0")}`;
    const slotEndTime = new Date(interviewTime);
    slotEndTime.setMinutes(slotEndTime.getMinutes() + duration);
    const slotEndTimeStr = `${String(slotEndTime.getHours()).padStart(2, "0")}:${String(slotEndTime.getMinutes()).padStart(2, "0")}`;
    
    // Create date object at start of day for consistent storage (local timezone)
    const year = interviewTime.getFullYear();
    const month = interviewTime.getMonth();
    const date = interviewTime.getDate();
    const dateAtStartOfDay = new Date(year, month, date, 0, 0, 0, 0);

    console.log(`📍 Creating BookedSlots record: date=${dateAtStartOfDay.toDateString()}, startTime=${slotTime}, endTime=${slotEndTimeStr}, interviewTime=${interviewTime}`);

    try {
      const bookedSlot = await BookedSlots.create({
        interviewer: interviewerId,
        date: dateAtStartOfDay,
        startTime: slotTime,
        endTime: slotEndTimeStr,
        interviewSession: interview._id,
      });

      console.log(`✅ BookedSlots record created:`, bookedSlot._id);
    } catch (error) {
      console.error(`❌ Error creating BookedSlots record:`, error.message);
      // Don't fail the entire booking if BookedSlots fails, but log it
    }

    res.status(201).json(interview);

  } catch (error) {
    console.error("❌ CREATE ERROR:", error.message);
    
    // Handle unique constraint violation (race condition)
    if (error.code === 11000) {
      console.warn(`⚠️ Race condition detected! Slot already booked by another user`);
      return res.status(409).json({ 
        message: "This slot was just booked by another user. Please try a different slot." 
      });
    }
    
    res.status(500).json({ message: error.message });
  }
};

// ✅ ACCEPT / REJECT / CANCEL
export const respondToInterview = async (req, res) => {
  try {
    const { status } = req.body;

    const interview = await InterviewSession.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({ message: "Not found" });
    }

    // Authorization: only interviewer can accept/reject, interviewee or interviewer can cancel
    if (status === "cancelled") {
      // Either interviewee or interviewer can cancel
      const isInterviewee = interview.interviewee.toString() === req.user.id.toString();
      const isInterviewer = interview.interviewer.toString() === req.user.id.toString();

      console.log("DEBUG Cancel:", {
        userId: req.user.id.toString(),
        intervieweeId: interview.interviewee.toString(),
        interviewerId: interview.interviewer.toString(),
        isInterviewee,
        isInterviewer
      });

      if (!isInterviewee && !isInterviewer) {
        return res.status(403).json({ 
          message: "Not allowed - you are neither the interviewee nor interviewer",
          debug: {
            userId: req.user.id.toString(),
            intervieweeId: interview.interviewee.toString(),
            interviewerId: interview.interviewer.toString()
          }
        });
      }
    } else {
      // Only interviewer can accept/reject
      console.log("DEBUG Accept/Reject:", {
        userId: req.user.id.toString(),
        interviewerId: interview.interviewer.toString(),
        match: interview.interviewer.toString() === req.user.id.toString()
      });

      if (interview.interviewer.toString() !== req.user.id.toString()) {
        return res.status(403).json({ 
          message: "Not allowed - only interviewer can accept/reject"
        });
      }

      if (interview.status !== "pending") {
        return res.status(400).json({ message: "Already handled" });
      }
    }

    interview.status = status;

    if (status === "accepted") {
      interview.roomId = uuidv4();
    }

    // 🔄 Handle cancellation - free up availability
    if (status === "cancelled") {
      try {
        // Delete the BookedSlots record for this interview
        const deleteResult = await BookedSlots.deleteOne({
          interviewSession: interview._id
        });
        console.log(`✅ BookedSlots record deleted for cancelled interview:`, deleteResult);
      } catch (error) {
        console.error(`❌ Error deleting BookedSlots record:`, error.message);
      }
    }

    await interview.save();

    const interviewee = await User.findById(interview.interviewee);

    if (status === "accepted") {
      await notificationService.sendAcceptedEmail(interview, interviewee);
    }

    if (status === "rejected") {
      await notificationService.sendRejectedEmail(interview, interviewee);
    }

    if (status === "cancelled") {
      await notificationService.sendCancelledEmail(interview, interviewee);
    }

    res.json({ message: `Interview ${status}`, interview });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ COMPLETE
export const completeInterview = async (req, res) => {
  try {
    const { feedback, rating } = req.body;

    const interview = await InterviewSession.findById(req.params.id);

    if (!interview) return res.status(404).json({ message: "Not found" });

    if (interview.interviewer.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not allowed" });
    }

    interview.status = "completed";
    interview.feedback = feedback;
    interview.rating = rating;

    await interview.save();

    res.json({ message: "Completed", interview });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ GET MY INTERVIEWS
export const getMyInterviews = async (req, res) => {
  try {
    let query =
      req.user.role === "interviewer"
        ? { interviewer: req.user.id }
        : { interviewee: req.user.id };

    const interviews = await InterviewSession.find(query)
      .populate("interviewer", "name workingAt")
      .populate("interviewee", "name email");

    res.json(interviews);

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ DELETE INTERVIEW (ADMIN)
export const deleteInterview = async (req, res) => {
  try {
    const interview = await InterviewSession.findByIdAndDelete(req.params.id);

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    res.json({ message: "Interview deleted" });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ GET ALL INTERVIEWS (ADMIN + INTERVIEWER)
export const getAllInterviews = async (req, res) => {
  try {
    const interviews = await InterviewSession.find()
      .populate("interviewer", "name email")
      .populate("interviewee", "name email");

    res.json(interviews);

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getUpcomingInterviews = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();

    console.log(`🔍 Fetching upcoming interviews for user: ${userId}, now: ${now}`);

    // Find upcoming interviews for both interviewer and interviewee
    // Interview should be "upcoming" as long as it hasn't ended yet
    // End time = scheduledAt + duration (in minutes)
    const upcomingInterviews = await InterviewSession.find({
      $or: [
        { interviewer: userId },
        { interviewee: userId }
      ],
      status: { $in: ["pending", "scheduled"] },
      // Show interview if it hasn't ended yet
      // endTime = scheduledAt + (duration * 60000 milliseconds)
      $expr: {
        $gte: [
          { $add: ["$scheduledAt", { $multiply: ["$duration", 60000] }] },
          now
        ]
      }
    })
      .populate("interviewer", "name email title company rating profileImage")
      .populate("interviewee", "name email profileImage")
      .sort({ scheduledAt: 1 });

    console.log(`✅ Found ${upcomingInterviews.length} upcoming interviews`);
    upcomingInterviews.forEach((interview, idx) => {
      const endTime = new Date(interview.scheduledAt.getTime() + interview.duration * 60000);
      console.log(`  [${idx}] ${interview.scheduledAt} to ${endTime} - Status: ${interview.status} - Interviewer: ${interview.interviewer?.name || 'N/A'}`);
    });

    res.status(200).json({
      success: true,
      data: upcomingInterviews,
      count: upcomingInterviews.length
    });
  } catch (error) {
    console.error(`❌ Error fetching upcoming interviews:`, error);
    res.status(500).json({
      success: false,
      message: "Error fetching upcoming interviews",
      error: error.message
    });
  }
};

// 🔍 DEBUG: Check specific interview
export const debugInterview = async (req, res) => {
  try {
    // Find interview at 1:15 on April 15, 2026
    const startOfDay = new Date(2026, 3, 15, 0, 0, 0, 0); // April 15
    const endOfDay = new Date(2026, 3, 16, 0, 0, 0, 0);
    
    const interviews = await InterviewSession.find({
      scheduledAt: { $gte: startOfDay, $lt: endOfDay }
    })
      .populate("interviewer", "name")
      .populate("interviewee", "name")
      .select("scheduledAt duration status interviewer interviewee");
    
    const now = new Date();
    console.log(`\n🔍 DEBUG TIME: ${now}\n`);
    interviews.forEach(iv => {
      const endTime = new Date(iv.scheduledAt.getTime() + iv.duration * 60000);
      const isUpcoming = endTime >= now && (iv.status === "pending" || iv.status === "scheduled");
      console.log(`  ${iv.scheduledAt} → ${endTime} (${iv.duration} mins) | Status: ${iv.status} | Upcoming: ${isUpcoming}`);
    });
    
    res.json({ now, interviews });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getPastInterviews = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    
    console.log(`🔍 Fetching past interviews for user: ${userId}`);

    // Find all interviews where the user is an interviewee and either:
    // 1. Status is completed, OR
    // 2. Status is scheduled/accepted but end time has passed
    const pastInterviews = await InterviewSession.find({
      interviewee: userId,
      $or: [
        { status: "completed" },
        {
          status: { $in: ["pending", "scheduled", "accepted"] },
          // End time has passed
          $expr: {
            $lt: [
              { $add: ["$scheduledAt", { $multiply: ["$duration", 60000] }] },
              now
            ]
          }
        }
      ]
    })
      .populate("interviewer", "name email title company rating profileImage")
      .sort({ scheduledAt: -1 });

    // Also get interviews where they're an interviewer (past completed ones)
    const interviewerPastInterviews = await InterviewSession.find({
      interviewer: userId,
      $or: [
        { status: "completed" },
        {
          status: { $in: ["pending", "scheduled", "accepted"] },
          // End time has passed
          $expr: {
            $lt: [
              { $add: ["$scheduledAt", { $multiply: ["$duration", 60000] }] },
              now
            ]
          }
        }
      ]
    })
      .populate("interviewee", "name email profileImage")
      .sort({ scheduledAt: -1 });

    const allPastInterviews = [...pastInterviews, ...interviewerPastInterviews];

    console.log(`✅ Found ${allPastInterviews.length} past interviews`);

    res.status(200).json({
      success: true,
      data: allPastInterviews,
      count: allPastInterviews.length
    });
  } catch (error) {
    console.error(`❌ Error fetching past interviews:`, error);
    res.status(500).json({
      success: false,
      message: "Error fetching past interviews",
      error: error.message
    });
  }
};
