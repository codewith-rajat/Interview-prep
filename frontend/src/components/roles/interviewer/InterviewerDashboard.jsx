import React, { useEffect, useState } from "react";
import PastInterviews from "./PastInterviews";
import UpcomingInterviews from "./UpcomingInterviews";
import { Link } from "react-router-dom";
import API from "../../utils/api";
import { Calendar, Award } from "lucide-react";

export default function InterviewerDashboard() {
  const [bookings, setBookings] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        setUser(storedUser);

        const res = await API.get("/interviews/upcoming");
        setBookings(res.data.data || []);
      } catch (error) {
        console.error("Error fetching interviews:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInterviews();
  }, []);

  const now = new Date();

  const upcoming = bookings
    .filter((b) => new Date(b.scheduledAt) >= now)
    .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));

  const past = bookings
    .filter((b) => new Date(b.scheduledAt) < now)
    .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));

  const handleFeedback = async (id, feedback, rating) => {
    try {
      await API.post(`/meeting/submit-feedback`, {
        interviewId: id,
        feedback,
        rating
      });

      // Update local state
      const updated = bookings.map((b) =>
        b._id === id ? { ...b, feedback, rating } : b
      );
      setBookings(updated);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("Error submitting feedback");
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* HEADER */}
      <div className="border-b border-white/10 px-6 sm:px-8 py-10">
        <div className="max-w-6xl mx-auto">
          <p className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 tracking-[0.14em] uppercase mb-4">
            <span className="w-4 h-px bg-amber-400" />
            Dashboard
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl tracking-tight text-stone-100 mb-2">
            Manage Interviews
          </h1>
          <p className="text-stone-400 text-sm sm:text-base">
            View your upcoming and past interview sessions
          </p>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-6xl mx-auto px-6 sm:px-8 py-12">
        {/* ACTION BUTTON */}
        {user && (
          <Link to="/set-availability" className="mb-8 block">
            <button className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2">
              <Calendar size={20} />
              Set Availability
            </button>
          </Link>
        )}

        {/* UPCOMING INTERVIEWS */}
        <UpcomingInterviews upcoming={upcoming} onFeedback={handleFeedback} />

        {/* PAST INTERVIEWS */}
        <PastInterviews past={past} />
      </div>
    </div>
  );
}