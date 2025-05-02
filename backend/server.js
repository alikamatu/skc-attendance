require("dotenv").config();
const express = require("express");
const cors = require("cors");
const attendanceRoutes = require("./routes/attendanceRoutes");
const adminRoutes = require("./routes/adminRoutes");
const studentRoutes = require("./routes/studentRoutes");

const app = express();
const port = process.env.PORT || 1000;

app.use(express.json());
const allowedOrigins = [
  "https://skc-attendance-uhlu.vercel.app", // Frontend origin
  "http://localhost:3000", // Local development frontend
  "https://skc-attendance-46dh.vercel.app" // Backend origin
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // If cookies or authentication are needed
  })
);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", studentRoutes);

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
