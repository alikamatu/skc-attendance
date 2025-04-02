const express = require("express");
const { addStudent, getStudent, removeStudent, getAttendanceReport, getAttendanceStats, getStudentsBySession, getTodayAttendance } = require("../controllers/adminController");

const router = express.Router();

router.post("/students", addStudent);  
router.get("/students/fetch", getStudent);  
router.delete("/students/:id", removeStudent);  
router.get("/attendance/report", getAttendanceReport); 
router.get("/attendance/stats", getAttendanceStats); 
router.get("/attendance/today", getTodayAttendance); 
router.get("/students/students-by-session", getStudentsBySession); 

module.exports = router;
