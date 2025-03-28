const pool = require("../config/db");

const { recordAttendance, getAttendance } = require("../models/attendanceModel");

const { Parser } = require("json2csv"); 

const getAttendanceHistory = async (req, res) => {
    const { start, end, session, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    if (!start || !end) {
        return res.status(400).json({ message: "Start and end dates are required" });
    }

    try {
        let query = `
            SELECT a.id, s.name AS student_name, a.date, a.signed_in_at, a.signed_out_at, a.status, s.session
            FROM attendance a 
            JOIN students s ON a.student_id = s.id
            WHERE a.date BETWEEN $1 AND $2
        `;

        const values = [start, end];

        if (session) {
            query += " AND s.session = $3";
            values.push(session);
        }

        query += " ORDER BY a.date ASC LIMIT $4 OFFSET $5";
        values.push(limit, offset);

        const { rows } = await pool.query(query, values);
        res.json(rows);
    } catch (error) {
        console.error("Error fetching attendance:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const exportAttendanceCSV = async (req, res) => {
  const { start, end, session } = req.query;

  if (!start || !end) {
      return res.status(400).json({ message: "Start and end dates are required" });
  }

  try {
      let query = `
          SELECT a.id, s.name AS student_name, a.date, a.signed_in_at, a.signed_out_at, a.status, s.session
          FROM attendance a 
          JOIN students s ON a.student_id = s.id
          WHERE a.date BETWEEN $1 AND $2
      `;

      const values = [start, end];

      if (session) {
          query += " AND s.session = $3";
          values.push(session);
      }

      query += " ORDER BY a.date ASC";

      const { rows } = await pool.query(query, values);

      if (rows.length === 0) {
          return res.status(404).json({ message: "No attendance records found" });
      }

      // Convert to CSV
      const json2csvParser = new Parser({ fields: ["id", "student_name", "date", "signed_in_at", "signed_out_at", "status", "session"] });
      const csv = json2csvParser.parse(rows);

      res.header("Content-Type", "text/csv");
      res.attachment("attendance_report.csv");
      res.send(csv);
  } catch (error) {
      console.error("Error exporting CSV:", error);
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

module.exports = { postAttendance, getAttendanceHistory, exportAttendanceCSV };
