USE examineid;

-- Reset tables so the seed can be run multiple times during development.
SET FOREIGN_KEY_CHECKS = 0;
DELETE FROM FeedbackResponse;
DELETE FROM MPAllowanceRecord;
DELETE FROM CategoryBenchmark;
DELETE FROM MP;
DELETE FROM ReportingPeriod;
DELETE FROM AllowanceCategory;
DELETE FROM Party;
ALTER TABLE FeedbackResponse AUTO_INCREMENT = 1;
ALTER TABLE MPAllowanceRecord AUTO_INCREMENT = 1;
ALTER TABLE CategoryBenchmark AUTO_INCREMENT = 1;
ALTER TABLE MP AUTO_INCREMENT = 1;
ALTER TABLE ReportingPeriod AUTO_INCREMENT = 1;
ALTER TABLE AllowanceCategory AUTO_INCREMENT = 1;
ALTER TABLE Party AUTO_INCREMENT = 1;
SET FOREIGN_KEY_CHECKS = 1;

-- Real public identities are used here for a DKI Jakarta sample.
-- Spending and benchmark values below remain prototype/demo data unless source-verified.
INSERT INTO Party (party_id, party_name, party_abbreviation, party_logo) VALUES
(1, 'Partai Gerakan Indonesia Raya', 'Gerindra', 'https://commons.wikimedia.org/wiki/Special:FilePath/Partai_Gerindra_logo.jpg'),
(2, 'Partai Demokrasi Indonesia Perjuangan', 'PDIP', 'https://commons.wikimedia.org/wiki/Special:FilePath/COLLECTIE_TROPENMUSEUM_Vlag_van_de_Partai_Demokrasi_Indonesia_Perjuangan_TMnr_6195-1.jpg'),
(3, 'Partai Keadilan Sejahtera', 'PKS', 'https://commons.wikimedia.org/wiki/Special:FilePath/Partai_Keadilan_Sejahtera_2020.svg'),
(4, 'Partai Nasional Demokrat', 'NasDem', 'https://commons.wikimedia.org/wiki/Special:FilePath/Partai_NasDem.svg'),
(5, 'Partai Golongan Karya', 'Golkar', 'https://commons.wikimedia.org/wiki/Special:FilePath/Logo_Golkar.svg');

INSERT INTO MP (
  mp_id,
  full_name,
  display_name,
  party_id,
  mp_rank,
  term_start,
  term_end,
  profile_image,
  status
) VALUES
(1, 'Habiburokhman', 'Habiburokhman', 1, 'Head', '2024-10-01', '2029-09-30', 'https://commons.wikimedia.org/wiki/Special:FilePath/Habiburokhman_Anggota_Komisi_III_DPR.jpg', 'Active'),
(2, 'Putra Nababan', 'Putra Nababan', 2, 'Member', '2024-10-01', '2029-09-30', 'https://commons.wikimedia.org/wiki/Special:FilePath/Anggota_DPR_James_Parulian_Putra_Nababan.jpg', 'Active'),
(3, 'Himmatul Aliyah', 'Himmatul Aliyah', 1, 'Vice', '2024-10-01', '2029-09-30', 'https://commons.wikimedia.org/wiki/Special:FilePath/Hj._HIMMATUL_ALIYAH.jpg', 'Active'),
(4, 'Kurniasih Mufidayati', 'Kurniasih Mufidayati', 3, 'Head', '2024-10-01', '2029-09-30', 'https://commons.wikimedia.org/wiki/Special:FilePath/KPU_Kurniasih_Mufidayati.jpg', 'Active'),
(5, 'Charles Honoris', 'Charles Honoris', 2, 'Member', '2024-10-01', '2029-09-30', 'https://commons.wikimedia.org/wiki/Special:FilePath/Charles_Honoris_Wiki.jpg', 'Active'),
(6, 'Ahmad Sahroni', 'Ahmad Sahroni', 4, 'Member', '2024-10-01', '2029-09-30', 'https://commons.wikimedia.org/wiki/Special:FilePath/Ahmad_Sahroni.jpg', 'Active');

INSERT INTO AllowanceCategory (
  category_id,
  category_name,
  icon_name,
  description,
  display_order,
  is_active
) VALUES
(1, 'Travel and Accommodation', 'plane', 'Transport, lodging, and official travel costs claimed by MPs.', 1, TRUE),
(2, 'Constituency Office Operations', 'building-2', 'Office rental, utilities, and day-to-day constituency service costs.', 2, TRUE),
(3, 'Staff and Research Support', 'users', 'Research assistants, policy support, and administrative staffing costs.', 3, TRUE),
(4, 'Community Outreach', 'megaphone', 'Town halls, printed materials, and outreach event costs.', 4, TRUE),
(5, 'Digital Communications', 'smartphone', 'Website, social media, and digital publication spending.', 5, TRUE),
(6, 'Housing', 'house', 'Temporary accommodation, housing support, and residence-related claims associated with parliamentary duties.', 6, TRUE);

INSERT INTO ReportingPeriod (
  period_id,
  year,
  month,
  month_name,
  start_date,
  end_date,
  label
) VALUES
(1, 2026, 1, 'January', '2026-01-01', '2026-01-31', 'Jan 2026'),
(2, 2026, 2, 'February', '2026-02-01', '2026-02-28', 'Feb 2026'),
(3, 2026, 3, 'March', '2026-03-01', '2026-03-31', 'Mar 2026'),
(4, 2026, 4, 'April', '2026-04-01', '2026-04-30', 'Apr 2026');

INSERT INTO CategoryBenchmark (
  benchmark_id,
  category_id,
  period_id,
  benchmark_type,
  benchmark_value,
  source_name,
  source_url
) VALUES
-- These values remain seeded monthly proxy benchmarks.
-- The source fields now point to the real BPS publications selected for future extraction and validation.
(1, 1, 1, 'Median Monthly Spend', 47000000.00, 'BPS Health, Transportation, and Education Prices 2024 (transport proxy)', 'https://www.bps.go.id/en/publication/2025/04/28/ed4d29c5d13ba67371799c58/harga-konsumen-beberapa-barang-dan-jasa-kelompok-kesehatan--transportasi--dan-pendidikan-150-kabupaten-kota-di-indonesia-2024.html'),
(2, 2, 1, 'Median Monthly Spend', 30000000.00, 'BPS Housing, Water, Electricity, and Fuel Prices 2024 (office operations proxy)', 'https://www.bps.go.id/en/publication/2025/04/28/22904d2b5a04c6d27050846f/consumer-price-of-selected-goods-and-services-for-housing--water--electricity--and-household-fuel-group-of-150-regencies-municipalities-in-indonesia-2024.html'),
(3, 3, 1, 'Median Monthly Spend', 43000000.00, 'Prototype labour-cost proxy pending defensible wage dataset', 'https://www.bps.go.id/en/publication/2025/05/16/b64f5cbd615a353a2e1588b8/national-consumer-price-of-selected-goods-and-services-2024.html'),
(4, 4, 1, 'Median Monthly Spend', 18500000.00, 'BPS National Consumer Prices 2024 (outreach materials proxy)', 'https://www.bps.go.id/en/publication/2025/05/16/b64f5cbd615a353a2e1588b8/national-consumer-price-of-selected-goods-and-services-2024.html'),
(5, 5, 1, 'Median Monthly Spend', 12000000.00, 'BPS National Consumer Prices 2024 (digital communications proxy)', 'https://www.bps.go.id/en/publication/2025/05/16/b64f5cbd615a353a2e1588b8/national-consumer-price-of-selected-goods-and-services-2024.html'),
(6, 1, 2, 'Median Monthly Spend', 46500000.00, 'BPS Health, Transportation, and Education Prices 2024 (transport proxy)', 'https://www.bps.go.id/en/publication/2025/04/28/ed4d29c5d13ba67371799c58/harga-konsumen-beberapa-barang-dan-jasa-kelompok-kesehatan--transportasi--dan-pendidikan-150-kabupaten-kota-di-indonesia-2024.html'),
(7, 2, 2, 'Median Monthly Spend', 30500000.00, 'BPS Housing, Water, Electricity, and Fuel Prices 2024 (office operations proxy)', 'https://www.bps.go.id/en/publication/2025/04/28/22904d2b5a04c6d27050846f/consumer-price-of-selected-goods-and-services-for-housing--water--electricity--and-household-fuel-group-of-150-regencies-municipalities-in-indonesia-2024.html'),
(8, 3, 2, 'Median Monthly Spend', 43500000.00, 'Prototype labour-cost proxy pending defensible wage dataset', 'https://www.bps.go.id/en/publication/2025/05/16/b64f5cbd615a353a2e1588b8/national-consumer-price-of-selected-goods-and-services-2024.html'),
(9, 4, 2, 'Median Monthly Spend', 19000000.00, 'BPS National Consumer Prices 2024 (outreach materials proxy)', 'https://www.bps.go.id/en/publication/2025/05/16/b64f5cbd615a353a2e1588b8/national-consumer-price-of-selected-goods-and-services-2024.html'),
(10, 5, 2, 'Median Monthly Spend', 12500000.00, 'BPS National Consumer Prices 2024 (digital communications proxy)', 'https://www.bps.go.id/en/publication/2025/05/16/b64f5cbd615a353a2e1588b8/national-consumer-price-of-selected-goods-and-services-2024.html'),
(11, 1, 3, 'Median Monthly Spend', 47500000.00, 'BPS Health, Transportation, and Education Prices 2024 (transport proxy)', 'https://www.bps.go.id/en/publication/2025/04/28/ed4d29c5d13ba67371799c58/harga-konsumen-beberapa-barang-dan-jasa-kelompok-kesehatan--transportasi--dan-pendidikan-150-kabupaten-kota-di-indonesia-2024.html'),
(12, 2, 3, 'Median Monthly Spend', 31000000.00, 'BPS Housing, Water, Electricity, and Fuel Prices 2024 (office operations proxy)', 'https://www.bps.go.id/en/publication/2025/04/28/22904d2b5a04c6d27050846f/consumer-price-of-selected-goods-and-services-for-housing--water--electricity--and-household-fuel-group-of-150-regencies-municipalities-in-indonesia-2024.html'),
(13, 3, 3, 'Median Monthly Spend', 44000000.00, 'Prototype labour-cost proxy pending defensible wage dataset', 'https://www.bps.go.id/en/publication/2025/05/16/b64f5cbd615a353a2e1588b8/national-consumer-price-of-selected-goods-and-services-2024.html'),
(14, 4, 3, 'Median Monthly Spend', 19500000.00, 'BPS National Consumer Prices 2024 (outreach materials proxy)', 'https://www.bps.go.id/en/publication/2025/05/16/b64f5cbd615a353a2e1588b8/national-consumer-price-of-selected-goods-and-services-2024.html'),
(15, 5, 3, 'Median Monthly Spend', 13000000.00, 'BPS National Consumer Prices 2024 (digital communications proxy)', 'https://www.bps.go.id/en/publication/2025/05/16/b64f5cbd615a353a2e1588b8/national-consumer-price-of-selected-goods-and-services-2024.html'),
(16, 1, 4, 'Median Monthly Spend', 48000000.00, 'BPS Health, Transportation, and Education Prices 2024 (transport proxy)', 'https://www.bps.go.id/en/publication/2025/04/28/ed4d29c5d13ba67371799c58/harga-konsumen-beberapa-barang-dan-jasa-kelompok-kesehatan--transportasi--dan-pendidikan-150-kabupaten-kota-di-indonesia-2024.html'),
(17, 2, 4, 'Median Monthly Spend', 31500000.00, 'BPS Housing, Water, Electricity, and Fuel Prices 2024 (office operations proxy)', 'https://www.bps.go.id/en/publication/2025/04/28/22904d2b5a04c6d27050846f/consumer-price-of-selected-goods-and-services-for-housing--water--electricity--and-household-fuel-group-of-150-regencies-municipalities-in-indonesia-2024.html'),
(18, 3, 4, 'Median Monthly Spend', 44500000.00, 'Prototype labour-cost proxy pending defensible wage dataset', 'https://www.bps.go.id/en/publication/2025/05/16/b64f5cbd615a353a2e1588b8/national-consumer-price-of-selected-goods-and-services-2024.html'),
(19, 4, 4, 'Median Monthly Spend', 20000000.00, 'BPS National Consumer Prices 2024 (outreach materials proxy)', 'https://www.bps.go.id/en/publication/2025/05/16/b64f5cbd615a353a2e1588b8/national-consumer-price-of-selected-goods-and-services-2024.html'),
(20, 5, 4, 'Median Monthly Spend', 13250000.00, 'BPS National Consumer Prices 2024 (digital communications proxy)', 'https://www.bps.go.id/en/publication/2025/05/16/b64f5cbd615a353a2e1588b8/national-consumer-price-of-selected-goods-and-services-2024.html'),
(21, 6, 1, 'Median Monthly Spend', 27500000.00, 'BPS Housing, Water, Electricity, and Fuel Prices 2024 (housing proxy)', 'https://www.bps.go.id/en/publication/2025/04/28/22904d2b5a04c6d27050846f/consumer-price-of-selected-goods-and-services-for-housing--water--electricity--and-household-fuel-group-of-150-regencies-municipalities-in-indonesia-2024.html'),
(22, 6, 2, 'Median Monthly Spend', 27800000.00, 'BPS Housing, Water, Electricity, and Fuel Prices 2024 (housing proxy)', 'https://www.bps.go.id/en/publication/2025/04/28/22904d2b5a04c6d27050846f/consumer-price-of-selected-goods-and-services-for-housing--water--electricity--and-household-fuel-group-of-150-regencies-municipalities-in-indonesia-2024.html'),
(23, 6, 3, 'Median Monthly Spend', 28200000.00, 'BPS Housing, Water, Electricity, and Fuel Prices 2024 (housing proxy)', 'https://www.bps.go.id/en/publication/2025/04/28/22904d2b5a04c6d27050846f/consumer-price-of-selected-goods-and-services-for-housing--water--electricity--and-household-fuel-group-of-150-regencies-municipalities-in-indonesia-2024.html'),
(24, 6, 4, 'Median Monthly Spend', 28500000.00, 'BPS Housing, Water, Electricity, and Fuel Prices 2024 (housing proxy)', 'https://www.bps.go.id/en/publication/2025/04/28/22904d2b5a04c6d27050846f/consumer-price-of-selected-goods-and-services-for-housing--water--electricity--and-household-fuel-group-of-150-regencies-municipalities-in-indonesia-2024.html');

INSERT INTO MPAllowanceRecord (
  allowance_record_id,
  mp_id,
  category_id,
  period_id,
  allowance_cap,
  actual_spend,
  variance_percent,
  variance_amount
) VALUES
(1, 1, 1, 1, 50000000.00, 48200000.00, -3.60, -1800000.00),
(2, 1, 2, 1, 32000000.00, 29800000.00, -6.88, -2200000.00),
(3, 1, 3, 1, 45000000.00, 44100000.00, -2.00, -900000.00),
(4, 1, 4, 1, 22000000.00, 21400000.00, -2.73, -600000.00),
(5, 1, 5, 1, 15000000.00, 12600000.00, -16.00, -2400000.00),
(6, 1, 1, 2, 50000000.00, 47400000.00, -5.20, -2600000.00),
(7, 1, 2, 2, 32000000.00, 30900000.00, -3.44, -1100000.00),
(8, 1, 3, 2, 45000000.00, 43600000.00, -3.11, -1400000.00),
(9, 1, 4, 2, 22000000.00, 20800000.00, -5.45, -1200000.00),
(10, 1, 5, 2, 15000000.00, 13100000.00, -12.67, -1900000.00),
(11, 1, 1, 3, 50000000.00, 48900000.00, -2.20, -1100000.00),
(12, 1, 2, 3, 32000000.00, 31500000.00, -1.56, -500000.00),
(13, 1, 3, 3, 45000000.00, 44850000.00, -0.33, -150000.00),
(14, 1, 4, 3, 22000000.00, 20600000.00, -6.36, -1400000.00),
(15, 1, 5, 3, 15000000.00, 12950000.00, -13.67, -2050000.00),
(16, 1, 1, 4, 50000000.00, 49300000.00, -1.40, -700000.00),
(17, 1, 2, 4, 32000000.00, 31800000.00, -0.63, -200000.00),
(18, 1, 3, 4, 45000000.00, 44200000.00, -1.78, -800000.00),
(19, 1, 4, 4, 22000000.00, 21200000.00, -3.64, -800000.00),
(20, 1, 5, 4, 15000000.00, 13300000.00, -11.33, -1700000.00),
(21, 2, 1, 1, 50000000.00, 45800000.00, -8.40, -4200000.00),
(22, 2, 2, 1, 32000000.00, 28750000.00, -10.16, -3250000.00),
(23, 2, 3, 1, 45000000.00, 42100000.00, -6.44, -2900000.00),
(24, 2, 4, 1, 22000000.00, 17800000.00, -19.09, -4200000.00),
(25, 2, 5, 1, 15000000.00, 11800000.00, -21.33, -3200000.00),
(26, 2, 1, 2, 50000000.00, 46100000.00, -7.80, -3900000.00),
(27, 2, 2, 2, 32000000.00, 29300000.00, -8.44, -2700000.00),
(28, 2, 3, 2, 45000000.00, 42700000.00, -5.11, -2300000.00),
(29, 2, 4, 2, 22000000.00, 18400000.00, -16.36, -3600000.00),
(30, 2, 5, 2, 15000000.00, 12250000.00, -18.33, -2750000.00),
(31, 2, 1, 3, 50000000.00, 46700000.00, -6.60, -3300000.00),
(32, 2, 2, 3, 32000000.00, 30100000.00, -5.94, -1900000.00),
(33, 2, 3, 3, 45000000.00, 43250000.00, -3.89, -1750000.00),
(34, 2, 4, 3, 22000000.00, 18850000.00, -14.32, -3150000.00),
(35, 2, 5, 3, 15000000.00, 12450000.00, -17.00, -2550000.00),
(36, 2, 1, 4, 50000000.00, 47200000.00, -5.60, -2800000.00),
(37, 2, 2, 4, 32000000.00, 30400000.00, -5.00, -1600000.00),
(38, 2, 3, 4, 45000000.00, 43800000.00, -2.67, -1200000.00),
(39, 2, 4, 4, 22000000.00, 19100000.00, -13.18, -2900000.00),
(40, 2, 5, 4, 15000000.00, 12750000.00, -15.00, -2250000.00),
(41, 3, 1, 1, 50000000.00, 51200000.00, 2.40, 1200000.00),
(42, 3, 2, 1, 32000000.00, 32600000.00, 1.88, 600000.00),
(43, 3, 3, 1, 45000000.00, 45350000.00, 0.78, 350000.00),
(44, 3, 4, 1, 22000000.00, 22500000.00, 2.27, 500000.00),
(45, 3, 5, 1, 15000000.00, 14400000.00, -4.00, -600000.00),
(46, 3, 1, 2, 50000000.00, 50650000.00, 1.30, 650000.00),
(47, 3, 2, 2, 32000000.00, 33100000.00, 3.44, 1100000.00),
(48, 3, 3, 2, 45000000.00, 45900000.00, 2.00, 900000.00),
(49, 3, 4, 2, 22000000.00, 22750000.00, 3.41, 750000.00),
(50, 3, 5, 2, 15000000.00, 14650000.00, -2.33, -350000.00),
(51, 3, 1, 3, 50000000.00, 51900000.00, 3.80, 1900000.00),
(52, 3, 2, 3, 32000000.00, 33450000.00, 4.53, 1450000.00),
(53, 3, 3, 3, 45000000.00, 46200000.00, 2.67, 1200000.00),
(54, 3, 4, 3, 22000000.00, 23100000.00, 5.00, 1100000.00),
(55, 3, 5, 3, 15000000.00, 14900000.00, -0.67, -100000.00),
(56, 3, 1, 4, 50000000.00, 52400000.00, 4.80, 2400000.00),
(57, 3, 2, 4, 32000000.00, 33800000.00, 5.63, 1800000.00),
(58, 3, 3, 4, 45000000.00, 46800000.00, 4.00, 1800000.00),
(59, 3, 4, 4, 22000000.00, 23400000.00, 6.36, 1400000.00),
(60, 3, 5, 4, 15000000.00, 15150000.00, 1.00, 150000.00),
(61, 4, 1, 1, 50000000.00, 47450000.00, -5.10, -2550000.00),
(62, 4, 2, 1, 32000000.00, 30200000.00, -5.63, -1800000.00),
(63, 4, 3, 1, 45000000.00, 43300000.00, -3.78, -1700000.00),
(64, 4, 4, 1, 22000000.00, 19250000.00, -12.50, -2750000.00),
(65, 4, 5, 1, 15000000.00, 12100000.00, -19.33, -2900000.00),
(66, 4, 1, 2, 50000000.00, 47900000.00, -4.20, -2100000.00),
(67, 4, 2, 2, 32000000.00, 30750000.00, -3.91, -1250000.00),
(68, 4, 3, 2, 45000000.00, 43800000.00, -2.67, -1200000.00),
(69, 4, 4, 2, 22000000.00, 19600000.00, -10.91, -2400000.00),
(70, 4, 5, 2, 15000000.00, 12350000.00, -17.67, -2650000.00),
(71, 4, 1, 3, 50000000.00, 48500000.00, -3.00, -1500000.00),
(72, 4, 2, 3, 32000000.00, 31100000.00, -2.81, -900000.00),
(73, 4, 3, 3, 45000000.00, 44400000.00, -1.33, -600000.00),
(74, 4, 4, 3, 22000000.00, 20100000.00, -8.64, -1900000.00),
(75, 4, 5, 3, 15000000.00, 12650000.00, -15.67, -2350000.00),
(76, 4, 1, 4, 50000000.00, 48850000.00, -2.30, -1150000.00),
(77, 4, 2, 4, 32000000.00, 31450000.00, -1.72, -550000.00),
(78, 4, 3, 4, 45000000.00, 44600000.00, -0.89, -400000.00),
(79, 4, 4, 4, 22000000.00, 20500000.00, -6.82, -1500000.00),
(80, 4, 5, 4, 15000000.00, 12800000.00, -14.67, -2200000.00),
(81, 5, 1, 1, 50000000.00, 44100000.00, -11.80, -5900000.00),
(82, 5, 2, 1, 32000000.00, 28150000.00, -12.03, -3850000.00),
(83, 5, 3, 1, 45000000.00, 40900000.00, -9.11, -4100000.00),
(84, 5, 4, 1, 22000000.00, 17100000.00, -22.27, -4900000.00),
(85, 5, 5, 1, 15000000.00, 11250000.00, -25.00, -3750000.00),
(86, 5, 1, 2, 50000000.00, 44850000.00, -10.30, -5150000.00),
(87, 5, 2, 2, 32000000.00, 28800000.00, -10.00, -3200000.00),
(88, 5, 3, 2, 45000000.00, 41400000.00, -8.00, -3600000.00),
(89, 5, 4, 2, 22000000.00, 17650000.00, -19.77, -4350000.00),
(90, 5, 5, 2, 15000000.00, 11600000.00, -22.67, -3400000.00),
(91, 5, 1, 3, 50000000.00, 45500000.00, -9.00, -4500000.00),
(92, 5, 2, 3, 32000000.00, 29450000.00, -7.97, -2550000.00),
(93, 5, 3, 3, 45000000.00, 41900000.00, -6.89, -3100000.00),
(94, 5, 4, 3, 22000000.00, 18250000.00, -17.05, -3750000.00),
(95, 5, 5, 3, 15000000.00, 11950000.00, -20.33, -3050000.00),
(96, 5, 1, 4, 50000000.00, 45900000.00, -8.20, -4100000.00),
(97, 5, 2, 4, 32000000.00, 29900000.00, -6.56, -2100000.00),
(98, 5, 3, 4, 45000000.00, 42350000.00, -5.89, -2650000.00),
(99, 5, 4, 4, 22000000.00, 18600000.00, -15.45, -3400000.00),
(100, 5, 5, 4, 15000000.00, 12150000.00, -19.00, -2850000.00),
(101, 6, 1, 1, 50000000.00, 49500000.00, -1.00, -500000.00),
(102, 6, 2, 1, 32000000.00, 31650000.00, -1.09, -350000.00),
(103, 6, 3, 1, 45000000.00, 44600000.00, -0.89, -400000.00),
(104, 6, 4, 1, 22000000.00, 20950000.00, -4.77, -1050000.00),
(105, 6, 5, 1, 15000000.00, 13900000.00, -7.33, -1100000.00),
(106, 6, 1, 2, 50000000.00, 50100000.00, 0.20, 100000.00),
(107, 6, 2, 2, 32000000.00, 32050000.00, 0.16, 50000.00),
(108, 6, 3, 2, 45000000.00, 44900000.00, -0.22, -100000.00),
(109, 6, 4, 2, 22000000.00, 21300000.00, -3.18, -700000.00),
(110, 6, 5, 2, 15000000.00, 14150000.00, -5.67, -850000.00),
(111, 6, 1, 3, 50000000.00, 50750000.00, 1.50, 750000.00),
(112, 6, 2, 3, 32000000.00, 32300000.00, 0.94, 300000.00),
(113, 6, 3, 3, 45000000.00, 45250000.00, 0.56, 250000.00),
(114, 6, 4, 3, 22000000.00, 21600000.00, -1.82, -400000.00),
(115, 6, 5, 3, 15000000.00, 14300000.00, -4.67, -700000.00),
(116, 6, 1, 4, 50000000.00, 51000000.00, 2.00, 1000000.00),
(117, 6, 2, 4, 32000000.00, 32550000.00, 1.72, 550000.00),
(118, 6, 3, 4, 45000000.00, 45550000.00, 1.22, 550000.00),
(119, 6, 4, 4, 22000000.00, 21850000.00, -0.68, -150000.00),
(120, 6, 5, 4, 15000000.00, 14500000.00, -3.33, -500000.00);

-- Expanded DKI Jakarta sample for richer prototype browsing.
INSERT INTO Party (party_id, party_name, party_abbreviation, party_logo) VALUES
(6, 'Partai Amanat Nasional', 'PAN', 'https://commons.wikimedia.org/wiki/Special:FilePath/Logo_Partai_Amanat_Nasional_2024.png'),
(7, 'Partai Kebangkitan Bangsa', 'PKB', 'https://commons.wikimedia.org/wiki/Special:FilePath/Logo_PKB_2024.png'),
(8, 'Partai Demokrat', 'Demokrat', 'https://commons.wikimedia.org/wiki/Special:FilePath/Logo_of_the_Democratic_Party_(Indonesia).svg');
INSERT INTO MP (
  mp_id,
  full_name,
  display_name,
  party_id,
  mp_rank,
  term_start,
  term_end,
  profile_image,
  status
) VALUES
(7, 'Hasbiallah Ilyas', 'Hasbiallah Ilyas', 7, 'Member', '2024-10-01', '2029-09-30', 'https://commons.wikimedia.org/wiki/Special:FilePath/KPU_Hasbiallah_Ilyas.png', 'Active'),
(8, 'Eko Hendro Purnomo', 'Eko Hendro Purnomo', 6, 'Member', '2024-10-01', '2029-09-30', 'https://commons.wikimedia.org/wiki/Special:FilePath/Eko_Patrio.jpg', 'Active'),
(9, 'Mardani Ali Sera', 'Mardani Ali Sera', 3, 'Head', '2024-10-01', '2029-09-30', 'https://commons.wikimedia.org/wiki/Special:FilePath/BKSAP_%E2%80%93_AIPA_Fokus_Tingkatkan_Kualitas_Pendidikan_di_ASEAN.jpg', 'Active'),
(10, 'Anis Byarwati', 'Anis Byarwati', 3, 'Vice', '2024-10-01', '2029-09-30', 'https://commons.wikimedia.org/wiki/Special:FilePath/Anis_Byarwati_2023.jpg', 'Active'),
(11, 'Abraham Sridjaja', 'Abraham Sridjaja', 5, 'Member', '2024-10-01', '2029-09-30', 'https://commons.wikimedia.org/wiki/Special:FilePath/KPU_Abraham_Sridjaja.jpg', 'Active'),
(12, 'Ida Fauziyah', 'Ida Fauziyah', 7, 'Member', '2024-10-01', '2029-09-30', 'https://commons.wikimedia.org/wiki/Special:FilePath/Ida_Fauziyah,_PKB_candidate_for_Jakarta_II_in_2024.jpg', 'Active'),
(13, 'Surya Utama', 'Surya Utama', 6, 'Member', '2024-10-01', '2029-09-30', 'https://commons.wikimedia.org/wiki/Special:FilePath/KPU_Uya_Kuya.jpg', 'Active'),
(14, 'Hidayat Nur Wahid', 'Hidayat Nur Wahid', 3, 'Head', '2024-10-01', '2029-09-30', 'https://commons.wikimedia.org/wiki/Special:FilePath/Hidayat_Nur_Wahid,_PKS_candidate_for_Jakarta_II_in_2024.jpg', 'Active'),
(15, 'Adang Daradjatun', 'Adang Daradjatun', 3, 'Member', '2024-10-01', '2029-09-30', 'https://commons.wikimedia.org/wiki/Special:FilePath/Adang_daradjatun.jpg', 'Active'),
(16, 'Rahayu Saraswati Djojohadikusumo', 'Rahayu Saraswati', 1, 'Vice', '2024-10-01', '2029-09-30', 'https://commons.wikimedia.org/wiki/Special:FilePath/Rahayu_saraswati_bicara.jpg', 'Active'),
(17, 'Erwin Aksa', 'Erwin Aksa', 5, 'Member', '2024-10-01', '2029-09-30', '', 'Active'),
(18, 'Nurwayah', 'Nurwayah', 8, 'Member', '2024-10-01', '2029-09-30', 'https://commons.wikimedia.org/wiki/Special:FilePath/KPU_Nurwayah.jpg', 'Active'),
(19, 'Darmadi Durianto', 'Darmadi Durianto', 2, 'Member', '2024-10-01', '2029-09-30', 'https://commons.wikimedia.org/wiki/Special:FilePath/Anggota_DPR_Darmadi_Durianto.jpg', 'Active'),
(20, 'Sigit Purnomo', 'Sigit Purnomo', 6, 'Member', '2024-10-01', '2029-09-30', 'https://commons.wikimedia.org/wiki/Special:FilePath/KPU_Sigit_Purnomo_Syamsudin_Said.jpg', 'Active');
INSERT INTO MPAllowanceRecord (
  allowance_record_id,
  mp_id,
  category_id,
  period_id,
  allowance_cap,
  actual_spend,
  variance_percent,
  variance_amount
) VALUES(121, 7, 1, 1, 50000000, 47200000, 0.43, 200000),
(122, 7, 2, 1, 32000000, 30500000, 1.67, 500000),
(123, 7, 3, 1, 45000000, 41600000, -3.26, -1400000),
(124, 7, 4, 1, 22000000, 18800000, 1.62, 300000),
(125, 7, 5, 1, 15000000, 12000000, 0, 0),
(126, 7, 1, 2, 50000000, 47650000, 2.47, 1150000),
(127, 7, 2, 2, 32000000, 30950000, 1.48, 450000),
(128, 7, 3, 2, 45000000, 42050000, -3.33, -1450000),
(129, 7, 4, 2, 22000000, 19250000, 1.32, 250000),
(130, 7, 5, 2, 15000000, 12450000, -0.40, -50000),
(131, 7, 1, 3, 50000000, 48150000, 1.37, 650000),
(132, 7, 2, 3, 32000000, 31450000, 1.45, 450000),
(133, 7, 3, 3, 45000000, 42550000, -3.30, -1450000),
(134, 7, 4, 3, 22000000, 19750000, 1.28, 250000),
(135, 7, 5, 3, 15000000, 12950000, -0.38, -50000),
(136, 7, 1, 4, 50000000, 48550000, 1.15, 550000),
(137, 7, 2, 4, 32000000, 31850000, 1.11, 350000),
(138, 7, 3, 4, 45000000, 42950000, -3.48, -1550000),
(139, 7, 4, 4, 22000000, 20150000, 0.75, 150000),
(140, 7, 5, 4, 15000000, 13350000, 0.75, 100000),
(141, 8, 1, 1, 50000000, 48000000, 2.13, 1000000),
(142, 8, 2, 1, 32000000, 31100000, 3.67, 1100000),
(143, 8, 3, 1, 45000000, 43500000, 1.16, 500000),
(144, 8, 4, 1, 22000000, 20300000, 9.73, 1800000),
(145, 8, 5, 1, 15000000, 13700000, 14.17, 1700000),
(146, 8, 1, 2, 50000000, 48450000, 4.19, 1950000),
(147, 8, 2, 2, 32000000, 31550000, 3.44, 1050000),
(148, 8, 3, 2, 45000000, 43950000, 1.03, 450000),
(149, 8, 4, 2, 22000000, 20750000, 9.21, 1750000),
(150, 8, 5, 2, 15000000, 14150000, 13.20, 1650000),
(151, 8, 1, 3, 50000000, 48950000, 3.05, 1450000),
(152, 8, 2, 3, 32000000, 32050000, 3.39, 1050000),
(153, 8, 3, 3, 45000000, 44450000, 1.02, 450000),
(154, 8, 4, 3, 22000000, 21250000, 8.97, 1750000),
(155, 8, 5, 3, 15000000, 14650000, 12.69, 1650000),
(156, 8, 1, 4, 50000000, 49350000, 2.81, 1350000),
(157, 8, 2, 4, 32000000, 32450000, 3.02, 950000),
(158, 8, 3, 4, 45000000, 44850000, 0.79, 350000),
(159, 8, 4, 4, 22000000, 21650000, 8.25, 1650000),
(160, 8, 5, 4, 15000000, 15050000, 13.58, 1800000),
(161, 9, 1, 1, 50000000, 45800000, -2.55, -1200000),
(162, 9, 2, 1, 32000000, 29600000, -1.33, -400000),
(163, 9, 3, 1, 45000000, 42000000, -2.33, -1000000),
(164, 9, 4, 1, 22000000, 18100000, -2.16, -400000),
(165, 9, 5, 1, 15000000, 11300000, -5.83, -700000),
(166, 9, 1, 2, 50000000, 46250000, -0.54, -250000),
(167, 9, 2, 2, 32000000, 30050000, -1.48, -450000),
(168, 9, 3, 2, 45000000, 42450000, -2.41, -1050000),
(169, 9, 4, 2, 22000000, 18550000, -2.37, -450000),
(170, 9, 5, 2, 15000000, 11750000, -6.00, -750000),
(171, 9, 1, 3, 50000000, 46750000, -1.58, -750000),
(172, 9, 2, 3, 32000000, 30550000, -1.45, -450000),
(173, 9, 3, 3, 45000000, 42950000, -2.39, -1050000),
(174, 9, 4, 3, 22000000, 19050000, -2.31, -450000),
(175, 9, 5, 3, 15000000, 12250000, -5.77, -750000),
(176, 9, 1, 4, 50000000, 47150000, -1.77, -850000),
(177, 9, 2, 4, 32000000, 30950000, -1.75, -550000),
(178, 9, 3, 4, 45000000, 43350000, -2.58, -1150000),
(179, 9, 4, 4, 22000000, 19450000, -2.75, -550000),
(180, 9, 5, 4, 15000000, 12650000, -4.53, -600000),
(181, 10, 1, 1, 50000000, 45200000, -3.83, -1800000),
(182, 10, 2, 1, 32000000, 29000000, -3.33, -1000000),
(183, 10, 3, 1, 45000000, 40900000, -4.88, -2100000),
(184, 10, 4, 1, 22000000, 17500000, -5.41, -1000000),
(185, 10, 5, 1, 15000000, 10900000, -9.17, -1100000),
(186, 10, 1, 2, 50000000, 45650000, -1.83, -850000),
(187, 10, 2, 2, 32000000, 29450000, -3.44, -1050000),
(188, 10, 3, 2, 45000000, 41350000, -4.94, -2150000),
(189, 10, 4, 2, 22000000, 17950000, -5.53, -1050000),
(190, 10, 5, 2, 15000000, 11350000, -9.20, -1150000),
(191, 10, 1, 3, 50000000, 46150000, -2.84, -1350000),
(192, 10, 2, 3, 32000000, 29950000, -3.39, -1050000),
(193, 10, 3, 3, 45000000, 41850000, -4.89, -2150000),
(194, 10, 4, 3, 22000000, 18450000, -5.38, -1050000),
(195, 10, 5, 3, 15000000, 11850000, -8.85, -1150000),
(196, 10, 1, 4, 50000000, 46550000, -3.02, -1450000),
(197, 10, 2, 4, 32000000, 30350000, -3.65, -1150000),
(198, 10, 3, 4, 45000000, 42250000, -5.06, -2250000),
(199, 10, 4, 4, 22000000, 18850000, -5.75, -1150000),
(200, 10, 5, 4, 15000000, 12250000, -7.55, -1000000),
(201, 11, 1, 1, 50000000, 46600000, -0.85, -400000),
(202, 11, 2, 1, 32000000, 31200000, 4.00, 1200000),
(203, 11, 3, 1, 45000000, 44200000, 2.79, 1200000),
(204, 11, 4, 1, 22000000, 20400000, 10.27, 1900000),
(205, 11, 5, 1, 15000000, 13500000, 12.50, 1500000),
(206, 11, 1, 2, 50000000, 47050000, 1.18, 550000),
(207, 11, 2, 2, 32000000, 31650000, 3.77, 1150000),
(208, 11, 3, 2, 45000000, 44650000, 2.64, 1150000),
(209, 11, 4, 2, 22000000, 20850000, 9.74, 1850000),
(210, 11, 5, 2, 15000000, 13950000, 11.60, 1450000),
(211, 11, 1, 3, 50000000, 47550000, 0.11, 50000),
(212, 11, 2, 3, 32000000, 32150000, 3.71, 1150000),
(213, 11, 3, 3, 45000000, 45150000, 2.61, 1150000),
(214, 11, 4, 3, 22000000, 21350000, 9.49, 1850000),
(215, 11, 5, 3, 15000000, 14450000, 11.15, 1450000),
(216, 11, 1, 4, 50000000, 47950000, -0.10, -50000),
(217, 11, 2, 4, 32000000, 32550000, 3.33, 1050000),
(218, 11, 3, 4, 45000000, 45550000, 2.36, 1050000),
(219, 11, 4, 4, 22000000, 21750000, 8.75, 1750000),
(220, 11, 5, 4, 15000000, 14850000, 12.08, 1600000),
(221, 12, 1, 1, 50000000, 44300000, -5.74, -2700000),
(222, 12, 2, 1, 32000000, 28300000, -5.67, -1700000),
(223, 12, 3, 1, 45000000, 40100000, -6.74, -2900000),
(224, 12, 4, 1, 22000000, 17100000, -7.57, -1400000),
(225, 12, 5, 1, 15000000, 10600000, -11.67, -1400000),
(226, 12, 1, 2, 50000000, 44750000, -3.76, -1750000),
(227, 12, 2, 2, 32000000, 28750000, -5.74, -1750000),
(228, 12, 3, 2, 45000000, 40550000, -6.78, -2950000),
(229, 12, 4, 2, 22000000, 17550000, -7.63, -1450000),
(230, 12, 5, 2, 15000000, 11050000, -11.60, -1450000),
(231, 12, 1, 3, 50000000, 45250000, -4.74, -2250000),
(232, 12, 2, 3, 32000000, 29250000, -5.65, -1750000),
(233, 12, 3, 3, 45000000, 41050000, -6.70, -2950000),
(234, 12, 4, 3, 22000000, 18050000, -7.44, -1450000),
(235, 12, 5, 3, 15000000, 11550000, -11.15, -1450000),
(236, 12, 1, 4, 50000000, 45650000, -4.90, -2350000),
(237, 12, 2, 4, 32000000, 29650000, -5.87, -1850000),
(238, 12, 3, 4, 45000000, 41450000, -6.85, -3050000),
(239, 12, 4, 4, 22000000, 18450000, -7.75, -1550000),
(240, 12, 5, 4, 15000000, 11950000, -9.81, -1300000),
(241, 13, 1, 1, 50000000, 48500000, 3.19, 1500000),
(242, 13, 2, 1, 32000000, 32000000, 6.67, 2000000),
(243, 13, 3, 1, 45000000, 45200000, 5.12, 2200000),
(244, 13, 4, 1, 22000000, 21300000, 15.14, 2800000),
(245, 13, 5, 1, 15000000, 14200000, 18.33, 2200000),
(246, 13, 1, 2, 50000000, 48950000, 5.27, 2450000),
(247, 13, 2, 2, 32000000, 32450000, 6.39, 1950000),
(248, 13, 3, 2, 45000000, 45650000, 4.94, 2150000),
(249, 13, 4, 2, 22000000, 21750000, 14.47, 2750000),
(250, 13, 5, 2, 15000000, 14650000, 17.20, 2150000),
(251, 13, 1, 3, 50000000, 49450000, 4.11, 1950000),
(252, 13, 2, 3, 32000000, 32950000, 6.29, 1950000),
(253, 13, 3, 3, 45000000, 46150000, 4.89, 2150000),
(254, 13, 4, 3, 22000000, 22250000, 14.10, 2750000),
(255, 13, 5, 3, 15000000, 15150000, 16.54, 2150000),
(256, 13, 1, 4, 50000000, 49850000, 3.85, 1850000),
(257, 13, 2, 4, 32000000, 33350000, 5.87, 1850000),
(258, 13, 3, 4, 45000000, 46550000, 4.61, 2050000),
(259, 13, 4, 4, 22000000, 22650000, 13.25, 2650000),
(260, 13, 5, 4, 15000000, 15550000, 17.36, 2300000),
(261, 14, 1, 1, 50000000, 46200000, -1.70, -800000),
(262, 14, 2, 1, 32000000, 30200000, 0.67, 200000),
(263, 14, 3, 1, 45000000, 43000000, 0, 0),
(264, 14, 4, 1, 22000000, 18500000, 0, 0),
(265, 14, 5, 1, 15000000, 11800000, -1.67, -200000),
(266, 14, 1, 2, 50000000, 46650000, 0.32, 150000),
(267, 14, 2, 2, 32000000, 30650000, 0.49, 150000),
(268, 14, 3, 2, 45000000, 43450000, -0.11, -50000),
(269, 14, 4, 2, 22000000, 18950000, -0.26, -50000),
(270, 14, 5, 2, 15000000, 12250000, -2.00, -250000),
(271, 14, 1, 3, 50000000, 47150000, -0.74, -350000),
(272, 14, 2, 3, 32000000, 31150000, 0.48, 150000),
(273, 14, 3, 3, 45000000, 43950000, -0.11, -50000),
(274, 14, 4, 3, 22000000, 19450000, -0.26, -50000),
(275, 14, 5, 3, 15000000, 12750000, -1.92, -250000),
(276, 14, 1, 4, 50000000, 47550000, -0.94, -450000),
(277, 14, 2, 4, 32000000, 31550000, 0.16, 50000),
(278, 14, 3, 4, 45000000, 44350000, -0.34, -150000),
(279, 14, 4, 4, 22000000, 19850000, -0.75, -150000),
(280, 14, 5, 4, 15000000, 13150000, -0.75, -100000),
(281, 15, 1, 1, 50000000, 47400000, 0.85, 400000),
(282, 15, 2, 1, 32000000, 30600000, 2.00, 600000),
(283, 15, 3, 1, 45000000, 43600000, 1.40, 600000),
(284, 15, 4, 1, 22000000, 19700000, 6.49, 1200000),
(285, 15, 5, 1, 15000000, 12600000, 5.00, 600000),
(286, 15, 1, 2, 50000000, 47850000, 2.90, 1350000),
(287, 15, 2, 2, 32000000, 31050000, 1.80, 550000),
(288, 15, 3, 2, 45000000, 44050000, 1.26, 550000),
(289, 15, 4, 2, 22000000, 20150000, 6.05, 1150000),
(290, 15, 5, 2, 15000000, 13050000, 4.40, 550000),
(291, 15, 1, 3, 50000000, 48350000, 1.79, 850000),
(292, 15, 2, 3, 32000000, 31550000, 1.77, 550000),
(293, 15, 3, 3, 45000000, 44550000, 1.25, 550000),
(294, 15, 4, 3, 22000000, 20650000, 5.90, 1150000),
(295, 15, 5, 3, 15000000, 13550000, 4.23, 550000),
(296, 15, 1, 4, 50000000, 48750000, 1.56, 750000),
(297, 15, 2, 4, 32000000, 31950000, 1.43, 450000),
(298, 15, 3, 4, 45000000, 44950000, 1.01, 450000),
(299, 15, 4, 4, 22000000, 21050000, 5.25, 1050000),
(300, 15, 5, 4, 15000000, 13950000, 5.28, 700000),
(301, 16, 1, 1, 50000000, 50100000, 6.60, 3100000),
(302, 16, 2, 1, 32000000, 32800000, 9.33, 2800000),
(303, 16, 3, 1, 45000000, 45500000, 5.81, 2500000),
(304, 16, 4, 1, 22000000, 21800000, 17.84, 3300000),
(305, 16, 5, 1, 15000000, 14600000, 21.67, 2600000),
(306, 16, 1, 2, 50000000, 50550000, 8.71, 4050000),
(307, 16, 2, 2, 32000000, 33250000, 9.02, 2750000),
(308, 16, 3, 2, 45000000, 45950000, 5.63, 2450000),
(309, 16, 4, 2, 22000000, 22250000, 17.11, 3250000),
(310, 16, 5, 2, 15000000, 15050000, 20.40, 2550000),
(311, 16, 1, 3, 50000000, 51050000, 7.47, 3550000),
(312, 16, 2, 3, 32000000, 33750000, 8.87, 2750000),
(313, 16, 3, 3, 45000000, 46450000, 5.57, 2450000),
(314, 16, 4, 3, 22000000, 22750000, 16.67, 3250000),
(315, 16, 5, 3, 15000000, 15550000, 19.62, 2550000),
(316, 16, 1, 4, 50000000, 51450000, 7.19, 3450000),
(317, 16, 2, 4, 32000000, 34150000, 8.41, 2650000),
(318, 16, 3, 4, 45000000, 46850000, 5.28, 2350000),
(319, 16, 4, 4, 22000000, 23150000, 15.75, 3150000),
(320, 16, 5, 4, 15000000, 15950000, 20.38, 2700000),
(321, 17, 1, 1, 50000000, 48700000, 3.62, 1700000),
(322, 17, 2, 1, 32000000, 31500000, 5.00, 1500000),
(323, 17, 3, 1, 45000000, 44800000, 4.19, 1800000),
(324, 17, 4, 1, 22000000, 20500000, 10.81, 2000000),
(325, 17, 5, 1, 15000000, 14100000, 17.50, 2100000),
(326, 17, 1, 2, 50000000, 49150000, 5.70, 2650000),
(327, 17, 2, 2, 32000000, 31950000, 4.75, 1450000),
(328, 17, 3, 2, 45000000, 45250000, 4.02, 1750000),
(329, 17, 4, 2, 22000000, 20950000, 10.26, 1950000),
(330, 17, 5, 2, 15000000, 14550000, 16.40, 2050000),
(331, 17, 1, 3, 50000000, 49650000, 4.53, 2150000),
(332, 17, 2, 3, 32000000, 32450000, 4.68, 1450000),
(333, 17, 3, 3, 45000000, 45750000, 3.98, 1750000),
(334, 17, 4, 3, 22000000, 21450000, 10.0, 1950000),
(335, 17, 5, 3, 15000000, 15050000, 15.77, 2050000),
(336, 17, 1, 4, 50000000, 50050000, 4.27, 2050000),
(337, 17, 2, 4, 32000000, 32850000, 4.29, 1350000),
(338, 17, 3, 4, 45000000, 46150000, 3.71, 1650000),
(339, 17, 4, 4, 22000000, 21850000, 9.25, 1850000),
(340, 17, 5, 4, 15000000, 15450000, 16.60, 2200000),
(341, 18, 1, 1, 50000000, 46900000, -0.21, -100000),
(342, 18, 2, 1, 32000000, 30100000, 0.33, 100000),
(343, 18, 3, 1, 45000000, 42400000, -1.40, -600000),
(344, 18, 4, 1, 22000000, 18400000, -0.54, -100000),
(345, 18, 5, 1, 15000000, 12000000, 0, 0),
(346, 18, 1, 2, 50000000, 47350000, 1.83, 850000),
(347, 18, 2, 2, 32000000, 30550000, 0.16, 50000),
(348, 18, 3, 2, 45000000, 42850000, -1.49, -650000),
(349, 18, 4, 2, 22000000, 18850000, -0.79, -150000),
(350, 18, 5, 2, 15000000, 12450000, -0.40, -50000),
(351, 18, 1, 3, 50000000, 47850000, 0.74, 350000),
(352, 18, 2, 3, 32000000, 31050000, 0.16, 50000),
(353, 18, 3, 3, 45000000, 43350000, -1.48, -650000),
(354, 18, 4, 3, 22000000, 19350000, -0.77, -150000),
(355, 18, 5, 3, 15000000, 12950000, -0.38, -50000),
(356, 18, 1, 4, 50000000, 48250000, 0.52, 250000),
(357, 18, 2, 4, 32000000, 31450000, -0.16, -50000),
(358, 18, 3, 4, 45000000, 43750000, -1.69, -750000),
(359, 18, 4, 4, 22000000, 19750000, -1.25, -250000),
(360, 18, 5, 4, 15000000, 13350000, 0.75, 100000),
(361, 19, 1, 1, 50000000, 48300000, 2.77, 1300000),
(362, 19, 2, 1, 32000000, 32300000, 7.67, 2300000),
(363, 19, 3, 1, 45000000, 45700000, 6.28, 2700000),
(364, 19, 4, 1, 22000000, 21200000, 14.59, 2700000),
(365, 19, 5, 1, 15000000, 14300000, 19.17, 2300000),
(366, 19, 1, 2, 50000000, 48750000, 4.84, 2250000),
(367, 19, 2, 2, 32000000, 32750000, 7.38, 2250000),
(368, 19, 3, 2, 45000000, 46150000, 6.09, 2650000),
(369, 19, 4, 2, 22000000, 21650000, 13.95, 2650000),
(370, 19, 5, 2, 15000000, 14750000, 18.00, 2250000),
(371, 19, 1, 3, 50000000, 49250000, 3.68, 1750000),
(372, 19, 2, 3, 32000000, 33250000, 7.26, 2250000),
(373, 19, 3, 3, 45000000, 46650000, 6.02, 2650000),
(374, 19, 4, 3, 22000000, 22150000, 13.59, 2650000),
(375, 19, 5, 3, 15000000, 15250000, 17.31, 2250000),
(376, 19, 1, 4, 50000000, 49650000, 3.44, 1650000),
(377, 19, 2, 4, 32000000, 33650000, 6.83, 2150000),
(378, 19, 3, 4, 45000000, 47050000, 5.73, 2550000),
(379, 19, 4, 4, 22000000, 22550000, 12.75, 2550000),
(380, 19, 5, 4, 15000000, 15650000, 18.11, 2400000),
(381, 20, 1, 1, 50000000, 47300000, 0.64, 300000),
(382, 20, 2, 1, 32000000, 30900000, 3.00, 900000),
(383, 20, 3, 1, 45000000, 43900000, 2.09, 900000),
(384, 20, 4, 1, 22000000, 19600000, 5.95, 1100000),
(385, 20, 5, 1, 15000000, 13100000, 9.17, 1100000),
(386, 20, 1, 2, 50000000, 47750000, 2.69, 1250000),
(387, 20, 2, 2, 32000000, 31350000, 2.79, 850000),
(388, 20, 3, 2, 45000000, 44350000, 1.95, 850000),
(389, 20, 4, 2, 22000000, 20050000, 5.53, 1050000),
(390, 20, 5, 2, 15000000, 13550000, 8.40, 1050000),
(391, 20, 1, 3, 50000000, 48250000, 1.58, 750000),
(392, 20, 2, 3, 32000000, 31850000, 2.74, 850000),
(393, 20, 3, 3, 45000000, 44850000, 1.93, 850000),
(394, 20, 4, 3, 22000000, 20550000, 5.38, 1050000),
(395, 20, 5, 3, 15000000, 14050000, 8.08, 1050000),
(396, 20, 1, 4, 50000000, 48650000, 1.35, 650000),
(397, 20, 2, 4, 32000000, 32250000, 2.38, 750000),
(398, 20, 3, 4, 45000000, 45250000, 1.69, 750000),
(399, 20, 4, 4, 22000000, 20950000, 4.75, 950000),
(400, 20, 5, 4, 15000000, 14450000, 9.06, 1200000);

-- Rebalance the expanded sample so leaderboard positions and variance patterns are easier to compare.
UPDATE MPAllowanceRecord
SET actual_spend = ROUND(
  actual_spend * CASE
    WHEN mp_id IN (8, 13, 16, 19) THEN 1.14
    WHEN mp_id IN (9, 14) THEN 1.08
    WHEN mp_id IN (10, 12, 18) THEN 0.90
    WHEN mp_id IN (11, 15, 17, 20) THEN 1.02
    ELSE 1
  END,
  2
)
WHERE mp_id BETWEEN 7 AND 20;

UPDATE MPAllowanceRecord
SET actual_spend = ROUND(actual_spend * 1.12, 2)
WHERE mp_id IN (8, 16, 19) AND category_id IN (1, 4);

UPDATE MPAllowanceRecord
SET actual_spend = ROUND(actual_spend * 0.88, 2)
WHERE mp_id IN (10, 12, 18) AND category_id = 5;

-- Add stronger category and period-specific variation so dashboards and leaderboards are less uniform.
UPDATE MPAllowanceRecord
SET actual_spend = ROUND(actual_spend * 1.18, 2)
WHERE category_id = 1
  AND period_id IN (3, 4)
  AND mp_id IN (3, 6, 8, 16, 19);

UPDATE MPAllowanceRecord
SET actual_spend = ROUND(actual_spend * 0.84, 2)
WHERE category_id = 5
  AND period_id IN (1, 2)
  AND mp_id IN (2, 5, 10, 12, 18);

UPDATE MPAllowanceRecord
SET actual_spend = ROUND(actual_spend * 1.15, 2)
WHERE category_id = 2
  AND mp_id IN (11, 14, 17)
  AND period_id IN (2, 4);

UPDATE MPAllowanceRecord
SET actual_spend = ROUND(actual_spend * 0.87, 2)
WHERE category_id = 4
  AND mp_id IN (4, 7, 15)
  AND period_id IN (1, 2, 3);

UPDATE MPAllowanceRecord
SET actual_spend = ROUND(actual_spend * 1.10, 2)
WHERE category_id = 3
  AND mp_id IN (1, 9, 13, 19)
  AND period_id IN (3, 4);

-- Nudge the latest visible period into a more balanced red/yellow/olive mix on the category cards.
UPDATE MPAllowanceRecord
SET actual_spend = ROUND(actual_spend * 0.96, 2)
WHERE category_id = 2
  AND period_id = 4;

UPDATE MPAllowanceRecord
SET actual_spend = ROUND(actual_spend * 0.88, 2)
WHERE category_id = 3
  AND period_id = 4;

UPDATE MPAllowanceRecord
SET actual_spend = ROUND(actual_spend * 0.94, 2)
WHERE category_id = 4
  AND period_id = 4;

UPDATE MPAllowanceRecord
SET actual_spend = ROUND(actual_spend * 0.82, 2)
WHERE category_id = 5
  AND period_id = 4;

UPDATE MPAllowanceRecord mar
JOIN CategoryBenchmark cb
  ON cb.category_id = mar.category_id
 AND cb.period_id = mar.period_id
SET
  mar.variance_amount = ROUND(mar.actual_spend - cb.benchmark_value, 2),
  mar.variance_percent = ROUND(
    ((mar.actual_spend - cb.benchmark_value) / cb.benchmark_value) * 100,
    2
  )
WHERE mar.mp_id BETWEEN 1 AND 20;

-- Extend 2026 to a full 12-month cycle so charts feel more complete.
INSERT INTO ReportingPeriod (
  period_id,
  year,
  month,
  month_name,
  start_date,
  end_date,
  label
) VALUES
(5, 2026, 5, 'May', '2026-05-01', '2026-05-31', 'May 2026'),
(6, 2026, 6, 'June', '2026-06-01', '2026-06-30', 'Jun 2026'),
(7, 2026, 7, 'July', '2026-07-01', '2026-07-31', 'Jul 2026'),
(8, 2026, 8, 'August', '2026-08-01', '2026-08-31', 'Aug 2026'),
(9, 2026, 9, 'September', '2026-09-01', '2026-09-30', 'Sep 2026'),
(10, 2026, 10, 'October', '2026-10-01', '2026-10-31', 'Oct 2026'),
(11, 2026, 11, 'November', '2026-11-01', '2026-11-30', 'Nov 2026'),
(12, 2026, 12, 'December', '2026-12-01', '2026-12-31', 'Dec 2026');

INSERT INTO CategoryBenchmark (
  category_id,
  period_id,
  benchmark_type,
  benchmark_value,
  source_name,
  source_url
) VALUES
(1, 5, 'Median Monthly Spend', 48500000.00, 'BPS Health, Transportation, and Education Prices 2024 (transport proxy)', 'https://www.bps.go.id/en/publication/2025/04/28/ed4d29c5d13ba67371799c58/harga-konsumen-beberapa-barang-dan-jasa-kelompok-kesehatan--transportasi--dan-pendidikan-150-kabupaten-kota-di-indonesia-2024.html'),
(2, 5, 'Median Monthly Spend', 32000000.00, 'BPS Housing, Water, Electricity, and Fuel Prices 2024 (office operations proxy)', 'https://www.bps.go.id/en/publication/2025/04/28/22904d2b5a04c6d27050846f/consumer-price-of-selected-goods-and-services-for-housing--water--electricity--and-household-fuel-group-of-150-regencies-municipalities-in-indonesia-2024.html'),
(3, 5, 'Median Monthly Spend', 44800000.00, 'Prototype labour-cost proxy pending defensible wage dataset', 'https://www.bps.go.id/en/publication/2025/05/16/b64f5cbd615a353a2e1588b8/national-consumer-price-of-selected-goods-and-services-2024.html'),
(4, 5, 'Median Monthly Spend', 20500000.00, 'BPS National Consumer Prices 2024 (outreach materials proxy)', 'https://www.bps.go.id/en/publication/2025/05/16/b64f5cbd615a353a2e1588b8/national-consumer-price-of-selected-goods-and-services-2024.html'),
(5, 5, 'Median Monthly Spend', 13400000.00, 'BPS National Consumer Prices 2024 (digital communications proxy)', 'https://www.bps.go.id/en/publication/2025/05/16/b64f5cbd615a353a2e1588b8/national-consumer-price-of-selected-goods-and-services-2024.html'),
(1, 6, 'Median Monthly Spend', 49000000.00, 'BPS Health, Transportation, and Education Prices 2024 (transport proxy)', 'https://www.bps.go.id/en/publication/2025/04/28/ed4d29c5d13ba67371799c58/harga-konsumen-beberapa-barang-dan-jasa-kelompok-kesehatan--transportasi--dan-pendidikan-150-kabupaten-kota-di-indonesia-2024.html'),
(2, 6, 'Median Monthly Spend', 32500000.00, 'BPS Housing, Water, Electricity, and Fuel Prices 2024 (office operations proxy)', 'https://www.bps.go.id/en/publication/2025/04/28/22904d2b5a04c6d27050846f/consumer-price-of-selected-goods-and-services-for-housing--water--electricity--and-household-fuel-group-of-150-regencies-municipalities-in-indonesia-2024.html'),
(3, 6, 'Median Monthly Spend', 45200000.00, 'Prototype labour-cost proxy pending defensible wage dataset', 'https://www.bps.go.id/en/publication/2025/05/16/b64f5cbd615a353a2e1588b8/national-consumer-price-of-selected-goods-and-services-2024.html'),
(4, 6, 'Median Monthly Spend', 21000000.00, 'BPS National Consumer Prices 2024 (outreach materials proxy)', 'https://www.bps.go.id/en/publication/2025/05/16/b64f5cbd615a353a2e1588b8/national-consumer-price-of-selected-goods-and-services-2024.html'),
(5, 6, 'Median Monthly Spend', 13600000.00, 'BPS National Consumer Prices 2024 (digital communications proxy)', 'https://www.bps.go.id/en/publication/2025/05/16/b64f5cbd615a353a2e1588b8/national-consumer-price-of-selected-goods-and-services-2024.html'),
(1, 7, 'Median Monthly Spend', 49500000.00, 'BPS Health, Transportation, and Education Prices 2024 (transport proxy)', 'https://www.bps.go.id/en/publication/2025/04/28/ed4d29c5d13ba67371799c58/harga-konsumen-beberapa-barang-dan-jasa-kelompok-kesehatan--transportasi--dan-pendidikan-150-kabupaten-kota-di-indonesia-2024.html'),
(2, 7, 'Median Monthly Spend', 33000000.00, 'BPS Housing, Water, Electricity, and Fuel Prices 2024 (office operations proxy)', 'https://www.bps.go.id/en/publication/2025/04/28/22904d2b5a04c6d27050846f/consumer-price-of-selected-goods-and-services-for-housing--water--electricity--and-household-fuel-group-of-150-regencies-municipalities-in-indonesia-2024.html'),
(3, 7, 'Median Monthly Spend', 45600000.00, 'Prototype labour-cost proxy pending defensible wage dataset', 'https://www.bps.go.id/en/publication/2025/05/16/b64f5cbd615a353a2e1588b8/national-consumer-price-of-selected-goods-and-services-2024.html'),
(4, 7, 'Median Monthly Spend', 21500000.00, 'BPS National Consumer Prices 2024 (outreach materials proxy)', 'https://www.bps.go.id/en/publication/2025/05/16/b64f5cbd615a353a2e1588b8/national-consumer-price-of-selected-goods-and-services-2024.html'),
(5, 7, 'Median Monthly Spend', 13900000.00, 'BPS National Consumer Prices 2024 (digital communications proxy)', 'https://www.bps.go.id/en/publication/2025/05/16/b64f5cbd615a353a2e1588b8/national-consumer-price-of-selected-goods-and-services-2024.html'),
(1, 8, 'Median Monthly Spend', 50000000.00, 'BPS Health, Transportation, and Education Prices 2024 (transport proxy)', 'https://www.bps.go.id/en/publication/2025/04/28/ed4d29c5d13ba67371799c58/harga-konsumen-beberapa-barang-dan-jasa-kelompok-kesehatan--transportasi--dan-pendidikan-150-kabupaten-kota-di-indonesia-2024.html'),
(2, 8, 'Median Monthly Spend', 32800000.00, 'BPS Housing, Water, Electricity, and Fuel Prices 2024 (office operations proxy)', 'https://www.bps.go.id/en/publication/2025/04/28/22904d2b5a04c6d27050846f/consumer-price-of-selected-goods-and-services-for-housing--water--electricity--and-household-fuel-group-of-150-regencies-municipalities-in-indonesia-2024.html'),
(3, 8, 'Median Monthly Spend', 46000000.00, 'Prototype labour-cost proxy pending defensible wage dataset', 'https://www.bps.go.id/en/publication/2025/05/16/b64f5cbd615a353a2e1588b8/national-consumer-price-of-selected-goods-and-services-2024.html'),
(4, 8, 'Median Monthly Spend', 20800000.00, 'BPS National Consumer Prices 2024 (outreach materials proxy)', 'https://www.bps.go.id/en/publication/2025/05/16/b64f5cbd615a353a2e1588b8/national-consumer-price-of-selected-goods-and-services-2024.html'),
(5, 8, 'Median Monthly Spend', 14200000.00, 'BPS National Consumer Prices 2024 (digital communications proxy)', 'https://www.bps.go.id/en/publication/2025/05/16/b64f5cbd615a353a2e1588b8/national-consumer-price-of-selected-goods-and-services-2024.html'),
(1, 9, 'Median Monthly Spend', 49200000.00, 'BPS Health, Transportation, and Education Prices 2024 (transport proxy)', 'https://www.bps.go.id/en/publication/2025/04/28/ed4d29c5d13ba67371799c58/harga-konsumen-beberapa-barang-dan-jasa-kelompok-kesehatan--transportasi--dan-pendidikan-150-kabupaten-kota-di-indonesia-2024.html'),
(2, 9, 'Median Monthly Spend', 32600000.00, 'BPS Housing, Water, Electricity, and Fuel Prices 2024 (office operations proxy)', 'https://www.bps.go.id/en/publication/2025/04/28/22904d2b5a04c6d27050846f/consumer-price-of-selected-goods-and-services-for-housing--water--electricity--and-household-fuel-group-of-150-regencies-municipalities-in-indonesia-2024.html'),
(3, 9, 'Median Monthly Spend', 45800000.00, 'Prototype labour-cost proxy pending defensible wage dataset', 'https://www.bps.go.id/en/publication/2025/05/16/b64f5cbd615a353a2e1588b8/national-consumer-price-of-selected-goods-and-services-2024.html'),
(4, 9, 'Median Monthly Spend', 21200000.00, 'BPS National Consumer Prices 2024 (outreach materials proxy)', 'https://www.bps.go.id/en/publication/2025/05/16/b64f5cbd615a353a2e1588b8/national-consumer-price-of-selected-goods-and-services-2024.html'),
(5, 9, 'Median Monthly Spend', 14000000.00, 'BPS National Consumer Prices 2024 (digital communications proxy)', 'https://www.bps.go.id/en/publication/2025/05/16/b64f5cbd615a353a2e1588b8/national-consumer-price-of-selected-goods-and-services-2024.html'),
(1, 10, 'Median Monthly Spend', 48800000.00, 'BPS Health, Transportation, and Education Prices 2024 (transport proxy)', 'https://www.bps.go.id/en/publication/2025/04/28/ed4d29c5d13ba67371799c58/harga-konsumen-beberapa-barang-dan-jasa-kelompok-kesehatan--transportasi--dan-pendidikan-150-kabupaten-kota-di-indonesia-2024.html'),
(2, 10, 'Median Monthly Spend', 32400000.00, 'BPS Housing, Water, Electricity, and Fuel Prices 2024 (office operations proxy)', 'https://www.bps.go.id/en/publication/2025/04/28/22904d2b5a04c6d27050846f/consumer-price-of-selected-goods-and-services-for-housing--water--electricity--and-household-fuel-group-of-150-regencies-municipalities-in-indonesia-2024.html'),
(3, 10, 'Median Monthly Spend', 45500000.00, 'Prototype labour-cost proxy pending defensible wage dataset', 'https://www.bps.go.id/en/publication/2025/05/16/b64f5cbd615a353a2e1588b8/national-consumer-price-of-selected-goods-and-services-2024.html'),
(4, 10, 'Median Monthly Spend', 21800000.00, 'BPS National Consumer Prices 2024 (outreach materials proxy)', 'https://www.bps.go.id/en/publication/2025/05/16/b64f5cbd615a353a2e1588b8/national-consumer-price-of-selected-goods-and-services-2024.html'),
(5, 10, 'Median Monthly Spend', 13800000.00, 'BPS National Consumer Prices 2024 (digital communications proxy)', 'https://www.bps.go.id/en/publication/2025/05/16/b64f5cbd615a353a2e1588b8/national-consumer-price-of-selected-goods-and-services-2024.html'),
(1, 11, 'Median Monthly Spend', 49400000.00, 'BPS Health, Transportation, and Education Prices 2024 (transport proxy)', 'https://www.bps.go.id/en/publication/2025/04/28/ed4d29c5d13ba67371799c58/harga-konsumen-beberapa-barang-dan-jasa-kelompok-kesehatan--transportasi--dan-pendidikan-150-kabupaten-kota-di-indonesia-2024.html'),
(2, 11, 'Median Monthly Spend', 32900000.00, 'BPS Housing, Water, Electricity, and Fuel Prices 2024 (office operations proxy)', 'https://www.bps.go.id/en/publication/2025/04/28/22904d2b5a04c6d27050846f/consumer-price-of-selected-goods-and-services-for-housing--water--electricity--and-household-fuel-group-of-150-regencies-municipalities-in-indonesia-2024.html'),
(3, 11, 'Median Monthly Spend', 46200000.00, 'Prototype labour-cost proxy pending defensible wage dataset', 'https://www.bps.go.id/en/publication/2025/05/16/b64f5cbd615a353a2e1588b8/national-consumer-price-of-selected-goods-and-services-2024.html'),
(4, 11, 'Median Monthly Spend', 22200000.00, 'BPS National Consumer Prices 2024 (outreach materials proxy)', 'https://www.bps.go.id/en/publication/2025/05/16/b64f5cbd615a353a2e1588b8/national-consumer-price-of-selected-goods-and-services-2024.html'),
(5, 11, 'Median Monthly Spend', 14100000.00, 'BPS National Consumer Prices 2024 (digital communications proxy)', 'https://www.bps.go.id/en/publication/2025/05/16/b64f5cbd615a353a2e1588b8/national-consumer-price-of-selected-goods-and-services-2024.html'),
(1, 12, 'Median Monthly Spend', 50500000.00, 'BPS Health, Transportation, and Education Prices 2024 (transport proxy)', 'https://www.bps.go.id/en/publication/2025/04/28/ed4d29c5d13ba67371799c58/harga-konsumen-beberapa-barang-dan-jasa-kelompok-kesehatan--transportasi--dan-pendidikan-150-kabupaten-kota-di-indonesia-2024.html'),
(2, 12, 'Median Monthly Spend', 33500000.00, 'BPS Housing, Water, Electricity, and Fuel Prices 2024 (office operations proxy)', 'https://www.bps.go.id/en/publication/2025/04/28/22904d2b5a04c6d27050846f/consumer-price-of-selected-goods-and-services-for-housing--water--electricity--and-household-fuel-group-of-150-regencies-municipalities-in-indonesia-2024.html'),
(3, 12, 'Median Monthly Spend', 46800000.00, 'Prototype labour-cost proxy pending defensible wage dataset', 'https://www.bps.go.id/en/publication/2025/05/16/b64f5cbd615a353a2e1588b8/national-consumer-price-of-selected-goods-and-services-2024.html'),
(4, 12, 'Median Monthly Spend', 22800000.00, 'BPS National Consumer Prices 2024 (outreach materials proxy)', 'https://www.bps.go.id/en/publication/2025/05/16/b64f5cbd615a353a2e1588b8/national-consumer-price-of-selected-goods-and-services-2024.html'),
(5, 12, 'Median Monthly Spend', 14500000.00, 'BPS National Consumer Prices 2024 (digital communications proxy)', 'https://www.bps.go.id/en/publication/2025/05/16/b64f5cbd615a353a2e1588b8/national-consumer-price-of-selected-goods-and-services-2024.html'),
(6, 5, 'Median Monthly Spend', 28700000.00, 'BPS Housing, Water, Electricity, and Fuel Prices 2024 (housing proxy)', 'https://www.bps.go.id/en/publication/2025/04/28/22904d2b5a04c6d27050846f/consumer-price-of-selected-goods-and-services-for-housing--water--electricity--and-household-fuel-group-of-150-regencies-municipalities-in-indonesia-2024.html'),
(6, 6, 'Median Monthly Spend', 29000000.00, 'BPS Housing, Water, Electricity, and Fuel Prices 2024 (housing proxy)', 'https://www.bps.go.id/en/publication/2025/04/28/22904d2b5a04c6d27050846f/consumer-price-of-selected-goods-and-services-for-housing--water--electricity--and-household-fuel-group-of-150-regencies-municipalities-in-indonesia-2024.html'),
(6, 7, 'Median Monthly Spend', 29400000.00, 'BPS Housing, Water, Electricity, and Fuel Prices 2024 (housing proxy)', 'https://www.bps.go.id/en/publication/2025/04/28/22904d2b5a04c6d27050846f/consumer-price-of-selected-goods-and-services-for-housing--water--electricity--and-household-fuel-group-of-150-regencies-municipalities-in-indonesia-2024.html'),
(6, 8, 'Median Monthly Spend', 29200000.00, 'BPS Housing, Water, Electricity, and Fuel Prices 2024 (housing proxy)', 'https://www.bps.go.id/en/publication/2025/04/28/22904d2b5a04c6d27050846f/consumer-price-of-selected-goods-and-services-for-housing--water--electricity--and-household-fuel-group-of-150-regencies-municipalities-in-indonesia-2024.html'),
(6, 9, 'Median Monthly Spend', 29100000.00, 'BPS Housing, Water, Electricity, and Fuel Prices 2024 (housing proxy)', 'https://www.bps.go.id/en/publication/2025/04/28/22904d2b5a04c6d27050846f/consumer-price-of-selected-goods-and-services-for-housing--water--electricity--and-household-fuel-group-of-150-regencies-municipalities-in-indonesia-2024.html'),
(6, 10, 'Median Monthly Spend', 28900000.00, 'BPS Housing, Water, Electricity, and Fuel Prices 2024 (housing proxy)', 'https://www.bps.go.id/en/publication/2025/04/28/22904d2b5a04c6d27050846f/consumer-price-of-selected-goods-and-services-for-housing--water--electricity--and-household-fuel-group-of-150-regencies-municipalities-in-indonesia-2024.html'),
(6, 11, 'Median Monthly Spend', 29300000.00, 'BPS Housing, Water, Electricity, and Fuel Prices 2024 (housing proxy)', 'https://www.bps.go.id/en/publication/2025/04/28/22904d2b5a04c6d27050846f/consumer-price-of-selected-goods-and-services-for-housing--water--electricity--and-household-fuel-group-of-150-regencies-municipalities-in-indonesia-2024.html'),
(6, 12, 'Median Monthly Spend', 29900000.00, 'BPS Housing, Water, Electricity, and Fuel Prices 2024 (housing proxy)', 'https://www.bps.go.id/en/publication/2025/04/28/22904d2b5a04c6d27050846f/consumer-price-of-selected-goods-and-services-for-housing--water--electricity--and-household-fuel-group-of-150-regencies-municipalities-in-indonesia-2024.html');

INSERT INTO MPAllowanceRecord (
  mp_id,
  category_id,
  period_id,
  allowance_cap,
  actual_spend,
  variance_percent,
  variance_amount
)
SELECT
  base.mp_id,
  base.category_id,
  p.period_id,
  base.allowance_cap,
  ROUND(
    base.actual_spend *
    CASE p.period_id
      WHEN 5 THEN 1.03
      WHEN 6 THEN 1.01
      WHEN 7 THEN 1.08
      WHEN 8 THEN 1.12
      WHEN 9 THEN 0.97
      WHEN 10 THEN 1.00
      WHEN 11 THEN 1.06
      WHEN 12 THEN 1.15
      ELSE 1
    END *
    CASE
      WHEN base.mp_id IN (8, 13, 16, 19) THEN 1.05
      WHEN base.mp_id IN (9, 14) THEN 1.03
      WHEN base.mp_id IN (10, 12, 18) THEN 0.95
      WHEN base.mp_id IN (11, 15, 17, 20) THEN 1.01
      ELSE 1
    END *
    CASE
      WHEN base.category_id = 1 AND p.period_id IN (7, 8, 12) THEN 1.12
      WHEN base.category_id = 2 AND p.period_id IN (6, 11) THEN 1.04
      WHEN base.category_id = 3 AND p.period_id IN (5, 12) THEN 1.06
      WHEN base.category_id = 4 AND p.period_id IN (8, 12) THEN 1.18
      WHEN base.category_id = 5 AND p.period_id IN (9, 10) THEN 0.88
      ELSE 1
    END,
    2
  ),
  0,
  0
FROM MPAllowanceRecord base
JOIN ReportingPeriod p
  ON p.period_id BETWEEN 5 AND 12
WHERE base.period_id = 4
  AND base.mp_id BETWEEN 1 AND 20;

-- Add Housing as a full sixth category by following the existing housing/office cost pattern.
INSERT INTO MPAllowanceRecord (
  mp_id,
  category_id,
  period_id,
  allowance_cap,
  actual_spend,
  variance_percent,
  variance_amount
)
SELECT
  office.mp_id,
  6,
  office.period_id,
  ROUND(office.allowance_cap * 1.12, 2),
  ROUND(
    office.actual_spend *
    CASE
      WHEN office.period_id IN (3, 4, 7, 11, 12) THEN 1.08
      WHEN office.period_id IN (5, 6, 8) THEN 1.05
      ELSE 1.02
    END *
    CASE
      WHEN office.mp_id IN (3, 8, 14, 19) THEN 1.09
      WHEN office.mp_id IN (4, 9, 10, 16) THEN 1.04
      WHEN office.mp_id IN (2, 5, 12, 18) THEN 0.93
      WHEN office.mp_id IN (1, 6, 11, 15) THEN 0.97
      ELSE 1
    END,
    2
  ),
  0,
  0
FROM MPAllowanceRecord office
WHERE office.category_id = 2
  AND office.mp_id BETWEEN 1 AND 20;

-- Apply rank-based allowance differentiation so Head/Vice/Member can carry different
-- allowance allocations for the same category-period.
UPDATE MPAllowanceRecord mar
JOIN MP m
  ON m.mp_id = mar.mp_id
SET mar.allowance_cap = ROUND(
  mar.allowance_cap *
  CASE m.mp_rank
    WHEN 'Head' THEN 1.10
    WHEN 'Vice' THEN 1.05
    ELSE 1.00
  END,
  2
)
WHERE mar.mp_id BETWEEN 1 AND 20;

UPDATE MPAllowanceRecord mar
JOIN CategoryBenchmark cb
  ON cb.category_id = mar.category_id
 AND cb.period_id = mar.period_id
SET
  mar.variance_amount = ROUND(mar.actual_spend - cb.benchmark_value, 2),
  mar.variance_percent = ROUND(
    ((mar.actual_spend - cb.benchmark_value) / cb.benchmark_value) * 100,
    2
  )
WHERE mar.period_id BETWEEN 5 AND 12
  AND mar.mp_id BETWEEN 1 AND 20;

UPDATE MPAllowanceRecord mar
JOIN CategoryBenchmark cb
  ON cb.category_id = mar.category_id
 AND cb.period_id = mar.period_id
SET
  mar.variance_amount = ROUND(mar.actual_spend - cb.benchmark_value, 2),
  mar.variance_percent = ROUND(
    ((mar.actual_spend - cb.benchmark_value) / cb.benchmark_value) * 100,
    2
  )
WHERE mar.category_id = 6
  AND mar.mp_id BETWEEN 1 AND 20;

-- Keep the prototype data varied but within a more believable public-facing range.
UPDATE MPAllowanceRecord mar
JOIN CategoryBenchmark cb
  ON cb.category_id = mar.category_id
 AND cb.period_id = mar.period_id
SET mar.actual_spend = ROUND(cb.benchmark_value * 1.49, 2)
WHERE mar.variance_percent > 49;

UPDATE MPAllowanceRecord mar
JOIN CategoryBenchmark cb
  ON cb.category_id = mar.category_id
 AND cb.period_id = mar.period_id
SET mar.actual_spend = ROUND(cb.benchmark_value * 0.62, 2)
WHERE mar.variance_percent < -38;

UPDATE MPAllowanceRecord mar
JOIN CategoryBenchmark cb
  ON cb.category_id = mar.category_id
 AND cb.period_id = mar.period_id
SET
  mar.variance_amount = ROUND(mar.actual_spend - cb.benchmark_value, 2),
  mar.variance_percent = ROUND(
    ((mar.actual_spend - cb.benchmark_value) / cb.benchmark_value) * 100,
    2
  )
WHERE mar.mp_id BETWEEN 1 AND 20;

INSERT INTO FeedbackResponse (
  feedback_id,
  feedback_type,
  mp_id,
  category_id,
  period_id,
  response_value,
  submitted_at,
  session_hash,
  source_page
) VALUES
(1, 'rating', 1, NULL, 1, 'somewhat_reasonable', '2026-01-18 10:12:00', 'sess_8f2c1a_mp1_jan', '/mps/1'),
(2, 'sentiment', NULL, 1, 1, 'slightly_high', '2026-01-18 10:15:00', 'sess_8f2c1a_cat1_jan', '/categories/1'),
(3, 'rating', 3, NULL, 2, 'not_reasonable', '2026-02-12 13:40:00', 'sess_b7d913_mp3_feb', '/mps/3'),
(4, 'sentiment', NULL, 2, 2, 'far_too_high', '2026-02-12 13:45:00', 'sess_b7d913_cat2_feb', '/categories/2'),
(5, 'rating', 4, NULL, 2, 'somewhat_reasonable', '2026-02-20 09:05:00', 'sess_1d4ef8_mp4_feb', '/mps/4'),
(6, 'sentiment', NULL, 4, 2, 'about_right', '2026-02-20 09:07:00', 'sess_1d4ef8_cat4_feb', '/categories/4'),
(7, 'rating', 5, NULL, 3, 'very_reasonable', '2026-03-08 16:10:00', 'sess_55cb22_mp5_mar', '/mps/5'),
(8, 'sentiment', NULL, 5, 3, 'about_right', '2026-03-08 16:14:00', 'sess_55cb22_cat5_mar', '/categories/5'),
(9, 'rating', 2, NULL, 3, 'somewhat_reasonable', '2026-03-14 11:21:00', 'sess_92aa61_mp2_mar', '/mps/2'),
(10, 'sentiment', NULL, 3, 3, 'about_right', '2026-03-14 11:24:00', 'sess_92aa61_cat3_mar', '/categories/3'),
(11, 'rating', 6, NULL, 4, 'somewhat_reasonable', '2026-04-11 08:35:00', 'sess_18ac90_mp6_apr', '/mps/6'),
(12, 'sentiment', NULL, 1, 4, 'slightly_high', '2026-04-11 08:39:00', 'sess_18ac90_cat1_apr', '/categories/1'),
(13, 'rating', 3, NULL, 4, 'not_reasonable', '2026-04-18 18:05:00', 'sess_27dd77_mp3_apr', '/mps/3'),
(14, 'sentiment', NULL, 1, 4, 'far_too_high', '2026-04-18 18:09:00', 'sess_27dd77_cat1_apr', '/categories/1'),
(15, 'rating', 7, NULL, 5, 'very_reasonable', '2026-05-09 12:10:00', 'sess_51bf22_mp7_may', '/mps/7'),
(16, 'sentiment', NULL, 4, 5, 'about_right', '2026-05-09 12:14:00', 'sess_51bf22_cat4_may', '/categories/4'),
(17, 'rating', 8, NULL, 6, 'not_reasonable', '2026-06-02 14:20:00', 'sess_62ce11_mp8_jun', '/mps/8'),
(18, 'sentiment', NULL, 2, 6, 'far_too_high', '2026-06-02 14:24:00', 'sess_62ce11_cat2_jun', '/categories/2'),
(19, 'rating', 9, NULL, 7, 'very_reasonable', '2026-07-17 09:42:00', 'sess_73dd08_mp9_jul', '/mps/9'),
(20, 'sentiment', NULL, 5, 7, 'about_right', '2026-07-17 09:48:00', 'sess_73dd08_cat5_jul', '/categories/5'),
(21, 'rating', 10, NULL, 8, 'somewhat_reasonable', '2026-08-21 17:10:00', 'sess_84ee19_mp10_aug', '/mps/10'),
(22, 'sentiment', NULL, 3, 8, 'slightly_high', '2026-08-21 17:15:00', 'sess_84ee19_cat3_aug', '/categories/3'),
(23, 'rating', 11, NULL, 9, 'not_reasonable', '2026-09-06 11:03:00', 'sess_95ff20_mp11_sep', '/mps/11'),
(24, 'sentiment', NULL, 1, 9, 'far_too_high', '2026-09-06 11:07:00', 'sess_95ff20_cat1_sep', '/categories/1'),
(25, 'rating', 12, NULL, 10, 'somewhat_reasonable', '2026-10-15 10:28:00', 'sess_a60131_mp12_oct', '/mps/12'),
(26, 'sentiment', NULL, 4, 10, 'about_right', '2026-10-15 10:31:00', 'sess_a60131_cat4_oct', '/categories/4'),
(27, 'rating', 13, NULL, 11, 'very_reasonable', '2026-11-22 15:16:00', 'sess_b71242_mp13_nov', '/mps/13'),
(28, 'sentiment', NULL, 5, 11, 'about_right', '2026-11-22 15:19:00', 'sess_b71242_cat5_nov', '/categories/5'),
(29, 'rating', 14, NULL, 12, 'somewhat_reasonable', '2026-12-10 13:12:00', 'sess_c82353_mp14_dec', '/mps/14'),
(30, 'sentiment', NULL, 2, 12, 'slightly_high', '2026-12-10 13:16:00', 'sess_c82353_cat2_dec', '/categories/2');


