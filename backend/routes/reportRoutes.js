import express from "express";
import reportUpload from "../middleware/reportUpload.js";
import { uploadReport, getPatientReports } from "../Controllers/reportController.js";

const router = express.Router();

router.post("/upload", reportUpload.single("reportFile"), uploadReport);
router.get("/patient/:patientId", getPatientReports);

export default router;
