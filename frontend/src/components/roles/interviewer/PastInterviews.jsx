import React, { useState, useEffect } from "react";
import axios from "axios";
import { Calendar, Clock, User, Star, MessageSquare } from "lucide-react";

const PastInterviews = () => {
  const [pastInterviews, setPastInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPastInterviews();
  }, []);

  const fetchPastInterviews = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/interviews/past", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPastInterviews(response.data.data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching past interviews:", error);
      setError("Failed to load past interviews");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  if (pastInterviews.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg">No past interviews yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white mb-6">Past Interviews</h2>
      {pastInterviews.map((interview) => (
        <div
          key={interview._id}
          className="bg-[#0f0f11] border border-amber-400/20 rounded-lg p-6 hover:border-amber-400/40 transition"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-400/10 flex items-center justify-center">
                <User className="text-amber-400" size={24} />
              </div>
              <div>
                <h3 className="text-white font-semibold">
                  {interview.interviewerId?.name || "Interviewer"}
                </h3>
                <p className="text-gray-400 text-sm">
                  {interview.interviewerId?.title || "Professional"}
                </p>
              </div>
            </div>
            {interview.feedbackId?.rating && (
              <div className="flex items-center gap-1">
                <Star className="text-amber-400 fill-amber-400" size={18} />
                <span className="text-white font-semibold">
                  {interview.feedbackId.rating}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-2 text-sm text-gray-400 mb-4">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-amber-400" />
              <span>
                {new Date(interview.scheduledDate).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-amber-400" />
              <span>
                {new Date(interview.scheduledDate).toLocaleTimeString()}
              </span>
            </div>
          </div>

          {interview.feedbackId?.summary && (
            <div className="bg-amber-400/5 border border-amber-400/20 rounded p-3 mb-4">
              <div className="flex items-start gap-2">
                <MessageSquare size={16} className="text-amber-400 mt-1 flex-shrink-0" />
                <p className="text-gray-300 text-sm">{interview.feedbackId.summary}</p>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button className="flex-1 bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/30 rounded py-2 px-4 transition text-sm font-semibold">
              View Feedback
            </button>
            <button className="flex-1 bg-amber-400 hover:bg-amber-500 text-black rounded py-2 px-4 transition text-sm font-semibold">
              Book Again
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PastInterviews;