import express from "express";
import * as prescriptionController from "../Controllers/prescriptionController.js";

const router = express.Router();

router.post("/create", prescriptionController.createPrescription);
router.put("/update/:id", prescriptionController.updatePrescription);
router.get("/doctor/:doctorId", prescriptionController.getDoctorPrescriptions);
router.get("/patient/:patientId", prescriptionController.getPatientPrescriptions);
router.get("/patients", prescriptionController.getAllPatients);

export default router;
