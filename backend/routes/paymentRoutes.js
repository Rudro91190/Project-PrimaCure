import express from "express";
import * as paymentController from "../Controllers/paymentController.js";

const router = express.Router();

router.post("/create", paymentController.createPayment);
router.post("/process", paymentController.processPayment);
router.get("/patient/:patientId", paymentController.getPatientPayments);

// Admin Routes
router.get("/all", paymentController.getAllPayments);
router.put("/update/:paymentId", paymentController.updatePaymentStatus);

export default router;
