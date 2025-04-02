const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const pool = require("../config/db");
const { getAdminByUsername } = require("../models/adminModel");

const loginAdmin = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }

  try {
    const admin = await getAdminByUsername(username);
    if (!admin) return res.status(401).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: admin.id, username: admin.username }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token });
  } catch (error) {
    console.error("❌ Error:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


// 🔹 Register Admin
const registerAdmin = async (req, res) => {
  const { username, password } = req.body;

  try {
    // 🔸 Check if username exists
    const userExists = await pool.query("SELECT * FROM admins WHERE username = $1", [username]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // 🔸 Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 🔸 Insert new admin into DB
    const newUser = await pool.query(
      "INSERT INTO admins (username, password) VALUES ($1, $2) RETURNING *",
      [username, hashedPassword]
    );

    // 🔸 Generate JWT token
    const token = jwt.sign(
      { id: newUser.rows[0].id, username: newUser.rows[0].username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({ token, username: newUser.rows[0].username });
  } catch (error) {
    console.error("Registration error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};


const getStudent = async (req, res) => {
    try {
        const { session, page = 1, limit = 10 } = req.query; // Default pagination values
        const offset = (page - 1) * limit;
        let query = "SELECT * FROM students";
        let values = [];

        // Add filtering if session is provided
        if (session) {
            query += " WHERE session = $1";
            values.push(session);
        }

        // Add pagination (use correct index for parameters)
        if (values.length > 0) {
            query += " ORDER BY id ASC LIMIT $2 OFFSET $3";
            values.push(limit, offset);
        } else {
            query += " ORDER BY id ASC LIMIT $1 OFFSET $2";
            values.push(limit, offset);
        }

        console.log("Executing query:", query, "with values:", values);
        const result = await pool.query(query, values);
        res.json(result.rows);
    } catch (error) {
        console.error("❌ Error fetching students:", error);
        res.status(500).json({ message: "Server error" });
    }
};


const addStudent = async (req, res) => {
    try {
        const { name, session } = req.body;
        
        if (!name || !session) {
            return res.status(400).json({ message: "Name and session are required" });
        }

        const allowedSessions = ["morning", "afternoon", "evening"];
        const normalizedSession = session.toLowerCase(); // Convert to lowercase

        if (!allowedSessions.includes(normalizedSession)) {
            return res.status(400).json({ message: "Invalid session. Allowed values: morning, afternoon, evening" });
        }

        const query = "INSERT INTO students (name, session) VALUES ($1, $2) RETURNING *";
        const values = [name, normalizedSession];

        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("❌ Error adding student:", error);
        res.status(500).json({ message: "Server error" });
    }
};

  const removeStudent = async (req, res) => {
    const { id } = req.params;
  
    try {
      await pool.query("DELETE FROM students WHERE id = $1", [id]);
      res.status(200).json({ message: "Student removed" });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  };
  
  const getAttendanceReport = async (req, res) => {
    const { startDate, endDate } = req.query;
  
    try {
      const report = await pool.query(
        `SELECT s.name, a.date, a.status FROM attendance a
         JOIN students s ON a.student_id = s.id
         WHERE a.date BETWEEN $1 AND $2`,
        [startDate, endDate]
      );
      res.status(200).json(report.rows);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  };
  
  const getAttendanceStats = async (req, res) => {
    try {
      const stats = await pool.query(
        `SELECT s.name, COUNT(*) as total_present
         FROM attendance a
         JOIN students s ON a.student_id = s.id
         WHERE a.status = 'present'
         GROUP BY s.name`
      );
      res.status(200).json(stats.rows);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  };
  

  const changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const adminId = req.adminId; // Assume adminId is extracted from a JWT token
  
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: "Old and new passwords are required" });
    }
  
    try {
      const admin = await pool.query("SELECT password FROM admins WHERE id = $1", [adminId]);
      if (admin.rows.length === 0) {
        return res.status(404).json({ error: "Admin not found" });
      }
  
      const isMatch = await bcrypt.compare(oldPassword, admin.rows[0].password);
      if (!isMatch) {
        return res.status(400).json({ error: "Old password is incorrect" });
      }
  
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await pool.query("UPDATE admins SET password = $1 WHERE id = $2", [hashedPassword, adminId]);
      res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  const getStudentsBySession = async (req, res) => {
    const { session } = req.query;

    if (!session) {
        return res.status(400).json({ message: "Session is required" });
    }

    try {
        const query = `
            SELECT id, name, session
            FROM students
            WHERE session = $1
            ORDER BY name ASC
        `;
        const { rows } = await pool.query(query, [session]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "No students found for the specified session" });
        }

        res.json(rows);
    } catch (error) {
        console.error("Error fetching students by session:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = { loginAdmin, registerAdmin, addStudent, getStudent, removeStudent, getAttendanceReport, getAttendanceStats, changePassword, getStudentsBySession };
