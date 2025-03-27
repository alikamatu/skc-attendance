const { recordAttendance, getAttendance } = require("../models/attendanceModel");

const postAttendance = async (req, res) => {
  const { name, status } = req.body;
  if (!name || !status) {
    return res.status(400).json({ error: "Name and status are required" });
  }

  try {
    await recordAttendance(name, status);
    res.status(201).json({ message: "Attendance recorded successfully" });
  } catch (error) {
    console.error("❌ Database error:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getAttendanceHistory = async (req, res) => {
  try {
    const records = await getAttendance();
    res.status(200).json(records);
  } catch (error) {
    console.error("❌ Fetch error:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { postAttendance, getAttendanceHistory };
