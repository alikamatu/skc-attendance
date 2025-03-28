const pool = require("../config/db");

const getAdminByUsername = async (username) => {
  const res = await pool.query("SELECT * FROM admins WHERE username = $1", [username]);
  return res.rows[0];
};

module.exports = { getAdminByUsername };
