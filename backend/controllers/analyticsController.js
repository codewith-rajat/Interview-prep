import User from "../models/User.js";
import InterviewSession from "../models/InterviewSessions.js";

/**
 * GET ADMIN ANALYTICS
 * Returns stats: active users, interviews completed this month, etc.
 */
export const getAnalytics = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    // Total users by role
    const totalUsers = await User.countDocuments();
    const interviewerCount = await User.countDocuments({ role: "interviewer" });
    const intervieweeCount = await User.countDocuments({ role: "interviewee" });

    // Interviews stats
    const totalInterviews = await InterviewSession.countDocuments();
    const completedInterviews = await InterviewSession.countDocuments({ status: "completed" });
    const pendingInterviews = await InterviewSession.countDocuments({ status: "pending" });
    const rejectedInterviews = await InterviewSession.countDocuments({ status: "rejected" });

    // This month's interviews
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const thisMonthInterviews = await InterviewSession.countDocuments({
      createdAt: { $gte: monthStart, $lte: monthEnd }
    });

    const thisMonthCompleted = await InterviewSession.countDocuments({
      status: "completed",
      createdAt: { $gte: monthStart, $lte: monthEnd }
    });

    // Average interviewer rating
    const interviewers = await User.find({ role: "interviewer" });
    const avgRating = interviewers.length > 0
      ? interviewers.reduce((sum, u) => sum + (u.rating || 0), 0) / interviewers.length
      : 0;

    // Top rated interviewers
    const topInterviewers = await User.find({ role: "interviewer" })
      .sort({ rating: -1 })
      .limit(5)
      .select("name email workingAt yearsOfExperience rating skills");

    // Active users (logged in this month)
    const activeUsers = await User.countDocuments({
      updatedAt: { $gte: monthStart }
    });

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          interviewers: interviewerCount,
          interviewees: intervieweeCount,
          activeThisMonth: activeUsers
        },
        interviews: {
          total: totalInterviews,
          completed: completedInterviews,
          pending: pendingInterviews,
          rejected: rejectedInterviews,
          thisMonth: thisMonthInterviews,
          completedThisMonth: thisMonthCompleted
        },
        ratings: {
          averageInterviewerRating: Number(avgRating.toFixed(2)),
          topInterviewers
        }
      }
    });
  } catch (error) {
    console.log("Analytics Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET INTERVIEW STATS BY INTERVIEWER
 * Returns completed interviews, average rating, total hours
 */
export const getInterviewerStats = async (req, res) => {
  try {
    const { interviewerId } = req.params;

    const interviewer = await User.findById(interviewerId);
    if (!interviewer || interviewer.role !== "interviewer") {
      return res.status(404).json({ message: "Interviewer not found" });
    }

    const interviews = await InterviewSession.find({ interviewer: interviewerId });
    const completedInterviews = interviews.filter(i => i.status === "completed");
    const totalHours = interviews.reduce((sum, i) => sum + (i.duration || 0), 0) / 60;

    res.json({
      success: true,
      data: {
        interviewerName: interviewer.name,
        totalInterviews: interviews.length,
        completedInterviews: completedInterviews.length,
        averageRating: interviewer.rating || 0,
        totalHoursTaken: Number(totalHours.toFixed(2)),
        skills: interviewer.skills,
        yearsOfExperience: interviewer.yearsOfExperience
      }
    });
  } catch (error) {
    console.log("Interviewer Stats Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET MONTHLY INTERVIEW CHART DATA
 * Returns interview counts for each day of current month
 */
export const getMonthlyChartData = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const chartData = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dayStart = new Date(year, month, day);
      const dayEnd = new Date(year, month, day + 1);

      const count = await InterviewSession.countDocuments({
        createdAt: { $gte: dayStart, $lt: dayEnd }
      });

      const completed = await InterviewSession.countDocuments({
        status: "completed",
        createdAt: { $gte: dayStart, $lt: dayEnd }
      });

      chartData.push({
        day,
        total: count,
        completed
      });
    }

    res.json({
      success: true,
      month: now.toLocaleString("default", { month: "long", year: "numeric" }),
      data: chartData
    });
  } catch (error) {
    console.log("Monthly Chart Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
