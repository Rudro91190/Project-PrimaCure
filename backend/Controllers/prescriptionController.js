import Prescription from "../models/Prescription.js";
import Medicine from "../models/Medicine.js";

// Create a new prescription with medicines
export const createPrescription = async (req, res) => {
  try {
    const { patientId, doctorId, diagnosis, notes, medicines } = req.body;

    const prescription = new Prescription({
      patientId,
      doctorId,
      diagnosis,
      notes,
    });
    await prescription.save();

    if (medicines && medicines.length > 0) {
      const medicineDocs = medicines.map((m) => ({
        prescriptionId: prescription._id,
        medicineName: m.medicineName,
        dosage: m.dosage,
        time: m.time,
        duration: m.duration,
      }));
      await Medicine.insertMany(medicineDocs);
    }

    res.status(201).json({ message: "Prescription saved successfully", prescription });
  } catch (err) {
    res.status(500).json({ message: "Error saving prescription", error: err.message });
  }
};

// Update an existing prescription
export const updatePrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const { diagnosis, notes, medicines } = req.body;

    const prescription = await Prescription.findByIdAndUpdate(
      id,
      { diagnosis, notes },
      { new: true }
    );

    if (!prescription) return res.status(404).json({ message: "Prescription not found" });

    // Replace old medicines with new ones
    if (medicines) {
      await Medicine.deleteMany({ prescriptionId: id });
      if (medicines.length > 0) {
        const medicineDocs = medicines.map((m) => ({
          prescriptionId: id,
          medicineName: m.medicineName,
          dosage: m.dosage,
          time: m.time,
          duration: m.duration,
        }));
        await Medicine.insertMany(medicineDocs);
      }
    }

    res.json({ message: "Prescription updated successfully", prescription });
  } catch (err) {
    res.status(500).json({ message: "Error updating prescription", error: err.message });
  }
};

// Get all prescriptions for a doctor
export const getDoctorPrescriptions = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const prescriptions = await Prescription.find({ doctorId })
      .populate("patientId", "fullName email")
      .sort({ date: -1 });

    const prescriptionIds = prescriptions.map((p) => p._id);
    const medicines = await Medicine.find({ prescriptionId: { $in: prescriptionIds } });

    res.json({ prescriptions, medicines });
  } catch (err) {
    res.status(500).json({ message: "Error fetching doctor prescriptions", error: err.message });
  }
};

// Get all prescriptions for a patient
export const getPatientPrescriptions = async (req, res) => {
  try {
    const { patientId } = req.params;
    const prescriptions = await Prescription.find({ patientId })
      .populate("doctorId", "fullName specialty")
      .sort({ date: -1 });

    const prescriptionIds = prescriptions.map((p) => p._id);
    const medicines = await Medicine.find({ prescriptionId: { $in: prescriptionIds } });

    res.json({ prescriptions, medicines });
  } catch (err) {
    res.status(500).json({ message: "Error fetching patient prescriptions", error: err.message });
  }
};

import User from "../models/User.js";
// Helper to get all patients so doctors can select them
export const getAllPatients = async (req, res) => {
  try {
    const patients = await User.find({ role: "patient" }, "fullName email");
    res.json(patients);
  } catch (err) {
    res.status(500).json({ message: "Error fetching patients", error: err.message });
  }
};
