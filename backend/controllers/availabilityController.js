import Availability from "../models/Availability.js";
import InterviewSession from "../models/InterviewSessions.js";
import BookedSlots from "../models/BookedSlots.js";
import generateSlots from "../utils/generateSlots.js";

const dayMap = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

// ✅ SET RECURRING AVAILABILITY (Bulk - Multiple Days)
export const setAvailability = async (req, res) => {
  try {
    const userId = req.user.id;
    const { availabilities, duration = 60 } = req.body;

    console.log(`Setting availability for user: ${userId}`);
    console.log(`Payload:`, JSON.stringify({ availabilities, duration }, null, 2));

    if (!Array.isArray(availabilities) || availabilities.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Availabilities must be a non-empty array",
      });
    }

    // Delete old availability for this user
    await Availability.deleteMany({ interviewer: userId, type: "recurring" });

    // Create new availability for each day
    const docs = availabilities.map((day) => {
      const dayOfWeek = dayMap[day.dayOfWeek];
      
      if (dayOfWeek === undefined) {
        throw new Error(`Invalid day: ${day.dayOfWeek}`);
      }

      if (!day.slots || day.slots.length === 0) {
        throw new Error(`Slots required for ${day.dayOfWeek}`);
      }

      const validatedSlots = day.slots.map((slot) => {
        if (!slot.startTime || !slot.endTime) {
          throw new Error("Invalid slot format");
        }

        if (slot.startTime >= slot.endTime) {
          throw new Error("Start time must be before end time");
        }

        return {
          startTime: slot.startTime,
          endTime: slot.endTime,
          isBooked: false,
          bookedBy: null,
        };
      });

      return {
        interviewer: userId,
        type: "recurring",
        dayOfWeek: dayOfWeek,
        slots: validatedSlots,
        slotDuration: duration,
        isActive: true,
      };
    });

    // Insert all at once
    const saved = await Availability.insertMany(docs);

    console.log(`✅ Saved ${saved.length} availability records`);
    saved.forEach((record, idx) => {
      console.log(`  Record ${idx + 1}: dayOfWeek=${record.dayOfWeek}, slots=${record.slots.length}, type=${record.type}`);
    });

    res.status(200).json({
      success: true,
      message: "Availability saved",
      data: saved,
    });
  } catch (error) {
    console.error("❌ setAvailability error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Γ£à SET CUSTOM AVAILABILITY (Specific Date with Time Slots)
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

// Γ£à GET ALL AVAILABILITIES (Both Recurring and Custom)
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

// Γ£à DELETE AVAILABILITY
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

// Γ£à GET AVAILABLE SLOTS (DATE-WISE ≡ƒöÑ)
export const getAvailableSlots = async (req, res) => {
  try {
    const { interviewerId, date } = req.query;

    if (!interviewerId || !date) {
      return res.status(400).json({ message: "Missing fields" });
    }

    // Parse date correctly in local timezone
    const [year, month, day] = date.split("-").map(Number);
    const queryDate = new Date(year, month - 1, day, 0, 0, 0, 0);

    const dayOfWeek = queryDate.getDay();

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
      
      // Convert time strings to slot objects with startTime and endTime
      generated.forEach((timeStr, idx) => {
        const [hours, minutes] = timeStr.split(":").map(Number);
        const startDate = new Date();
        startDate.setHours(hours, minutes, 0, 0);
        
        const endDate = new Date(startDate);
        endDate.setMinutes(endDate.getMinutes() + availability.slotDuration);
        
        allSlots.push({
          startTime: timeStr,
          endTime: endDate.toTimeString().slice(0, 5)
        });
      });
    });

    // Create date range for booking check (start and end of day in local timezone)
    const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
    const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);

    console.log(`🔍 Checking BookedSlots for interviewer=${interviewerId}, date=${startOfDay.toDateString()}`);

    // ✅ Use BookedSlots instead of InterviewSession to track booked times
    const bookedSlots = await BookedSlots.find({
      interviewer: interviewerId,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    console.log(`📍 Found ${bookedSlots.length} booked slots for this date`);
    bookedSlots.forEach(bs => {
      console.log(`   - ${bs.startTime} to ${bs.endTime}`);
    });

    const bookedStartTimes = bookedSlots.map(bs => bs.startTime);

    const availableSlots = allSlots.filter(
      slot => !bookedStartTimes.includes(slot.startTime)
    );

    console.log(`✅ Returning ${availableSlots.length} available slots out of ${allSlots.length}`);

    res.json({
      success: true,
      data: availableSlots
    });

  } catch (error) {
    console.error(`❌ Error in getAvailableSlots:`, error);
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
};  
