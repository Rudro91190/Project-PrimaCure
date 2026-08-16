const express = require("express");
const router = express.Router();
console.log("Auth routes loaded");

const {
  register,
  login,
  forgotPassword,
  resetPassword,
} = require("../Controllers/authController");

// ================= AUTH ROUTES =================
router.post("/register", register);
router.post("/login", login);

// 🔁 Forgot Password
router.post("/forgot-password", forgotPassword);

// 🔁 Reset Password
router.put("/reset-password/:token", resetPassword);

module.exports = router;