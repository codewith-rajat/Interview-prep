import mongoose from "mongoose";

const availabilitySchema = new mongoose.Schema(
  {
    interviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: ["recurring", "custom"],
      default: "recurring",
    },

    dayOfWeek: {
      type: Number, // 0 = Sunday
      default: null,
    },

    date: {
      type: Date,
      default: null,
    },

    slots: [
      {
        startTime: { type: String, required: true },
        endTime: { type: String, required: true },
        isBooked: { type: Boolean, default: false },
        bookedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "InterviewSession",
          default: null,
        },
      },
    ],

    slotDuration: {
      type: Number,
      default: 60,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Indexes (optional but useful)
availabilitySchema.index({ interviewer: 1, dayOfWeek: 1, type: 1 });
availabilitySchema.index({ interviewer: 1, date: 1, type: 1 });

export default mongoose.model("Availability", availabilitySchema);