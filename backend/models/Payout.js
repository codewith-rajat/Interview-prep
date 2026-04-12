import mongoose from "mongoose";

const payoutSchema = new mongoose.Schema(
  {
    interviewer: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    credits: {type: Number, required: true},
    platformFee: {type: Number, required: true}, // 20% of credits converted to USD
    netAmount: {type: Number, required: true}, // 80% after platform fee
    paymentMethod: {type: String, enum: ["PAYPAL", "BANK"], required: true},
    paymentDetail: {type: String, required: true}, // email or bank account
    status: {type: String, enum: ["PROCESSING", "APPROVED", "REJECTED", "COMPLETED"], default: "PROCESSING"},
    
    // Admin notes
    adminNotes: String,
    approvedBy: {type: mongoose.Schema.Types.ObjectId, ref: "User"}, // Admin who approved
    approvedAt: Date,
    
    // Timestamps
    requestedAt: {type: Date, default: Date.now},
  },
  { timestamps: true }
);

// Index for performance
payoutSchema.index({ interviewer: 1, status: 1 });
payoutSchema.index({ status: 1 });
payoutSchema.index({ requestedAt: -1 });

export default mongoose.model("Payout", payoutSchema);
