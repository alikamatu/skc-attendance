const express = require("express");
const { postAttendance, getAttendanceHistory } = require("../controllers/attendanceController");

const router = express.Router();

router.post("/", postAttendance);   // Sign in / Sign out
router.get("/", getAttendanceHistory); // Fetch all records

module.exports = router;
