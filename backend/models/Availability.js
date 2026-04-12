import mongoose from "mongoose";

const availabilitySchema = new mongoose.Schema(
  {
    interviewer: {type: mongoose.Schema.Types.ObjectId,ref: "User",required: true},
    // Support both recurring (dayOfWeek) and custom (specific dates)
    type: {type: String, enum: ["recurring", "custom"], default: "recurring"},
    dayOfWeek: {type: Number, // 0 = Sunday, 6 = Saturday (for recurring only)
      default: null
    },
    date: {type: Date, default: null}, // specific date for custom availability
    slots: [
      {
        startTime: {type: String, required: true},
        endTime: {type: String, required: true},
        isBooked: {type: Boolean, default: false},
        bookedBy: {type: mongoose.Schema.Types.ObjectId, ref: "InterviewSession", default: null}
      }
    ],
    slotDuration: {type: Number, default: 60},
    isActive: {type: Boolean, default: true}
  },
  { timestamps: true }
);

// Prevent duplicate availability for same day (recurring)
availabilitySchema.index(
  { interviewer: 1, dayOfWeek: 1, type: 1 },
  { unique: false, sparse: true }
);

// Prevent duplicate for same specific date (custom)
availabilitySchema.index(
  { interviewer: 1, date: 1, type: 1 },
  { unique: false, sparse: true }
);

export default mongoose.model("Availability", availabilitySchema);