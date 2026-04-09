const express = require("express");
const router = express.Router();
const db = require("../db");

// GET benchmark rows with optional category/period filters
router.get("/", (req, res) => {
  const { category_id, period_id } = req.query;

  const conditions = [];
  const values = [];

  if (category_id) {
    conditions.push("cb.category_id = ?");
    values.push(category_id);
  }

  if (period_id) {
    conditions.push("cb.period_id = ?");
    values.push(period_id);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const sql = `
    SELECT
      cb.benchmark_id,
      cb.category_id,
      ac.category_name,
      ac.icon_name,
      cb.period_id,
      rp.year,
      rp.month,
      rp.month_name,
      rp.label AS reporting_label,
      cb.benchmark_type,
      cb.benchmark_value,
      cb.source_name,
      cb.source_url,
      cb.last_updated
    FROM categorybenchmark cb
    JOIN allowancecategory ac ON cb.category_id = ac.category_id
    JOIN reportingperiod rp ON cb.period_id = rp.period_id
    ${whereClause}
    ORDER BY rp.year DESC, rp.month DESC, ac.display_order ASC
  `;

  db.query(sql, values, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to fetch benchmarks" });
    }

    res.json(results);
  });
});

module.exports = router;
