const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { getAdminByUsername } = require("../models/adminModel");

const loginAdmin = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }

  try {
    const admin = await getAdminByUsername(username);
    if (!admin) return res.status(401).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: admin.id, username: admin.username }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token });
  } catch (error) {
    console.error("❌ Error:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { loginAdmin };
