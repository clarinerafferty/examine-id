import {
  HandCoins,
  CalendarDays,
  ChevronDown,
  CircleHelp,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  fetchJson,
  formatCurrency,
  getBrowserSessionHash,
  postJson,
} from "../lib/api";

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

function formatDisplayDate(value) {
  if (!value) {
    return "No recent update";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
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
  const [activeRankBarPoint, setActiveRankBarPoint] = useState(null);
  const [isYearMenuOpen, setIsYearMenuOpen] = useState(false);
  const [isHeroPeriodMenuOpen, setIsHeroPeriodMenuOpen] = useState(false);
  const [isVarianceMenuOpen, setIsVarianceMenuOpen] = useState(false);
  const [isTopSpendersMenuOpen, setIsTopSpendersMenuOpen] = useState(false);
  const [isBenchmarkInfoOpen, setIsBenchmarkInfoOpen] = useState(false);
  const [isBudgetInfoOpen, setIsBudgetInfoOpen] = useState(false);
  const [isRankInfoOpen, setIsRankInfoOpen] = useState(false);
  const [isTopSpendersInfoOpen, setIsTopSpendersInfoOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [hasSubmittedFeedback, setHasSubmittedFeedback] = useState(false);
  const [isRankTogglePinned, setIsRankTogglePinned] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const yearMenuRef = useRef(null);
  const heroPeriodMenuRef = useRef(null);
  const varianceMenuRef = useRef(null);
  const topSpendersMenuRef = useRef(null);
  const rankToggleRef = useRef(null);
  const categoryFeedbackType = useMemo(
    () => `sentiment_${String(selectedRank || "member").toLowerCase()}`,
    [selectedRank]
  );

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
            String(item.feedback_type) === String(categoryFeedbackType) &&
            item.session_hash === sessionHash
        );

        if (!isMounted) {
          return;
        }

        if (existingVote) {
          setHasSubmittedFeedback(true);
          setFeedbackMessage(`Anonymous vote recorded for ${selectedRank} MPs this period`);
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
  }, [categoryFeedbackType, id, selectedPeriod, selectedRank]);

  useEffect(() => {
    function updateRankTogglePinned() {
      if (!rankToggleRef.current) {
        return;
      }

      const top = rankToggleRef.current.getBoundingClientRect().top;
      setIsRankTogglePinned(top <= 10);
    }

    updateRankTogglePinned();
    window.addEventListener("scroll", updateRankTogglePinned, { passive: true });
    window.addEventListener("resize", updateRankTogglePinned);

    return () => {
      window.removeEventListener("scroll", updateRankTogglePinned);
      window.removeEventListener("resize", updateRankTogglePinned);
    };
  }, []);

  useEffect(() => {
    const hasModalOpen = isBudgetInfoOpen || isRankInfoOpen || isTopSpendersInfoOpen;

    document.body.classList.toggle("modal-open", hasModalOpen);

    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [isBudgetInfoOpen, isRankInfoOpen, isTopSpendersInfoOpen]);

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

      if (!heroPeriodMenuRef.current?.contains(event.target)) {
        setIsHeroPeriodMenuOpen(false);
      }

      if (!varianceMenuRef.current?.contains(event.target)) {
        setIsVarianceMenuOpen(false);
      }

      if (!topSpendersMenuRef.current?.contains(event.target)) {
        setIsTopSpendersMenuOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setIsBenchmarkInfoOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
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

  const headlineAllowance = useMemo(() => {
    if (!selectedRankLatest.length) {
      return 0;
    }

    const total = selectedRankLatest.reduce(
      (sum, record) => sum + Number(record.allowance_cap || 0),
      0
    );

    return total / selectedRankLatest.length;
  }, [selectedRankLatest]);

  const currentBenchmark = benchmarkMap.get(String(selectedPeriod)) || 0;
  const headlineVariance = useMemo(() => {
    if (!currentBenchmark) {
      return 0;
    }

    return ((headlineAllowance - currentBenchmark) / currentBenchmark) * 100;
  }, [headlineAllowance, currentBenchmark]);
  const selectedPeriodLabel =
    periods.find((period) => String(period.period_id) === String(selectedPeriod))?.label ||
    "Select period";
  const selectedPeriodIndex = periods.findIndex(
    (period) => String(period.period_id) === String(selectedPeriod)
  );
  const previousPeriod = selectedPeriodIndex > 0 ? periods[selectedPeriodIndex - 1] : null;
  const previousBenchmark = previousPeriod
    ? benchmarkMap.get(String(previousPeriod.period_id)) || 0
    : 0;
  const benchmarkMoMPercent =
    previousBenchmark > 0
      ? ((currentBenchmark - previousBenchmark) / previousBenchmark) * 100
      : null;
  const benchmarkGapAmount = headlineAllowance - currentBenchmark;

  const heroLastUpdated = useMemo(() => {
    if (!selectedRankLatest.length) {
      return "";
    }

    const latest = selectedRankLatest.reduce((latestRecord, record) => {
      if (!latestRecord) {
        return record;
      }

      return new Date(record.last_updated) > new Date(latestRecord.last_updated)
        ? record
        : latestRecord;
    }, null);

    return latest?.last_updated || "";
  }, [selectedRankLatest]);

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
      const rankAverageAllowance = rankSpendRecords.length
        ? rankSpendRecords.reduce((sum, record) => sum + Number(record.allowance_cap || 0), 0) /
          rankSpendRecords.length
        : 0;

      return {
        label: period.label,
        monthLabel: period.month_name?.slice(0, 3) || period.label.slice(0, 3),
        fullMonthLabel: period.label,
        allowanceCap: rankAverageAllowance || (periodRecords[0] ? Number(periodRecords[0].allowance_cap || 0) : 0),
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
      const averageVarianceAmount = periodRecords.length
        ? periodRecords.reduce((sum, record) => sum + Number(record.variance_amount || 0), 0) /
          periodRecords.length
        : 0;

      return {
        rank,
        variance: averageVariance,
        varianceAmount: averageVarianceAmount,
      };
    });
  }, [records, selectedVariancePeriod]);

  const rankBreakdown = useMemo(() => {
    const ranks = ["Head", "Vice", "Member"];

    return ranks.map((rank) => {
      const variances = records
        .filter(
          (record) =>
            record.mp_rank === rank &&
            String(record.period_id) === String(selectedVariancePeriod)
        )
        .map((record) => Number(record.variance_percent || 0))
        .sort((a, b) => a - b);

      const total = variances.length;
      const aboveCount = variances.filter((value) => value > 5).length;
      const belowCount = variances.filter((value) => value < -5).length;
      const nearCount = total - aboveCount - belowCount;
      const median =
        !total
          ? 0
          : total % 2 === 1
            ? variances[(total - 1) / 2]
            : (variances[total / 2 - 1] + variances[total / 2]) / 2;

      return {
        rank,
        total,
        aboveCount,
        belowCount,
        nearCount,
        minVariance: total ? variances[0] : 0,
        maxVariance: total ? variances[total - 1] : 0,
        median,
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
        varianceAmount: Number(item.varianceAmount || 0),
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

  const budgetChartYearLabel = selectedChartYear || yearOptions[yearOptions.length - 1] || "2026";

  const selectedVariancePeriodLabel =
    periods.find((period) => String(period.period_id) === String(selectedVariancePeriod))?.label ||
    "the selected month";

  useEffect(() => {
    setActiveRankBarPoint(null);
  }, [selectedVariancePeriod]);

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
      await postJson("/api/feedback", {
        feedback_type: categoryFeedbackType,
        category_id: Number(id),
        period_id: Number(selectedPeriod),
        response_value: responseValue,
        session_hash: getBrowserSessionHash(),
        source_page: `/categories/${id}`,
      });
      await fetchJson(`/api/feedback?category_id=${id}`);
      setFeedbackMessage(`Anonymous vote recorded for ${selectedRank} MPs this period`);
      setHasSubmittedFeedback(true);
    } catch (error) {
      if (error instanceof Error && error.status === 409) {
        setFeedbackMessage(`Anonymous vote recorded for ${selectedRank} MPs this period`);
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
            <div ref={rankToggleRef} className="rank-toggle-sticky">
              <div className={`rank-toggle-group ${isRankTogglePinned ? "pinned" : ""}`}>
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
            </div>

            <section className="category-hero-stat">
              <div className="category-hero-topline">
                <div className="category-hero-label">
                  {`${category?.category_name || "Allowance"} ALLOWANCE (MONTHLY)`}
                </div>
                <div
                  className={`dark-period-wrap ${isHeroPeriodMenuOpen ? "open" : ""}`}
                  ref={heroPeriodMenuRef}
                >
                  <button
                    type="button"
                    className="dark-period-pill dark-period-trigger category-hero-period-trigger"
                    aria-haspopup="listbox"
                    aria-expanded={isHeroPeriodMenuOpen}
                    aria-label="Select period for headline allowance"
                    onClick={() => setIsHeroPeriodMenuOpen((current) => !current)}
                  >
                    <CalendarDays size={12} />
                    {selectedPeriodLabel}
                    <ChevronDown size={12} />
                  </button>
                  {isHeroPeriodMenuOpen ? (
                    <div className="dark-period-menu" role="listbox">
                      {periods.map((period) => (
                        <button
                          key={period.period_id}
                          type="button"
                          className={`dark-period-option ${
                            String(period.period_id) === String(selectedPeriod) ? "active" : ""
                          }`}
                          role="option"
                          aria-selected={String(period.period_id) === String(selectedPeriod)}
                          onClick={() => {
                            setSelectedPeriod(String(period.period_id));
                            setIsHeroPeriodMenuOpen(false);
                          }}
                        >
                          {period.label}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="category-hero-value">
                <HandCoins size={20} />
                <span>{formatCompactCurrency(headlineAllowance)}</span>
              </div>
              <div className="category-hero-helper">
                Monthly allowance given for {selectedRank} MP
              </div>

              <div className="category-hero-meta-row">
                <div className="category-hero-chip">
                  <strong>{formatVarianceText(headlineVariance)}</strong>{" "}
                  {headlineVariance >= 0 ? "above" : "below"} market benchmark
                </div>
                <div className="category-hero-updated">
                  Updated: {formatDisplayDate(heroLastUpdated)}
                </div>
              </div>

              <button
                type="button"
                className="category-hero-detail-card category-hero-detail-card-button"
                onClick={() => setIsBenchmarkInfoOpen(true)}
                aria-label="Open benchmark details"
              >
                <span className="category-hero-benchmark-label">
                  Market benchmark (national median)
                </span>
                <strong className="category-hero-benchmark-value">
                  {formatCompactCurrency(currentBenchmark)}
                </strong>
                <span className="category-hero-period-note">
                  as of {selectedPeriodLabel}
                </span>
              </button>
            </section>

            <section className="category-feedback-panel">
              <div className="profile-feedback-title">
                <CircleHelp size={25} />
                <span>
                  How appropriate is this {category?.category_name?.toLowerCase()} allowance for{" "}
                  {selectedRank} MPs?
                </span>
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
                <button
                  type="button"
                  className={`feedback-choice low ${hasSubmittedFeedback ? "submitted" : ""}`}
                  onClick={() => submitFeedback("too_low")}
                  disabled={submittingFeedback || hasSubmittedFeedback}
                >
                  <span className="feedback-choice-icon too-low" aria-hidden="true">
                    <i className="feedback-choice-bar dark" />
                    <i className="feedback-choice-bar accent" />
                  </span>
                  Too low
                </button>
              </div>

              <p className="feedback-anonymous-note">
                One anonymous vote per browser, per period, per rank tab.
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
              <div className="dark-panel-title-wrap">
                <h2>Budget vs. Benchmark</h2>
                <p className="chart-subtitle">Monthly comparison for selected rank and category</p>
              </div>
              <div className="dark-panel-actions">
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
                    {budgetChartYearLabel}
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
                <button
                  type="button"
                  className="rank-chart-info-button"
                  onClick={() => setIsBudgetInfoOpen(true)}
                  aria-label="Open budget vs benchmark details"
                >
                  <CircleHelp size={15} />
                </button>
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
                          label: `${item.fullMonthLabel} Allowance given`,
                          value: formatCompactCurrency(item.allowanceCap),
                        })
                      }
                      onMouseLeave={() => setActiveChartPoint(null)}
                      onClick={() =>
                        setActiveChartPoint({
                          x: item.x,
                          y: item.allowanceY,
                          label: `${item.fullMonthLabel} Allowance given`,
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
                          label: `${item.fullMonthLabel} Market benchmark`,
                          value: formatCompactCurrency(item.marketPrice),
                        })
                      }
                      onMouseLeave={() => setActiveChartPoint(null)}
                      onClick={() =>
                        setActiveChartPoint({
                          x: item.x,
                          y: item.marketY,
                          label: `${item.fullMonthLabel} Market benchmark`,
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
                          label: `${item.fullMonthLabel} Typical MP spending`,
                          value: formatCompactCurrency(item.medianSpendMp),
                        })
                      }
                      onMouseLeave={() => setActiveChartPoint(null)}
                      onClick={() =>
                        setActiveChartPoint({
                          x: item.x,
                          y: item.medianY,
                          label: `${item.fullMonthLabel} Typical MP spending`,
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
              <span><i className="legend red" />Allowance given</span>
              <span><i className="legend yellow" />Market benchmark</span>
              <span><i className="legend grey dashed" />Typical MP spending</span>
            </div>
            <p className="chart-legend-note">
              Dashed line = typical spending (median), not allowance.
            </p>
          </section>

          {isBudgetInfoOpen ? (
            <div className="benchmark-info-backdrop" onClick={() => setIsBudgetInfoOpen(false)}>
              <div
                className="benchmark-info-modal rank-info-modal"
                role="dialog"
                aria-modal="true"
                aria-label="Budget vs benchmark details"
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  type="button"
                  className="benchmark-info-close"
                  onClick={() => setIsBudgetInfoOpen(false)}
                  aria-label="Close budget vs benchmark details"
                >
                  ×
                </button>
                <h3>Budget vs Benchmark Details</h3>
                <p className="benchmark-info-formula">
                  Period: {budgetChartYearLabel} | Rank: {selectedRank} MPs | Category:{" "}
                  {category?.category_name || "This category"}
                </p>
                <div className="rank-info-grid">
                  <div className="rank-info-card">
                    <div className="rank-info-card-head">
                      <strong>What to check</strong>
                    </div>
                    <div className="rank-info-kv rank-info-kv-copy">
                      <span>Gap to watch</span>
                      <p className="rank-info-copy">
                        Compare <strong>allowance</strong> and <strong>typical spending</strong> with
                        the benchmark line.
                      </p>
                    </div>
                    <div className="rank-info-kv rank-info-kv-copy">
                      <span>If dashed stays above benchmark</span>
                      <p className="rank-info-copy">
                        <strong>Typical MP spending</strong> was above benchmark that month.
                      </p>
                    </div>
                    <div className="rank-info-kv rank-info-kv-copy">
                      <span>If red stays above benchmark</span>
                      <p className="rank-info-copy">
                        The <strong>allowance cap</strong> itself was set above benchmark.
                      </p>
                    </div>
                  </div>
                  <div className="rank-info-card">
                    <div className="rank-info-card-head">
                      <strong>Transparency notes</strong>
                    </div>
                    <div className="rank-info-kv rank-info-kv-copy">
                      <span>This chart shows</span>
                      <p className="rank-info-copy">
                        A <strong>monthly trend for the selected rank</strong>, not one MP.
                      </p>
                    </div>
                    <div className="rank-info-kv rank-info-kv-copy">
                      <span>It does not show</span>
                      <p className="rank-info-copy">
                        <strong>Individual MP values</strong> or outliers on its own.
                      </p>
                    </div>
                    <div className="rank-info-kv rank-info-kv-copy">
                      <span>Read carefully</span>
                      <p className="rank-info-copy">
                        <strong>Allowance</strong> can sit above benchmark even when{" "}
                        <strong>typical spending</strong> is lower, and vice versa.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <section className="dark-panel">
            <div className="dark-panel-header">
              <div className="dark-panel-title-wrap">
                <h2>Average Spending Difference vs Benchmark</h2>
                <p className="dark-panel-helper">
                  Shows average actual spending vs benchmark for each MP rank in{" "}
                  {selectedVariancePeriodLabel}.
                </p>
              </div>
              <div
                className={`dark-period-wrap ${isVarianceMenuOpen ? "open" : ""}`}
                ref={varianceMenuRef}
              >
                <button
                  type="button"
                  className="dark-period-pill dark-period-trigger dark-period-trigger-compact"
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
              <button
                type="button"
                className="rank-chart-info-button"
                onClick={() => setIsRankInfoOpen(true)}
                aria-label="Open spending difference details"
              >
                <CircleHelp size={15} />
              </button>
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
                Spending difference vs benchmark (%)
              </text>

              {rankChartData.bars.map((item) => (
                <g
                  key={item.rank}
                  className="rank-chart-interactive"
                  onClick={() =>
                    setActiveRankBarPoint((current) =>
                      current?.rank === item.rank
                        ? null
                        : {
                            rank: item.rank,
                            x: item.centerX,
                            y: item.direction === "positive" ? item.fillY : item.markerY,
                            variance: item.variance,
                            varianceAmount: item.varianceAmount,
                          }
                    )
                  }
                >
                  <rect
                    x={item.x - 8}
                    y={rankChartData.chart.top}
                    width={item.width + 16}
                    height={rankChartData.chart.height}
                    rx="20"
                    className="rank-chart-hitbox"
                  />
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

              {activeRankBarPoint ? (
                <g
                  className="rank-chart-tooltip"
                  transform={`translate(${Math.min(Math.max(activeRankBarPoint.x - 47, 56), 196)}, ${Math.max(
                    activeRankBarPoint.y - 48,
                    10
                  )})`}
                >
                  <rect width="94" height="34" rx="8" />
                  <text x="8" y="11" className="rank-chart-tooltip-label">
                    {activeRankBarPoint.rank} MPs
                  </text>
                  <text x="8" y="21" className="rank-chart-tooltip-value">
                    {activeRankBarPoint.variance > 0 ? "+" : ""}
                    {Number(activeRankBarPoint.variance.toFixed(1))}%
                  </text>
                  <text x="8" y="29" className="rank-chart-tooltip-detail">
                    {activeRankBarPoint.varianceAmount > 0 ? "+" : activeRankBarPoint.varianceAmount < 0 ? "-" : ""}
                    {formatCompactCurrency(Math.abs(activeRankBarPoint.varianceAmount))}
                  </text>
                </g>
              ) : null}
            </svg>
          </section>

          {isRankInfoOpen ? (
            <div className="benchmark-info-backdrop" onClick={() => setIsRankInfoOpen(false)}>
              <div
                className="benchmark-info-modal rank-info-modal"
                role="dialog"
                aria-modal="true"
                aria-label="Spending difference details"
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  type="button"
                  className="benchmark-info-close"
                  onClick={() => setIsRankInfoOpen(false)}
                  aria-label="Close spending difference details"
                >
                  ×
                </button>
                <h3>Spending Difference Details</h3>
                <p className="benchmark-info-formula">
                  Uses actual spending, not allowance caps. Above 0% = above benchmark. Below 0%
                  = below benchmark. An average above 0% does not mean every MP spent above
                  benchmark.
                </p>
                <p className="benchmark-info-scope">
                  Period: {selectedVariancePeriodLabel}
                </p>
                <div className="rank-info-grid">
                  {rankBreakdown.map((item) => (
                    <div key={`rank-detail-${item.rank}`} className="rank-info-card">
                      <div className="rank-info-card-head">
                        <strong>{item.rank} MPs</strong>
                        <span>{item.total} total</span>
                      </div>
                      <div className="rank-info-kv">
                        <span>Above benchmark</span>
                        <strong>{item.aboveCount}</strong>
                      </div>
                      <div className="rank-info-kv">
                        <span>Near benchmark</span>
                        <strong>{item.nearCount}</strong>
                      </div>
                      <div className="rank-info-kv">
                        <span>Below benchmark</span>
                        <strong>{item.belowCount}</strong>
                      </div>
                      <div className="rank-info-kv">
                        <span>Median</span>
                        <strong>{item.median >= 0 ? "+" : ""}{Number(item.median.toFixed(1))}%</strong>
                      </div>
                      <div className="rank-info-kv">
                        <span>Range</span>
                        <strong>
                          {item.minVariance >= 0 ? "+" : ""}
                          {Number(item.minVariance.toFixed(1))}% to {item.maxVariance >= 0 ? "+" : ""}
                          {Number(item.maxVariance.toFixed(1))}%
                        </strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

            <section className="category-top-spenders">
              <div className="top-spenders-header">
                <div>
                  <h2>
                    Top Spenders in{" "}
                    {category?.category_name || "This Category"}
                  </h2>
                </div>
                <div className="top-spenders-actions">
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
                  <button
                    type="button"
                    className="top-spenders-info-button"
                    onClick={() => setIsTopSpendersInfoOpen(true)}
                    aria-label="Open top spenders explanation"
                  >
                    <CircleHelp size={15} />
                  </button>
                </div>
              </div>
            <div className="category-table-list" aria-label="Top spenders list">
              {topSpenders.map((item, index) => (
                <Link
                  key={item.allowance_record_id}
                  to={`/mps/${item.mp_id}`}
                  className="category-table-link"
                  aria-label={`View ${item.display_name || item.mp_name}`}
                >
                <article className="category-table-row">
                  <div className="category-table-rank">{index + 1}.</div>
                  <div className="category-table-main">
                    <div className="category-table-top">
                      <div className="category-table-title">
                        <div className="category-table-name-row">
                          <h3 className="category-table-name">{item.display_name || item.mp_name}</h3>
                          <span className="category-table-rank-badge">{item.mp_rank || "-"} MP</span>
                        </div>
                      </div>
                      <span
                        className={`category-variance-pill ${
                          item.variance_percent > 5
                            ? "above"
                            : item.variance_percent < -5
                              ? "below"
                              : "near"
                        }`}
                      >
                        {item.variance_percent > 0 ? "+" : ""}
                        {Math.round(item.variance_percent)}%
                      </span>
                    </div>
                    <div className="category-table-meta">
                      <div className="category-table-meta-item">
                        <span>Party</span>
                        <strong className="top-spenders-party-cell">
                          {mpMap.get(item.mp_id)?.party_logo ? (
                            <img
                              src={mpMap.get(item.mp_id)?.party_logo}
                              alt={`${mpMap.get(item.mp_id)?.party_abbreviation || "Party"} logo`}
                              className="top-spenders-party-logo"
                            />
                          ) : (
                            <span className="top-spenders-party-text">
                              {mpMap.get(item.mp_id)?.party_abbreviation || "-"}
                            </span>
                          )}
                        </strong>
                      </div>
                      <div className="category-table-meta-item">
                        <span>Monthly Spend</span>
                        <strong>{formatCompactCurrency(item.actual_spend)}</strong>
                      </div>
                      <div className="category-table-meta-item">
                        <span>Gap</span>
                        <strong className="category-gap-text">
                          {Number(item.variance_amount || 0) > 0 ? "+" : Number(item.variance_amount || 0) < 0 ? "-" : ""}
                          {formatCompactCurrency(Math.abs(Number(item.variance_amount || 0)))}
                        </strong>
                      </div>
                    </div>
                  </div>
                </article>
                </Link>
              ))}
            </div>
          </section>

          {isTopSpendersInfoOpen ? (
            <div className="benchmark-info-backdrop" onClick={() => setIsTopSpendersInfoOpen(false)}>
              <div
                className="benchmark-info-modal top-spenders-info-modal"
                role="dialog"
                aria-modal="true"
                aria-label="Top spenders explanation"
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  type="button"
                  className="benchmark-info-close"
                  onClick={() => setIsTopSpendersInfoOpen(false)}
                  aria-label="Close top spenders explanation"
                >
                  ×
                </button>
                <h3>About This Table</h3>
                <p className="benchmark-info-formula">
                  Period:{" "}
                  {periods.find((period) => String(period.period_id) === String(selectedTopSpendersPeriod))?.label ||
                    "Selected month"}
                </p>
                <div className="rank-info-grid top-spenders-info-grid">
                  <div className="rank-info-card">
                    <div className="rank-info-card-head">
                      <strong>Quick guide</strong>
                    </div>
                    <div className="rank-info-kv rank-info-kv-copy">
                      <span>Table</span>
                      <p className="rank-info-copy">
                        Top 5 MPs by <strong>reported spending</strong> in{" "}
                        {category?.category_name || "this category"}.
                      </p>
                    </div>
                    <div className="rank-info-kv rank-info-kv-copy">
                      <span>Monthly Spend</span>
                      <p className="rank-info-copy">
                        <strong>Actual spending</strong>, not the allowance cap.
                      </p>
                    </div>
                    <div className="rank-info-kv rank-info-kv-copy">
                      <span>Vs benchmark</span>
                      <p className="rank-info-copy">
                        <strong>% above or below</strong> the category benchmark.
                      </p>
                    </div>
                    <div className="rank-info-kv rank-info-kv-copy">
                      <span>Note</span>
                      <p className="rank-info-copy">
                        Shows <strong>highest spenders only</strong>, not every MP or a rule break.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {isBenchmarkInfoOpen ? (
        <div className="benchmark-info-backdrop" onClick={() => setIsBenchmarkInfoOpen(false)}>
          <div
            className="benchmark-info-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Benchmark details"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="benchmark-info-close"
              onClick={() => setIsBenchmarkInfoOpen(false)}
              aria-label="Close benchmark details"
            >
              ×
            </button>
            <h3>Benchmark Details</h3>
            <p className="benchmark-info-formula">
              Formula: (Allowance - Benchmark) / Benchmark
            </p>
            <div className="benchmark-info-grid">
              <div>
                <span>Allowance</span>
                <strong>{formatCompactCurrency(headlineAllowance)}</strong>
              </div>
              <div>
                <span>Benchmark</span>
                <strong>{formatCompactCurrency(currentBenchmark)}</strong>
              </div>
              <div>
                <span>Gap</span>
                <strong>{formatCompactCurrency(Math.abs(benchmarkGapAmount))}</strong>
              </div>
              <div>
                <span>Result</span>
                <strong>
                  {headlineVariance >= 0 ? "+" : ""}
                  {Math.round(headlineVariance)}%
                </strong>
              </div>
            </div>
            <p className="benchmark-info-scope">
              Scope: {category?.category_name || "Category"} • {selectedPeriodLabel} •{" "}
              {selectedRank} MP
            </p>
            <p className="benchmark-info-trend">
              Benchmark vs previous month:{" "}
              {benchmarkMoMPercent === null
                ? "Not available"
                : `${benchmarkMoMPercent >= 0 ? "+" : ""}${Math.round(
                    benchmarkMoMPercent
                  )}%`}
            </p>
            <button
              type="button"
              className="benchmark-info-about"
              onClick={() => {
                setIsBenchmarkInfoOpen(false);
                navigate("/about");
              }}
            >
              Source & method: See About page
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default CategoryDetail;
