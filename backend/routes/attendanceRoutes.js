const express = require("express");
const { postAttendance, getAttendanceHistory, getAttendance } = require("../controllers/attendanceController");

const router = express.Router();

router.post("/", postAttendance);   // Sign in / Sign out
router.get("/", getAttendanceHistory); // Fetch all records
router.get("/fetch", getAttendance); // Fetch all records

module.exports = router;
