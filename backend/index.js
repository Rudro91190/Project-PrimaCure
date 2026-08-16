import "./loadEnv.js";

import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import authRoutes from "./routes/auth.js";
import appointmentRoutes from "./routes/appointment.js";
import consultationRoutes from "./routes/consultationRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import prescriptionRoutes from "./routes/prescriptionRoutes.js";
import medicalHistoryRoutes from "./routes/medicalHistoryRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import medicineRoutes from "./routes/medicineRoutes.js";
import supplierRoutes from "./routes/supplierRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "PrimaCure API is running successfully!" });
});

app.use("/api/auth", authRoutes);

app.use("/api/appointments", appointmentRoutes);

app.use("/api/consultations", consultationRoutes);

app.use("/api/payments", paymentRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/medical-history", medicalHistoryRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/catalog", medicineRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/users", userRoutes);
app.use("/api/doctors", doctorRoutes);

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error("MongoDB connection error:", err));
