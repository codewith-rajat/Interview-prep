import InterviewSession from "../models/InterviewSessions.js";
import Availability from "../models/Availability.js";
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

    // ❌ double booking check
    const existing = await InterviewSession.findOne({
      interviewer: interviewerId,
      scheduledAt: interviewTime
    });

    if (existing) {
      return res.status(400).json({ message: "Slot already booked" });
    }

    // ✅ create interview
    const interview = await InterviewSession.create({
      interviewer: interviewerId,
      interviewee: req.user.id,
      scheduledAt: interviewTime,
      duration,
      status: "pending"
    });

    res.status(201).json(interview);

  } catch (error) {
    console.log("CREATE ERROR:", error);
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
      const scheduleDate = new Date(interview.scheduledAt);
      const dayOfWeek = scheduleDate.getDay();
      const slotStartTime = interview.scheduledAt.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      });

      // Find the availability slot and mark as not booked
      await Availability.updateOne(
        {
          interviewer: interview.interviewer,
          dayOfWeek: dayOfWeek,
          "slots._id": { $exists: true }
        },
        {
          $set: {
            "slots.$[elem].isBooked": false,
            "slots.$[elem].bookedBy": null
          }
        },
        {
          arrayFilters: [{ "elem.startTime": { $lte: slotStartTime }, "elem.endTime": { $gte: slotStartTime } }]
        }
      );
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