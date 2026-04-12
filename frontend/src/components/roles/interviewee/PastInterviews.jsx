import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../utils/api";
import { useToast } from "../../ui/Toast";
import { SkeletonLoader } from "../../ui/Loaders";
import { Calendar, Clock, MessageSquare, Send, X, Briefcase } from "lucide-react";

export default function PastInterviews() {
  const [pastBookings, setPastBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedbackId, setFeedbackId] = useState(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [rating, setRating] = useState(5);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    const fetchPastInterviews = async () => {
      try {
        setIsLoading(true);
        const res = await API.get("/interviews/my");

        const now = new Date();

        const past = res.data.filter(
          (b) => new Date(b.scheduledAt) < now && b.status === "completed"
        );

        const sorted = past.sort(
          (a, b) => new Date(b.scheduledAt) - new Date(a.scheduledAt)
        );

        setPastBookings(sorted);
      } catch (error) {
        showToast("Failed to load past interviews", "error");
        console.error("Error fetching past interviews:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPastInterviews();
  }, []);

  const handleSubmitFeedback = async (id) => {
    if (!feedbackText.trim()) {
      showToast("Feedback cannot be empty", "warning");
      return;
    }

    try {
      await API.post("/meeting/submit-feedback", {
        interviewId: id,
        feedback: feedbackText,
        rating: rating,
      });

      const updated = pastBookings.map((b) =>
        b._id === id ? { ...b, feedback: feedbackText, rating: rating } : b
      );

      setPastBookings(updated);
      setFeedbackId(null);
      setFeedbackText("");
      setRating(5);
      showToast("Feedback submitted successfully", "success");
    } catch (error) {
      showToast("Error submitting feedback", "error");
      console.error("Error submitting feedback:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="mb-12">
        <h2 className="text-2xl font-serif font-bold text-stone-100 mb-8">
          Past Interviews
        </h2>
        <SkeletonLoader count={3} />
      </div>
    );
  }

  if (!isLoading && pastBookings.length === 0) {
    return (
      <div className="mb-12">
        <h2 className="text-2xl font-serif font-bold text-stone-100 mb-8">
          Past Interviews
        </h2>
        <div className="bg-[#0f0f11] border border-white/10 rounded-2xl p-12 text-center">
          <p className="text-stone-400 mb-2">📭 No Past Interviews</p>
          <p className="text-stone-500 text-sm">
            You haven't completed any interviews yet
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-12">
      {/* SECTION HEADER */}
      <div className="mb-8">
        <h2 className="text-2xl font-serif font-bold text-stone-100 mb-2">
          Past Interviews ({pastBookings.length})
        </h2>
        <p className="text-stone-400 text-sm">
          Your completed interview sessions and feedback
        </p>
      </div>

      {/* INTERVIEWS GRID */}
      <div className="grid gap-4">
        {pastBookings.map((booking) => (
          <div
            key={booking._id}
            className="bg-[#0f0f11] border border-white/10 hover:border-amber-400/30 rounded-2xl p-6 transition-all duration-200"
          >
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 pb-6 border-b border-white/10">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-stone-100 mb-1">
                  {booking.interviewer?.name || "N/A"}
                </h3>
                <div className="flex items-center gap-2 text-sm text-stone-400 mb-3">
                  <Briefcase size={16} className="text-amber-400" />
                  <span>{booking.interviewer?.workingAt || "N/A"}</span>
                </div>

                {/* DETAILS */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-stone-400">
                    <Clock size={16} className="text-amber-400" />
                    <span>{booking.duration} mins</span>
                  </div>
                  <div className="flex items-center gap-2 text-stone-400">
                    <Calendar size={16} className="text-amber-400" />
                    <span>
                      {new Date(booking.scheduledAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-stone-400">
                    <span className="text-amber-400">🕐</span>
                    <span>
                      {new Date(booking.scheduledAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* STATUS & RATING */}
              <div className="flex flex-col gap-2">
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-center">
                  ✓ Completed
                </span>
                {booking.rating && (
                  <div className="text-center">
                    <div className="flex justify-center gap-0.5 mb-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={
                            star <= booking.rating
                              ? "text-amber-400"
                              : "text-stone-600"
                          }
                        >
                          ⭐
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-stone-400">
                      {booking.rating}/5
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* FEEDBACK SECTION */}
            <div>
              {booking.feedback ? (
                <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <div className="flex items-start gap-2 mb-3">
                    <MessageSquare size={16} className="text-amber-400 mt-0.5" />
                    <p className="text-sm font-semibold text-stone-100">Your Feedback</p>
                  </div>
                  <p className="text-stone-400 text-sm mb-3">{booking.feedback}</p>
                  {booking.rating && (
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={
                            star <= booking.rating
                              ? "text-amber-400"
                              : "text-stone-600"
                          }
                        >
                          ⭐
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ) : feedbackId === booking._id ? (
                <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
                  {/* TEXTAREA */}
                  <div>
                    <label className="text-sm font-semibold text-stone-100 mb-2 block">
                      Your Feedback
                    </label>
                    <textarea
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="Share your experience with this interview..."
                      className="w-full bg-white/5 border border-white/10 text-stone-100 placeholder-stone-500 rounded-lg p-3 focus:border-amber-400/50 focus:outline-none focus:ring-2 focus:ring-amber-400/10 transition-all resize-none"
                      rows="3"
                    />
                  </div>

                  {/* RATING */}
                  <div>
                    <label className="text-sm font-semibold text-stone-100 mb-2 block">
                      Rating
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          className={`text-2xl transition-all transform ${
                            star <= rating
                              ? "scale-125 text-amber-400"
                              : "scale-100 text-stone-600 hover:text-amber-300"
                          }`}
                        >
                          ⭐
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* BUTTONS */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleSubmitFeedback(booking._id)}
                      className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
                    >
                      <Send size={16} />
                      Submit
                    </button>
                    <button
                      onClick={() => {
                        setFeedbackId(null);
                        setFeedbackText("");
                        setRating(5);
                      }}
                      className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-stone-300 font-semibold rounded-lg transition-all border border-white/10 flex items-center justify-center gap-2"
                    >
                      <X size={16} />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setFeedbackId(booking._id)}
                  className="w-full px-4 py-2.5 bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 text-amber-400 font-semibold rounded-lg transition-all border border-amber-500/30 flex items-center justify-center gap-2"
                >
                  <MessageSquare size={16} />
                  Add Feedback
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}