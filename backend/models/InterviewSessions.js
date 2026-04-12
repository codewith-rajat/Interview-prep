import mongoose from "mongoose";

const interviewSessionSchema = new mongoose.Schema(
  {
    interviewer: {type: mongoose.Schema.Types.ObjectId,ref: "User",required: true},
    interviewee: {type: mongoose.Schema.Types.ObjectId,ref: "User",required: true},
    scheduledAt: {type: Date,required: true},
    duration: {type: Number,default: 60},
    status: {type: String,enum: ["pending", "cancelled", "completed", "scheduled"],default: "pending"},
    
    // ===== Feedback & Ratings =====
    feedback: {
      summary: String,
      technical: String,
      communication: String,
      problemSolving: String,
      recommendation: String, // HIRE / CONSIDER / NO_HIRE
      strengths: [String],
      improvements: [String],
      overallRating: {type: String, enum: ["POOR", "AVERAGE", "GOOD", "EXCELLENT"]}, // AI rating
      sessionRating: {type: Number, min: 1, max: 5}, // User rating
      sessionComment: String
    },
    
    // ===== Recording & Media =====
    recordingUrl: String,
    recordingDuration: Number, // in seconds
    
    // ===== Chat & Messages =====
    chatMessages: [{
      sender: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
      message: String,
      timestamp: {type: Date, default: Date.now}
    }],
    
    // ===== Video Room =====
    roomId: {type: String},
    category: String, // FRONTEND, BACKEND, SYSTEM_DESIGN, etc.
    
    // ===== Credits & Payment =====
    creditsSpent: {type: Number, default: 0},
    creditsEarned: {type: Number, default: 0}
  },
  { timestamps: true }
);

// 🔥 CRITICAL: prevent double booking
interviewSessionSchema.index(
  { interviewer: 1, scheduledAt: 1 },
  { unique: true }
);

// ⚡ performance indexes
interviewSessionSchema.index({ interviewee: 1 });
interviewSessionSchema.index({ scheduledAt: 1 });
interviewSessionSchema.index({ status: 1 });

export default mongoose.model("InterviewSession", interviewSessionSchema);