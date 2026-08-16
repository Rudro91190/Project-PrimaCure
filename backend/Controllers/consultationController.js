import OnlineConsultation from "../models/OnlineConsultation.js";
import User from "../models/User.js";

// ================= REQUEST ONLINE CONSULTATION =================
export const requestConsultation = async (req, res) => {
  try {
    const {
      patientId,
      doctorId,
      symptoms,
      medicalHistory,
      consultationType,
      preferredDate,
      preferredTime,
    } = req.body;

    // Validate required fields
    if (
      !patientId ||
      !doctorId ||
      !symptoms ||
      !preferredDate ||
      !preferredTime
    ) {
      return res.status(400).json({
        message:
          "Please provide all required fields: patientId, doctorId, symptoms, preferredDate, preferredTime",
      });
    }

    // Verify both patient and doctor exist
    const patient = await User.findById(patientId);
    const doctor = await User.findById(doctorId);

    if (!patient || !doctor) {
      return res.status(404).json({ message: "Patient or Doctor not found" });
    }

    if (doctor.role !== "doctor") {
      return res.status(400).json({ message: "Selected user is not a doctor" });
    }

    // Create consultation request
    const consultation = new OnlineConsultation({
      patient: patientId,
      doctor: doctorId,
      symptoms,
      medicalHistory,
      consultationType: consultationType || "video",
      preferredDate: new Date(preferredDate),
      preferredTime,
    });

    await consultation.save();

    // Populate references before sending response
    await consultation.populate("patient", "fullName email phone");
    await consultation.populate("doctor", "fullName specialty email");

    res.status(201).json({
      message: "Consultation request submitted successfully",
      consultation,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error requesting consultation",
      error: err.message,
    });
  }
};

// ================= GET ALL CONSULTATION REQUESTS FOR A PATIENT =================
export const getPatientConsultations = async (req, res) => {
  try {
    const { patientId } = req.params;

    const consultations = await OnlineConsultation.find({ patient: patientId })
      .populate("doctor", "fullName specialty profilePicture email phone")
      .sort({ createdAt: -1 });

    res.json(consultations);
  } catch (err) {
    res.status(500).json({
      message: "Error fetching consultations",
      error: err.message,
    });
  }
};

// ================= GET ALL PENDING CONSULTATION REQUESTS FOR A DOCTOR =================
export const getDoctorConsultationRequests = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const consultations = await OnlineConsultation.find({
      doctor: doctorId,
      status: { $in: ["pending", "accepted"] },
    })
      .populate("patient", "fullName email phone address")
      .sort({ createdAt: -1 });

    res.json(consultations);
  } catch (err) {
    res.status(500).json({
      message: "Error fetching consultation requests",
      error: err.message,
    });
  }
};

// ================= ACCEPT CONSULTATION REQUEST (Doctor) =================
export const acceptConsultation = async (req, res) => {
  try {
    const { consultationId } = req.params;
    const { consultationLink } = req.body;

    const consultation = await OnlineConsultation.findById(consultationId);

    if (!consultation) {
      return res.status(404).json({ message: "Consultation not found" });
    }

    if (consultation.status !== "pending") {
      return res.status(400).json({
        message: `Cannot accept consultation with status: ${consultation.status}`,
      });
    }

    consultation.status = "accepted";
    if (consultationLink) {
      consultation.consultationLink = consultationLink;
    }

    await consultation.save();

    await consultation.populate("patient", "fullName email phone");
    await consultation.populate("doctor", "fullName specialty email");

    res.json({
      message: "Consultation request accepted",
      consultation,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error accepting consultation",
      error: err.message,
    });
  }
};

// ================= REJECT CONSULTATION REQUEST (Doctor) =================
export const rejectConsultation = async (req, res) => {
  try {
    const { consultationId } = req.params;
    const { rejectionReason } = req.body;

    const consultation = await OnlineConsultation.findById(consultationId);

    if (!consultation) {
      return res.status(404).json({ message: "Consultation not found" });
    }

    if (consultation.status !== "pending") {
      return res.status(400).json({
        message: `Cannot reject consultation with status: ${consultation.status}`,
      });
    }

    consultation.status = "rejected";
    consultation.rejectionReason = rejectionReason || "No reason provided";

    await consultation.save();

    await consultation.populate("patient", "fullName email phone");
    await consultation.populate("doctor", "fullName specialty email");

    res.json({
      message: "Consultation request rejected",
      consultation,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error rejecting consultation",
      error: err.message,
    });
  }
};

// ================= MARK CONSULTATION AS COMPLETED (Doctor) =================
export const completeConsultation = async (req, res) => {
  try {
    const { consultationId } = req.params;
    const { notes } = req.body;

    const consultation = await OnlineConsultation.findById(consultationId);

    if (!consultation) {
      return res.status(404).json({ message: "Consultation not found" });
    }

    if (consultation.status !== "accepted") {
      return res.status(400).json({
        message: `Can only complete accepted consultations. Current status: ${consultation.status}`,
      });
    }

    consultation.status = "completed";
    if (notes) {
      consultation.notes = notes;
    }

    await consultation.save();

    await consultation.populate("patient", "fullName email phone");
    await consultation.populate("doctor", "fullName specialty email");

    res.json({
      message: "Consultation marked as completed",
      consultation,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error completing consultation",
      error: err.message,
    });
  }
};

// ================= CANCEL CONSULTATION (Patient or Doctor) =================
export const cancelConsultation = async (req, res) => {
  try {
    const { consultationId } = req.params;

    const consultation = await OnlineConsultation.findById(consultationId);

    if (!consultation) {
      return res.status(404).json({ message: "Consultation not found" });
    }

    if (
      consultation.status === "completed" ||
      consultation.status === "cancelled"
    ) {
      return res.status(400).json({
        message: `Cannot cancel consultation with status: ${consultation.status}`,
      });
    }

    consultation.status = "cancelled";

    await consultation.save();

    await consultation.populate("patient", "fullName email phone");
    await consultation.populate("doctor", "fullName specialty email");

    res.json({
      message: "Consultation cancelled",
      consultation,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error cancelling consultation",
      error: err.message,
    });
  }
};

// ================= GET SINGLE CONSULTATION =================
export const getConsultationById = async (req, res) => {
  try {
    const { consultationId } = req.params;

    const consultation = await OnlineConsultation.findById(consultationId)
      .populate("patient", "fullName email phone address")
      .populate("doctor", "fullName specialty email phone profilePicture");

    if (!consultation) {
      return res.status(404).json({ message: "Consultation not found" });
    }

    res.json(consultation);
  } catch (err) {
    res.status(500).json({
      message: "Error fetching consultation",
      error: err.message,
    });
  }
};

// ================= GET ALL CONSULTATION HISTORY FOR A PATIENT =================
export const getPatientConsultationHistory = async (req, res) => {
  try {
    const { patientId } = req.params;

    const consultations = await OnlineConsultation.find({
      patient: patientId,
      status: { $in: ["completed", "cancelled", "rejected"] },
    })
      .populate("doctor", "fullName specialty email")
      .sort({ createdAt: -1 });

    res.json(consultations);
  } catch (err) {
    res.status(500).json({
      message: "Error fetching consultation history",
      error: err.message,
    });
  }
};
