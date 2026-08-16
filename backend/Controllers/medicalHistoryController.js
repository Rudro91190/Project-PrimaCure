import MedicalHistory from "../models/MedicalHistory.js";

export const addHistory = async (req, res) => {
  try {
    const { patientId, doctorId, disease, treatment, surgery, allergies, notes } = req.body;
    
    const newHistory = new MedicalHistory({
      patientId,
      doctorId,
      disease,
      treatment,
      surgery,
      allergies,
      notes,
    });
    
    await newHistory.save();
    res.status(201).json({ message: "Medical history added successfully", data: newHistory });
  } catch (error) {
    res.status(500).json({ message: "Failed to add medical history", error: error.message });
  }
};

export const getPatientHistory = async (req, res) => {
  try {
    const { patientId } = req.params;
    const history = await MedicalHistory.find({ patientId }).populate("doctorId", "fullName specialty").sort({ date: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve history", error: error.message });
  }
};
