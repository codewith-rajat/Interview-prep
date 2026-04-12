import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {type: String,required: true},
    email: {type: String,required: true,unique: true},
    password: {type: String,required: true},
    role: {type: String,enum: ["admin", "interviewer", "interviewee"],required: true},
    // ===== Profile Fields =====

    isStudent: {type: Boolean,default: null},
    university: String,
    graduationYear: Number,
    branch: String,
    workingAt: String,
    yearsOfExperience: Number,
    skills: {type: [String],set: function (skills) {return skills.map(s => s.trim().toLowerCase());},required: true},
    bio: String,
    profileCompleted: {type: Boolean,default: false},
    // Interviewer Stats
    totalSessions: {type: Number,default: 0},
    rating: {type: Number,default: 0},
    
    // ===== Credit & Payment System =====
    creditBalance: {type: Number,default: 0},
    totalEarned: {type: Number,default: 0},
    
    // ===== Interviewer Specific =====
    title: String, // e.g., "Senior Software Engineer"
    company: String,
    yearsExp: Number,
    categories: {type: [String],default: []}, // e.g., ["FRONTEND", "BACKEND"]
    
    // ===== Payment Methods =====
    paymentMethods: [{
      type: {type: String, enum: ["PAYPAL", "BANK"]},
      detail: String, // email or bank account
      isDefault: Boolean
    }]
  },
  { timestamps: true }
);
userSchema.pre("save", async function () {

  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 10);
});
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);