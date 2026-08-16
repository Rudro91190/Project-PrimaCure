const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  specialty: {
    type: String,
    required: true,
  },
  availability: {
    type: Boolean,
    default: true, // true = available
  },
  experience: Number,
  hospital: String,
}, { timestamps: true });

module.exports = mongoose.model("Doctor", doctorSchema);