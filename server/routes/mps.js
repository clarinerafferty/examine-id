const express = require("express");
const router = express.Router();
const db = require("../db");

// GET all MPs with their party details
router.get("/", (req, res) => {
  const sql = `
    SELECT
      m.mp_id,
      m.full_name,
      m.display_name,
      m.mp_rank,
      m.term_start,
      m.term_end,
      m.profile_image,
      m.status,
      p.party_id,
      p.party_name,
      p.party_abbreviation,
      p.party_logo
    FROM mp m
    JOIN party p ON m.party_id = p.party_id
    ORDER BY m.full_name ASC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to fetch MPs" });
    }

    res.json(results);
  });
});

// GET allowance and benchmark comparison for a single MP
router.get("/:id/allowances", (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT
      mar.allowance_record_id,
      mar.mp_id,
      mar.category_id,
      mar.period_id,
      ac.category_name,
      ac.icon_name,
      rp.year,
      rp.month,
      rp.month_name,
      rp.label AS reporting_label,
      mar.allowance_cap,
      mar.actual_spend,
      mar.variance_percent,
      mar.variance_amount,
      cb.benchmark_type,
      cb.benchmark_value,
      cb.source_name,
      cb.source_url,
      mar.last_updated
    FROM mpallowancerecord mar
    JOIN allowancecategory ac ON mar.category_id = ac.category_id
    JOIN reportingperiod rp ON mar.period_id = rp.period_id
    LEFT JOIN categorybenchmark cb
      ON cb.category_id = mar.category_id
      AND cb.period_id = mar.period_id
    WHERE mar.mp_id = ?
    ORDER BY rp.year DESC, rp.month DESC, ac.display_order ASC
  `;

  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to fetch allowance data" });
    }

    res.json(results);
  });
});

// GET a single MP with summary totals
router.get("/:id", (req, res) => {
  const { id } = req.params;

  const mpSql = `
    SELECT
      m.mp_id,
      m.full_name,
      m.display_name,
      m.mp_rank,
      m.term_start,
      m.term_end,
      m.profile_image,
      m.status,
      p.party_id,
      p.party_name,
      p.party_abbreviation,
      p.party_logo
    FROM mp m
    JOIN party p ON m.party_id = p.party_id
    WHERE m.mp_id = ?
  `;

  const totalsSql = `
    SELECT
      COUNT(*) AS record_count,
      COALESCE(SUM(actual_spend), 0) AS total_actual_spend,
      COALESCE(SUM(allowance_cap), 0) AS total_allowance_cap,
      COALESCE(AVG(variance_percent), 0) AS average_variance_percent
    FROM mpallowancerecord
    WHERE mp_id = ?
  `;

  db.query(mpSql, [id], (mpErr, mpResults) => {
    if (mpErr) {
      console.error(mpErr);
      return res.status(500).json({ error: "Failed to fetch MP" });
    }

    if (mpResults.length === 0) {
      return res.status(404).json({ error: "MP not found" });
    }

    db.query(totalsSql, [id], (totalsErr, totalsResults) => {
      if (totalsErr) {
        console.error(totalsErr);
        return res.status(500).json({ error: "Failed to fetch MP summary" });
      }

      res.json({
        ...mpResults[0],
        summary: totalsResults[0],
      });
    });
  });
});

module.exports = router;
