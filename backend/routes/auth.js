
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import * as authController from "../Controllers/authController.js";
import * as doctorController from "../Controllers/DoctorController.js";

const router = express.Router();

// List all doctors (for appointment booking)
router.get('/doctors', async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' }, 'fullName specialty _id averageRating totalReviews');
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching doctors', error: err.message });
  }
});

// Search doctors
router.get('/doctors/search', doctorController.searchDoctors);

// Registration Route
router.post('/register', async (req, res) => {
  try {
    const {
      email,
      password,
      role,
      fullName,
      phone,
      gender,
      dateOfBirth,
      specialty,
      subSpecialty,
      yearsOfExperience,
      qualifications,
      medicalSchool,
      confirmPassword
    } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: 'Email, password, and role are required.' });
    }
    if (!['doctor', 'patient', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid user role.' });
    }
    if (role === 'doctor') {
      if (!fullName || !phone || !gender || !specialty) {
        return res.status(400).json({ message: 'All visible doctor fields are required.' });
      }
      if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match.' });
      }
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const userData = { email, password: hashedPassword, role };
    if (role === 'doctor') {
      Object.assign(userData, {
        fullName,
        phone,
        gender,
        dateOfBirth,
        specialty,
        subSpecialty,
        yearsOfExperience,
        qualifications,
        medicalSchool
      });
    }
    const user = new User(userData);
    await user.save();
    res.status(201).json({ message: 'Registration successful.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    res.json({ token, role: user.role, user: { _id: user._id, role: user.role, fullName: user.fullName, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

router.post('/forgot-password', authController.forgotPassword);
router.put('/reset-password/:token', authController.resetPassword);

// Change Password (logged in)
router.put('/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword, userId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Current password incorrect" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
