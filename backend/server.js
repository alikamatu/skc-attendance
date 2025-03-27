require("dotenv").config();
const express = require("express");
const cors = require("cors");
const attendanceRoutes = require("./routes/attendanceRoutes");

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

app.use("/api/attendance", attendanceRoutes);

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
