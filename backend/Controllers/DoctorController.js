import User from "../models/User.js";

// 🔍 Search + Filter Doctors
const searchDoctors = async (req, res) => {
  try {
    const { name, specialty, availability } = req.query;

    // ✅ Base query (only doctors)
    let query = {
      role: "doctor",
    };

    // 🔍 Search by full name (case-insensitive)
    if (name) {
      query.fullName = { $regex: name, $options: "i" };
    }

    // 🩺 Filter by specialty
    if (specialty) {
      query.specialty = specialty;
    }

    // 🟢 Filter by availability
    if (availability !== undefined) {
      query.availability = availability === "true";
    }

    const doctors = await User.find(query);

    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export { searchDoctors };