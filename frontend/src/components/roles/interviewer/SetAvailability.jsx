import { useState, useEffect } from "react";
import API from "../../utils/api";
import { useNavigate } from "react-router-dom";
import { Clock, Save, X } from "lucide-react";

const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// Generate time options (every 15 minutes)
const generateTimeOptions = () => {
  const times = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      const hour = String(h).padStart(2, "0");
      const min = String(m).padStart(2, "0");
      times.push(`${hour}:${min}`);
    }
  }
  return times;
};

const timeOptions = generateTimeOptions();

function Toast({ message, type }) {
  const colors = {
    success: "bg-emerald-500/20 border-emerald-500/50 text-emerald-300",
    error: "bg-red-500/20 border-red-500/50 text-red-300",
    warning: "bg-amber-500/20 border-amber-500/50 text-amber-300",
    info: "bg-blue-500/20 border-blue-500/50 text-blue-300",
  };

  const icon = {
    success: "✓",
    error: "✕",
    warning: "!",
    info: "i",
  }[type] || "•";

  return (
    <div
      className={`${colors[type]} border px-4 py-3 rounded-lg shadow-lg flex items-center justify-between gap-3 fixed top-4 right-4 z-50`}
    >
      <div className="flex items-center gap-3">
        <span className="font-bold">{icon}</span>
        <span className="font-medium text-sm">{message}</span>
      </div>
    </div>
  );
}

export default function SetAvailability() {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [slotDuration, setSlotDuration] = useState("60");
  const navigate = useNavigate();

  // State for each day of the week
  const [availability, setAvailability] = useState({
    0: { enabled: false, startTime: "09:00", endTime: "17:00" },
    1: { enabled: true, startTime: "09:00", endTime: "17:00" },
    2: { enabled: true, startTime: "09:00", endTime: "17:00" },
    3: { enabled: true, startTime: "09:00", endTime: "17:00" },
    4: { enabled: true, startTime: "09:00", endTime: "17:00" },
    5: { enabled: true, startTime: "09:00", endTime: "17:00" },
    6: { enabled: false, startTime: "09:00", endTime: "17:00" },
  });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const toggleDay = (dayIndex) => {
    setAvailability((prev) => ({
      ...prev,
      [dayIndex]: {
        ...prev[dayIndex],
        enabled: !prev[dayIndex].enabled,
      },
    }));
  };

  const updateStartTime = (dayIndex, time) => {
    setAvailability((prev) => ({
      ...prev,
      [dayIndex]: {
        ...prev[dayIndex],
        startTime: time,
      },
    }));
  };

  const updateEndTime = (dayIndex, time) => {
    setAvailability((prev) => ({
      ...prev,
      [dayIndex]: {
        ...prev[dayIndex],
        endTime: time,
      },
    }));
  };

  const handleSave = async () => {
    try {
      const selectedDays = Object.entries(availability)
        .filter(([_, day]) => day.enabled)
        .map(([dayIndex, day]) => ({
          dayOfWeek: parseInt(dayIndex),
          slots: [{ startTime: day.startTime, endTime: day.endTime }],
          slotDuration: parseInt(slotDuration),
        }));

      if (selectedDays.length === 0) {
        showToast("Please select at least one day", "error");
        return;
      }

      setLoading(true);

      for (const day of selectedDays) {
        await API.post("/availability", day);
      }

      showToast("Availability saved successfully!", "success");
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      showToast(
        err.response?.data?.message || "Error saving availability",
        "error"
      );
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
            Availability
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl tracking-tight text-stone-100 mb-2">
            Set your availability
          </h1>
          <p className="text-stone-400 text-sm sm:text-base">
            Let candidates know when you're available for interviews
          </p>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-6xl mx-auto px-6 sm:px-8 py-12">
        {toast && <Toast message={toast.message} type={toast.type} />}

        {/* MAIN CARD */}
        <div className="bg-[#0f0f11] border border-white/10 rounded-2xl p-6 sm:p-8">
          {/* DAYS SECTION */}
          <div className="mb-10">
            <h2 className="text-lg font-semibold text-stone-100 mb-6">
              Select your working days
            </h2>

            <div className="space-y-4">
              {daysOfWeek.map((day, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row sm:items-center gap-4 pb-4 border-b border-white/10 last:border-b-0"
                >
                  {/* CHECKBOX & DAY NAME */}
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={availability[index].enabled}
                      onChange={() => toggleDay(index)}
                      className="w-5 h-5 rounded accent-amber-500 cursor-pointer"
                    />
                    <label className="font-medium text-stone-100 cursor-pointer w-24">
                      {day}
                    </label>
                  </div>

                  {/* TIME INPUTS */}
                  {availability[index].enabled ? (
                    <div className="flex flex-1 items-center gap-3">
                      {/* Start Time */}
                      <select
                        value={availability[index].startTime}
                        onChange={(e) => updateStartTime(index, e.target.value)}
                        className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-stone-100 text-sm focus:outline-none focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/10 transition-all"
                      >
                        {timeOptions.map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>

                      {/* Separator */}
                      <span className="text-stone-500">→</span>

                      {/* End Time */}
                      <select
                        value={availability[index].endTime}
                        onChange={(e) => updateEndTime(index, e.target.value)}
                        className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-stone-100 text-sm focus:outline-none focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/10 transition-all"
                      >
                        {timeOptions.map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="flex-1 text-stone-500 text-sm">
                      Not available
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* DURATION SECTION */}
          <div className="mb-10 pb-10 border-b border-white/10">
            <h2 className="text-lg font-semibold text-stone-100 mb-4 flex items-center gap-2">
              <Clock size={20} className="text-amber-400" />
              Interview Duration
            </h2>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <select
                value={slotDuration}
                onChange={(e) => setSlotDuration(e.target.value)}
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-stone-100 text-sm focus:outline-none focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/10 transition-all min-w-[180px]"
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">60 minutes (1 hour)</option>
                <option value="90">90 minutes</option>
                <option value="120">120 minutes (2 hours)</option>
              </select>
              <p className="text-stone-400 text-sm">
                Each slot will be <span className="font-semibold">{slotDuration}</span> minutes
              </p>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:from-amber-500/50 disabled:to-amber-600/50 text-black font-semibold transition-all flex items-center justify-center gap-2"
            >
              <Save size={18} />
              {loading ? "Saving..." : "Save Availability"}
            </button>
            <button
              onClick={() => navigate(-1)}
              className="flex-1 py-3 px-6 rounded-xl bg-white/5 hover:bg-white/10 text-stone-300 font-semibold transition-all border border-white/10 flex items-center justify-center gap-2"
            >
              <X size={18} />
              Cancel
            </button>
          </div>

          {/* INFO TEXT */}
          <p className="text-stone-500 text-xs mt-6 flex items-start gap-2">
            <span className="mt-0.5">💡</span>
            <span>You can edit your availability at any time from your dashboard</span>
          </p>
        </div>
      </div>
    </div>
  );
}