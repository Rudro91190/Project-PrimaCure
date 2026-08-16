import mongoose from "mongoose";

const medicalHistorySchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  disease: {
    type: String,
    required: true,
  },
  treatment: {
    type: String,
  },
  surgery: {
    type: String,
  },
  allergies: {
    type: String,
  },
  notes: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

export default mongoose.model("MedicalHistory", medicalHistorySchema);
