const express = require("express");
const router = express.Router();
const db = require("../db");

// GET allowance records with optional mp/category/period filters
router.get("/", (req, res) => {
  const { mp_id, category_id, period_id } = req.query;

  const conditions = [];
  const values = [];

  if (mp_id) {
    conditions.push("mar.mp_id = ?");
    values.push(mp_id);
  }

  if (category_id) {
    conditions.push("mar.category_id = ?");
    values.push(category_id);
  }

  if (period_id) {
    conditions.push("mar.period_id = ?");
    values.push(period_id);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const sql = `
    SELECT
      mar.allowance_record_id,
      mar.mp_id,
      m.full_name AS mp_name,
      m.display_name,
      m.mp_rank,
      mar.category_id,
      ac.category_name,
      ac.icon_name,
      mar.period_id,
      rp.year,
      rp.month,
      rp.month_name,
      rp.label AS reporting_label,
      mar.allowance_cap,
      mar.actual_spend,
      mar.variance_percent,
      mar.variance_amount,
      mar.last_updated
    FROM mpallowancerecord mar
    JOIN mp m ON mar.mp_id = m.mp_id
    JOIN allowancecategory ac ON mar.category_id = ac.category_id
    JOIN reportingperiod rp ON mar.period_id = rp.period_id
    ${whereClause}
    ORDER BY rp.year DESC, rp.month DESC, m.full_name ASC, ac.display_order ASC
  `;

  db.query(sql, values, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to fetch allowance records" });
    }

    res.json(results);
  });
});

module.exports = router;
