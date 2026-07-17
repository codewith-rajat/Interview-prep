import React, { useEffect, useState } from "react";
import { Plus, X, ChevronDown } from "lucide-react";
import API from "../../utils/api";

const SetAvailability = () => {
  const [duration, setDuration] = useState(60);
  const [availability, setAvailability] = useState([
    { day: "Monday", isSelected: false, startTime: "09:00", endTime: "17:00", slots: [] },
    { day: "Tuesday", isSelected: false, startTime: "09:00", endTime: "17:00", slots: [] },
    { day: "Wednesday", isSelected: false, startTime: "09:00", endTime: "17:00", slots: [] },
    { day: "Thursday", isSelected: false, startTime: "09:00", endTime: "17:00", slots: [] },
    { day: "Friday", isSelected: false, startTime: "09:00", endTime: "17:00", slots: [] },
    { day: "Saturday", isSelected: false, startTime: "09:00", endTime: "17:00", slots: [] },
    { day: "Sunday", isSelected: false, startTime: "09:00", endTime: "17:00", slots: [] },
  ]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [existingSlots, setExistingSlots] = useState([]);

  // ---------------- FETCH EXISTING ----------------
  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const res = await API.get("/availability");

        const allSlots = res.data.data.flatMap((day) =>
          day.slots.map((slot) => ({
            dayOfWeek: day.dayOfWeek,
            startTime: slot.startTime,
          }))
        );

        setExistingSlots(allSlots);
      } catch (err) {
        console.error(err);
      }
    };

    fetchAvailability();
  }, []);

  // ---------------- TIME GENERATOR ----------------
  const generateTimeSlots = () => {
    const slots = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += duration) {
        slots.push(
          `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
        );
      }
    }
    return slots;
  };

  const calculateEndTime = (startTime) => {
    const [h, m] = startTime.split(":").map(Number);
    const total = h * 60 + m + duration;
    const eh = Math.floor(total / 60) % 24;
    const em = total % 60;

    return `${String(eh).padStart(2, "0")}:${String(em).padStart(2, "0")}`;
  };

  // ---------------- DAY TOGGLE ----------------
  const handleDayToggle = (index) => {
    const updated = [...availability];
    updated[index].isSelected = !updated[index].isSelected;

    if (updated[index].isSelected) {
      updated[index].startTime = "09:00";
      updated[index].endTime = calculateEndTime("09:00");
      updated[index].slots = [];
    }

    setAvailability(updated);
  };

  // ---------------- START TIME CHANGE ----------------
  const handleStartTimeChange = (index, value) => {
    const updated = [...availability];
    updated[index].startTime = value;
    updated[index].endTime = calculateEndTime(value);
    updated[index].slots = [];
    setAvailability(updated);
  };

  // ---------------- ADD SLOT (FIXED LOGIC) ----------------
  const handleAddSlot = (index) => {
    const updated = [...availability];
    const day = updated[index];

    if (!day.slots) day.slots = [];

    const lastEnd =
      day.slots.length > 0
        ? day.slots[day.slots.length - 1].endTime
        : day.startTime;

    const newStart = lastEnd;
    const newEnd = calculateEndTime(newStart);

    const existsUI = day.slots.some(
      (s) => s.startTime === newStart && s.endTime === newEnd
    );

    const dayMap = {
      Sunday: 0,
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
    };

    const existsDB = existingSlots.some(
      (s) =>
        s.dayOfWeek === dayMap[day.day] &&
        s.startTime === newStart
    );

    if (existsUI || existsDB) return;

    day.slots.push({
      startTime: newStart,
      endTime: newEnd,
    });

    setAvailability(updated);
  };

  // ---------------- REMOVE SLOT ----------------
  const handleRemoveSlot = (dayIndex, slotIndex) => {
    const updated = [...availability];
    updated[dayIndex].slots.splice(slotIndex, 1);
    setAvailability(updated);
  };

  // ---------------- SAVE ----------------
  const handleSaveAvailability = async () => {
    try {
      setLoading(true);

      // Helper function to generate slots between two times
      const generateSlotsBetween = (startTime, endTime, slotDuration) => {
        const slots = [];
        const [startHour, startMin] = startTime.split(":").map(Number);
        const [endHour, endMin] = endTime.split(":").map(Number);

        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;

        for (let minutes = startMinutes; minutes < endMinutes; minutes += slotDuration) {
          const hour = Math.floor(minutes / 60);
          const min = minutes % 60;
          const nextMinutes = minutes + slotDuration;
          const nextHour = Math.floor(nextMinutes / 60);
          const nextMin = nextMinutes % 60;

          slots.push({
            startTime: `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`,
            endTime: `${String(nextHour).padStart(2, "0")}:${String(nextMin).padStart(2, "0")}`,
          });
        }

        return slots;
      };

      const payload = availability
        .filter((d) => d.isSelected)
        .map((d) => {
          // If slots were manually selected, use them; otherwise generate from time range
          const slots = d.slots && d.slots.length > 0
            ? d.slots
            : generateSlotsBetween(d.startTime, d.endTime, duration);

          return {
            dayOfWeek: d.day,
            slots: slots,
          };
        });

      console.log(`📤 Sending availability payload:`, JSON.stringify(payload, null, 2));

      await API.post("/availability", {
        availabilities: payload,
        duration,
      });

      setMessage("✅ Availability saved successfully!");

      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (err) {
      console.error(err);
      setMessage(
        err.response?.data?.message || "❌ Failed to save availability"
      );
    } finally {
      setLoading(false);
    }
  };

  const timeSlots = generateTimeSlots();

  // ================= UI (RESTORED TAILWIND) =================
  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-4xl mx-auto">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-white my-2">
            Great! Now let's set your availability
          </h1>
          <p className="text-gray-400 sm:text-md">
            Let your audience know when you're available. You can edit this later
          </p>
        </div>

        {/* DURATION */}
        <div className="bg-[#0f0f11] border border-amber-400/20 rounded-lg p-6 mb-8">
          <div>
            <label className="block text-white font-semibold mb-4 text-lg">
              Session Duration (minutes)
            </label>

            <div className="flex items-center gap-4 mb-3">
              <input
                type="number"
                min="15"
                max="480"
                step="15"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) || 60)}
                className="w-32 bg-black border border-amber-400/30 text-white px-4 py-2 rounded focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 font-semibold"
              />
              <span className="text-gray-400">
                (Each slot will be exactly {duration} minutes)
              </span>
            </div>
            <div>
              <button
                onClick={async () => {
                  try {
                    await API.patch("/user/session-duration", { sessionDuration: duration });
                    setMessage("✅ Session duration saved!");
                    setTimeout(() => setMessage(""), 3000);
                  } catch (err) {
                    setMessage("❌ Failed to save duration");
                    console.error(err);
                  }
                }}
                className="ml-auto px-4 py-2 mb-3 bg-amber-400 text-black font-semibold rounded hover:bg-amber-500 transition"
              >
                Save Duration
              </button>
            </div>
          </div>

          <p className="text-xs text-gray-500">
            💡 Tip: 9:00 AM auto becomes 10:00 AM
          </p>
        </div>

        {/* DAYS */}
        <div className="space-y-4">
          {availability.map((day, index) => (
            <div
              key={index}
              className="bg-[#0f0f11] border border-amber-400/20 rounded-lg p-6 hover:border-amber-400/40 transition-colors"
            >
              {/* DAY HEADER */}
              <div className="flex items-center gap-4 mb-4">
                <input
                  type="checkbox"
                  checked={day.isSelected}
                  onChange={() => handleDayToggle(index)}
                  className="w-5 h-5 accent-amber-400 cursor-pointer"
                />

                <span className="text-white font-semibold text-lg w-24">
                  {day.day}
                </span>

                {!day.isSelected && (
                  <span className="text-gray-500 ml-auto italic">
                    Unavailable
                  </span>
                )}
              </div>

              {/* TIME SECTION */}
              {day.isSelected && (
                <div className="space-y-4">

                  <div className="flex items-end gap-4 flex-wrap">

                    {/* FROM */}
                    <div className="flex flex-col">
                      <label className="text-gray-300 text-sm mb-2">
                        From:
                      </label>

                      <select
                        value={day.startTime}
                        onChange={(e) =>
                          handleStartTimeChange(index, e.target.value)
                        }
                        className="bg-black border border-amber-400/30 text-white px-4 py-2 rounded"
                      >
                        {timeSlots.map((slot) => (
                          <option key={slot} value={slot}>
                            {slot}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* TO */}
                    <div className="flex flex-col">
                      <label className="text-gray-300 text-sm mb-2">
                        To:
                      </label>

                      <input
                        type="text"
                        value={day.endTime}
                        disabled
                        className="bg-gray-900/50 border border-amber-400/20 text-gray-400 px-4 py-2 rounded w-20 text-center"
                      />
                    </div>

                    {/* ADD */}
                    <button
                      onClick={() => handleAddSlot(index)}
                      className="mt-5 bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/30 rounded p-2.5"
                    >
                      <Plus size={20} />
                    </button>
                  </div>

                  {/* SLOTS */}
                  {day.slots?.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-amber-400/20 space-y-2">
                      {day.slots.map((slot, i) => (
                        <div
                          key={i}
                          className="flex justify-between items-center bg-amber-400/5 p-3 rounded border border-amber-400/10"
                        >
                          <span className="text-gray-300">
                            {slot.startTime} - {slot.endTime}
                          </span>

                          <button
                            onClick={() => handleRemoveSlot(index, i)}
                            className="text-red-400"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* SAVE */}
        <button
          onClick={handleSaveAvailability}
          disabled={loading}
          className="mt-8 w-full bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold py-3 rounded-lg"
        >
          {loading ? "Saving..." : "Save Availability"}
        </button>

        {/* MESSAGE */}
        {message && (
          <div className="mt-4 text-center text-white">
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default SetAvailability;