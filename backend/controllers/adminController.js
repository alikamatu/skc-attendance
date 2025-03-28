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

const addStudent = async (req, res) => {
    const { name } = req.body;
  
    try {
      const newStudent = await pool.query(
        "INSERT INTO students (name) VALUES ($1) RETURNING *",
        [name]
      );
      res.status(201).json(newStudent.rows[0]);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  };
  
  // 🔹 Remove a student  
  const removeStudent = async (req, res) => {
    const { id } = req.params;
  
    try {
      await pool.query("DELETE FROM students WHERE id = $1", [id]);
      res.status(200).json({ message: "Student removed" });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  };
  
  // 🔹 Generate attendance report  
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
  
  // 🔹 Get Attendance Stats  
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


module.exports = { loginAdmin, registerAdmin, addStudent, removeStudent, getAttendanceReport, getAttendanceStats };
