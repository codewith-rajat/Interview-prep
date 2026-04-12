import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../utils/api";
import { useToast } from "../../ui/Toast";
import { SkeletonLoader } from "../../ui/Loaders";
import { EmptyState } from "../../ui/EmptyState";
import { Calendar, Mail, Clock, Edit2, Send, X } from "lucide-react";

export default function PastInterviews({ past = [] }) {
  const [pastBookings, setPastBookings] = useState(past);
  const [isLoading, setIsLoading] = useState(!past.length);
  const [feedbackId, setFeedbackId] = useState(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [rating, setRating] = useState(0);
  const [submittingId, setSubmittingId] = useState(null);
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!past.length) {
      fetchPastInterviews();
    } else {
      setPastBookings(past);
    }
  }, [past]);

  const fetchPastInterviews = async () => {
    try {
      setIsLoading(true);
      const { data } = await API.get("/meetings/past");
      setPastBookings(data.data || []);
    } catch (error) {
      console.error("Error fetching past interviews:", error);
      showToast("Failed to load past interviews", "error");
      setPastBookings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitFeedback = async (interviewId) => {
    if (!feedbackText.trim() || rating === 0) {
      showToast("Please provide feedback and rating", "warning");
      return;
    }

    try {
      setSubmittingId(interviewId);
      await API.post(`/meetings/${interviewId}/feedback`, {
        feedback: feedbackText,
        rating: rating,
      });
      showToast("Feedback submitted successfully", "success");

      setPastBookings((prev) =>
        prev.map((booking) =>
          booking._id === interviewId
            ? {
                ...booking,
                feedback: {
                  text: feedbackText,
                  rating: rating,
                  submittedAt: new Date(),
                },
              }
            : booking
        )
      );

      setFeedbackId(null);
      setFeedbackText("");
      setRating(0);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      showToast("Failed to submit feedback", "error");
    } finally {
      setSubmittingId(null);
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

  if (!pastBookings || pastBookings.length === 0) {
    return (
      <div className="mb-12">
        <h2 className="text-2xl font-serif font-bold text-stone-100 mb-8">
          Past Interviews
        </h2>
        <div className="bg-[#0f0f11] border border-white/10 rounded-2xl p-12 text-center">
          <p className="text-stone-400 mb-2">📭 No Past Interviews</p>
          <p className="text-stone-500 text-sm">
            You haven't conducted any interviews yet
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
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-stone-100 mb-3">
                  {booking.intervieweeId?.fullName ||
                    booking.interviewee?.name ||
                    "Student"}
                </h3>

                {/* DETAILS GRID */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-stone-400">
                    <Mail size={16} className="text-amber-400" />
                    <span className="truncate">
                      {booking.intervieweeId?.email ||
                        booking.interviewee?.email ||
                        "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-stone-400">
                    <Calendar size={16} className="text-amber-400" />
                    <span>
                      {booking.startTime
                        ? new Date(booking.startTime).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric" }
                          )
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-stone-400">
                    <Clock size={16} className="text-amber-400" />
                    <span>{booking.duration || 30} mins</span>
                  </div>
                </div>
              </div>

              {/* STATUS BADGE */}
              <div className="flex-shrink-0">
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  ✓ Completed
                </span>
              </div>
            </div>

            {/* FEEDBACK SECTION */}
            {feedbackId === booking._id ? (
              <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-stone-100 mb-2">
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

                <div>
                  <label className="block text-sm font-semibold text-stone-100 mb-2">
                    Feedback
                  </label>
                  <textarea
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Share your feedback about this interview..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/10 transition-all resize-none"
                    rows="3"
                  />
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleSubmitFeedback(booking._id)}
                    disabled={submittingId === booking._id}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:from-amber-500/50 disabled:to-amber-600/50 text-black font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Send size={16} />
                    {submittingId === booking._id ? "Submitting..." : "Submit"}
                  </button>
                  <button
                    onClick={() => {
                      setFeedbackId(null);
                      setFeedbackText("");
                      setRating(0);
                    }}
                    className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-stone-300 font-semibold rounded-lg transition-all flex items-center justify-center gap-2 border border-white/10"
                  >
                    <X size={16} />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                {booking.feedback ? (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="text-sm font-semibold text-amber-400">
                        Your Feedback
                      </h4>
                      <button
                        onClick={() => {
                          setFeedbackId(booking._id);
                          setFeedbackText(booking.feedback.text || "");
                          setRating(booking.feedback.rating || 0);
                        }}
                        className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
                      >
                        <Edit2 size={14} />
                        Edit
                      </button>
                    </div>
                    <div className="flex gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={
                            star <= booking.feedback.rating
                              ? "text-amber-400"
                              : "text-stone-600"
                          }
                        >
                          ⭐
                        </span>
                      ))}
                    </div>
                    <p className="text-stone-300 text-sm">
                      {booking.feedback.text}
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={() => setFeedbackId(booking._id)}
                    className="w-full px-4 py-2.5 bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 text-amber-400 font-semibold rounded-lg transition-all border border-amber-500/30 flex items-center justify-center gap-2"
                  >
                    <Edit2 size={16} />
                    Add Feedback & Rating
                  </button>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
