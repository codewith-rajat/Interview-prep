import Availability from "../models/Availability.js";
import InterviewSession from "../models/InterviewSessions.js";
import generateSlots from "../utils/generateSlots.js";

// ✅ SET RECURRING AVAILABILITY (Day of Week)
export const setAvailability = async (req, res) => {
  try {
    const { dayOfWeek, slots, slotDuration } = req.body;

    const data = await Availability.findOneAndUpdate(
      { interviewer: req.user.id, dayOfWeek, type: "recurring" },
      {
        interviewer: req.user.id,
        dayOfWeek,
        type: "recurring",
        slots,
        slotDuration,
        isActive: true
      },
      { upsert: true, new: true }
    );

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ SET CUSTOM AVAILABILITY (Specific Date with Time Slots)
export const setCustomAvailability = async (req, res) => {
  try {
    const { date, slots, slotDuration } = req.body;

    if (!date || !slots || slots.length === 0) {
      return res.status(400).json({ message: "Date and slots are required" });
    }

    // Convert date string to Date object (start of day)
    const availabilityDate = new Date(date);
    availabilityDate.setHours(0, 0, 0, 0);

    const data = await Availability.findOneAndUpdate(
      { 
        interviewer: req.user.id, 
        date: availabilityDate,
        type: "custom"
      },
      {
        interviewer: req.user.id,
        date: availabilityDate,
        type: "custom",
        slots,
        slotDuration: slotDuration || 60,
        isActive: true
      },
      { upsert: true, new: true }
    );

    res.json(data);
  } catch (error) {
    console.error("Error setting custom availability:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ GET ALL AVAILABILITIES (Both Recurring and Custom)
export const getAvailabilities = async (req, res) => {
  try {
    const availabilities = await Availability.find({
      interviewer: req.user.id,
      isActive: true
    }).sort({ type: 1, dayOfWeek: 1, date: -1 });

    res.json(availabilities);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ DELETE AVAILABILITY
export const deleteAvailability = async (req, res) => {
  try {
    const { availabilityId } = req.params;

    const availability = await Availability.findById(availabilityId);

    if (!availability) {
      return res.status(404).json({ message: "Availability not found" });
    }

    if (availability.interviewer.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await Availability.findByIdAndDelete(availabilityId);

    res.json({ message: "Availability deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ GET AVAILABLE SLOTS (DATE-WISE 🔥)
export const getAvailableSlots = async (req, res) => {
  try {
    const { interviewerId, date } = req.query;

    if (!interviewerId || !date) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const queryDate = new Date(date);
    queryDate.setHours(0, 0, 0, 0);

    const dayOfWeek = new Date(date).getDay();

    // Check for custom availability first
    let availability = await Availability.findOne({
      interviewer: interviewerId,
      date: queryDate,
      type: "custom",
      isActive: true
    });

    // If no custom availability, check recurring
    if (!availability) {
      availability = await Availability.findOne({
        interviewer: interviewerId,
        dayOfWeek,
        type: "recurring",
        isActive: true
      });
    }

    if (!availability) return res.json([]);

    let allSlots = [];

    availability.slots.forEach(slot => {
      const generated = generateSlots(
        slot.startTime,
        slot.endTime,
        availability.slotDuration
      );
      allSlots.push(...generated);
    });

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const bookings = await InterviewSession.find({
      interviewer: interviewerId,
      scheduledAt: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ["pending", "accepted"] }
    });

    const bookedTimes = bookings.map(b =>
      new Date(b.scheduledAt).toTimeString().slice(0, 5)
    );

    const availableSlots = allSlots.filter(
      s => !bookedTimes.includes(s)
    );

    res.json(availableSlots);

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};  