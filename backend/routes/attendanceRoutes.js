const express = require("express");
const { postAttendance, getAttendanceHistory, exportAttendanceCSV, exportAttendancePDF } = require("../controllers/attendanceController");

const router = express.Router();

router.post("/", postAttendance);   // Sign in / Sign out
router.get("/", getAttendanceHistory); // Fetch all records
router.get("/attendance/export", exportAttendanceCSV);
router.get("/export/pdf", exportAttendancePDF);

module.exports = router;
