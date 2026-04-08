const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
  })
);
app.use(express.json());

const mpRoutes = require("./routes/mps");
const categoryRoutes = require("./routes/categories");
const allowanceRoutes = require("./routes/allowances");
const benchmarkRoutes = require("./routes/benchmarks");
const feedbackRoutes = require("./routes/feedback");

app.use("/api/mps", mpRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/allowances", allowanceRoutes);
app.use("/api/benchmarks", benchmarkRoutes);
app.use("/api/feedback", feedbackRoutes);

app.get("/", (req, res) => {
  res.send("Examine.ID backend is running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
