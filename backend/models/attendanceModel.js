const pool = require("../config/db");

const recordAttendance = async (name, status) => {
  const timestamp = new Date().toISOString();
  return await pool.query(
    "INSERT INTO attendance (name, status, timestamp) VALUES ($1, $2, $3)",
    [name, status, timestamp]
  );
};

const getAttendance = async () => {
  const result = await pool.query("SELECT * FROM attendance ORDER BY timestamp DESC");
  return result.rows;
};

module.exports = { recordAttendance, getAttendance };
