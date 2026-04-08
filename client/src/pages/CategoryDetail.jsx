import {
  HandCoins,
  CalendarDays,
  ChevronDown,
  CircleHelp,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchJson, formatCurrency, getBrowserSessionHash } from "../lib/api";

function formatCompactCurrency(value) {
  const numericValue = Number(value || 0);

  if (numericValue >= 1000000) {
    return `Rp ${Number((numericValue / 1000000).toFixed(1))}M`;
  }

  return formatCurrency(numericValue);
}

function formatVarianceText(value) {
  const numericValue = Math.round(Math.abs(Number(value || 0)));
  return `${numericValue}%`;
}

function formatAxisCompactCurrency(value) {
  const numericValue = Number(value || 0);
  return `Rp ${Number((numericValue / 1000000).toFixed(0))}M`;
}

function createSmoothPath(points) {
  if (!points.length) {
    return "";
  }

  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y}`;
  }

  return points.reduce((path, point, index, array) => {
    if (index === 0) {
      return `M ${point.x} ${point.y}`;
    }

    const previous = array[index - 1];
    const controlX = (previous.x + point.x) / 2;
    return `${path} C ${controlX} ${previous.y}, ${controlX} ${point.y}, ${point.x} ${point.y}`;
  }, "");
}

function createRankFillPath(x, y, width, height, direction, shouldCurveEnd) {
  if (!shouldCurveEnd) {
    return [
      `M ${x} ${y}`,
      `L ${x + width} ${y}`,
      `L ${x + width} ${y + height}`,
      `L ${x} ${y + height}`,
      "Z",
    ].join(" ");
  }

  const radius = Math.min(12, width / 2, height);

  if (direction === "positive") {
    return [
      `M ${x} ${y + height}`,
      `L ${x} ${y + radius}`,
      `Q ${x} ${y} ${x + radius} ${y}`,
      `L ${x + width - radius} ${y}`,
      `Q ${x + width} ${y} ${x + width} ${y + radius}`,
      `L ${x + width} ${y + height}`,
      "Z",
    ].join(" ");
  }

  return [
    `M ${x} ${y}`,
    `L ${x} ${y + height - radius}`,
    `Q ${x} ${y + height} ${x + radius} ${y + height}`,
    `L ${x + width - radius} ${y + height}`,
    `Q ${x + width} ${y + height} ${x + width} ${y + height - radius}`,
    `L ${x + width} ${y}`,
    "Z",
  ].join(" ");
}

function isCurrentOrPastPeriod(period) {
  if (!period) {
    return false;
  }

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  if (Number(period.year) < currentYear) {
    return true;
  }

  if (Number(period.year) > currentYear) {
    return false;
  }

  return Number(period.month) <= currentMonth;
}

function CategoryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [benchmarks, setBenchmarks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [mps, setMps] = useState([]);
  const [selectedRank, setSelectedRank] = useState("Head");
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [selectedVariancePeriod, setSelectedVariancePeriod] = useState("");
  const [selectedTopSpendersPeriod, setSelectedTopSpendersPeriod] = useState("");
  const [selectedChartYear, setSelectedChartYear] = useState("");
  const [activeChartPoint, setActiveChartPoint] = useState(null);
  const [isYearMenuOpen, setIsYearMenuOpen] = useState(false);
  const [isVarianceMenuOpen, setIsVarianceMenuOpen] = useState(false);
  const [isTopSpendersMenuOpen, setIsTopSpendersMenuOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [hasSubmittedFeedback, setHasSubmittedFeedback] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const yearMenuRef = useRef(null);
  const varianceMenuRef = useRef(null);
  const topSpendersMenuRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    async function loadCategoryPage() {
      try {
        const [allowanceData, benchmarkData, categoryData, mpData] = await Promise.all([
          fetchJson(`/api/allowances?category_id=${id}`),
          fetchJson(`/api/benchmarks?category_id=${id}`),
          fetchJson("/api/categories"),
          fetchJson("/api/mps"),
        ]);

        if (isMounted) {
          setRecords(allowanceData);
          setBenchmarks(benchmarkData);
          setCategories(categoryData);
          setMps(mpData);
        }
      } catch {
        if (isMounted) {
          setError("Unable to load this allowance category right now.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadCategoryPage();

    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    let isMounted = true;

    async function loadExistingFeedback() {
      if (!id || !selectedPeriod) {
        if (isMounted) {
          setHasSubmittedFeedback(false);
          setFeedbackMessage("");
        }
        return;
      }

      try {
        const feedbackRows = await fetchJson(
          `/api/feedback?category_id=${encodeURIComponent(
            id
          )}&period_id=${encodeURIComponent(selectedPeriod)}`
        );
        const sessionHash = getBrowserSessionHash();
        const existingVote = feedbackRows.find(
          (item) =>
            String(item.category_id) === String(id) &&
            String(item.period_id) === String(selectedPeriod) &&
            item.session_hash === sessionHash
        );

        if (!isMounted) {
          return;
        }

        if (existingVote) {
          setHasSubmittedFeedback(true);
          setFeedbackMessage("Anonymous vote recorded for this period");
        } else {
          setHasSubmittedFeedback(false);
          setFeedbackMessage("");
        }
      } catch {
        if (isMounted) {
          setHasSubmittedFeedback(false);
          setFeedbackMessage("");
        }
      }
    }

    loadExistingFeedback();

    return () => {
      isMounted = false;
    };
  }, [id, selectedPeriod]);

  const category = categories.find((item) => Number(item.category_id) === Number(id));
  const mpMap = useMemo(() => new Map(mps.map((item) => [item.mp_id, item])), [mps]);

  const periods = useMemo(() => {
    const uniquePeriods = new Map();

    records.forEach((record) => {
      uniquePeriods.set(record.period_id, {
        period_id: record.period_id,
        label: record.reporting_label,
        year: Number(record.year),
        month: Number(record.month),
      });
    });

    return Array.from(uniquePeriods.values())
      .filter(isCurrentOrPastPeriod)
      .sort((a, b) => {
        if (a.year !== b.year) {
          return a.year - b.year;
        }

        return a.month - b.month;
      });
  }, [records]);

  useEffect(() => {
    if (!periods.length) {
      return;
    }

    if (!selectedPeriod || !periods.some((period) => String(period.period_id) === String(selectedPeriod))) {
      setSelectedPeriod(String(periods[periods.length - 1].period_id));
    }
  }, [periods, selectedPeriod]);

  useEffect(() => {
    if (!periods.length) {
      return;
    }

    if (
      !selectedVariancePeriod ||
      !periods.some((period) => String(period.period_id) === String(selectedVariancePeriod))
    ) {
      setSelectedVariancePeriod(String(periods[periods.length - 1].period_id));
    }
  }, [periods, selectedVariancePeriod]);

  useEffect(() => {
    if (!periods.length) {
      return;
    }

    if (
      !selectedTopSpendersPeriod ||
      !periods.some((period) => String(period.period_id) === String(selectedTopSpendersPeriod))
    ) {
      setSelectedTopSpendersPeriod(String(periods[periods.length - 1].period_id));
    }
  }, [periods, selectedTopSpendersPeriod]);

  useEffect(() => {
    if (!periods.length) {
      return;
    }

    const validYears = Array.from(new Set(periods.map((period) => String(period.year)))).sort();
    const latestYear = validYears[validYears.length - 1];

    if (!selectedChartYear || !validYears.includes(String(selectedChartYear))) {
      setSelectedChartYear(latestYear);
    }
  }, [periods, selectedChartYear]);

  useEffect(() => {
    function handlePointerDown(event) {
      if (!yearMenuRef.current?.contains(event.target)) {
        setIsYearMenuOpen(false);
      }

      if (!varianceMenuRef.current?.contains(event.target)) {
        setIsVarianceMenuOpen(false);
      }

      if (!topSpendersMenuRef.current?.contains(event.target)) {
        setIsTopSpendersMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  const yearOptions = useMemo(() => {
    return Array.from(new Set(periods.map((period) => String(period.year)))).sort();
  }, [periods]);

  const rankFilteredRecords = useMemo(() => {
    return records.filter((record) => record.mp_rank === selectedRank);
  }, [records, selectedRank]);

  const selectedRankLatest = useMemo(() => {
    if (!selectedPeriod) {
      return [];
    }

    return rankFilteredRecords.filter(
      (record) => String(record.period_id) === String(selectedPeriod)
    );
  }, [rankFilteredRecords, selectedPeriod]);

  const benchmarkMap = useMemo(() => {
    return new Map(
      benchmarks.map((benchmark) => [String(benchmark.period_id), Number(benchmark.benchmark_value)])
    );
  }, [benchmarks]);

  const headlineSpend = useMemo(() => {
    if (!selectedRankLatest.length) {
      return 0;
    }

    const total = selectedRankLatest.reduce(
      (sum, record) => sum + Number(record.actual_spend || 0),
      0
    );

    return total / selectedRankLatest.length;
  }, [selectedRankLatest]);

  const headlineVariance = useMemo(() => {
    if (!selectedRankLatest.length) {
      return 0;
    }

    const total = selectedRankLatest.reduce(
      (sum, record) => sum + Number(record.variance_percent || 0),
      0
    );

    return total / selectedRankLatest.length;
  }, [selectedRankLatest]);

  const currentBenchmark = benchmarkMap.get(String(selectedPeriod)) || 0;

  const lineChartData = useMemo(() => {
    return periods
      .filter((period) => String(period.year) === String(selectedChartYear || period.year))
      .map((period) => {
      const periodRecords = records.filter(
        (record) => Number(record.period_id) === Number(period.period_id)
      );

      const averageSpend = periodRecords.length
        ? periodRecords.reduce((sum, record) => sum + Number(record.actual_spend || 0), 0) /
          periodRecords.length
        : 0;

      const rankSpendRecords = periodRecords.filter((record) => record.mp_rank === selectedRank);
      const rankAverageSpend = rankSpendRecords.length
        ? rankSpendRecords.reduce((sum, record) => sum + Number(record.actual_spend || 0), 0) /
          rankSpendRecords.length
        : 0;

      return {
        label: period.label,
        monthLabel: period.month_name?.slice(0, 3) || period.label.slice(0, 3),
        fullMonthLabel: period.label,
        allowanceCap: periodRecords[0] ? Number(periodRecords[0].allowance_cap || 0) : 0,
        marketPrice: benchmarkMap.get(String(period.period_id)) || 0,
        medianSpendMp: averageSpend || rankAverageSpend,
      };
    });
  }, [benchmarkMap, periods, records, selectedChartYear, selectedRank]);

  const maxLineValue = Math.max(
    ...lineChartData.flatMap((item) => [item.allowanceCap, item.marketPrice, item.medianSpendMp]),
    1
  );

  const lineChartPoints = useMemo(() => {
    if (!lineChartData.length) {
      return [];
    }

    const startX = 48;
    const endX = 280;
    const yBase = 128;
    const chartHeight = 92;

    return lineChartData.map((item, index) => {
      const x =
        lineChartData.length === 1
          ? (startX + endX) / 2
          : startX + (index * (endX - startX)) / (lineChartData.length - 1);

      return {
        ...item,
        x,
        allowanceY: yBase - (item.allowanceCap / maxLineValue) * chartHeight,
        marketY: yBase - (item.marketPrice / maxLineValue) * chartHeight,
        medianY: yBase - (item.medianSpendMp / maxLineValue) * chartHeight,
      };
    });
  }, [lineChartData, maxLineValue]);

  const lineChartYAxisLabels = useMemo(() => {
    const values = [1, 0.75, 0.5, 0.25, 0].map((ratio) => ({
      y: 36 + (1 - ratio) * 92,
      value: formatAxisCompactCurrency(maxLineValue * ratio),
    }));

    return values;
  }, [maxLineValue]);

  const allowanceLinePath = useMemo(
    () => createSmoothPath(lineChartPoints.map((item) => ({ x: item.x, y: item.allowanceY }))),
    [lineChartPoints]
  );
  const marketLinePath = useMemo(
    () => createSmoothPath(lineChartPoints.map((item) => ({ x: item.x, y: item.marketY }))),
    [lineChartPoints]
  );
  const medianLinePath = useMemo(
    () => createSmoothPath(lineChartPoints.map((item) => ({ x: item.x, y: item.medianY }))),
    [lineChartPoints]
  );

  const rankBars = useMemo(() => {
    const ranks = ["Head", "Vice", "Member"];

    return ranks.map((rank) => {
      const periodRecords = records.filter(
        (record) =>
          record.mp_rank === rank &&
          String(record.period_id) === String(selectedVariancePeriod)
      );

      const averageVariance = periodRecords.length
        ? periodRecords.reduce((sum, record) => sum + Number(record.variance_percent || 0), 0) /
          periodRecords.length
        : 0;

      return {
        rank,
        variance: averageVariance,
      };
    });
  }, [records, selectedVariancePeriod]);

  const rankChartData = useMemo(() => {
    const chart = {
      left: 44,
      right: 286,
      top: 22,
      bottom: 150,
      width: 242,
      height: 128,
    };
    const maxAbsVariance = Math.max(...rankBars.map((item) => Math.abs(Number(item.variance || 0))), 1);
    const domainMax = Math.ceil(maxAbsVariance * 1.15);
    const zeroY = chart.top + chart.height / 2;
    const barWidth = 44;
    const slotWidth = chart.width / rankBars.length;
    const ticks = [domainMax, 0, -domainMax]
      .map((value) => Number(value.toFixed(0)))
      .filter((value, index, array) => array.indexOf(value) === index)
      .sort((a, b) => b - a)
      .map((value) => ({
        value,
        y: chart.top + ((domainMax - value) / (domainMax * 2)) * chart.height,
      }));

    const bars = rankBars.map((item, index) => {
      const variance = Number(item.variance || 0);
      const centerX = chart.left + slotWidth * index + slotWidth / 2;
      const magnitude = Math.abs(variance);
      const halfHeight = chart.height / 2;
      const fillSize = Math.max((magnitude / domainMax) * halfHeight, 4);
      const shellHeight = chart.height - 6;
      const fillY = variance >= 0 ? zeroY - fillSize : zeroY;
      const markerY = variance >= 0 ? fillY : fillY + fillSize;
      const shellEndY = chart.top + shellHeight;
      const reachesShellEnd =
        variance >= 0 ? fillY <= chart.top + 1 : fillY + fillSize >= shellEndY - 1;
      const labelCenterY =
        variance >= 0
          ? Math.max(fillY - 10, chart.top + 14)
          : Math.min(markerY + 12, shellEndY - 10);

      return {
        ...item,
        variance,
        direction: variance >= 0 ? "positive" : "negative",
        centerX,
        x: centerX - barWidth / 2,
        width: barWidth,
        shellY: chart.top,
        shellHeight,
        fillY,
        fillHeight: fillSize,
        markerY,
        fillTopY: fillY,
        reachesShellEnd,
        labelCenterY,
      };
    });

    return {
      chart,
      zeroY,
      domainMax,
      ticks,
      bars,
      verticalGuides: rankBars.map((item, index) => chart.left + slotWidth * index + slotWidth / 2),
    };
  }, [rankBars]);

  const topSpenders = useMemo(() => {
    return records
      .filter((record) => String(record.period_id) === String(selectedTopSpendersPeriod))
      .sort((a, b) => Number(b.actual_spend) - Number(a.actual_spend))
      .slice(0, 5);
  }, [records, selectedTopSpendersPeriod]);

  async function submitFeedback(responseValue) {
    if (!selectedPeriod || submittingFeedback) {
      return;
    }

    setSubmittingFeedback(true);
    setFeedbackMessage("");

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          feedback_type: "sentiment",
          category_id: Number(id),
          period_id: Number(selectedPeriod),
          response_value: responseValue,
          session_hash: getBrowserSessionHash(),
          source_page: `/categories/${id}`,
        }),
      });

      if (!response.ok) {
        throw new Error("Feedback failed");
      }

      await response.json();
      await fetchJson(`/api/feedback?category_id=${id}`);
      setFeedbackMessage("Anonymous vote recorded for this period");
      setHasSubmittedFeedback(true);
    } catch (error) {
      if (error instanceof Error && error.message.includes("409")) {
        setFeedbackMessage("Anonymous vote recorded for this period");
        setHasSubmittedFeedback(true);
      } else {
        setFeedbackMessage("Unable to save feedback right now");
        setHasSubmittedFeedback(false);
      }
    } finally {
      setSubmittingFeedback(false);
    }
  }

  return (
    <div className="category-profile-screen">
      <div className="category-profile-top">
        {loading && <div className="card status-card">Loading category...</div>}
        {error && <div className="card status-card error-card">{error}</div>}

        {!loading && !error && (
          <>
            <div className="rank-toggle-group">
              {["Head", "Vice", "Member"].map((rank) => (
                <button
                  key={rank}
                  type="button"
                  className={selectedRank === rank ? "active" : ""}
                  onClick={() => setSelectedRank(rank)}
                >
                  {rank.toUpperCase()} MP
                </button>
              ))}
            </div>

            <section className="category-hero-stat">
              <div className="category-hero-label">
                {`${category?.category_name || "Allowance"} Allowance Given (Per Month)`}
              </div>
              <div className="category-hero-value">
                <HandCoins size={20} />
                <span>{formatCompactCurrency(headlineSpend)}</span>
              </div>
              <div className="category-hero-chip">
                Allowance is <strong>{formatVarianceText(headlineVariance)}</strong>{" "}
                {headlineVariance >= 0 ? "Above" : "Below"} Category Benchmark
              </div>
              <div className="category-hero-benchmark">
                National median{" "}
                <span className="category-hero-benchmark-name">
                  {category?.category_name?.toLowerCase() || "category"}
                </span>{" "}
                benchmark:
                <strong className="category-hero-benchmark-value">
                  {formatCompactCurrency(currentBenchmark)}
                </strong>
              </div>
            </section>

            <section className="category-feedback-panel">
              <div className="profile-feedback-title">
                <CircleHelp size={25} />
                <span>How appropriate is this {category?.category_name?.toLowerCase()} allowance?</span>
              </div>

              <div className="category-feedback-buttons">
                <button
                  type="button"
                  className={`feedback-choice negative ${hasSubmittedFeedback ? "submitted" : ""}`}
                  onClick={() => submitFeedback("far_too_high")}
                  disabled={submittingFeedback || hasSubmittedFeedback}
                >
                  <span className="feedback-choice-icon far-high" aria-hidden="true">
                    <i className="feedback-choice-bar dark" />
                    <i className="feedback-choice-bar accent" />
                  </span>
                  Far too high
                </button>
                <button
                  type="button"
                  className={`feedback-choice warning ${hasSubmittedFeedback ? "submitted" : ""}`}
                  onClick={() => submitFeedback("slightly_high")}
                  disabled={submittingFeedback || hasSubmittedFeedback}
                >
                  <span className="feedback-choice-icon slightly-high" aria-hidden="true">
                    <i className="feedback-choice-bar dark" />
                    <i className="feedback-choice-bar accent" />
                  </span>
                  Slightly high
                </button>
                <button
                  type="button"
                  className={`feedback-choice positive ${hasSubmittedFeedback ? "submitted" : ""}`}
                  onClick={() => submitFeedback("about_right")}
                  disabled={submittingFeedback || hasSubmittedFeedback}
                >
                  <span className="feedback-choice-icon about-right" aria-hidden="true">
                    <i className="feedback-choice-bar dark" />
                    <i className="feedback-choice-bar accent" />
                  </span>
                  About right
                </button>
              </div>

              <p className="feedback-anonymous-note">
                One anonymous vote per browser per period.
              </p>

              {(submittingFeedback || hasSubmittedFeedback) && (
                <>
                  <div className="profile-feedback-status">
                    <span>{submittingFeedback ? "Saving feedback..." : feedbackMessage}</span>
                    {!submittingFeedback && hasSubmittedFeedback && <CheckCircle2 size={18} />}
                  </div>

                  {hasSubmittedFeedback && (
                    <button
                      type="button"
                      className="summary-button"
                      onClick={() =>
                        navigate(
                          `/feedback?period=${encodeURIComponent(
                            selectedPeriod
                          )}&focus=category&category_id=${encodeURIComponent(
                            id || ""
                          )}&category_name=${encodeURIComponent(
                            category?.category_name || ""
                          )}`
                        )
                      }
                    >
                      <span>View public feedback summary</span>
                      <span className="summary-button-icon" aria-hidden="true">
                        <ChevronRight size={12} />
                      </span>
                    </button>
                  )}
                </>
              )}
            </section>
          </>
        )}
      </div>

      {!loading && !error && (
        <div className="category-profile-sheet">
          <section className="dark-panel">
            <div className="dark-panel-header">
              <h2>Budget vs. Benchmark</h2>
              <div
                className={`dark-period-wrap ${isYearMenuOpen ? "open" : ""}`}
                ref={yearMenuRef}
              >
                <button
                  type="button"
                  className="dark-period-pill dark-period-trigger"
                  aria-haspopup="listbox"
                  aria-expanded={isYearMenuOpen}
                  onClick={() => setIsYearMenuOpen((current) => !current)}
                >
                  <CalendarDays size={12} />
                  {selectedChartYear || yearOptions[yearOptions.length - 1] || "2026"}
                  <ChevronDown size={12} />
                </button>
                {isYearMenuOpen ? (
                  <div className="dark-period-menu" role="listbox">
                    {yearOptions.map((year) => (
                      <button
                        key={year}
                        type="button"
                        className={`dark-period-option ${year === selectedChartYear ? "active" : ""}`}
                        role="option"
                        aria-selected={year === selectedChartYear}
                        onClick={() => {
                          setSelectedChartYear(year);
                          setIsYearMenuOpen(false);
                        }}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

              <svg viewBox="0 0 308 168" className="line-chart" aria-label="Budget chart">
                {lineChartPoints.map((item) => (
                  <line
                    key={`vertical-${item.label}`}
                    x1={item.x}
                    y1="26"
                    x2={item.x}
                    y2="128"
                    className="chart-grid-line vertical"
                  />
                ))}
                {[0, 1, 2, 3, 4].map((index) => (
                  <line
                    key={index}
                    x1="46"
                    y1={36 + index * 23}
                    x2="286"
                    y2={36 + index * 23}
                    className="chart-grid-line"
                  />
                ))}

                {lineChartYAxisLabels.map((item) => (
                  <text
                    key={`${item.y}-${item.value}`}
                    x="40"
                    y={item.y + 3}
                    textAnchor="end"
                    className="chart-axis-label"
                  >
                    {item.value}
                  </text>
                ))}

                {lineChartPoints.map((item) => (
                  <text
                    key={item.label}
                    x={item.x}
                    y="148"
                    textAnchor="middle"
                    className="chart-axis-text"
                  >
                    {item.monthLabel}
                  </text>
                ))}

                <path
                  fill="none"
                  stroke="#d54a3c"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d={allowanceLinePath}
                />
                <path
                  fill="none"
                  stroke="#f0c43d"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d={marketLinePath}
                />
                <path
                  fill="none"
                  stroke="#8f8f72"
                  strokeWidth="2.2"
                  strokeDasharray="4 4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d={medianLinePath}
                />
                {lineChartPoints.map((item) => (
                  <g key={`points-${item.label}`}>
                    <circle
                      cx={item.x}
                      cy={item.allowanceY}
                      r="3"
                      className="chart-point red"
                      onMouseEnter={() =>
                        setActiveChartPoint({
                          x: item.x,
                          y: item.allowanceY,
                          label: `${item.fullMonthLabel} Allowance Cap`,
                          value: formatCompactCurrency(item.allowanceCap),
                        })
                      }
                      onMouseLeave={() => setActiveChartPoint(null)}
                      onClick={() =>
                        setActiveChartPoint({
                          x: item.x,
                          y: item.allowanceY,
                          label: `${item.fullMonthLabel} Allowance Cap`,
                          value: formatCompactCurrency(item.allowanceCap),
                        })
                      }
                    />
                    <circle
                      cx={item.x}
                      cy={item.marketY}
                      r="3"
                      className="chart-point yellow"
                      onMouseEnter={() =>
                        setActiveChartPoint({
                          x: item.x,
                          y: item.marketY,
                          label: `${item.fullMonthLabel} Benchmark`,
                          value: formatCompactCurrency(item.marketPrice),
                        })
                      }
                      onMouseLeave={() => setActiveChartPoint(null)}
                      onClick={() =>
                        setActiveChartPoint({
                          x: item.x,
                          y: item.marketY,
                          label: `${item.fullMonthLabel} Benchmark`,
                          value: formatCompactCurrency(item.marketPrice),
                        })
                      }
                    />
                    <circle
                      cx={item.x}
                      cy={item.medianY}
                      r="2.8"
                      className="chart-point grey"
                      onMouseEnter={() =>
                        setActiveChartPoint({
                          x: item.x,
                          y: item.medianY,
                          label: `${item.fullMonthLabel} Median Spend MP`,
                          value: formatCompactCurrency(item.medianSpendMp),
                        })
                      }
                      onMouseLeave={() => setActiveChartPoint(null)}
                      onClick={() =>
                        setActiveChartPoint({
                          x: item.x,
                          y: item.medianY,
                          label: `${item.fullMonthLabel} Median Spend MP`,
                          value: formatCompactCurrency(item.medianSpendMp),
                        })
                      }
                    />
                  </g>
                ))}
                {activeChartPoint ? (
                  <g
                    className="chart-tooltip"
                    transform={`translate(${Math.min(activeChartPoint.x + 8, 202)}, ${Math.max(
                      activeChartPoint.y - 34,
                      8
                    )})`}
                  >
                    <rect width="108" height="28" rx="7" />
                    <text x="6" y="10" className="chart-tooltip-label">
                      {activeChartPoint.label}
                    </text>
                    <text x="6" y="21" className="chart-tooltip-value">
                      {activeChartPoint.value}
                    </text>
                  </g>
                ) : null}
              </svg>

            <div className="chart-legend">
              <span><i className="legend red" />Allowance Cap</span>
              <span><i className="legend yellow" />Benchmark Value</span>
              <span><i className="legend grey" />Median Spend MP</span>
            </div>
          </section>

          <section className="dark-panel">
            <div className="dark-panel-header">
              <h2>Average Variance by MP Rank</h2>
              <div
                className={`dark-period-wrap ${isVarianceMenuOpen ? "open" : ""}`}
                ref={varianceMenuRef}
              >
                <button
                  type="button"
                  className="dark-period-pill dark-period-trigger"
                  aria-haspopup="listbox"
                  aria-expanded={isVarianceMenuOpen}
                  onClick={() => setIsVarianceMenuOpen((current) => !current)}
                >
                  <CalendarDays size={12} />
                  {periods.find((period) => String(period.period_id) === String(selectedVariancePeriod))?.label ||
                    "Latest"}
                  <ChevronDown size={12} />
                </button>
                {isVarianceMenuOpen ? (
                  <div className="dark-period-menu" role="listbox">
                    {periods.map((period) => (
                      <button
                        key={period.period_id}
                        type="button"
                        className={`dark-period-option ${
                          String(period.period_id) === String(selectedVariancePeriod) ? "active" : ""
                        }`}
                        role="option"
                        aria-selected={String(period.period_id) === String(selectedVariancePeriod)}
                        onClick={() => {
                          setSelectedVariancePeriod(String(period.period_id));
                          setIsVarianceMenuOpen(false);
                        }}
                      >
                        {period.label}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            <svg viewBox="0 0 308 182" className="rank-variance-chart" aria-label="Average variance by MP rank">
              <line
                x1={rankChartData.chart.left}
                y1={rankChartData.chart.top}
                x2={rankChartData.chart.left}
                y2={rankChartData.chart.bottom}
                className="rank-chart-axis"
              />
              <line
                x1={rankChartData.chart.left}
                y1={rankChartData.chart.bottom}
                x2={rankChartData.chart.right}
                y2={rankChartData.chart.bottom}
                className="rank-chart-axis"
              />

              {rankChartData.verticalGuides.map((x) => (
                <line
                  key={`guide-${x}`}
                  x1={x}
                  y1={rankChartData.chart.top}
                  x2={x}
                  y2={rankChartData.chart.bottom}
                  className="rank-chart-grid vertical"
                />
              ))}

              {rankChartData.ticks.map((tick) => (
                <g key={`tick-${tick.value}`}>
                  <line
                    x1={rankChartData.chart.left}
                    y1={tick.y}
                    x2={rankChartData.chart.right}
                    y2={tick.y}
                    className={tick.value === 0 ? "rank-chart-zero" : "rank-chart-grid"}
                  />
                  <text
                    x={rankChartData.chart.left - 6}
                    y={tick.y + 3}
                    textAnchor="end"
                    className="rank-chart-y-label"
                  >
                    {tick.value > 0 ? "+" : ""}
                    {Math.round(tick.value)}%
                  </text>
                </g>
              ))}

              <text
                transform={`translate(14 ${(
                  rankChartData.chart.top +
                  rankChartData.chart.bottom
                ) / 2}) rotate(-90)`}
                textAnchor="middle"
                className="rank-chart-axis-title"
              >
                Variance (%)
              </text>

              {rankChartData.bars.map((item) => (
                <g key={item.rank}>
                  <rect
                    x={item.x}
                    y={item.shellY}
                    width={item.width}
                    height={item.shellHeight}
                    rx="18"
                    className="rank-chart-shell"
                  />
                  <path
                    d={createRankFillPath(
                      item.x,
                      item.fillY,
                      item.width,
                      item.fillHeight,
                      item.direction,
                      item.reachesShellEnd
                    )}
                    className={`rank-chart-bar rank-${item.rank.toLowerCase()}`}
                  />
                  <line
                    x1={item.x - 2}
                    y1={item.markerY}
                    x2={item.x + item.width + 2}
                    y2={item.markerY}
                    className={`rank-chart-marker rank-${item.rank.toLowerCase()}`}
                  />
                  <rect
                    x={item.centerX - 26}
                    y="168"
                    width="12"
                    height="4"
                    rx="2"
                    className={`rank-chart-chip rank-${item.rank.toLowerCase()}`}
                  />
                  <text
                    x={item.centerX - 10}
                    y="176"
                    textAnchor="start"
                    className="rank-chart-x-label"
                  >
                    {item.rank} MPs
                  </text>
                </g>
              ))}
            </svg>

            <div className="rank-chart-summary" aria-label="Average variance values by MP rank">
              {rankChartData.bars.map((item) => (
                <div key={`summary-${item.rank}`} className="rank-chart-summary-item">
                  <i className={`rank-chart-chip rank-${item.rank.toLowerCase()}`} />
                  <span className="rank-chart-summary-label">{item.rank} MPs</span>
                  <strong
                    className={`rank-chart-summary-value ${item.variance < 0 ? "negative" : "positive"}`}
                  >
                    {item.variance > 0 ? "+" : ""}
                    {Number(item.variance.toFixed(1))}%
                  </strong>
                </div>
              ))}
            </div>
          </section>

            <section className="category-top-spenders">
              <div className="top-spenders-header">
                <div>
                  <h2>
                    Top Spenders in{" "}
                    {category?.category_name || "This Category"}
                  </h2>
                </div>
                <div
                  className={`profile-period-wrap ${isTopSpendersMenuOpen ? "open" : ""}`}
                ref={topSpendersMenuRef}
              >
                <button
                  type="button"
                  className="profile-period-pill profile-period-trigger"
                  aria-haspopup="listbox"
                  aria-expanded={isTopSpendersMenuOpen}
                  onClick={() => setIsTopSpendersMenuOpen((current) => !current)}
                >
                  {periods.find((period) => String(period.period_id) === String(selectedTopSpendersPeriod))?.label ||
                    "Latest"}
                  <ChevronDown size={12} />
                </button>
                {isTopSpendersMenuOpen ? (
                  <div className="profile-period-menu" role="listbox">
                    {periods.map((period) => (
                      <button
                        key={period.period_id}
                        type="button"
                        className={`profile-period-option ${
                          String(period.period_id) === String(selectedTopSpendersPeriod) ? "active" : ""
                        }`}
                        role="option"
                        aria-selected={String(period.period_id) === String(selectedTopSpendersPeriod)}
                        onClick={() => {
                          setSelectedTopSpendersPeriod(String(period.period_id));
                          setIsTopSpendersMenuOpen(false);
                        }}
                      >
                        {period.label}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="category-table-head">
              <span>#</span>
              <span>MP</span>
              <span>Party</span>
              <span>Monthly Spend</span>
              <span>Variance</span>
            </div>

            {topSpenders.map((item, index) => (
              <div className="category-table-row" key={item.allowance_record_id}>
                <span>{index + 1}</span>
                <span>{item.display_name || item.mp_name}</span>
                <span>{mpMap.get(item.mp_id)?.party_abbreviation || "-"}</span>
                <span>{formatCompactCurrency(item.actual_spend)}</span>
                <span className="category-variance-text">
                  {item.variance_percent > 0 ? "+" : ""}
                  {Math.round(item.variance_percent)}%
                </span>
              </div>
            ))}
          </section>
        </div>
      )}
    </div>
  );
}

export default CategoryDetail;
