import InterviewSession from "../models/InterviewSessions.js";
import User from "../models/User.js";

// ===== GENERATE AI FEEDBACK (After interview ends) =====
export const generateAIFeedback = async (req, res) => {
  try {
    const { interviewId, transcript, recordingDuration } = req.body;

    // TODO: Integrate with Google Gemini API or Claude API
    // This is a placeholder implementation
    
    const interview = await InterviewSession.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    // Simulate AI feedback generation
    // In production, call Google Gemini or Claude API
    const feedback = {
      summary: "Candidate demonstrated solid understanding of fundamentals with room for improvement in advanced topics.",
      technical: "Strong grasp of core concepts. Struggled slightly with optimization and edge cases.",
      communication: "Clear explanation of thought process. Could improve on asking clarifying questions upfront.",
      problemSolving: "Good instinct for breaking problems down. Identified overlapping subproblems but missed optimization opportunities.",
      recommendation: "CONSIDER", // HIRE / CONSIDER / NO_HIRE
      strengths: [
        "Strong fundamentals understanding",
        "Clear verbal communication",
        "Systematic debugging approach"
      ],
      improvements: [
        "Optimize solutions for time/space complexity",
        "Ask more clarifying questions",
        "Practice with more advanced scenarios"
      ],
      overallRating: "GOOD" // POOR / AVERAGE / GOOD / EXCELLENT
    };

    interview.feedback = feedback;
    interview.recordingDuration = recordingDuration;
    await interview.save();

    // Award credits to interviewer
    const interviewer = await User.findById(interview.interviewer);
    if (interviewer) {
      interviewer.creditBalance += 5; // 5 credits per interview
      interviewer.totalEarned = (interviewer.totalEarned || 0) + 5;
      await interviewer.save();
    }

    res.json({
      message: "AI feedback generated",
      feedback,
    });
  } catch (error) {
    console.error("Error generating feedback:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ===== GET INTERVIEW FEEDBACK =====
export const getInterviewFeedback = async (req, res) => {
  try {
    const { interviewId } = req.params;

    const interview = await InterviewSession.findById(interviewId)
      .populate("interviewer", "name email title company")
      .populate("interviewee", "name email skills");

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    if (!interview.feedback) {
      return res.status(404).json({ message: "Feedback not available yet" });
    }

    res.json({
      interview,
      feedback: interview.feedback,
    });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ===== SUBMIT SESSION RATING (User rates the interview) =====
export const submitSessionRating = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const interview = await InterviewSession.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    interview.feedback = interview.feedback || {};
    interview.feedback.sessionRating = rating;
    interview.feedback.sessionComment = comment || "";

    await interview.save();

    // Update interviewer rating
    const interviews = await InterviewSession.find({
      interviewer: interview.interviewer,
      "feedback.sessionRating": { $exists: true }
    });

    if (interviews.length > 0) {
      const avgRating = interviews.reduce((sum, i) => sum + (i.feedback?.sessionRating || 0), 0) / interviews.length;
      await User.findByIdAndUpdate(interview.interviewer, { rating: avgRating });
    }

    res.json({ message: "Rating submitted", interview });
  } catch (error) {
    console.error("Error submitting rating:", error);
    res.status(500).json({ message: "Server error" });
  }
};
