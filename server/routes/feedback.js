const express = require("express");
const router = express.Router();
const db = require("../db");

// POST feedback for an MP, a category, or both within a reporting period
router.post("/", (req, res) => {
  const {
    feedback_type,
    mp_id = null,
    category_id = null,
    period_id,
    response_value,
    session_hash = null,
    source_page = null,
  } = req.body;

  if (!feedback_type || !period_id || !response_value) {
    return res.status(400).json({
      error: "feedback_type, period_id, and response_value are required",
    });
  }

  if (!session_hash) {
    return res.status(400).json({
      error: "session_hash is required for anonymous vote protection",
    });
  }

  if (!mp_id && !category_id) {
    return res.status(400).json({
      error: "At least one of mp_id or category_id must be provided",
    });
  }

  const findExistingSql = `
    SELECT feedback_id
    FROM FeedbackResponse
    WHERE feedback_type = ?
      AND period_id = ?
      AND session_hash = ?
      AND (
        (mp_id <=> ?)
        AND (category_id <=> ?)
      )
    LIMIT 1
  `;

  db.query(
    findExistingSql,
    [feedback_type, period_id, session_hash, mp_id, category_id],
    (findErr, existingResults) => {
      if (findErr) {
        console.error(findErr);
        return res.status(500).json({ error: "Failed to submit feedback" });
      }

      if (existingResults.length > 0) {
        res.set("Cache-Control", "no-store");
        return res.status(409).json({
          message: "Feedback already recorded for this browser and period",
          feedback_id: existingResults[0].feedback_id,
          action: "exists",
        });
      }

      const insertSql = `
        INSERT INTO FeedbackResponse (
          feedback_type,
          mp_id,
          category_id,
          period_id,
          response_value,
          session_hash,
          source_page
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      const insertValues = [
        feedback_type,
        mp_id,
        category_id,
        period_id,
        response_value,
        session_hash,
        source_page,
      ];

      db.query(insertSql, insertValues, (insertErr, result) => {
        if (insertErr) {
          console.error(insertErr);
          return res.status(500).json({ error: "Failed to submit feedback" });
        }

        res.set("Cache-Control", "no-store");
        res.status(201).json({
          message: "Feedback submitted successfully",
          feedback_id: result.insertId,
          action: "created",
        });
      });
    }
  );
});

// GET feedback, optionally filtered by mp, category, or reporting period
router.get("/", (req, res) => {
  const { mp_id, category_id, period_id } = req.query;

  const conditions = [];
  const values = [];

  if (mp_id) {
    conditions.push("fr.mp_id = ?");
    values.push(mp_id);
  }

  if (category_id) {
    conditions.push("fr.category_id = ?");
    values.push(category_id);
  }

  if (period_id) {
    conditions.push("fr.period_id = ?");
    values.push(period_id);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const sql = `
    SELECT
      fr.feedback_id,
      fr.feedback_type,
      fr.mp_id,
      m.full_name AS mp_name,
      fr.category_id,
      ac.category_name,
      fr.period_id,
      rp.label AS reporting_label,
      fr.response_value,
      fr.submitted_at,
      fr.session_hash,
      fr.source_page
    FROM FeedbackResponse fr
    LEFT JOIN MP m ON fr.mp_id = m.mp_id
    LEFT JOIN AllowanceCategory ac ON fr.category_id = ac.category_id
    JOIN ReportingPeriod rp ON fr.period_id = rp.period_id
    ${whereClause}
    ORDER BY fr.submitted_at DESC
  `;

  db.query(sql, values, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to fetch feedback" });
    }

    res.set("Cache-Control", "no-store");
    res.json(results);
  });
});

module.exports = router;
