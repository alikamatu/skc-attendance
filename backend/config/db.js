require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

pool.connect()
  .then(client => {
    console.log('✅ Connected to PostgreSQL');
    return client.query('SELECT NOW()').then(res => {
      console.log('⏱️ Current time:', res.rows[0].now);
      client.release();
    });
  })
  .catch(err => console.error('❌ Connection error:', err.message));

module.exports = pool;
