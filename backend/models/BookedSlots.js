import mongoose from "mongoose";

const bookedSlotsSchema = new mongoose.Schema(
  {
    interviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date, // Specific date (e.g., April 15, 2026)
      required: true,
    },
    startTime: {
      type: String, // e.g., "09:00"
      required: true,
    },
    endTime: {
      type: String, // e.g., "10:00"
      required: true,
    },
    interviewSession: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InterviewSession",
      required: true,
    },
  },
  { timestamps: true }
);

// Index to quickly find booked slots for a specific date and interviewer
bookedSlotsSchema.index({ interviewer: 1, date: 1 });
bookedSlotsSchema.index({ interviewer: 1, startTime: 1, date: 1 });

export default mongoose.model("BookedSlots", bookedSlotsSchema);
