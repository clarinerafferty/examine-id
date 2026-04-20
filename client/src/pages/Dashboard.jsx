import {
  Search,
  AlertTriangle,
  Wallet,
  TrendingUp,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  Plane,
  Home,
  Smartphone,
  Users,
  Building2,
  ShieldUser,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchJson } from "../lib/api";
import { resolveCategoryIcon } from "../lib/categoryIcons";

function formatCompactCurrency(value) {
  const numericValue = Number(value || 0);

  if (numericValue >= 1000000) {
    return `Rp${(numericValue / 1000000).toFixed(1)}M`;
  }

  return `Rp${numericValue.toFixed(0)}`;
}

function formatDashboardCategoryLabel(name) {
  const labelMap = {
    "Digital Communications": "Digital Comms",
    "Travel and Accommodation": "Travel & Accommodation",
    "Staff and Research Support": "Staff & Research",
    "Constituency Office Operations": "Office Operations",
  };

  return labelMap[name] || name;
}

function formatSignedPercent(value) {
  const numericValue = Number(value || 0);
  const roundedValue = Math.round(numericValue);
  const prefix = roundedValue > 0 ? "+" : "";
  return `${prefix}${roundedValue}%`;
}

function formatVarianceAmountLabel(value) {
  const numericValue = Number(value || 0);
  return `${formatCompactCurrency(Math.abs(numericValue))} ${
    numericValue >= 0 ? "above" : "below"
  }`;
}

function getDivergenceCategoryIcon(name) {
  const iconMap = {
    house: Home,
    plane: Plane,
    smartphone: Smartphone,
    users: Users,
    "building-2": Building2,
    "shield-user": ShieldUser,
  };
  const { iconKey, iconLabel } = resolveCategoryIcon(name, "house");

  return {
    Icon: iconMap[iconKey] || Wallet,
    iconLabel: formatDashboardCategoryLabel(iconLabel),
  };
}

function calculatePercentChange(currentValue, previousValue) {
  const previous = Number(previousValue);
  const current = Number(currentValue);

  if (!Number.isFinite(previous) || previous === 0) {
    return null;
  }

  if (!Number.isFinite(current)) {
    return null;
  }

  return ((current - previous) / Math.abs(previous)) * 100;
}

function normalizeSearchValue(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const DIVERGENCE_AXIS_MIN = -30;
const DIVERGENCE_AXIS_MAX = 50;
const DIVERGENCE_AXIS_RANGE = DIVERGENCE_AXIS_MAX - DIVERGENCE_AXIS_MIN;
const HIGH_VARIANCE_THRESHOLD = 25;
const SPARKLINE_VIEWBOX_WIDTH = 600;
const SPARKLINE_VIEWBOX_HEIGHT = 66;
const SPARKLINE_PADDING_LEFT = 40;
const SPARKLINE_PADDING_RIGHT = 12;
const SPARKLINE_AXIS_TOP = 10;
const SPARKLINE_AXIS_BOTTOM = 54;
const SPARKLINE_PREVIEW_POINT_COUNT = 4;

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

function Dashboard() {
  const navigate = useNavigate();
  const [allowances, setAllowances] = useState([]);
  const [mps, setMps] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedTopSpendersPeriodId, setSelectedTopSpendersPeriodId] = useState("");
  const [isTopSpendersMenuOpen, setIsTopSpendersMenuOpen] = useState(false);
  const [isTopSpendersInfoOpen, setIsTopSpendersInfoOpen] = useState(false);
  const [activeDivergenceCategory, setActiveDivergenceCategory] = useState(null);
  const [activeDivergenceIcon, setActiveDivergenceIcon] = useState(null);
  const [isDivergenceInfoOpen, setIsDivergenceInfoOpen] = useState(false);
  const [activeMetricModal, setActiveMetricModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const searchBarRef = useRef(null);
  const topSpendersMenuRef = useRef(null);
  const topSpendersInfoRef = useRef(null);
  const divergenceInfoRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        const [allowanceData, mpData] = await Promise.all([
          fetchJson("/api/allowances"),
          fetchJson("/api/mps"),
        ]);

        if (isMounted) {
          setAllowances(allowanceData);
          setMps(mpData);
        }
      } catch {
        if (isMounted) {
          setError("Unable to load dashboard data right now.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const periodsAscending = useMemo(() => {
    const uniquePeriods = new Map();

    allowances.forEach((record) => {
      uniquePeriods.set(record.period_id, {
        period_id: Number(record.period_id),
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
  }, [allowances]);

  const latestPeriodId = useMemo(() => {
    if (!periodsAscending.length) {
      return null;
    }

    return periodsAscending[periodsAscending.length - 1].period_id;
  }, [periodsAscending]);

  const latestPeriodRecords = useMemo(() => {
    if (!latestPeriodId) {
      return [];
    }

    return allowances.filter((record) => Number(record.period_id) === Number(latestPeriodId));
  }, [allowances, latestPeriodId]);

  const previousPeriodId = useMemo(() => {
    if (periodsAscending.length < 2) {
      return null;
    }

    return periodsAscending[periodsAscending.length - 2].period_id;
  }, [periodsAscending]);

  const previousPeriodRecords = useMemo(() => {
    if (!previousPeriodId) {
      return [];
    }

    return allowances.filter((record) => Number(record.period_id) === Number(previousPeriodId));
  }, [allowances, previousPeriodId]);

  const periodsDescending = useMemo(() => {
    return [...periodsAscending].reverse();
  }, [periodsAscending]);

  useEffect(() => {
    if (
      latestPeriodId &&
      (!selectedTopSpendersPeriodId ||
        !periodsDescending.some(
          (period) => Number(period.period_id) === Number(selectedTopSpendersPeriodId)
        ))
    ) {
      setSelectedTopSpendersPeriodId(String(latestPeriodId));
    }
  }, [latestPeriodId, periodsDescending, selectedTopSpendersPeriodId]);

  useEffect(() => {
    function handlePointerDown(event) {
      if (!searchBarRef.current?.contains(event.target)) {
        setIsSearchOpen(false);
      }

      if (!topSpendersMenuRef.current?.contains(event.target)) {
        setIsTopSpendersMenuOpen(false);
      }

      if (!topSpendersInfoRef.current?.contains(event.target)) {
        setIsTopSpendersInfoOpen(false);
      }

      if (!divergenceInfoRef.current?.contains(event.target)) {
        setIsDivergenceInfoOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setIsSearchOpen(false);
        setIsDivergenceInfoOpen(false);
        setIsTopSpendersInfoOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const latestPeriodLabel = latestPeriodRecords[0]?.reporting_label || "Latest";
  const previousPeriodLabel =
    periodsAscending.length >= 2 ? periodsAscending[periodsAscending.length - 2].label : null;
  const latestUpdate = latestPeriodRecords[0]?.last_updated
    ? new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date(latestPeriodRecords[0].last_updated))
    : "No update";

  const averageMonthlySpendPerMp = useMemo(() => {
    if (!latestPeriodRecords.length) {
      return 0;
    }

    const spendByMp = new Map();

    latestPeriodRecords.forEach((record) => {
      const mpId = Number(record.mp_id);
      const current = Number(spendByMp.get(mpId) || 0);
      spendByMp.set(mpId, current + Number(record.actual_spend || 0));
    });

    const totals = Array.from(spendByMp.values());
    const totalAcrossMps = totals.reduce((sum, value) => sum + value, 0);

    return totals.length ? totalAcrossMps / totals.length : 0;
  }, [latestPeriodRecords]);

  const averageMonthlySpendPerMpPrevious = useMemo(() => {
    if (!previousPeriodRecords.length) {
      return 0;
    }

    const spendByMp = new Map();

    previousPeriodRecords.forEach((record) => {
      const mpId = Number(record.mp_id);
      const current = Number(spendByMp.get(mpId) || 0);
      spendByMp.set(mpId, current + Number(record.actual_spend || 0));
    });

    const totals = Array.from(spendByMp.values());
    const totalAcrossMps = totals.reduce((sum, value) => sum + value, 0);

    return totals.length ? totalAcrossMps / totals.length : 0;
  }, [previousPeriodRecords]);

  const monthlySpendMoMPercent = useMemo(() => {
    return calculatePercentChange(averageMonthlySpendPerMp, averageMonthlySpendPerMpPrevious);
  }, [averageMonthlySpendPerMp, averageMonthlySpendPerMpPrevious]);

  const monthlySpendMoMAmount = useMemo(() => {
    return averageMonthlySpendPerMp - averageMonthlySpendPerMpPrevious;
  }, [averageMonthlySpendPerMp, averageMonthlySpendPerMpPrevious]);

  const overallVariance = useMemo(() => {
    if (!latestPeriodRecords.length) {
      return 0;
    }

    const total = latestPeriodRecords.reduce(
      (sum, record) => sum + Number(record.variance_percent || 0),
      0
    );

    return total / latestPeriodRecords.length;
  }, [latestPeriodRecords]);

  const previousOverallVariance = useMemo(() => {
    if (!previousPeriodRecords.length) {
      return null;
    }

    const total = previousPeriodRecords.reduce(
      (sum, record) => sum + Number(record.variance_percent || 0),
      0
    );

    return total / previousPeriodRecords.length;
  }, [previousPeriodRecords]);

  const benchmarkGapPerMpLatest = useMemo(() => {
    if (!latestPeriodRecords.length) {
      return 0;
    }

    const gapByMp = new Map();
    latestPeriodRecords.forEach((record) => {
      const mpId = Number(record.mp_id);
      const current = Number(gapByMp.get(mpId) || 0);
      gapByMp.set(mpId, current + Number(record.variance_amount || 0));
    });

    const totals = Array.from(gapByMp.values());
    return totals.length
      ? totals.reduce((sum, value) => sum + value, 0) / totals.length
      : 0;
  }, [latestPeriodRecords]);

  const benchmarkGapPerMpPrevious = useMemo(() => {
    if (!previousPeriodRecords.length) {
      return null;
    }

    const gapByMp = new Map();
    previousPeriodRecords.forEach((record) => {
      const mpId = Number(record.mp_id);
      const current = Number(gapByMp.get(mpId) || 0);
      gapByMp.set(mpId, current + Number(record.variance_amount || 0));
    });

    const totals = Array.from(gapByMp.values());
    return totals.length
      ? totals.reduce((sum, value) => sum + value, 0) / totals.length
      : 0;
  }, [previousPeriodRecords]);

  const benchmarkVarianceDeltaPp = useMemo(() => {
    if (previousOverallVariance === null) {
      return null;
    }

    return overallVariance - previousOverallVariance;
  }, [overallVariance, previousOverallVariance]);

  const benchmarkGapDeltaPerMp = useMemo(() => {
    if (benchmarkGapPerMpPrevious === null) {
      return null;
    }

    return benchmarkGapPerMpLatest - benchmarkGapPerMpPrevious;
  }, [benchmarkGapPerMpLatest, benchmarkGapPerMpPrevious]);

  const thresholdSummary = useMemo(() => {
    const highVarianceRecords = latestPeriodRecords.filter(
      (record) => Number(record.variance_percent) > HIGH_VARIANCE_THRESHOLD
    );
    const uniqueMpIds = new Set(highVarianceRecords.map((record) => record.mp_id));
    const excessSpend = highVarianceRecords.reduce(
      (sum, record) => sum + Math.max(0, Number(record.variance_amount || 0)),
      0
    );

    return {
      count: uniqueMpIds.size,
      excessSpend,
    };
  }, [latestPeriodRecords]);

  const thresholdTrend = useMemo(() => {
    return periodsAscending.map((period) => {
      const periodRecords = allowances.filter(
        (record) => Number(record.period_id) === Number(period.period_id)
      );
      const highVarianceRecords = periodRecords.filter(
        (record) => Number(record.variance_percent) > HIGH_VARIANCE_THRESHOLD
      );

      return {
        label: period.label,
        year: Number(period.year),
        month: Number(period.month),
        count: new Set(highVarianceRecords.map((record) => record.mp_id)).size,
      };
    });
  }, [allowances, periodsAscending]);

  const thresholdTrendChange = useMemo(() => {
    if (!thresholdTrend.length) {
      return {
        current: null,
        previous: null,
        monthOverMonth: null,
        sameMonthLastYear: null,
        yearOverYear: null,
      };
    }

    const currentPoint = thresholdTrend[thresholdTrend.length - 1];
    const previousPoint = thresholdTrend.length >= 2 ? thresholdTrend[thresholdTrend.length - 2] : null;
    const sameMonthLastYearPoint = thresholdTrend.find(
      (point) =>
        Number(point.year) === Number(currentPoint.year) - 1 &&
        Number(point.month) === Number(currentPoint.month)
    );

    return {
      current: currentPoint,
      previous: previousPoint,
      monthOverMonth: previousPoint ? currentPoint.count - previousPoint.count : null,
      sameMonthLastYear: sameMonthLastYearPoint || null,
      yearOverYear: sameMonthLastYearPoint ? currentPoint.count - sameMonthLastYearPoint.count : null,
    };
  }, [thresholdTrend]);

  const thresholdTrendPreview = useMemo(() => {
    return thresholdTrend.slice(-SPARKLINE_PREVIEW_POINT_COUNT);
  }, [thresholdTrend]);

  const thresholdTrendPreviewInsight = useMemo(() => {
    if (thresholdTrendPreview.length < 2) {
      return "";
    }

    const first = thresholdTrendPreview[0];
    const latest = thresholdTrendPreview[thresholdTrendPreview.length - 1];
    const change = latest.count - first.count;
    const firstMonth = String(first.label || "").split(" ")[0] || "start";

    if (change === 0) {
      return `No change since ${firstMonth}`;
    }

    return `${change > 0 ? "Up" : "Down"} ${Math.abs(change)} since ${firstMonth}`;
  }, [thresholdTrendPreview]);

  const thresholdTrendMax = useMemo(() => {
    return Math.max(...thresholdTrendPreview.map((item) => item.count), 1);
  }, [thresholdTrendPreview]);

  const thresholdTrendScaleMax = useMemo(() => {
    if (thresholdTrendMax <= 5) {
      return 5;
    }

    if (thresholdTrendMax <= 10) {
      return 10;
    }

    return Math.ceil(thresholdTrendMax / 5) * 5;
  }, [thresholdTrendMax]);

  const thresholdTrendTicks = useMemo(() => {
    const values = [0, Math.round(thresholdTrendScaleMax / 2), thresholdTrendScaleMax];

    return values.map((value) => {
      const ratio = thresholdTrendScaleMax ? value / thresholdTrendScaleMax : 0;
      const y = SPARKLINE_AXIS_BOTTOM - ratio * (SPARKLINE_AXIS_BOTTOM - SPARKLINE_AXIS_TOP);

      return { value, y };
    });
  }, [thresholdTrendScaleMax]);

  const thresholdTrendPlot = useMemo(() => {
    if (!thresholdTrendPreview.length) {
      return [];
    }

    const sparklineLeft = SPARKLINE_PADDING_LEFT;
    const sparklineRight = SPARKLINE_VIEWBOX_WIDTH - SPARKLINE_PADDING_RIGHT;
    const sparklineBottom = SPARKLINE_AXIS_BOTTOM;
    const sparklineHeight = SPARKLINE_AXIS_BOTTOM - SPARKLINE_AXIS_TOP;
    const slotWidth = (sparklineRight - sparklineLeft) / thresholdTrendPreview.length;

    return thresholdTrendPreview.map((item, index) => {
      const x =
        thresholdTrendPreview.length === 1
          ? (sparklineLeft + sparklineRight) / 2
          : sparklineLeft + slotWidth * index + slotWidth / 2;
      const y = sparklineBottom - (item.count / thresholdTrendScaleMax) * sparklineHeight;

      return {
        ...item,
        x,
        y,
        severityClass: item.count >= 4 ? "critical" : item.count >= 2 ? "warning" : "calm",
      };
    });
  }, [thresholdTrendPreview, thresholdTrendScaleMax]);

  const thresholdTrendPoints = useMemo(() => {
    if (!thresholdTrendPlot.length) {
      return "";
    }

    return thresholdTrendPlot
      .map((item) => `${item.x},${item.y}`)
      .join(" ");
  }, [thresholdTrendPlot]);

  const thresholdTrendRecent = useMemo(() => {
    return thresholdTrend.slice(-6);
  }, [thresholdTrend]);

  const topCategories = useMemo(() => {
    const grouped = new Map();

    latestPeriodRecords.forEach((record) => {
      const existing = grouped.get(record.category_id) || {
        category_name: record.category_name,
        totalVariance: 0,
        totalVarianceAmount: 0,
        count: 0,
      };

      existing.totalVariance += Number(record.variance_percent || 0);
      existing.totalVarianceAmount += Number(record.variance_amount || 0);
      existing.count += 1;
      grouped.set(record.category_id, existing);
    });

    return Array.from(grouped.values())
      .map((item) => ({
        ...item,
        averageVariance: item.count ? item.totalVariance / item.count : 0,
        averageVarianceAmount: item.count ? item.totalVarianceAmount / item.count : 0,
      }))
      .sort((a, b) => Math.abs(b.averageVariance) - Math.abs(a.averageVariance))
      .slice(0, 3);
  }, [latestPeriodRecords]);

  const selectedTopSpendersRecords = useMemo(() => {
    const activePeriodId = Number(selectedTopSpendersPeriodId || latestPeriodId);

    if (!activePeriodId) {
      return [];
    }

    return allowances.filter((record) => Number(record.period_id) === activePeriodId);
  }, [allowances, selectedTopSpendersPeriodId, latestPeriodId]);

  const topSpenders = useMemo(() => {
    const mpMap = new Map(mps.map((item) => [item.mp_id, item]));
    const grouped = new Map();

    selectedTopSpendersRecords.forEach((record) => {
      const existing = grouped.get(record.mp_id) || {
        mp_id: record.mp_id,
        name: record.display_name || record.mp_name,
        party: mpMap.get(record.mp_id)?.party_abbreviation || "",
        partyLogo: mpMap.get(record.mp_id)?.party_logo || "",
        spend: 0,
        varianceTotal: 0,
        count: 0,
      };

      existing.spend += Number(record.actual_spend || 0);
      existing.varianceTotal += Number(record.variance_percent || 0);
      existing.count += 1;
      grouped.set(record.mp_id, existing);
    });

    return Array.from(grouped.values())
      .map((item) => ({
        ...item,
        variance: item.count ? item.varianceTotal / item.count : 0,
      }))
      .sort((a, b) => b.spend - a.spend)
      .slice(0, 5);
  }, [selectedTopSpendersRecords, mps]);

  const selectedTopSpendersPeriodLabel =
    periodsDescending.find((period) => Number(period.period_id) === Number(selectedTopSpendersPeriodId))
      ?.label || latestPeriodLabel;
  const normalizedSearchTerm = useMemo(() => normalizeSearchValue(searchTerm), [searchTerm]);

  const searchableCategories = useMemo(() => {
    const grouped = new Map();

    allowances.forEach((record) => {
      if (!grouped.has(record.category_id)) {
        grouped.set(record.category_id, {
          category_id: record.category_id,
          category_name: record.category_name,
          searchText: normalizeSearchValue(record.category_name),
        });
      }
    });

    return Array.from(grouped.values());
  }, [allowances]);

  const mpSuggestions = useMemo(() => {
    if (!normalizedSearchTerm) {
      return [];
    }

    return mps
      .map((item) => ({
        ...item,
        searchText: normalizeSearchValue(
          `${item.display_name || ""} ${item.full_name || ""} ${item.party_name || ""} ${
            item.party_abbreviation || ""
          }`
        ),
      }))
      .filter((item) => item.searchText.includes(normalizedSearchTerm))
      .sort((a, b) => {
        const aDisplay = normalizeSearchValue(a.display_name || a.full_name);
        const bDisplay = normalizeSearchValue(b.display_name || b.full_name);
        const aStarts = aDisplay.startsWith(normalizedSearchTerm) ? 1 : 0;
        const bStarts = bDisplay.startsWith(normalizedSearchTerm) ? 1 : 0;

        if (aStarts !== bStarts) {
          return bStarts - aStarts;
        }

        return aDisplay.localeCompare(bDisplay);
      })
      .slice(0, 4);
  }, [mps, normalizedSearchTerm]);

  const categorySuggestions = useMemo(() => {
    if (!normalizedSearchTerm) {
      return [];
    }

    return searchableCategories
      .filter((item) => item.searchText.includes(normalizedSearchTerm))
      .sort((a, b) => {
        const aStarts = a.searchText.startsWith(normalizedSearchTerm) ? 1 : 0;
        const bStarts = b.searchText.startsWith(normalizedSearchTerm) ? 1 : 0;

        if (aStarts !== bStarts) {
          return bStarts - aStarts;
        }

        return a.category_name.localeCompare(b.category_name);
      })
      .slice(0, 4);
  }, [normalizedSearchTerm, searchableCategories]);

  const hasSearchSuggestions = mpSuggestions.length > 0 || categorySuggestions.length > 0;

  function handleSearchSelect(option) {
    setSearchTerm(option.label);
    setIsSearchOpen(false);

    if (option.type === "mp") {
      navigate(
        `/mps/${option.id}${latestPeriodId ? `?period=${encodeURIComponent(latestPeriodId)}` : ""}`
      );
      return;
    }

    navigate(`/categories/${option.id}`);
  }

  function handleSearchSubmit(event) {
    event.preventDefault();

    const rawTerm = searchTerm.trim();
    const term = normalizedSearchTerm;

    if (!term) {
      navigate("/allowances");
      return;
    }
    setIsSearchOpen(false);

    if (mpSuggestions.length > 0 && categorySuggestions.length === 0) {
      navigate(`/allowances?view=member&search=${encodeURIComponent(rawTerm)}`);
      return;
    }

    navigate(`/allowances?view=category&search=${encodeURIComponent(rawTerm)}`);
  }

  return (
    <div className="dashboard-screen">
      <main className="dashboard-main">
        <section className="hero-card">
          <h1 className="hero-title">
            <span className="hero-red">Simplifying</span> the
            <br />
            Standard of Oversight
          </h1>

          <p className="hero-text">
            Examine.ID cuts through complex data to deliver clear financial truth.
            We provide market benchmarks and comparison tools to measure MPs'
            allowance spending against objective prices, empowering citizens with
            unbiased transparency and direct accountability.
            < br/>
            < br/>
            Data shown is based on available reported allowance records for MPs in <b>DKI Jakarta</b>.
            Benchmark comparisons are reference tools for public oversight and should not be read
            as legal or audit conclusions.
          </p>

          <form className="search-bar" onSubmit={handleSearchSubmit} ref={searchBarRef}>
            <input
              type="text"
              placeholder="Search MPs or allowance categories..."
              value={searchTerm}
              onFocus={() => setIsSearchOpen(true)}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setIsSearchOpen(true);
              }}
              aria-label="Search MPs or allowance categories"
              aria-expanded={isSearchOpen && Boolean(normalizedSearchTerm)}
              aria-controls="dashboard-search-suggestions"
              aria-autocomplete="list"
            />
            <button type="submit" aria-label="Search" className="search-submit-button">
              <Search size={16} />
            </button>

            {isSearchOpen && normalizedSearchTerm ? (
              <div className="search-suggestions" id="dashboard-search-suggestions" role="listbox">
                {mpSuggestions.length ? (
                  <div className="search-suggestion-group">
                    <div className="search-suggestion-heading">MPs</div>
                    {mpSuggestions.map((item) => (
                      <button
                        key={`mp-${item.mp_id}`}
                        type="button"
                        className="search-suggestion-item"
                        onClick={() =>
                          handleSearchSelect({
                            type: "mp",
                            id: item.mp_id,
                            label: item.display_name || item.full_name,
                          })
                        }
                      >
                        <span className="search-suggestion-title">
                          {item.display_name || item.full_name}
                        </span>
                        <span className="search-suggestion-meta">
                          {item.party_abbreviation || item.party_name || "MP"}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : null}

                {categorySuggestions.length ? (
                  <div className="search-suggestion-group">
                    <div className="search-suggestion-heading">Categories</div>
                    {categorySuggestions.map((item) => (
                      <button
                        key={`category-${item.category_id}`}
                        type="button"
                        className="search-suggestion-item"
                        onClick={() =>
                          handleSearchSelect({
                            type: "category",
                            id: item.category_id,
                            label: item.category_name,
                          })
                        }
                      >
                        <span className="search-suggestion-title">{item.category_name}</span>
                        <span className="search-suggestion-meta">Allowance category</span>
                      </button>
                    ))}
                  </div>
                ) : null}

                {hasSearchSuggestions ? (
                  <button
                    type="submit"
                    className="search-suggestion-footer"
                  >
                    View all matching results
                  </button>
                ) : (
                  <div className="search-suggestion-empty">
                    No direct matches. Press search to browse filtered results.
                  </div>
                )}
              </div>
            ) : null}
          </form>

          <div className="hero-illustration real-illustration">
            <img
              src="/hero-illustration.png"
              alt="User examining financial transparency data"
            />
          </div>
        </section>

        {loading && <div className="card status-card">Loading dashboard...</div>}
        {error && <div className="card status-card error-card">{error}</div>}

        {!loading && !error && (
          <>
            <div className="section-pill">Dashboard</div>

            <section className="metric-two-grid">
              <article className="metric-card">
                <button
                  type="button"
                  className="metric-card-button"
                  onClick={() => setActiveMetricModal("avg-spend")}
                  aria-label="Show details for average monthly spend card"
                >
                  <div className="metric-card-header metric-card-header-lifted">
                    <div className="metric-label-wrap">
                      <Wallet size={14} />
                      <span>Avg. Monthly Spend per MP</span>
                    </div>
                  </div>

                  <div className="metric-value-row metric-value-row-avg">
                    <div className="metric-value">{formatCompactCurrency(averageMonthlySpendPerMp)}</div>
                    <div
                      className={`metric-chip metric-chip-change ${
                        monthlySpendMoMPercent === null
                          ? "metric-chip-neutral"
                          : monthlySpendMoMPercent > 0
                          ? "metric-chip-negative"
                          : "metric-chip-positive"
                      }`}
                    >
                      {monthlySpendMoMPercent === null
                        ? "N/A"
                        : `${monthlySpendMoMPercent > 0 ? "+" : ""}${Math.round(
                            monthlySpendMoMPercent
                          )}%`}
                    </div>
                  </div>

                  <div className="metric-updated">as of {latestUpdate}</div>

                </button>
              </article>

              <article className="metric-card">
                <button
                  type="button"
                  className="metric-card-button"
                  onClick={() => setActiveMetricModal("variance")}
                  aria-label="Show details for overall variance card"
                >
                  <div className="metric-card-header">
                    <div className="metric-label-wrap">
                      <TrendingUp size={14} />
                      <span>MP Spend vs Benchmark</span>
                    </div>
                  </div>

                  <div className="metric-value-row">
                    <div className="metric-value metric-highlight">
                      {overallVariance > 0 ? "+" : ""}
                      {Math.round(overallVariance)}%
                    </div>
                    <div className="metric-chip">{latestPeriodLabel}</div>
                  </div>

                  <div className="metric-context">
                    {overallVariance >= 0 ? "above" : "below"} benchmark prices
                  </div>
                  <div className="metric-updated">as of {latestUpdate}</div>
                </button>
              </article>
            </section>

            {activeMetricModal ? (
              <div
                className="metric-modal-backdrop"
                role="presentation"
                onClick={() => setActiveMetricModal(null)}
              >
                <div
                  className={`metric-modal ${
                    activeMetricModal === "avg-spend" ||
                    activeMetricModal === "variance" ||
                    activeMetricModal === "threshold"
                      ? "metric-modal-threshold"
                      : ""
                  }`}
                  role="dialog"
                  aria-modal="true"
                  aria-label="Metric details"
                  onClick={(event) => event.stopPropagation()}
                >
                  <button
                    type="button"
                    className="metric-modal-close"
                    onClick={() => setActiveMetricModal(null)}
                    aria-label="Close details"
                  >
                    &times;
                  </button>
                  {activeMetricModal === "avg-spend" ? (
                    <>
                      <h3>Avg. Monthly Spend per MP</h3>
                      <div className="metric-modal-highlight">
                        <div className="metric-modal-main-value">
                          {formatCompactCurrency(averageMonthlySpendPerMp)}
                        </div>
                        <div
                          className={`metric-chip metric-chip-change metric-modal-change ${
                            monthlySpendMoMPercent === null
                              ? "metric-chip-neutral"
                              : monthlySpendMoMPercent > 0
                              ? "metric-chip-negative"
                              : "metric-chip-positive"
                          }`}
                        >
                          {monthlySpendMoMPercent === null
                            ? "N/A"
                            : `${monthlySpendMoMPercent > 0 ? "+" : ""}${Math.round(
                                monthlySpendMoMPercent
                              )}%`}
                        </div>
                      </div>

                      <div className="metric-modal-meta-row">
                        <span className="metric-modal-pill">as of {latestPeriodLabel}</span>
                        <span className="metric-modal-pill">Coverage: all MPs shown</span>
                      </div>

                      <p className="metric-modal-caption">
                        Average total monthly allowance spend per MP.
                      </p>

                      {monthlySpendMoMPercent === null ? (
                        <p className="metric-modal-emphasis">
                          No previous month is available yet for comparison.
                        </p>
                      ) : (
                        <p className="metric-modal-emphasis">
                          <strong>{Math.abs(Math.round(monthlySpendMoMPercent))}%</strong>{" "}
                          {monthlySpendMoMPercent >= 0 ? "higher" : "lower"} than{" "}
                          <strong>{previousPeriodLabel || "the previous month"}</strong> (
                          <strong>{formatCompactCurrency(Math.abs(monthlySpendMoMAmount))}</strong>{" "}
                          {monthlySpendMoMPercent >= 0 ? "more" : "less"} per MP).
                        </p>
                      )}
                    </>
                  ) : activeMetricModal === "threshold" ? (
                    <>
                      <h3>MPs Spending Far Above Benchmark</h3>
                      <div className="metric-modal-highlight">
                        <div className="metric-modal-main-value">{thresholdSummary.count} MPs</div>
                        <div className="metric-chip metric-chip-period">{latestPeriodLabel}</div>
                      </div>
                      <div className="metric-modal-meta-row">
                        <span className="metric-modal-pill">
                          Rule: more than {HIGH_VARIANCE_THRESHOLD}% above benchmark
                        </span>
                        <span className="metric-modal-pill">Coverage: all MPs shown</span>
                      </div>
                      <div className="threshold-stat-grid">
                        <div className="threshold-stat-card">
                          <span>Flagged MPs</span>
                          <strong>{thresholdSummary.count} MPs</strong>
                        </div>
                        <div className="threshold-stat-card">
                          <span>vs previous month</span>
                          <strong>
                            {thresholdTrendChange.monthOverMonth === null
                              ? "Not available"
                              : `${thresholdTrendChange.monthOverMonth > 0 ? "+" : ""}${
                                  thresholdTrendChange.monthOverMonth
                                } MPs`}
                          </strong>
                        </div>
                        <div className="threshold-stat-card">
                          <span>vs same month last year</span>
                          <strong>
                            {thresholdTrendChange.yearOverYear === null
                              ? "Not available"
                              : `${thresholdTrendChange.yearOverYear > 0 ? "+" : ""}${
                                  thresholdTrendChange.yearOverYear
                                } MPs`}
                          </strong>
                        </div>
                        <div className="threshold-stat-card">
                          <span>Spent above benchmark</span>
                          <strong className="metric-number-negative">
                            {formatCompactCurrency(thresholdSummary.excessSpend)}
                          </strong>
                        </div>
                      </div>
                      {thresholdTrendRecent.length ? (
                        <div className="threshold-recent-block">
                          <div className="threshold-recent-title">Recent months</div>
                          <div className="threshold-recent-grid">
                            {thresholdTrendRecent.map((item) => (
                              <div className="threshold-recent-item" key={item.label}>
                                <span>{item.label}</span>
                                <strong>{item.count} MPs</strong>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}
                      <p className="metric-modal-caption">
                        The trend line on the card shows how many MPs were flagged each month.
                      </p>
                      <button
                        className="visit-button metric-modal-cta"
                        type="button"
                        onClick={() => {
                          const params = new URLSearchParams({
                            view: "member",
                            sort: "variance",
                            threshold: String(HIGH_VARIANCE_THRESHOLD),
                            source: "dashboard",
                          });

                          if (latestPeriodId) {
                            params.set("period", String(latestPeriodId));
                          }

                          setActiveMetricModal(null);
                          navigate(`/allowances?${params.toString()}`);
                        }}
                      >
                        View MPs
                      </button>
                    </>
                  ) : (
                    <>
                      <h3>MP Spend vs Benchmark</h3>
                      <div className="metric-modal-highlight">
                        <div className="metric-modal-main-value metric-highlight">
                          {overallVariance > 0 ? "+" : ""}
                          {Math.round(overallVariance)}%
                        </div>
                        <div className="metric-chip metric-chip-period">{latestPeriodLabel}</div>
                      </div>

                      <div className="metric-modal-meta-row">
                        <span className="metric-modal-pill">
                          Status: {overallVariance >= 0 ? "Above" : "Below"} benchmark
                        </span>
                        <span className="metric-modal-pill">Coverage: all MPs shown</span>
                      </div>

                      <p className="metric-modal-caption">
                        Benchmark = estimated market cost for each allowance category.
                      </p>
                      {benchmarkVarianceDeltaPp === null || benchmarkGapDeltaPerMp === null ? (
                        <p className="metric-modal-emphasis">
                          No previous month is available yet for trend comparison.
                        </p>
                      ) : (
                        <>
                          <div className="metric-modal-kv">
                            <div className="metric-modal-kv-row">
                              <span>This month</span>
                              <strong>
                                {latestPeriodLabel}:{" "}
                                <span
                                  className={
                                    overallVariance >= 0
                                      ? "metric-number-negative"
                                      : "metric-number-positive"
                                  }
                                >
                                  {overallVariance > 0 ? "+" : ""}
                                  {Math.round(overallVariance)}%
                                </span>{" "}
                                vs benchmark
                              </strong>
                            </div>
                            <div className="metric-modal-kv-row">
                              <span>Last month</span>
                              <strong>
                                {previousPeriodLabel || "Previous month"}:{" "}
                                <span
                                  className={
                                    Number(previousOverallVariance || 0) >= 0
                                      ? "metric-number-negative"
                                      : "metric-number-positive"
                                  }
                                >
                                  {Number(previousOverallVariance || 0) > 0 ? "+" : ""}
                                  {Math.round(previousOverallVariance || 0)}%
                                </span>{" "}
                                vs benchmark
                              </strong>
                            </div>
                          </div>
                          <div className="metric-modal-gap">
                            Average MP gap is{" "}
                            <strong
                              className={
                                benchmarkGapDeltaPerMp >= 0
                                  ? "metric-number-negative"
                                  : "metric-number-positive"
                              }
                            >
                              {formatCompactCurrency(Math.abs(benchmarkGapDeltaPerMp))}{" "}
                              {benchmarkGapDeltaPerMp >= 0 ? "higher" : "lower"}
                            </strong>
                            {" "}than{" "}
                            <strong>{previousPeriodLabel || "last month"}</strong>.
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            ) : null}

            <article
              className="wide-alert-card wide-alert-card-clickable"
              role="button"
              tabIndex={0}
              aria-label="Show details for MPs spending far above benchmark"
              onClick={() => setActiveMetricModal("threshold")}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setActiveMetricModal("threshold");
                }
              }}
            >
              <div className="metric-label-wrap">
                <AlertTriangle size={14} />
                <span>MPs Spending Far Above Benchmark</span>
              </div>
              <div className="wide-alert-subtitle">
                Over {HIGH_VARIANCE_THRESHOLD}% above expected category cost
              </div>

              <div className="wide-alert-top">
                <div className="wide-alert-stat">
                  <div className="wide-alert-micro-label">Flagged in {latestPeriodLabel}</div>
                  <div className="wide-big-value">{thresholdSummary.count} MPs</div>
                </div>
              </div>

              <div className="sparkline-card" aria-label="Threshold trend by period">
                <div className="wide-alert-chart-label">Monthly over-benchmark trend</div>
                {thresholdTrendPreviewInsight ? (
                  <div className="wide-alert-chart-context">{thresholdTrendPreviewInsight}</div>
                ) : null}
                <svg
                  viewBox={`0 0 ${SPARKLINE_VIEWBOX_WIDTH} ${SPARKLINE_VIEWBOX_HEIGHT}`}
                  className="sparkline-chart"
                  role="img"
                >
                {thresholdTrendTicks.map((tick) => (
                  <g key={`tick-${tick.value}`}>
                    <line
                      x1={SPARKLINE_PADDING_LEFT}
                      y1={tick.y}
                      x2={SPARKLINE_VIEWBOX_WIDTH - SPARKLINE_PADDING_RIGHT}
                      y2={tick.y}
                      className="sparkline-gridline"
                    />
                    <text
                      x={SPARKLINE_PADDING_LEFT - 6}
                      y={tick.y + 2}
                      textAnchor="end"
                      className="sparkline-y-label"
                    >
                      {tick.value}
                    </text>
                  </g>
                ))}
                  <line
                    x1={SPARKLINE_PADDING_LEFT}
                    y1={SPARKLINE_AXIS_BOTTOM}
                    x2={SPARKLINE_VIEWBOX_WIDTH - SPARKLINE_PADDING_RIGHT}
                    y2={SPARKLINE_AXIS_BOTTOM}
                    className="sparkline-axis"
                  />
                {thresholdTrendPoints ? (
                    <>
                      <polyline
                        points={thresholdTrendPoints}
                        fill="none"
                        className="sparkline-line"
                      />
                      {thresholdTrendPlot.map((item, index) => (
                        <g key={item.label}>
                          <circle
                            cx={item.x}
                            cy={item.y}
                            r={index === thresholdTrendPlot.length - 1 ? 3.4 : 2.2}
                            className={`sparkline-point ${item.severityClass} ${
                              index === thresholdTrendPlot.length - 1 ? "latest" : ""
                            }`}
                          />
                        </g>
                      ))}
                    </>
                  ) : null}
                </svg>
                <div className="sparkline-labels">
                  {thresholdTrendPreview.map((item) => (
                    <span key={item.label}>{item.label.replace(" 2026", "")}</span>
                  ))}
                </div>
              </div>

              <div className="metric-updated">as of {latestUpdate}</div>
            </article>

            <section className="section-block divergence-section">
              <div className="section-header divergence-header">
                <h2>Top Categories vs Benchmark</h2>
                <div className="divergence-actions" ref={divergenceInfoRef}>
                  <button
                    type="button"
                    className="divergence-info-button"
                    aria-label="Learn more about this chart"
                    aria-controls="divergence-info-popup"
                    aria-expanded={isDivergenceInfoOpen}
                    onClick={() => setIsDivergenceInfoOpen((current) => !current)}
                  >
                    <HelpCircle size={13} />
                  </button>
                  {isDivergenceInfoOpen ? (
                    <div className="divergence-info-panel" id="divergence-info-popup" role="dialog">
                      <div className="divergence-info-copy">
                        <p className="divergence-info-title">How to read this chart</p>
                        <ul className="divergence-info-list">
                          <li>Each bar shows a category's average difference from the benchmark this month.</li>
                          <li>0% means it matches the benchmark.</li>
                          <li>Right of 0 is above. Left of 0 is below.</li>
                          <li>Tap a bar to see the exact % and Rp difference.</li>
                        </ul>
                        <div className="divergence-info-example">
                          Example: Housing +23% means average Housing spending is 23% above the benchmark.
                        </div>
                      </div>
                      <button
                        type="button"
                        className="link-button divergence-popup-link"
                        onClick={() => {
                          setIsDivergenceInfoOpen(false);
                          navigate("/allowances?view=category");
                        }}
                      >
                        View all categories
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
              <p className="section-helper">
                Top categories with the biggest spend difference vs benchmark.
              </p>

                <div className="bar-card">
                  {topCategories.map((category) => {
                    const clampedVariance = Math.max(
                      DIVERGENCE_AXIS_MIN,
                      Math.min(DIVERGENCE_AXIS_MAX, category.averageVariance)
                    );
                    const isNegative = clampedVariance < 0;
                    const width = `${(Math.abs(clampedVariance) / DIVERGENCE_AXIS_RANGE) * 100}%`;
                    const categoryKey = category.category_name;
                    const isActive = activeDivergenceCategory === categoryKey;
                    const { Icon, iconLabel } = getDivergenceCategoryIcon(category.category_name);
                    const isIconActive = activeDivergenceIcon === categoryKey;

                    return (
                      <div className="bar-row" key={categoryKey}>
                        <button
                          type="button"
                          className={`bar-icon-label bar-icon-button ${isIconActive ? "active" : ""}`}
                          title={iconLabel}
                          aria-label={`Show category name: ${iconLabel}`}
                          aria-pressed={isIconActive}
                          onClick={() =>
                            setActiveDivergenceIcon((current) =>
                              current === categoryKey ? null : categoryKey
                            )
                          }
                        >
                          <Icon size={16} aria-hidden="true" />
                          {isIconActive ? (
                            <span className="bar-icon-name" role="status">
                              {iconLabel}
                            </span>
                          ) : null}
                          <span className="sr-only">{iconLabel}</span>
                        </button>
                        <button
                          type="button"
                          className="bar-track bar-track-button"
                          onClick={() =>
                            setActiveDivergenceCategory((current) =>
                              current === categoryKey ? null : categoryKey
                            )
                          }
                          onMouseEnter={() => setActiveDivergenceCategory(categoryKey)}
                          onMouseLeave={() =>
                            setActiveDivergenceCategory((current) =>
                              current === categoryKey ? null : current
                            )
                          }
                          aria-pressed={isActive}
                          aria-label={`Show divergence score for ${formatDashboardCategoryLabel(
                            category.category_name
                          )}: ${formatSignedPercent(clampedVariance)}, ${formatVarianceAmountLabel(
                            category.averageVarianceAmount
                          )}`}
                        >
                          <div
                            className={isNegative ? "bar-left" : "bar-right"}
                            style={{ width }}
                          >
                            {isActive ? (
                              <span
                                className={`bar-value-badge ${
                                  isNegative ? "negative" : "positive"
                                }`}
                              >
                                <span className="bar-value-percent">
                                  {formatSignedPercent(clampedVariance)}
                                </span>
                                <span className="bar-value-amount">
                                  {formatVarianceAmountLabel(category.averageVarianceAmount)}
                                </span>
                              </span>
                            ) : null}
                          </div>
                        </button>
                      </div>
                    );
                })}

                <div className="axis-row">
                  <span>-30</span>
                  <span>0</span>
                  <span>30</span>
                  <span>50</span>
                </div>
              </div>
            </section>

                <section className="section-block top-spenders-section">
                  <div className="section-header">
                    <h2>Top Spenders List</h2>
                    <div className="top-spenders-actions">
                      <div
                        className={`month-filter-wrap ${isTopSpendersMenuOpen ? "open" : ""}`}
                        ref={topSpendersMenuRef}
                      >
                        <button
                          type="button"
                          className="month-filter month-filter-trigger"
                          aria-haspopup="listbox"
                          aria-expanded={isTopSpendersMenuOpen}
                          aria-label="Select top spenders reporting period"
                          onClick={() => setIsTopSpendersMenuOpen((current) => !current)}
                        >
                          <span>{selectedTopSpendersPeriodLabel}</span>
                          <ChevronDown size={14} />
                        </button>
                        {isTopSpendersMenuOpen ? (
                          <div className="month-filter-menu" role="listbox">
                            {periodsDescending.map((period) => (
                              <button
                                key={period.period_id}
                                type="button"
                                className={`month-filter-option ${
                                  Number(period.period_id) === Number(selectedTopSpendersPeriodId)
                                    ? "active"
                                    : ""
                                }`}
                                role="option"
                                aria-selected={
                                  Number(period.period_id) === Number(selectedTopSpendersPeriodId)
                                }
                                onClick={() => {
                                  setSelectedTopSpendersPeriodId(String(period.period_id));
                                  setIsTopSpendersMenuOpen(false);
                                }}
                              >
                                {period.label}
                              </button>
                            ))}
                          </div>
                        ) : null}
                      </div>
                      <div className="top-spenders-info-wrap" ref={topSpendersInfoRef}>
                        <button
                          type="button"
                          className="top-spenders-info-button"
                          aria-label="Learn more about top spenders list"
                          aria-controls="top-spenders-info-popup"
                          aria-expanded={isTopSpendersInfoOpen}
                          onClick={() => setIsTopSpendersInfoOpen((current) => !current)}
                        >
                          <HelpCircle size={13} />
                        </button>
                        {isTopSpendersInfoOpen ? (
                          <div
                            className="top-spenders-info-panel"
                            id="top-spenders-info-popup"
                            role="dialog"
                          >
                            <p className="top-spenders-info-title">How to read this table</p>
                            <ul className="top-spenders-info-list">
                              <li>Ranks MPs by total monthly spend for the selected month.</li>
                              <li>
                                Variance shows % difference vs benchmark (0% = benchmark).
                              </li>
                              <li>
                                Example: +30% means spending is 30% above benchmark.
                              </li>
                            </ul>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <p className="section-helper top-spenders-helper">
                    Ranked by monthly spend. Tap a row to view full MP details.
                  </p>

                <div className="table-card">
                  <div className="table-head">
                    <span>#</span>
                    <span>MP</span>
                    <span>Party</span>
                    <span>Monthly Spend</span>
                    <span>Variance</span>
                    <span className="sr-only">Open details</span>
                  </div>
                  {topSpenders.map((mp, index) => (
                    <button
                      type="button"
                      className="table-row table-row-button"
                      key={mp.mp_id}
                      onClick={() => navigate(`/mps/${mp.mp_id}`)}
                      aria-label={`Open details for ${mp.name}`}
                    >
                      <span className="rank">{index + 1}</span>
                      <span className="name">{mp.name}</span>
                      <span className="top-spenders-party-cell">
                        {mp.partyLogo ? (
                          <img
                            src={mp.partyLogo}
                            alt={`${mp.party || "Party"} logo`}
                            className="top-spenders-party-logo"
                          />
                        ) : (
                          <span className="top-spenders-party-text">{mp.party || "-"}</span>
                        )}
                      </span>
                      <span>{formatCompactCurrency(mp.spend)}</span>
                      <span className={`variance ${mp.variance >= 0 ? "up" : "down"}`}>
                        {mp.variance > 0 ? "+" : ""}
                        {Math.round(mp.variance)}%
                        {mp.variance >= 0 ? <ArrowUp size={13} /> : <ArrowDown size={13} />}
                      </span>
                      <span className="table-row-chevron" aria-hidden="true">
                        <ChevronRight size={14} />
                      </span>
                    </button>
                  ))}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
