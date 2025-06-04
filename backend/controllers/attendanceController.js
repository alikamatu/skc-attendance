const pool = require("../config/db");
const fs = require("fs");
const { format } = require("fast-csv");
const path = require("path");
const { recordAttendance, getAttendance } = require("../models/attendanceModel");
const { Parser } = require("json2csv"); 
const PDFDocument = require("pdfkit");


const formatTime = (timestamp) => {
    if (!timestamp) return "N/A"; // Handle NULL values
    const date = new Date(timestamp);
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12; // Convert 0 to 12-hour format
    return `${hours}:${minutes} ${ampm}`;
};

const exportAttendancePDF = async (req, res) => {
    const { start, end, session, branch, format = "DD MMM YYYY" } = req.query;

    if (!start || !end) {
        return res.status(400).json({ message: "Start and end dates are required" });
    }

    try {
        let dateFormatSQL = format === "MM/DD/YYYY" ? "MM/DD/YYYY" : "DD Mon YYYY";

        let query = `
            SELECT a.id, s.name AS student_name, 
            TO_CHAR(a.date, '${dateFormatSQL}') AS date,
            TO_CHAR(a.signed_in_at, 'HH12:MI AM') AS signed_in_at,
            TO_CHAR(a.signed_out_at, 'HH12:MI AM') AS signed_out_at,
            a.status, s.session, s.branch
            FROM attendance a 
            JOIN students s ON a.student_id = s.id
            WHERE a.date BETWEEN $1 AND $2
        `;

        const values = [start, end];
        if (session) {
            query += " AND s.session = $3";
            values.push(session);
        }

        if (branch) {
            query += session ? " AND branch = $4" : " AND branch = $3";
            values.push(branch);
          }

        query += " ORDER BY a.date ASC";
        const { rows } = await pool.query(query, values);

        if (!rows.length) {
            return res.status(404).json({ message: "No attendance records found." });
        }

        const exportPath = path.join(__dirname, "/tmp");
        if (!fs.existsSync(exportPath)) {
            fs.mkdirSync(exportPath, { recursive: true });
        }

        const filePath = path.join(exportPath, "attendance_report.pdf");
        const doc = new PDFDocument({ margin: 30 });
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        doc.font("Helvetica-Bold").fontSize(18).text("Attendance Report", { align: "center" }).moveDown(1);
        doc.font("Helvetica").fontSize(12).text(`From: ${start} To: ${end}`, { align: "center" }).moveDown(2);

        const tableTop = doc.y;
        const colWidths = [65, 80, 65, 65, 65, 65, 65, 65]; // Column widths
        const rowHeight = 20;

        const drawTableRow = (y, columns, isHeader = false) => {
            doc.font(isHeader ? "Helvetica-Bold" : "Helvetica").fontSize(10);
            let x = 10;
            columns.forEach((text, i) => {
                doc.text(text, x, y, { width: colWidths[i], align: "center" });
                x += colWidths[i];
            });
        };

        doc.rect(30, tableTop, colWidths.reduce((a, b) => a + b, 0), rowHeight).stroke("#000");
        drawTableRow(tableTop + 7, ["ID", "Student", "Date", "Sign In", "Sign Out", "Status", "Session", "Branch"], true);

        let y = tableTop + rowHeight;
        rows.forEach((record) => {
            doc.rect(30, y, colWidths.reduce((a, b) => a + b, 0), rowHeight).stroke();
            drawTableRow(y + 7, [
                record.id.toString(),
                record.student_name,
                record.date,
                record.signed_in_at || "N/A",
                record.signed_out_at || "N/A",
                record.status,
                record.session || "N/A",
                record.branch || "N/A",
            ]);
            y += rowHeight;
        });

        doc.end();

        stream.on("finish", () => {
            res.download(filePath, "attendance_report.pdf", (err) => {
                if (err) console.error("Error sending PDF:", err);
                fs.unlinkSync(filePath);
            });
        });
    } catch (error) {
        console.error("Error exporting PDF:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


const getAttendanceHistory = async (req, res) => {
  const { start, end, session, branch, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  if (!start || !end) {
      return res.status(400).json({ message: "Start and end dates are required" });
  }

  try {
      let query = `
          SELECT a.id, s.name AS student_name, a.date, a.signed_in_at, a.signed_out_at, a.status, s.session, s.branch
          FROM attendance a 
          JOIN students s ON a.student_id = s.id
          WHERE a.date BETWEEN $1::DATE AND $2::DATE
      `;

      const values = [start, end];

      if (session) {
          query += " AND s.session = $3::TEXT";
          values.push(session);
      }

      if (branch) {
        query += session ? " AND branch = $4" : " AND branch = $3";
        values.push(branch);
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
    const { start, end, session, branch } = req.query;

    if (!start || !end) {
        return res.status(400).json({ message: "Start and end dates are required" });
    }

    try {
        let query = `
            SELECT a.id, s.name AS student_name, a.date, a.signed_in_at, a.signed_out_at, a.status, s.session, s.branch
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
    try {
        const { student_id, name, action, comment } = req.body; // <-- accept comment

        if (!student_id || !name || !action) {
            return res.status(400).json({ error: "Missing student_id, name, or action" });
        }

        if (action === "sign-in") {
            await pool.query(
                "INSERT INTO attendance (student_id, date, status, signed_in_at, name) VALUES ($1, CURRENT_DATE, 'present', NOW(), $2)",
                [student_id, name]
            );
        } else if (action === "sign-out") {
            await pool.query(
                `UPDATE attendance 
                 SET signed_out_at = NOW(), comment = $2
                 WHERE id = (
                     SELECT id 
                     FROM attendance 
                     WHERE student_id = $1 AND signed_out_at IS NULL 
                     ORDER BY signed_in_at DESC 
                     LIMIT 1
                 )`,
                [student_id, comment] // <-- pass comment as $2
            );
        }

        res.json({ success: true });
    } catch (error) {
        console.error("Database Insert/Update Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = { postAttendance, getAttendanceHistory, exportAttendanceCSV, exportAttendancePDF };
