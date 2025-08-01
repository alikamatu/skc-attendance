const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { loginAdmin, registerAdmin, addStudent, getStudent, removeStudent, getAttendanceReport, getAttendanceStats, changePassword, getTodayAttendance } = require("../controllers/adminController");


router.post("/login", loginAdmin);
router.post("/register", registerAdmin);
router.post("/students", addStudent);  
router.post("/students/fetch", getStudent);  
router.delete("/students/:id", removeStudent);  
router.get("/attendance/report", getAttendanceReport); 
router.get("/attendance/stats", getAttendanceStats); 
router.get("/attendance/today", getTodayAttendance); 
router.get("/stats", async (req, res) => {
  try {
    const totalStudents = await pool.query("SELECT COUNT(*) FROM students");
    const totalSignIns = await pool.query("SELECT COUNT(*) FROM attendance WHERE signed_in_at IS NOT NULL");
    const totalSignOuts = await pool.query("SELECT COUNT(*) FROM attendance WHERE signed_out_at IS NOT NULL");
    const presentToday = await pool.query(
      "SELECT COUNT(*) FROM attendance WHERE date = CURRENT_DATE AND signed_in_at IS NOT NULL AND signed_out_at IS NULL"
    );

    const morning = await pool.query(
      "SELECT COUNT(*) FROM attendance WHERE EXTRACT(HOUR FROM signed_in_at) BETWEEN 6 AND 12"
    );
    const afternoon = await pool.query(
      "SELECT COUNT(*) FROM attendance WHERE EXTRACT(HOUR FROM signed_in_at) BETWEEN 12 AND 18"
    );
    const summer = await pool.query(
      "SELECT COUNT(*) FROM attendance WHERE EXTRACT(HOUR FROM signed_in_at) BETWEEN 18 AND 24"
    );

    res.json({
      totalStudents: parseInt(totalStudents.rows[0].count),
      totalSignIns: parseInt(totalSignIns.rows[0].count),
      totalSignOuts: parseInt(totalSignOuts.rows[0].count),
      presentToday: parseInt(presentToday.rows[0].count),
      sessionDistribution: {
        morning: parseInt(morning.rows[0].count),
        afternoon: parseInt(afternoon.rows[0].count),
        summer: parseInt(summer.rows[0].count),
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
router.post("/change-password", changePassword);  

module.exports = router;
