import Report from "../models/Report.js";

export const uploadReport = async (req, res) => {
  try {
    const { patientId, doctorId, reportName } = req.body;
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const newReport = new Report({
      patientId,
      doctorId,
      reportName,
      fileUrl: req.file.path, // Cloudinary provides the URL in req.file.path
    });

    await newReport.save();
    res.status(201).json({ message: "Report uploaded successfully", data: newReport });
  } catch (error) {
    res.status(500).json({ message: "Failed to upload report", error: error.message });
  }
};

export const getPatientReports = async (req, res) => {
  try {
    const { patientId } = req.params;
    const reports = await Report.find({ patientId }).populate("doctorId", "fullName").sort({ date: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve reports", error: error.message });
  }
};
