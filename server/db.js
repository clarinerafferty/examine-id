const mysql = require("mysql2");
const dotenv = require("dotenv");

dotenv.config();

const useDbSsl =
  String(process.env.DB_SSL || "").trim().toLowerCase() === "true";

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  connectTimeout: 10000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  ...(useDbSsl ? { ssl: { rejectUnauthorized: false } } : {}),
});

// Probe once at boot for visibility, but keep serving so later requests can reconnect.
db.getConnection((err, connection) => {
  if (err) {
    console.error("Database pool startup check failed:", err.code || err.message);
    return;
  }

  console.log("Connected to MySQL database");
  connection.release();
});

module.exports = db;
