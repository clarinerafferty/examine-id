CREATE DATABASE IF NOT EXISTS examineid
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE examineid;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS FeedbackResponse;
DROP TABLE IF EXISTS MPAllowanceRecord;
DROP TABLE IF EXISTS CategoryBenchmark;
DROP TABLE IF EXISTS MP;
DROP TABLE IF EXISTS ReportingPeriod;
DROP TABLE IF EXISTS AllowanceCategory;
DROP TABLE IF EXISTS Party;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE Party (
  party_id INT AUTO_INCREMENT PRIMARY KEY,
  party_name VARCHAR(255) NOT NULL,
  party_abbreviation VARCHAR(50) NOT NULL,
  party_logo TEXT
);

CREATE TABLE MP (
  mp_id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  display_name VARCHAR(255),
  party_id INT NOT NULL,
  mp_rank VARCHAR(50) NOT NULL,
  term_start DATE,
  term_end DATE,
  profile_image TEXT,
  status VARCHAR(50) DEFAULT 'Active',
  CONSTRAINT fk_mp_party
    FOREIGN KEY (party_id) REFERENCES Party(party_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
);

CREATE TABLE AllowanceCategory (
  category_id INT AUTO_INCREMENT PRIMARY KEY,
  category_name VARCHAR(255) NOT NULL,
  icon_name VARCHAR(100),
  description TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE ReportingPeriod (
  period_id INT AUTO_INCREMENT PRIMARY KEY,
  year INT NOT NULL,
  month INT NOT NULL,
  month_name VARCHAR(50) NOT NULL,
  start_date DATE,
  end_date DATE,
  label VARCHAR(100) NOT NULL,
  UNIQUE KEY uq_reporting_period_year_month (year, month)
);

CREATE TABLE CategoryBenchmark (
  benchmark_id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT NOT NULL,
  period_id INT NOT NULL,
  benchmark_type VARCHAR(100) NOT NULL,
  benchmark_value DECIMAL(14, 2) NOT NULL,
  source_name TEXT,
  source_url TEXT,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_benchmark_category
    FOREIGN KEY (category_id) REFERENCES AllowanceCategory(category_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT fk_benchmark_period
    FOREIGN KEY (period_id) REFERENCES ReportingPeriod(period_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  UNIQUE KEY uq_category_benchmark_period (category_id, period_id)
);

CREATE TABLE MPAllowanceRecord (
  allowance_record_id INT AUTO_INCREMENT PRIMARY KEY,
  mp_id INT NOT NULL,
  category_id INT NOT NULL,
  period_id INT NOT NULL,
  allowance_cap DECIMAL(14, 2) NOT NULL DEFAULT 0,
  actual_spend DECIMAL(14, 2) NOT NULL DEFAULT 0,
  variance_percent DECIMAL(8, 2) NOT NULL DEFAULT 0,
  variance_amount DECIMAL(14, 2) NOT NULL DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_allowance_mp
    FOREIGN KEY (mp_id) REFERENCES MP(mp_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT fk_allowance_category
    FOREIGN KEY (category_id) REFERENCES AllowanceCategory(category_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT fk_allowance_period
    FOREIGN KEY (period_id) REFERENCES ReportingPeriod(period_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  UNIQUE KEY uq_mp_category_period (mp_id, category_id, period_id)
);

CREATE TABLE FeedbackResponse (
  feedback_id INT AUTO_INCREMENT PRIMARY KEY,
  feedback_type VARCHAR(100) NOT NULL,
  mp_id INT NULL,
  category_id INT NULL,
  period_id INT NOT NULL,
  response_value VARCHAR(100) NOT NULL,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  session_hash VARCHAR(255) NOT NULL,
  source_page VARCHAR(255),
  CONSTRAINT fk_feedback_mp
    FOREIGN KEY (mp_id) REFERENCES MP(mp_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT fk_feedback_category
    FOREIGN KEY (category_id) REFERENCES AllowanceCategory(category_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT fk_feedback_period
    FOREIGN KEY (period_id) REFERENCES ReportingPeriod(period_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  KEY idx_feedback_lookup (feedback_type, period_id, session_hash, mp_id, category_id),
  KEY idx_feedback_mp_period (mp_id, period_id),
  KEY idx_feedback_category_period (category_id, period_id)
);
