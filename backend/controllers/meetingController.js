import InterviewSession from "../models/InterviewSessions.js";
import User from "../models/User.js";

/**
 * GET MEETING ROOM DETAILS
 * Returns info about a specific interview session
 */
export const getMeetingDetails = async (req, res) => {
  try {
    const { roomId } = req.params;

    const interview = await InterviewSession.findOne({ roomId })
      .populate("interviewer", "name email workingAt yearsOfExperience skills rating")
      .populate("interviewee", "name email skills");

    if (!interview) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    // Check if user is participant
    if (interview.interviewer._id.toString() !== req.user.id && interview.interviewee._id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const now = new Date();
    const start = new Date(interview.scheduledAt);
    const end = new Date(start.getTime() + (interview.duration || 60) * 60000);
    const isActive = now >= start && now <= end;

    res.json({
      success: true,
      data: {
        roomId: interview.roomId,
        interviewer: interview.interviewer,
        interviewee: interview.interviewee,
        scheduledAt: interview.scheduledAt,
        duration: interview.duration,
        status: interview.status,
        isActive,
        startTime: start,
        endTime: end,
        feedback: interview.feedback || null,
        rating: interview.rating || null
      }
    });
  } catch (error) {
    console.log("Get Meeting Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * SUBMIT FEEDBACK & RATING (Interviewer only)
 */
export const submitFeedback = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const { feedback, rating } = req.body;

    // Validate rating
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const interview = await InterviewSession.findById(interviewId);

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    // Only interviewer can submit feedback
    if (interview.interviewer.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only interviewer can submit feedback" });
    }

    // Interview must be completed
    if (interview.status !== "completed") {
      return res.status(400).json({ message: "Interview not yet completed" });
    }

    interview.feedback = feedback || interview.feedback;
    interview.rating = rating || interview.rating;

    await interview.save();

    // Update interviewer's average rating
    const allInterviews = await InterviewSession.find({
      interviewer: req.user.id,
      status: "completed",
      rating: { $exists: true, $ne: null }
    });

    if (allInterviews.length > 0) {
      const avgRating = allInterviews.reduce((sum, iv) => sum + iv.rating, 0) / allInterviews.length;
      await User.findByIdAndUpdate(req.user.id, { rating: avgRating });
    }

    res.json({
      success: true,
      message: "Feedback submitted",
      interview
    });
  } catch (error) {
    console.log("Submit Feedback Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET INTERVIEW WITH FEEDBACK (Interviewee can see feedback)
 */
export const getInterviewWithFeedback = async (req, res) => {
  try {
    const { interviewId } = req.params;

    const interview = await InterviewSession.findById(interviewId)
      .populate("interviewer", "name email workingAt yearsOfExperience skills rating")
      .populate("interviewee", "name email");

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    // Check if user is participant
    if (interview.interviewer._id.toString() !== req.user.id && interview.interviewee._id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json({
      success: true,
      data: interview
    });
  } catch (error) {
    console.log("Get Interview Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
