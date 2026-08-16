import express from "express";
import { addHistory, getPatientHistory } from "../Controllers/medicalHistoryController.js";

const router = express.Router();

router.post("/add", addHistory);
router.get("/patient/:patientId", getPatientHistory);

export default router;
