const express = require("express");
const router = express.Router();
const db = require("../db");

// GET all active allowance categories with totals
router.get("/", (req, res) => {
  const sql = `
    SELECT
      ac.category_id,
      ac.category_name,
      ac.icon_name,
      ac.description,
      ac.display_order,
      ac.is_active,
      COUNT(mar.allowance_record_id) AS allowance_record_count,
      COALESCE(SUM(mar.actual_spend), 0) AS total_actual_spend,
      COALESCE(SUM(mar.allowance_cap), 0) AS total_allowance_cap
    FROM allowancecategory ac
    LEFT JOIN mpallowancerecord mar ON ac.category_id = mar.category_id
    WHERE ac.is_active = TRUE
    GROUP BY
      ac.category_id,
      ac.category_name,
      ac.icon_name,
      ac.description,
      ac.display_order,
      ac.is_active
    ORDER BY ac.display_order ASC, ac.category_name ASC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to fetch categories" });
    }

    res.json(results);
  });
});

module.exports = router;
