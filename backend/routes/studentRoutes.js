const express = require("express");
const { addStudent, getStudent, removeStudent, getAttendanceReport, getAttendanceStats } = require("../controllers/adminController");

const router = express.Router();

router.post("/students", addStudent);  
router.get("/students/fetch", getStudent);  
router.delete("/students/:id", removeStudent);  
router.get("/attendance/report", getAttendanceReport); 
router.get("/attendance/stats", getAttendanceStats); 

module.exports = router;
