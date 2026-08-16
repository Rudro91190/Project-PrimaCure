import express from "express";
import { searchDoctors } from "../Controllers/DoctorController.js";

const router = express.Router();

// 🔍 Search + Filter
router.get("/search", searchDoctors);

export default router;