import mongoose from "mongoose";

const onlineConsultationSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    symptoms: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    medicalHistory: {
      type: String,
      maxlength: 1000,
    },
    consultationType: {
      type: String,
      enum: ["video", "audio", "chat"],
      default: "video",
    },
    preferredDate: {
      type: Date,
      required: true,
    },
    preferredTime: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed", "cancelled"],
      default: "pending",
    },
    notes: {
      type: String,
      maxlength: 500,
    },
    consultationLink: {
      type: String,
    },
    rejectionReason: {
      type: String,
    },
  },
  { timestamps: true },
);

export default mongoose.model("OnlineConsultation", onlineConsultationSchema);
