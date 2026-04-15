import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../utils/api";
import { useToast } from "../../ui/Toast";
import { SkeletonLoader } from "../../ui/Loaders";
import { Phone, X, Clock, Briefcase, User } from "lucide-react";

export default function UpcomingBookings() {
  const [bookings, setBookings] = useState([]);
  const [timeUpdate, setTimeUpdate] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setIsLoading(true);
        
        // Debug call
        const debugRes = await API.get("/interviews/debug/check");
        console.log(`🔍 DEBUG INFO:`, debugRes.data);
        
        const res = await API.get("/interviews/upcoming");

        console.log(`📥 Fetched bookings:`, res.data.data);

        // ⚠️ NO NEED TO FILTER - Backend already returns duration-aware upcoming interviews
        // Backend only returns interviews where scheduledAt + duration >= now
        const filtered = res.data.data.filter(
          (b) => b.status === "pending" || b.status === "scheduled"
        );

        const sorted = filtered.sort(
          (a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt)
        );

        console.log(`✅ Filtered to ${sorted.length} upcoming bookings`);
        setBookings(sorted);
      } catch (err) {
        showToast("Failed to load interviews", "error");
        console.log(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeUpdate((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleCancel = async (id, interviewerId) => {
    const confirm = window.confirm(
      "Are you sure you want to cancel this interview?"
    );

    if (!confirm) return;

    try {
      setCancelling(id);
      await API.patch(`/interviews/${id}/respond`, { status: "cancelled" });

      setBookings((prev) => prev.filter((b) => b._id !== id));

      showToast("Interview cancelled successfully", "success");
    } catch (err) {
      showToast(
        err.response?.data?.message || "Error cancelling interview",
        "error"
      );
    } finally {
      setCancelling(null);
    }
  };

  const isJoinEnabled = (time, status) => {
    // Can only join if status is accepted or scheduled
    if (status !== "accepted" && status !== "scheduled") {
      return false;
    }

    const now = new Date();
    const interviewTime = new Date(time);
    const diff = interviewTime - now;

    // Allow join 5 minutes before to 1 hour after interview
    return diff <= 5 * 60 * 1000 && diff >= -60 * 60 * 1000;
  };

  const getTimeLeft = (time) => {
    const now = new Date();
    const interviewTime = new Date(time);
    const diff = interviewTime - now;

    if (diff <= 0) {
      const timePassed = Math.abs(diff);
      const hoursPassed = Math.floor(timePassed / (1000 * 60 * 60));
      const minutesPassed = Math.floor(timePassed / (1000 * 60));
      const daysPassed = Math.floor(timePassed / (1000 * 60 * 60 * 24));

      if (hoursPassed >= 24) return `${daysPassed}d ago`;
      if (hoursPassed > 0) return `${hoursPassed}h ago`;
      if (minutesPassed > 0) return `${minutesPassed}m ago`;
      return "Live now";
    }

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours >= 24) return `${days}d left`;
    if (minutes >= 60) return `${hours}h left`;
    return `${minutes}m left`;
  };

  const handleJoin = (booking) => {
    if (booking.roomId) {
      navigate(`/join/${booking.roomId}`);
    } else {
      showToast("Interview has not been accepted yet", "warning");
    }
  };

  return (
    <div className="mb-12">
      {/* SECTION HEADER */}
      <div className="mb-8">
        <h2 className="text-2xl font-serif font-bold text-stone-100 mb-2">
          My Upcoming Interviews
        </h2>
        <p className="text-stone-400 text-sm">
          Your scheduled interview sessions
        </p>
      </div>

      {/* LOADING STATE */}
      {isLoading && <SkeletonLoader count={3} />}

      {/* EMPTY STATE */}
      {!isLoading && bookings.length === 0 && (
        <div className="bg-[#0f0f11] border border-white/10 rounded-2xl p-12 text-center">
          <p className="text-stone-400 mb-2">📭 No Upcoming Interviews</p>
          <p className="text-stone-500 text-sm mb-6">
            You don't have any upcoming interviews scheduled
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold rounded-xl transition-all duration-200 transform hover:scale-105"
          >
            Search Interviewers
          </button>
        </div>
      )}

      {/* CONTENT */}
      {!isLoading && bookings.length > 0 && (
        <div className="grid gap-4">
          {bookings.map((booking) => {
            const dateObj = new Date(booking.scheduledAt);
            const date = dateObj.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });
            const time = dateObj.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={booking._id}
                className="bg-[#0f0f11] border border-white/10 hover:border-amber-400/30 rounded-2xl p-6 transition-all duration-200 flex flex-col sm:flex-row sm:items-center gap-6 sm:justify-between"
              >
                {/* INTERVIEW INFO */}
                <div className="flex-1 space-y-4">
                  {/* INTERVIEWER */}
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center flex-shrink-0">
                      <User size={20} className="text-amber-400" />
                    </div>
                    <div>
                      <p className="text-stone-100 font-semibold">
                        {booking.interviewer?.name || "N/A"}
                      </p>
                      <p className="text-stone-500 text-sm flex items-center gap-1">
                        <Briefcase size={14} className="text-amber-400" />
                        {booking.interviewer?.workingAt || "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* DETAILS GRID */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-stone-400">
                      <Clock size={16} className="text-amber-400" />
                      <span>{booking.duration} mins</span>
                    </div>
                    <div className="flex items-center gap-2 text-stone-400">
                      <span className="text-amber-400">�</span>
                      <span>{date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-stone-400">
                      <span className="text-amber-400">🕐</span>
                      <span>{time}</span>
                    </div>
                  </div>

                  {/* STATUS & TIME LEFT */}
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                        booking.status === "accepted"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          : "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                      }`}
                    >
                      {booking.status === "pending" ? "⏳ Pending" : "✓ Confirmed"}
                    </span>
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-white/5 text-stone-400 border border-white/10">
                      {getTimeLeft(booking.scheduledAt)}
                    </span>
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => handleJoin(booking)}
                    disabled={!isJoinEnabled(booking.scheduledAt, booking.status)}
                    className={`flex-1 sm:flex-none px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                      isJoinEnabled(booking.scheduledAt, booking.status)
                        ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black transform hover:scale-105 shadow-lg"
                        : "bg-white/5 text-stone-500 cursor-not-allowed border border-white/10"
                    }`}
                  >
                    <Phone size={18} />
                    <span className="hidden sm:inline">Join</span>
                  </button>

                  <button
                    onClick={() => handleCancel(booking._id, booking.interviewer?._id)}
                    disabled={cancelling === booking._id}
                    className="flex-1 sm:flex-none px-6 py-3 bg-red-500/10 hover:bg-red-500/20 disabled:bg-red-500/5 text-red-400 font-semibold rounded-xl transition-all border border-red-500/30 flex items-center justify-center gap-2"
                  >
                    <X size={18} />
                    <span className="hidden sm:inline">
                      {cancelling === booking._id ? "Cancelling..." : "Cancel"}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}