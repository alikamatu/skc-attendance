const { recordAttendance, getAttendance } = require("../models/attendanceModel");

const getAttendanceHistory = async (req, res) => {
  const { start, end } = req.query;

  if (!start || !end) {
      return res.status(400).json({ message: "Start and end dates are required" });
  }

  try {
      const query = `
          SELECT a.id, s.name AS student_name, a.date, a.signed_in_at, a.signed_out_at, a.status 
          FROM attendance a 
          JOIN students s ON a.student_id = s.id
          WHERE a.date BETWEEN $1 AND $2
          ORDER BY a.date ASC
      `;

      const { rows } = await pool.query(query, [start, end]); // Pass parameters correctly
      res.json(rows);
  } catch (error) {
      console.error("Error fetching attendance:", error);
      res.status(500).json({ message: "Internal Server Error" });
  }
};


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

const sds = async (req, res) => {
  try {
    const records = await getAttendance();
    res.status(200).json(records);
  } catch (error) {
    console.error("❌ Fetch error:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { postAttendance, getAttendanceHistory };
