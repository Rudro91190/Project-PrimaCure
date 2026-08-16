const User = require("../models/User");

// ✅ Update Profile (REPLACED LOGIC ONLY)
const updateProfile = async (req, res) => {
  try {
    console.log("🔥 UPDATE ROUTE HIT");

    // 👇 ADD THIS LINE HERE
    console.log("USER ID:", req.params.id);
    console.log("REQ PARAMS:", req.params);  // 👈 ADD HERE
    console.log("REQ BODY:", req.body); 
    req.body.name = req.body.fullName;     // 👈 ADD HERE
    const userId = req.params.id;
    if (!userId) {
        return res.status(400).json({ message: "Invalid user ID" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      req.body,
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ success: true, updatedUser });

  } catch (err) {
    console.log("ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// ✅ Upload Profile Photo (UNCHANGED)
const uploadPhoto = async (req, res) => {
  try {
    console.log("🔥 UPLOAD ROUTE HIT");
    console.log("PARAMS:", req.params);
    console.log("FILE:", req.file);
    const userId = req.params.id;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { profilePhoto: req.file.path },
      { new: true }
    );

    res.json({ success: true, user });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  updateProfile,
  uploadPhoto,
};