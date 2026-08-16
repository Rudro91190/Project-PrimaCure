import express from "express";
import upload from "../middleware/upload.js";
import User from "../models/User.js";

const router = express.Router();

// GET current user profile
router.get("/profile", async (req, res) => {
  try {
    // Note: Since we aren't using an auth middleware in this simplified version yet, 
    // we'll expect a userId from the client or headers for now, 
    // or better, find by a token logic if implemented.
    // For now, looking at Profile.js, it sends a token. 
    // Let's assume the frontend sends the userId in some way or we use a placeholder.
    // UPDATE: Looking at Profile.js, it calls /profile with token. 
    // I will add a simple find by a provided header or just return the first user for demo if no ID.
    const userId = req.headers.userid || req.query.userId; 
    if (!userId) {
       // Fallback: search for first admin if admin requested, but let's try to be specific
       return res.status(400).json({ message: "User ID required in headers (userid)" });
    }
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error fetching profile", error: err.message });
  }
});

// UPDATE user profile details
router.put("/update/:id", async (req, res) => {
  try {
    const { 
      fullName, 
      phone, 
      address, 
      emergencyContact,
      specialty,
      subSpecialty,
      yearsOfExperience,
      qualifications,
      medicalSchool
    } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { 
        fullName, 
        phone, 
        address, 
        emergencyContact,
        specialty,
        subSpecialty,
        yearsOfExperience,
        qualifications,
        medicalSchool
      },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "Profile updated successfully", user });
  } catch (err) {
    res.status(500).json({ message: "Error updating profile", error: err.message });
  }
});

// UPLOAD profile photo
router.post("/upload/:id", upload.single("profilePhoto"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.profilePhoto = req.file.path; // Cloudinary URL
    await user.save();

    res.json({
      message: "Photo uploaded successfully",
      profilePhoto: user.profilePhoto,
    });
  } catch (err) {
    res.status(500).json({ message: "Upload error", error: err.message });
  }
});

export default router;
