import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../utils/api";
import { Briefcase, Code, Calendar, Clock, ArrowLeft, Check } from "lucide-react";

export default function InterviewRequest() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [allSlots, setAllSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await API.get(`/discovery/interviewers/${id}`);
        setUser(res.data.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchUser();
  }, [id]);

  useEffect(() => {
    if (!user || !selectedDate) return;

    const fetchSlots = async () => {
      try {
        const res = await API.get(`/availability`, {
          params: {
            interviewerId: user._id,
            date: selectedDate,
          },
        });

        setAllSlots(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchSlots();
  }, [user, selectedDate]);

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-stone-400">Loading...</p>
      </div>
    );
  }

  const allBookings = JSON.parse(localStorage.getItem("bookings")) || [];

  const bookedSlots = allBookings
    .filter((b) => b.interviewerId === user._id && b.date === selectedDate)
    .map((b) => b.slot);

  const slots = allSlots.filter((slot) => !bookedSlots.includes(slot));

  const handleConfirm = async () => {
    if (!selectedSlot || !selectedDate) {
      alert("Please select date & slot");
      return;
    }

    try {
      setLoading(true);
      const interviewDateTime = new Date(`${selectedDate} ${selectedSlot}`);

      await API.post("/interviews/create", {
        interviewerId: user._id,
        scheduledAt: interviewDateTime,
        duration: 60,
      });

      alert(
        `✓ Booked ${user.name} on ${selectedDate} at ${selectedSlot}`
      );

      navigate("/dashboard");
    } catch (err) {
      console.log(err);
      alert("Booking failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* HEADER */}
      <div className="border-b border-white/10 px-6 sm:px-8 py-10">
        <div className="max-w-6xl mx-auto">
          <p className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 tracking-[0.14em] uppercase mb-4">
            <span className="w-4 h-px bg-amber-400" />
            Book Interview
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl tracking-tight text-stone-100 mb-2">
            Schedule your session
          </h1>
          <p className="text-stone-400 text-sm sm:text-base">
            Choose a date and time that works best for you
          </p>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-6xl mx-auto px-6 sm:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* LEFT - INTERVIEWER INFO */}
          <div className="lg:col-span-1">
            <div className="bg-[#0f0f11] border border-white/10 rounded-2xl p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-stone-100 mb-4">
                Interviewer
              </h2>

              <div className="mb-6 pb-6 border-b border-white/10">
                <h3 className="text-xl font-semibold text-stone-100 mb-1">
                  {user.name}
                </h3>
                <div className="flex items-center gap-2 text-sm text-stone-400">
                  <Briefcase size={16} className="text-amber-400" />
                  <span>{user.workingAt}</span>
                </div>
              </div>

              {/* SKILLS */}
              {user.skills && user.skills.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-stone-500 font-semibold mb-3">
                    Skills
                  </p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {user.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 text-xs font-medium rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* EXPERIENCE & BIO */}
              {user.yearsOfExperience && (
                <div className="mb-4 pb-4 border-b border-white/10">
                  <p className="text-sm text-stone-300">
                    <span className="font-semibold">Experience:</span> {user.yearsOfExperience} years
                  </p>
                </div>
              )}

              {user.bio && (
                <p className="text-sm text-stone-400 italic">"{user.bio}"</p>
              )}
            </div>
          </div>

          {/* RIGHT - BOOKING FORM */}
          <div className="lg:col-span-2">
            <div className="bg-[#0f0f11] border border-white/10 rounded-2xl p-6 sm:p-8">
              {/* DATE SELECTION */}
              <div className="mb-8">
                <label className="block text-lg font-semibold text-stone-100 mb-4">
                  <Calendar size={20} className="inline mr-2 text-amber-400" />
                  Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedSlot(null);
                  }}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-stone-100 focus:outline-none focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/10 transition-all"
                />
              </div>

              {/* SLOTS */}
              <div>
                <label className="block text-lg font-semibold text-stone-100 mb-4">
                  <Clock size={20} className="inline mr-2 text-amber-400" />
                  Available Times
                </label>

                {!selectedDate ? (
                  <div className="bg-white/5 border border-white/10 rounded-lg p-8 text-center">
                    <p className="text-stone-400">Please select a date first</p>
                  </div>
                ) : slots.length === 0 ? (
                  <div className="bg-white/5 border border-white/10 rounded-lg p-8 text-center">
                    <p className="text-stone-400">No slots available for this date</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {slots.map((slot) => {
                      const isBooked = bookedSlots.includes(slot);

                      return (
                        <button
                          key={slot}
                          onClick={() => !isBooked && setSelectedSlot(slot)}
                          disabled={isBooked}
                          className={`p-3 rounded-xl border transition-all font-semibold ${
                            isBooked
                              ? "bg-white/5 text-stone-600 cursor-not-allowed border-white/5"
                              : selectedSlot === slot
                              ? "bg-gradient-to-r from-amber-500 to-amber-600 text-black border-amber-500/50"
                              : "border-white/10 text-stone-300 hover:border-amber-400/50 hover:bg-white/5"
                          }`}
                        >
                          {slot}
                          {isBooked && (
                            <span className="block text-xs mt-1 opacity-70">
                              Booked
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* SUMMARY */}
              {selectedDate && selectedSlot && (
                <div className="mt-8 pt-8 border-t border-white/10">
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-6">
                    <p className="text-stone-300 text-sm">
                      <span className="font-semibold">Booking Summary:</span> {user.name} on{" "}
                      <span className="text-amber-400 font-semibold">
                        {selectedDate} at {selectedSlot}
                      </span>
                    </p>
                  </div>
                </div>
              )}

              {/* ACTIONS */}
              <div className="mt-8 flex gap-4">
                <button
                  onClick={() => navigate(-1)}
                  className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 text-stone-300 font-semibold rounded-xl transition-all border border-white/10 flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={18} />
                  Back
                </button>

                <button
                  onClick={handleConfirm}
                  disabled={!selectedSlot || !selectedDate || loading}
                  className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                    !selectedSlot || !selectedDate || loading
                      ? "bg-amber-500/50 text-black/50 cursor-not-allowed"
                      : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black transform hover:scale-105 shadow-lg"
                  }`}
                >
                  <Check size={18} />
                  {loading ? "Booking..." : "Confirm Booking"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}