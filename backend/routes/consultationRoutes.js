import express from "express";
import {
  requestConsultation,
  getPatientConsultations,
  getDoctorConsultationRequests,
  acceptConsultation,
  rejectConsultation,
  completeConsultation,
  cancelConsultation,
  getConsultationById,
  getPatientConsultationHistory,
} from "../Controllers/consultationController.js";

const router = express.Router();

// Patient routes
router.post("/request", requestConsultation);
router.get("/patient/:patientId", getPatientConsultations);
router.get("/patient/:patientId/history", getPatientConsultationHistory);
router.put("/:consultationId/cancel", cancelConsultation);

// Doctor routes
router.get("/doctor/:doctorId/requests", getDoctorConsultationRequests);
router.put("/:consultationId/accept", acceptConsultation);
router.put("/:consultationId/reject", rejectConsultation);
router.put("/:consultationId/complete", completeConsultation);

// Get consultation details
router.get("/:consultationId", getConsultationById);

export default router;
