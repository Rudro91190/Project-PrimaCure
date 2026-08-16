import express from "express";
import mongoose from "mongoose";
import cors from "cors";

// ✅ Routes
import doctorRoutes from "./routes/doctorRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import consultationRoutes from "./routes/consultationRoutes.js";

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ API Routes
app.use("/api/doctors", doctorRoutes); // Doctor search & filter
app.use("/api/users", userRoutes); // User profile, upload, etc.
app.use("/api/auth", authRoutes); // Authentication
app.use("/api/consultations", consultationRoutes); // Online consultations

// ✅ Serve uploaded images
app.use("/uploads", express.static("uploads"));

// ✅ Test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

export default app;
