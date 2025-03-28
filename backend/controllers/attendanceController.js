const pool = require("../config/db");
const fs = require("fs");
const { format } = require("fast-csv");
const path = require("path");
const { recordAttendance, getAttendance } = require("../models/attendanceModel");
const { Parser } = require("json2csv"); 
const PDFDocument = require("pdfkit");


const exportAttendancePDF = async (req, res) => {
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

      if (!rows.length) {
          return res.status(404).json({ message: "No attendance records found." });
      }

      // ✅ Ensure the 'exports' directory exists
      const exportPath = path.join(__dirname, "../exports");
      if (!fs.existsSync(exportPath)) {
          fs.mkdirSync(exportPath, { recursive: true });
      }

      const filePath = path.join(exportPath, "attendance_report.pdf");
      const doc = new PDFDocument();
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // PDF Header
      doc.fontSize(18).text("Attendance Report", { align: "center" }).moveDown(1);
      doc.fontSize(12).text(`From: ${start} To: ${end}`).moveDown(1);

      // Table Header
      doc.fontSize(10).text("ID  |  Student  |  Date  |  Sign In  |  Sign Out  |  Status", { underline: true }).moveDown(0.5);

      // Table Data
      rows.forEach((record) => {
          doc.text(
              `${record.id}  |  ${record.student_name}  |  ${record.date}  |  ${record.signed_in_at || "N/A"}  |  ${record.signed_out_at || "N/A"}  |  ${record.status}`,
              { continued: false }
          );
      });

      doc.end();

      stream.on("finish", () => {
          res.download(filePath, "attendance_report.pdf", (err) => {
              if (err) console.error("Error sending PDF:", err);
              fs.unlinkSync(filePath); // Delete file after sending
          });
      });
  } catch (error) {
      console.error("Error exporting PDF:", error);
      res.status(500).json({ message: "Internal Server Error" });
  }
};

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
          WHERE a.date BETWEEN $1::DATE AND $2::DATE
      `;

      const values = [start, end];

      if (session) {
          query += " AND s.session = $3::TEXT";
          values.push(session);
      }

      query += ` ORDER BY a.date ASC LIMIT $${values.length + 1}::INT OFFSET $${values.length + 2}::INT`;
      values.push(parseInt(limit), parseInt(offset));

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
            WHERE a.date BETWEEN $1::DATE AND $2::DATE
        `;

        const values = [start, end];

        if (session) {
            query += " AND s.session = $3::TEXT";
            values.push(session);
        }

        query += " ORDER BY a.date ASC";

        const { rows } = await pool.query(query, values);

        if (rows.length === 0) {
            return res.status(404).json({ message: "No attendance records found" });
        }

        // Define CSV file path
        const filePath = path.join(__dirname, `../../exports/attendance_${Date.now()}.csv`);
        const writableStream = fs.createWriteStream(filePath);

        // Write CSV header and data
        const csvStream = format({ headers: true });
        csvStream.pipe(writableStream);

        rows.forEach((row) => {
            csvStream.write({
                ID: row.id,
                Name: row.student_name,
                Session: row.session,
                Date: row.date,
                Signed_In: row.signed_in_at || "N/A",
                Signed_Out: row.signed_out_at || "N/A",
                Status: row.status
            });
        });

        csvStream.end();

        writableStream.on("finish", () => {
            res.download(filePath, `attendance_report_${start}_${end}.csv`, (err) => {
                if (err) console.error("Download Error:", err);
                fs.unlinkSync(filePath); // Delete file after download
            });
        });

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

module.exports = { postAttendance, getAttendanceHistory, exportAttendanceCSV, exportAttendancePDF };
