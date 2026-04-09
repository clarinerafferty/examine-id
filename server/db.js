const mysql = require("mysql2");
const dotenv = require("dotenv");

dotenv.config();

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
});

// Log one startup probe, but let the pool reconnect lazily for later requests.
db.getConnection((err, connection) => {
  if (err) {
    console.error("Database pool startup check failed:", err);
    return;
  }

  console.log("Connected to MySQL database");
  connection.release();
});

module.exports = db;
