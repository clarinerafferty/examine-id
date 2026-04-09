import {
  Search,
  AlertTriangle,
  Wallet,
  TrendingUp,
  ChevronDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchJson } from "../lib/api";

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

const DIVERGENCE_AXIS_MIN = -30;
const DIVERGENCE_AXIS_MAX = 50;
const DIVERGENCE_AXIS_RANGE = DIVERGENCE_AXIS_MAX - DIVERGENCE_AXIS_MIN;

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
  const [selectedTopSpendersPeriodId, setSelectedTopSpendersPeriodId] = useState("");
  const [isTopSpendersMenuOpen, setIsTopSpendersMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const topSpendersMenuRef = useRef(null);

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
      if (!topSpendersMenuRef.current?.contains(event.target)) {
        setIsTopSpendersMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  const latestPeriodLabel = latestPeriodRecords[0]?.reporting_label || "Latest";
  const latestUpdate = latestPeriodRecords[0]?.last_updated
    ? new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date(latestPeriodRecords[0].last_updated))
    : "No update";

  const averageSpend = useMemo(() => {
    if (!latestPeriodRecords.length) {
      return 0;
    }

    const total = latestPeriodRecords.reduce(
      (sum, record) => sum + Number(record.actual_spend || 0),
      0
    );

    return total / latestPeriodRecords.length;
  }, [latestPeriodRecords]);

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

  const thresholdSummary = useMemo(() => {
    const highVarianceRecords = latestPeriodRecords.filter(
      (record) => Number(record.variance_percent) > 25
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
        (record) => Number(record.variance_percent) > 25
      );

      return {
        label: period.label,
        count: new Set(highVarianceRecords.map((record) => record.mp_id)).size,
      };
    });
  }, [allowances, periodsAscending]);

  const thresholdTrendMax = useMemo(() => {
    return Math.max(...thresholdTrend.map((item) => item.count), 1);
  }, [thresholdTrend]);

  const thresholdTrendPlot = useMemo(() => {
    if (!thresholdTrend.length) {
      return [];
    }

    return thresholdTrend.map((item, index) => {
      const x =
        thresholdTrend.length === 1 ? 84 : 10 + (index * 148) / (thresholdTrend.length - 1);
      const y = 36 - (item.count / thresholdTrendMax) * 24;

      return {
        ...item,
        x,
        y,
        severityClass: item.count >= 4 ? "critical" : item.count >= 2 ? "warning" : "calm",
      };
    });
  }, [thresholdTrend, thresholdTrendMax]);

  const thresholdTrendPoints = useMemo(() => {
    if (!thresholdTrendPlot.length) {
      return "";
    }

    return thresholdTrendPlot
      .map((item) => `${item.x},${item.y}`)
      .join(" ");
  }, [thresholdTrendPlot]);

  const topCategories = useMemo(() => {
    const grouped = new Map();

    latestPeriodRecords.forEach((record) => {
      const existing = grouped.get(record.category_id) || {
        category_name: record.category_name,
        maxVariance: Number.NEGATIVE_INFINITY,
        minVariance: Number.POSITIVE_INFINITY,
      };

      const variance = Number(record.variance_percent || 0);
      existing.maxVariance = Math.max(existing.maxVariance, variance);
      existing.minVariance = Math.min(existing.minVariance, variance);
      grouped.set(record.category_id, existing);
    });

    return Array.from(grouped.values())
      .map((item) => ({
        ...item,
        dominantVariance:
          Math.abs(item.maxVariance) >= Math.abs(item.minVariance)
            ? item.maxVariance
            : item.minVariance,
      }))
      .sort((a, b) => Math.abs(b.dominantVariance) - Math.abs(a.dominantVariance))
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

  function handleSearchSubmit(event) {
    event.preventDefault();

    const term = searchTerm.trim().toLowerCase();

    if (!term) {
      navigate("/allowances");
      return;
    }

    const matchingMp = mps.find((item) =>
      `${item.display_name || ""} ${item.full_name || ""} ${item.party_name || ""}`
        .toLowerCase()
        .includes(term)
    );

    if (matchingMp) {
      navigate(`/mps/${matchingMp.mp_id}`);
      return;
    }

    const matchingCategory = latestPeriodRecords.find((item) =>
      item.category_name.toLowerCase().includes(term)
    );

    if (matchingCategory) {
      navigate(`/categories/${matchingCategory.category_id}`);
      return;
    }

    navigate(`/allowances?view=category&search=${encodeURIComponent(searchTerm.trim())}`);
  }

  return (
    <div className="dashboard-screen">
      <header className="top-header">
        <div className="brand-wrap">
          <img src="/examine-id-logo.png" alt="Examine.ID logo" className="brand-logo" />
          <div className="brand-text">
            <div className="brand-title">Examine.ID</div>
            <div className="brand-subtitle">See the Numbers, Know the Story</div>
          </div>
        </div>
      </header>

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
          </p>

          <form className="search-bar" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              placeholder="Search MPs or categories..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
            <button type="submit" aria-label="Search">
              <Search size={16} />
            </button>
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
                <div className="metric-card-header">
                  <div className="metric-label-wrap">
                    <Wallet size={14} />
                    <span>Avg. Allowance Spend</span>
                  </div>
                </div>

                <div className="metric-value-row">
                  <div className="metric-value">{formatCompactCurrency(averageSpend)}</div>
                  <div className="metric-chip">
                    {overallVariance > 0 ? "+" : ""}
                    {Math.round(overallVariance)}%
                  </div>
                </div>

                <div className="metric-updated">Update: {latestUpdate}</div>
              </article>

              <article className="metric-card">
                <div className="metric-card-header">
                  <div className="metric-label-wrap">
                    <TrendingUp size={14} />
                    <span>Overall Variance vs Market</span>
                  </div>
                </div>

                <div className="metric-value-row">
                  <div className="metric-value metric-highlight">
                    {overallVariance > 0 ? "+" : ""}
                    {Math.round(overallVariance)}%
                  </div>
                  <div className="metric-chip">{latestPeriodLabel}</div>
                </div>

                <div className="metric-updated">Update: {latestUpdate}</div>
              </article>
            </section>

            <article className="wide-alert-card">
              <div className="metric-label-wrap">
                <AlertTriangle size={14} />
                <span>MPs Above 25% Threshold</span>
              </div>

              <div className="wide-alert-content">
                <div className="wide-alert-left">
                  <div className="wide-big-value">{thresholdSummary.count} MPs</div>
                  <div className="sparkline-card" aria-label="Threshold trend by period">
                    <svg viewBox="0 0 96 42" className="sparkline-chart" role="img">
                      <line x1="8" y1="36" x2="88" y2="36" className="sparkline-axis" />
                    {thresholdTrendPoints ? (
                        <>
                          <polyline
                            points={thresholdTrendPoints}
                            fill="none"
                            className="sparkline-line"
                          />
                          {thresholdTrendPlot.map((item) => (
                            <g key={item.label}>
                              <circle
                                cx={item.x}
                                cy={item.y}
                                r="2.4"
                                className={`sparkline-point ${item.severityClass}`}
                              />
                            </g>
                          ))}
                        </>
                      ) : null}
                    </svg>
                    <div className="sparkline-labels">
                      {thresholdTrend.map((item) => (
                        <span key={item.label}>{item.label.replace(" 2026", "")}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="wide-alert-right">
                  <div className="wide-note">
                    {formatCompactCurrency(thresholdSummary.excessSpend)} Excess Spend
                  </div>
                  <button
                    className="visit-button"
                    type="button"
                    onClick={() =>
                      navigate("/allowances?view=member&sort=variance&threshold=25")
                    }
                  >
                    View List
                  </button>
                </div>
              </div>

              <div className="metric-updated">Update: {latestUpdate}</div>
            </article>

            <section className="section-block">
              <div className="section-header">
                <h2>Top Categories by Divergence</h2>
                <button
                  type="button"
                  className="link-button"
                  onClick={() => navigate("/allowances?view=category")}
                >
                  See all
                </button>
              </div>

                <div className="bar-card">
                  {topCategories.map((category) => {
                    const clampedVariance = Math.max(
                      DIVERGENCE_AXIS_MIN,
                      Math.min(DIVERGENCE_AXIS_MAX, category.dominantVariance)
                    );
                    const isNegative = clampedVariance < 0;
                    const width = `${(Math.abs(clampedVariance) / DIVERGENCE_AXIS_RANGE) * 100}%`;

                    return (
                      <div className="bar-row" key={category.category_name}>
                        <label>{formatDashboardCategoryLabel(category.category_name)}</label>
                        <div className="bar-track">
                          <div
                            className={isNegative ? "bar-left" : "bar-right"}
                            style={{ width }}
                          />
                        </div>
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

                <section className="section-block">
                  <div className="section-header">
                    <h2>Top Spenders List</h2>
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
                  </div>

                <div className="table-card">
                  <div className="table-head">
                    <span>#</span>
                      <span>MP</span>
                    <span>Party</span>
                    <span>Monthly Spend</span>
                      <span>Variance</span>
                    </div>
                  {topSpenders.map((mp, index) => (
                    <button
                      type="button"
                    className="table-row table-row-button"
                    key={mp.mp_id}
                    onClick={() => navigate(`/mps/${mp.mp_id}`)}
                  >
                    <span className="rank">{index + 1}</span>
                    <span className="name">{mp.name}</span>
                    <span>{mp.party}</span>
                    <span>{formatCompactCurrency(mp.spend)}</span>
                    <span className={`variance ${mp.variance >= 0 ? "up" : "down"}`}>
                      {mp.variance > 0 ? "+" : ""}
                      {Math.round(mp.variance)}%
                      {mp.variance >= 0 ? <ArrowUp size={13} /> : <ArrowDown size={13} />}
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
