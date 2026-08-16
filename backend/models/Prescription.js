import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema({
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
  date: {
    type: Date,
    default: Date.now,
  },
  diagnosis: {
    type: String,
    required: true,
  },
  notes: {
    type: String,
  },
}, { timestamps: true });

export default mongoose.model("Prescription", prescriptionSchema);
