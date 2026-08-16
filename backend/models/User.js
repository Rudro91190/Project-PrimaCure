import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  // 🔹 Common fields
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },

  password: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    enum: ["doctor", "patient", "admin"],
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  // 🔐 Password Reset Fields ✅ NEW
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpire: {
    type: Date,
  },

  // 🔹 Basic Profile Info
  fullName: { type: String },
  phone: { type: String },
  address: { type: String },
  gender: { type: String, enum: ["Male", "Female", "Other"] },
  dateOfBirth: { type: Date },
  age: { type: Number },
  bloodGroup: { type: String },

  // 🔹 Emergency Contact
  emergencyContact: {
    name: { type: String },
    phone: { type: String },
    relation: { type: String },
  },

  // 🔹 Profile Photo
  profilePhoto: {
    type: String,
    default: "",
  },

  // 🔹 Doctor-specific fields
  specialty: { type: String },
  subSpecialty: { type: String },
  yearsOfExperience: { type: Number },
  qualifications: { type: String },
  medicalSchool: { type: String },
  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  totalReviews: { type: Number, default: 0 },
});

export default mongoose.model("User", userSchema);
