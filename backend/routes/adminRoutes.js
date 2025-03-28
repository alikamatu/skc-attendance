const express = require("express");
const { loginAdmin, registerAdmin, addStudent, getStudent, removeStudent, getAttendanceReport, getAttendanceStats } = require("../controllers/adminController");

const router = express.Router();
router.post("/login", loginAdmin);
router.post("/register", registerAdmin);

router.post("/students", addStudent);  
router.post("/students/fetch", getStudent);  
router.delete("/students/:id", removeStudent);  
router.get("/attendance/report", getAttendanceReport); 
router.get("/attendance/stats", getAttendanceStats); 

module.exports = router;
