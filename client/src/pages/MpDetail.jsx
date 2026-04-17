import {
  Building2,
  Home,
  CircleUserRound,
  HandCoins,
  ShoppingBasket,
  CalendarDays,
  CircleHelp,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Megaphone,
  Plane,
  Scale,
  Smartphone,
  Users,
  ShieldUser,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  fetchJson,
  formatCurrency,
  getBrowserSessionHash,
  postJson,
} from "../lib/api";
import { resolveCategoryIcon } from "../lib/categoryIcons";

function formatCompactCurrency(value) {
  const numericValue = Number(value || 0);

  if (numericValue >= 1000000) {
    return `Rp. ${(numericValue / 1000000).toFixed(1)}M`;
  }

  return formatCurrency(numericValue);
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

function isCurrentOrPastRecord(record) {
  if (!record) {
    return false;
  }

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const recordYear = Number(record.year);
  const recordMonth = Number(record.month);

  if (recordYear < currentYear) {
    return true;
  }

  if (recordYear > currentYear) {
    return false;
  }

  return recordMonth <= currentMonth;
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

function formatAxisTickValue(value) {
  const numericValue = Number(value || 0);

  if (Number.isInteger(numericValue)) {
    return String(numericValue);
  }

  return numericValue.toFixed(1);
}

function formatSignedAxisTick(value) {
  const numericValue = Number(value || 0);

  if (numericValue === 0) {
    return "0";
  }

  return `${numericValue > 0 ? "+" : "-"}${formatAxisTickValue(Math.abs(numericValue))}`;
}

function getMpCategoryIcon(name) {
  const iconMap = {
    house: Home,
    plane: Plane,
    smartphone: Smartphone,
    users: Users,
    "building-2": Building2,
    "shield-user": ShieldUser,
  };
  const { iconKey, iconLabel } = resolveCategoryIcon(name, "house");

  return { Icon: iconMap[iconKey] || Wallet, iconLabel };
}

function MpDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mp, setMp] = useState(null);
  const [allowances, setAllowances] = useState([]);
  const [isSpendInfoOpen, setIsSpendInfoOpen] = useState(false);
  const [isVarianceInfoOpen, setIsVarianceInfoOpen] = useState(false);
  const [isTrendInfoOpen, setIsTrendInfoOpen] = useState(false);
  const [isCategoryChartInfoOpen, setIsCategoryChartInfoOpen] = useState(false);
  const [selectedTrendYear, setSelectedTrendYear] = useState("");
  const [isTrendYearMenuOpen, setIsTrendYearMenuOpen] = useState(false);
  const [activeTrendPoint, setActiveTrendPoint] = useState(null);
  const [activeCategoryLabelId, setActiveCategoryLabelId] = useState(null);
  const [activeCategoryBarId, setActiveCategoryBarId] = useState(null);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [hasSubmittedFeedback, setHasSubmittedFeedback] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadMpDetail() {
      try {
        const [mpData, allowanceData] = await Promise.all([
          fetchJson(`/api/mps/${id}`),
          fetchJson(`/api/mps/${id}/allowances`),
        ]);

        if (isMounted) {
          setMp(mpData);
          setAllowances(allowanceData);
        }
      } catch {
        if (isMounted) {
          setError("Unable to load this MP profile right now.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadMpDetail();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const currentOrPastAllowances = useMemo(() => {
    return allowances.filter(isCurrentOrPastRecord);
  }, [allowances]);

  const latestPeriodId = useMemo(() => {
    if (!currentOrPastAllowances.length) {
      return null;
    }

    const latestRecord = currentOrPastAllowances.reduce((latest, record) => {
      if (!latest) {
        return record;
      }

      if (Number(record.year) > Number(latest.year)) {
        return record;
      }

      if (
        Number(record.year) === Number(latest.year) &&
        Number(record.month) > Number(latest.month)
      ) {
        return record;
      }

      return latest;
    }, null);

    return latestRecord?.period_id || null;
  }, [currentOrPastAllowances]);

  const selectedPeriodId = useMemo(() => {
    const requestedPeriod = searchParams.get("period");

    if (
      requestedPeriod &&
      currentOrPastAllowances.some(
        (record) => String(record.period_id) === String(requestedPeriod)
      )
    ) {
      return requestedPeriod;
    }

    return latestPeriodId ? String(latestPeriodId) : null;
  }, [currentOrPastAllowances, latestPeriodId, searchParams]);

  const selectedPeriodRecords = useMemo(() => {
    if (!selectedPeriodId) {
      return [];
    }

    return currentOrPastAllowances.filter(
      (record) => Number(record.period_id) === Number(selectedPeriodId)
    );
  }, [currentOrPastAllowances, selectedPeriodId]);

  const periodOptions = useMemo(() => {
    const uniquePeriods = new Map();

    currentOrPastAllowances.forEach((record) => {
      uniquePeriods.set(String(record.period_id), {
        period_id: String(record.period_id),
        label: record.reporting_label,
        year: Number(record.year),
        month: Number(record.month),
      });
    });

    return Array.from(uniquePeriods.values()).sort((a, b) => {
      if (a.year !== b.year) {
        return a.year - b.year;
      }

      return a.month - b.month;
    });
  }, [currentOrPastAllowances]);

  const selectedPeriodIndex = periodOptions.findIndex(
    (period) => String(period.period_id) === String(selectedPeriodId)
  );

  const previousPeriod = selectedPeriodIndex > 0 ? periodOptions[selectedPeriodIndex - 1] : null;

  const previousPeriodRecords = useMemo(() => {
    if (!previousPeriod) {
      return [];
    }

    return currentOrPastAllowances.filter(
      (record) => Number(record.period_id) === Number(previousPeriod.period_id)
    );
  }, [currentOrPastAllowances, previousPeriod]);

  const trendYearOptions = useMemo(() => {
    return Array.from(new Set(periodOptions.map((period) => String(period.year)))).sort();
  }, [periodOptions]);

  useEffect(() => {
    if (!trendYearOptions.length) {
      return;
    }

    if (!selectedTrendYear || !trendYearOptions.includes(String(selectedTrendYear))) {
      setSelectedTrendYear(trendYearOptions[trendYearOptions.length - 1]);
    }
  }, [selectedTrendYear, trendYearOptions]);

  useEffect(() => {
    setActiveTrendPoint(null);
  }, [selectedTrendYear]);

  useEffect(() => {
    setActiveCategoryLabelId(null);
    setActiveCategoryBarId(null);
  }, [selectedPeriodId]);

  const latestPeriodLabel = selectedPeriodRecords[0]?.reporting_label || "";
  const latestUpdate = selectedPeriodRecords[0]?.last_updated || allowances[0]?.last_updated;

  const topCategories = useMemo(() => {
    return [...selectedPeriodRecords]
      .sort(
        (a, b) =>
          Math.abs(Number(b.variance_percent || 0)) -
          Math.abs(Number(a.variance_percent || 0))
      )
      .slice(0, 5);
  }, [selectedPeriodRecords]);

  const categoryScaleMax = useMemo(() => {
    const maxAbsVariance = topCategories.reduce(
      (maxValue, item) => Math.max(maxValue, Math.abs(Number(item.variance_percent || 0))),
      0
    );

    if (!maxAbsVariance) {
      return 10;
    }

    if (maxAbsVariance <= 10) {
      return 10;
    }

    if (maxAbsVariance <= 25) {
      return Math.ceil(maxAbsVariance / 5) * 5;
    }

    return Math.ceil(maxAbsVariance / 10) * 10;
  }, [topCategories]);

  const categoryAxisTicks = useMemo(() => {
    return [
      -categoryScaleMax,
      -(categoryScaleMax / 2),
      0,
      categoryScaleMax / 2,
      categoryScaleMax,
    ];
  }, [categoryScaleMax]);

  const monthlySpend = useMemo(() => {
    return selectedPeriodRecords.reduce(
      (sum, record) => sum + Number(record.actual_spend || 0),
      0
    );
  }, [selectedPeriodRecords]);

  const marketVariance = useMemo(() => {
    if (!selectedPeriodRecords.length) {
      return 0;
    }

    const total = selectedPeriodRecords.reduce(
      (sum, record) => sum + Number(record.variance_percent || 0),
      0
    );

    return total / selectedPeriodRecords.length;
  }, [selectedPeriodRecords]);

  const previousMonthlySpend = useMemo(() => {
    return previousPeriodRecords.reduce(
      (sum, record) => sum + Number(record.actual_spend || 0),
      0
    );
  }, [previousPeriodRecords]);

  const previousMarketVariance = useMemo(() => {
    if (!previousPeriodRecords.length) {
      return 0;
    }

    const total = previousPeriodRecords.reduce(
      (sum, record) => sum + Number(record.variance_percent || 0),
      0
    );

    return total / previousPeriodRecords.length;
  }, [previousPeriodRecords]);

  const categoryCount = selectedPeriodRecords.length;

  const totalBenchmarkSpend = useMemo(() => {
    return selectedPeriodRecords.reduce((sum, record) => {
      return sum + (Number(record.actual_spend || 0) - Number(record.variance_amount || 0));
    }, 0);
  }, [selectedPeriodRecords]);

  const totalGapAmount = monthlySpend - totalBenchmarkSpend;

  const previousTotalBenchmarkSpend = useMemo(() => {
    return previousPeriodRecords.reduce((sum, record) => {
      return sum + (Number(record.actual_spend || 0) - Number(record.variance_amount || 0));
    }, 0);
  }, [previousPeriodRecords]);

  const previousTotalGapAmount = previousMonthlySpend - previousTotalBenchmarkSpend;

  const monthlySpendChangeAmount = monthlySpend - previousMonthlySpend;
  const monthlySpendChangePercent =
    previousMonthlySpend > 0 ? (monthlySpendChangeAmount / previousMonthlySpend) * 100 : null;
  const marketVarianceChange = marketVariance - previousMarketVariance;
  const totalGapChangeAmount = totalGapAmount - previousTotalGapAmount;

  const monthlyTrendData = useMemo(() => {
    return periodOptions
      .filter((period) => String(period.year) === String(selectedTrendYear))
      .map((period) => {
        const periodRecords = currentOrPastAllowances.filter(
          (record) => Number(record.period_id) === Number(period.period_id)
        );
        const actualSpend = periodRecords.reduce(
          (sum, record) => sum + Number(record.actual_spend || 0),
          0
        );
        const benchmarkSpend = periodRecords.reduce((sum, record) => {
          return sum + (Number(record.actual_spend || 0) - Number(record.variance_amount || 0));
        }, 0);

        return {
          periodId: String(period.period_id),
          label: period.label,
          monthLabel: period.label.slice(0, 3),
          actualSpend,
          benchmarkSpend,
        };
      });
  }, [currentOrPastAllowances, periodOptions, selectedTrendYear]);

  const maxTrendValue = Math.max(
    ...monthlyTrendData.flatMap((item) => [item.actualSpend, item.benchmarkSpend]),
    1
  );

  const trendChartPoints = useMemo(() => {
    if (!monthlyTrendData.length) {
      return [];
    }

    const startX = 52;
    const endX = 280;
    const yBase = 128;
    const chartHeight = 92;

    return monthlyTrendData.map((item, index) => {
      const x =
        monthlyTrendData.length === 1
          ? (startX + endX) / 2
          : startX + (index * (endX - startX)) / (monthlyTrendData.length - 1);

      return {
        ...item,
        x,
        actualY: yBase - (item.actualSpend / maxTrendValue) * chartHeight,
        benchmarkY: yBase - (item.benchmarkSpend / maxTrendValue) * chartHeight,
      };
    });
  }, [maxTrendValue, monthlyTrendData]);

  const trendYAxisLabels = useMemo(() => {
    return [1, 0.5, 0].map((ratio) => ({
      y: 36 + (1 - ratio) * 92,
      value: formatCompactCurrency(maxTrendValue * ratio),
    }));
  }, [maxTrendValue]);

  const trendSpendPath = useMemo(
    () => createSmoothPath(trendChartPoints.map((item) => ({ x: item.x, y: item.actualY }))),
    [trendChartPoints]
  );

  const trendBenchmarkPath = useMemo(
    () => createSmoothPath(trendChartPoints.map((item) => ({ x: item.x, y: item.benchmarkY }))),
    [trendChartPoints]
  );

  const highestTrendMonth = useMemo(() => {
    if (!monthlyTrendData.length) {
      return null;
    }

    return monthlyTrendData.reduce((highest, item) =>
      !highest || item.actualSpend > highest.actualSpend ? item : highest
    , null);
  }, [monthlyTrendData]);

  const lowestTrendMonth = useMemo(() => {
    if (!monthlyTrendData.length) {
      return null;
    }

    return monthlyTrendData.reduce((lowest, item) =>
      !lowest || item.actualSpend < lowest.actualSpend ? item : lowest
    , null);
  }, [monthlyTrendData]);

  const yearlySpendTotal = useMemo(() => {
    return monthlyTrendData.reduce((sum, item) => sum + item.actualSpend, 0);
  }, [monthlyTrendData]);

  const yearlyBenchmarkTotal = useMemo(() => {
    return monthlyTrendData.reduce((sum, item) => sum + item.benchmarkSpend, 0);
  }, [monthlyTrendData]);

  const categoriesAboveBenchmark = useMemo(() => {
    return selectedPeriodRecords.filter((record) => Number(record.variance_percent || 0) > 0).length;
  }, [selectedPeriodRecords]);

  const categoriesBelowBenchmark = useMemo(() => {
    return selectedPeriodRecords.filter((record) => Number(record.variance_percent || 0) < 0).length;
  }, [selectedPeriodRecords]);

  useEffect(() => {
    const hasModalOpen =
      isSpendInfoOpen || isVarianceInfoOpen || isTrendInfoOpen || isCategoryChartInfoOpen;

    document.body.classList.toggle("modal-open", hasModalOpen);

    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [isSpendInfoOpen, isVarianceInfoOpen, isTrendInfoOpen, isCategoryChartInfoOpen]);

  useEffect(() => {
    let isMounted = true;

    async function loadExistingFeedback() {
      if (!id || !selectedPeriodId) {
        if (isMounted) {
          setHasSubmittedFeedback(false);
          setFeedbackMessage("");
        }
        return;
      }

      try {
        const feedbackRows = await fetchJson(
          `/api/feedback?mp_id=${encodeURIComponent(id)}&period_id=${encodeURIComponent(
            selectedPeriodId
          )}`
        );
        const sessionHash = getBrowserSessionHash();
        const existingVote = feedbackRows.find(
          (item) =>
            String(item.mp_id) === String(id) &&
            String(item.period_id) === String(selectedPeriodId) &&
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
  }, [id, selectedPeriodId]);

  async function submitFeedback(responseValue) {
    if (!selectedPeriodId || submittingFeedback) {
      return;
    }

    setSubmittingFeedback(true);
    setFeedbackMessage("");

    try {
      await postJson("/api/feedback", {
        feedback_type: "rating",
        mp_id: Number(id),
        period_id: Number(selectedPeriodId),
        response_value: responseValue,
        session_hash: getBrowserSessionHash(),
        source_page: `/mps/${id}`,
      });
      await fetchJson(`/api/feedback?mp_id=${id}`);
      setFeedbackMessage("Anonymous vote recorded for this period");
      setHasSubmittedFeedback(true);
    } catch (error) {
      if (error instanceof Error && error.status === 409) {
        setFeedbackMessage("Anonymous vote recorded for this period");
        setHasSubmittedFeedback(true);
      } else {
        setFeedbackMessage("Unable to save feedback");
        setHasSubmittedFeedback(false);
      }
    } finally {
      setSubmittingFeedback(false);
    }
  }

  return (
    <div className="mp-profile-screen">
      <div className="mp-profile-top">
        {loading && <div className="card status-card">Loading profile...</div>}
        {error && <div className="card status-card error-card">{error}</div>}

        {!loading && !error && mp && (
          <>
            <div className="mp-profile-avatar">
              {mp.profile_image ? (
                <img
                  src={mp.profile_image}
                  alt={mp.display_name || mp.full_name}
                  className="mp-profile-avatar-photo"
                />
              ) : (
                <CircleUserRound size={128} strokeWidth={1.5} />
              )}
            </div>

            <div className="mp-profile-heading">
              <div className="mp-profile-name">{mp.display_name || mp.full_name}</div>
              <div className="mp-profile-rank">{mp.mp_rank}</div>
              <div className="mp-profile-party-line">
                <div className="mp-profile-party-brand">
                  {mp.party_logo ? (
                    <img
                      src={mp.party_logo}
                      alt={`${mp.party_abbreviation} logo`}
                      className="party-logo-badge"
                    />
                  ) : (
                    <span className="party-dot" />
                  )}
                  <span className="mp-profile-party-name">{mp.party_name}</span>
                </div>
                <span className="mp-profile-term">2024 - 2029</span>
              </div>
            </div>
          </>
        )}
      </div>

      {!loading && !error && mp && (
        <div className="mp-profile-sheet">
          <section className="profile-metric-grid">
            <article className="profile-stat-card">
              <button
                type="button"
                className="profile-stat-button"
                onClick={() => setIsSpendInfoOpen(true)}
                aria-label="Open total monthly spend details"
              >
                <div className="profile-stat-label">
                  <HandCoins size={16} />
                  <span>Total Monthly Spend</span>
                </div>

                <div className="profile-stat-value-row">
                  <div className="profile-stat-value">{formatCompactCurrency(monthlySpend)}</div>
                  <div className="profile-chip neutral">{categoryCount} categories</div>
                </div>

                <div className="profile-stat-update">as of {formatDisplayDate(latestUpdate)}</div>
              </button>
            </article>

            <article className="profile-stat-card">
              <button
                type="button"
                className="profile-stat-button"
                onClick={() => setIsVarianceInfoOpen(true)}
                aria-label="Open market overspend or underspend details"
              >
                <div className="profile-stat-label">
                  <ShoppingBasket size={16} />
                  <span>Market Overspend/Underspend</span>
                </div>

                <div className={`overspend-tag ${marketVariance < 0 ? "below" : "above"}`}>
                  {marketVariance >= 0 ? "OVERSPEND" : "UNDERSPEND"}
                </div>

                <div className="profile-stat-value-row">
                  <div className="profile-stat-value accent">
                    {marketVariance > 0 ? "+" : ""}
                    {Math.round(marketVariance)}%
                  </div>
                  <div className={`profile-chip ${totalGapAmount >= 0 ? "gain" : "muted"}`}>
                    {totalGapAmount > 0 ? "+" : totalGapAmount < 0 ? "-" : ""}
                    {formatCompactCurrency(Math.abs(totalGapAmount))}
                  </div>
                </div>

                <div className="profile-stat-update">as of {formatDisplayDate(latestUpdate)}</div>
              </button>
            </article>
          </section>

          {isSpendInfoOpen ? (
            <div className="benchmark-info-backdrop" onClick={() => setIsSpendInfoOpen(false)}>
              <div
                className="benchmark-info-modal rank-info-modal"
                role="dialog"
                aria-modal="true"
                aria-label="Total monthly spend details"
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  type="button"
                  className="benchmark-info-close"
                  onClick={() => setIsSpendInfoOpen(false)}
                  aria-label="Close total monthly spend details"
                >
                  ×
                </button>
                <h3>Total Monthly Spend</h3>
                <p className="benchmark-info-formula">Period: {latestPeriodLabel || "Selected month"}</p>
                <div className="mp-info-highlight-row">
                  <div className="mp-info-highlight-card">
                    <span>This month</span>
                    <strong>{formatCompactCurrency(monthlySpend)}</strong>
                  </div>
                  <div className="mp-info-highlight-card">
                    <span>Categories</span>
                    <strong>{categoryCount}</strong>
                  </div>
                </div>
                <div className="rank-info-grid">
                  <div className="rank-info-card">
                    <div className="rank-info-card-head">
                      <strong>What this means</strong>
                    </div>
                    <div className="rank-info-kv rank-info-kv-copy">
                      <span>Definition</span>
                      <p className="rank-info-copy">
                        The <strong>sum of this MP&apos;s reported spending</strong> across categories
                        in the selected month.
                      </p>
                    </div>
                    <div className="rank-info-kv rank-info-kv-copy">
                      <span>This covers</span>
                      <p className="rank-info-copy">
                        <strong>{categoryCount} category records</strong> for{" "}
                        {latestPeriodLabel || "this month"}.
                      </p>
                    </div>
                  </div>
                  <div className="rank-info-card">
                    <div className="rank-info-card-head">
                      <strong>Compared with previous month</strong>
                    </div>
                    {previousPeriod ? (
                      <div className="mp-info-stat-list">
                        <div className="mp-info-stat-row">
                          <span>{previousPeriod.label}</span>
                          <strong>{formatCompactCurrency(previousMonthlySpend)}</strong>
                        </div>
                        <div className="mp-info-stat-row">
                          <span>Change in Rp</span>
                          <strong>
                            {monthlySpendChangeAmount > 0 ? "+" : monthlySpendChangeAmount < 0 ? "-" : ""}
                            {formatCompactCurrency(Math.abs(monthlySpendChangeAmount))}
                          </strong>
                        </div>
                        <div className="mp-info-stat-row">
                          <span>Change in %</span>
                          <strong>
                            {monthlySpendChangePercent !== null
                              ? `${monthlySpendChangePercent > 0 ? "+" : ""}${Math.round(
                                  monthlySpendChangePercent
                                )}%`
                              : "N/A"}
                          </strong>
                        </div>
                      </div>
                    ) : (
                      <p className="rank-info-copy">No earlier month available for comparison.</p>
                    )}
                  </div>
                  <div className="rank-info-card">
                    <div className="rank-info-card-head">
                      <strong>Transparency notes</strong>
                    </div>
                    <p className="rank-info-copy">
                      This shows the MP&apos;s <strong>reported category spending total for one month</strong>.
                      It does not show spending from other months or whether the amount was reasonable by itself.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {isVarianceInfoOpen ? (
            <div className="benchmark-info-backdrop" onClick={() => setIsVarianceInfoOpen(false)}>
              <div
                className="benchmark-info-modal rank-info-modal"
                role="dialog"
                aria-modal="true"
                aria-label="Market overspend or underspend details"
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  type="button"
                  className="benchmark-info-close"
                  onClick={() => setIsVarianceInfoOpen(false)}
                  aria-label="Close market overspend or underspend details"
                >
                  ×
                </button>
                <h3>Market Overspend/Underspend</h3>
                <p className="benchmark-info-formula">Period: {latestPeriodLabel || "Selected month"}</p>
                <div className="mp-info-highlight-row">
                  <div className="mp-info-highlight-card">
                    <span>Average %</span>
                    <strong>
                      {marketVariance > 0 ? "+" : ""}
                      {Math.round(marketVariance)}%
                    </strong>
                  </div>
                  <div className="mp-info-highlight-card">
                    <span>Gap vs benchmark</span>
                    <strong>
                      {totalGapAmount > 0 ? "+" : totalGapAmount < 0 ? "-" : ""}
                      {formatCompactCurrency(Math.abs(totalGapAmount))}
                    </strong>
                  </div>
                </div>
                <div className="rank-info-grid">
                  <div className="rank-info-card">
                    <div className="rank-info-card-head">
                      <strong>What this means</strong>
                    </div>
                    <div className="rank-info-kv rank-info-kv-copy">
                      <span>Average difference</span>
                      <p className="rank-info-copy">
                        This is the <strong>average % difference</strong> between spending and the
                        market benchmark across the MP&apos;s categories.
                      </p>
                    </div>
                    <div className="rank-info-kv rank-info-kv-copy">
                      <span>Money gap</span>
                      <p className="rank-info-copy">
                        Overall gap vs benchmark:{" "}
                        <strong>
                          {totalGapAmount > 0 ? "+" : totalGapAmount < 0 ? "-" : ""}
                          {formatCompactCurrency(Math.abs(totalGapAmount))}
                        </strong>.
                      </p>
                    </div>
                    <div className="rank-info-kv rank-info-kv-copy">
                      <span>Compared with previous month</span>
                      <div className="mp-info-stat-list">
                        {previousPeriod ? (
                          <>
                            <div className="mp-info-stat-row">
                              <span>{previousPeriod.label}</span>
                              <strong>
                                {previousMarketVariance > 0 ? "+" : ""}
                                {Math.round(previousMarketVariance)}%
                              </strong>
                            </div>
                            <div className="mp-info-stat-row">
                              <span>Change in pts</span>
                              <strong>
                                {marketVarianceChange > 0 ? "+" : ""}
                                {Math.round(marketVarianceChange)} pts
                              </strong>
                            </div>
                            <div className="mp-info-stat-row">
                              <span>Previous gap</span>
                              <strong>
                                {previousTotalGapAmount > 0 ? "+" : previousTotalGapAmount < 0 ? "-" : ""}
                                {formatCompactCurrency(Math.abs(previousTotalGapAmount))}
                              </strong>
                            </div>
                            <div className="mp-info-stat-row">
                              <span>Gap change</span>
                              <strong>
                                {totalGapChangeAmount > 0 ? "+" : totalGapChangeAmount < 0 ? "-" : ""}
                                {formatCompactCurrency(Math.abs(totalGapChangeAmount))}
                              </strong>
                            </div>
                          </>
                        ) : (
                          <p className="rank-info-copy">No earlier month available for comparison.</p>
                        )}
                      </div>
                    </div>
                    <div className="rank-info-kv rank-info-kv-copy">
                      <span>Category split</span>
                      <p className="rank-info-copy">
                        <strong>{categoriesAboveBenchmark}</strong> above benchmark and{" "}
                        <strong>{categoriesBelowBenchmark}</strong> below benchmark.
                      </p>
                    </div>
                  </div>
                  <div className="rank-info-card">
                    <div className="rank-info-card-head">
                      <strong>Transparency notes</strong>
                    </div>
                    <p className="rank-info-copy">
                      A positive average means <strong>spending was above benchmark on average</strong>,
                      not necessarily in every category. The benchmark is a <strong>market reference point</strong>,
                      used to compare this MP&apos;s reported spending.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <section className="profile-chart-section">
            <div className="profile-chart-header">
              <div>
                <h2>Monthly Spend Over Time</h2>
                <p>
                  Track this MP&apos;s total monthly spending across {selectedTrendYear || "the selected year"}.
                  Tap a dot for exact monthly figures.
                </p>
              </div>
              <div className="profile-chart-actions">
                <div className={`profile-period-wrap ${isTrendYearMenuOpen ? "open" : ""}`}>
                  <button
                    type="button"
                    className="profile-period-pill profile-period-trigger profile-period-trigger-compact"
                    aria-haspopup="listbox"
                    aria-expanded={isTrendYearMenuOpen}
                    onClick={() => setIsTrendYearMenuOpen((current) => !current)}
                  >
                    <CalendarDays size={14} />
                    {selectedTrendYear || "Year"}
                    <ChevronDown size={12} />
                  </button>
                  {isTrendYearMenuOpen ? (
                    <div className="profile-period-menu" role="listbox">
                      {trendYearOptions.map((year) => (
                        <button
                          key={year}
                          type="button"
                          className={`profile-period-option ${String(year) === String(selectedTrendYear) ? "active" : ""}`}
                          role="option"
                          aria-selected={String(year) === String(selectedTrendYear)}
                          onClick={() => {
                            setSelectedTrendYear(String(year));
                            setIsTrendYearMenuOpen(false);
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
                  onClick={() => setIsTrendInfoOpen(true)}
                  aria-label="Open monthly spend over time details"
                >
                  <CircleHelp size={15} />
                </button>
              </div>
            </div>

            {monthlyTrendData.length ? (
              <>
                <div className="profile-line-chart-wrap">
                <svg viewBox="0 0 308 168" className="profile-line-chart" aria-label="Monthly spend over time">
                  {trendChartPoints.map((item) => (
                    <line
                      key={`trend-vertical-${item.periodId}`}
                      x1={item.x}
                      y1="26"
                      x2={item.x}
                      y2="128"
                      className="chart-grid-line vertical"
                    />
                  ))}
                  {[0, 1, 2, 3, 4].map((index) => (
                    <line
                      key={`trend-grid-${index}`}
                      x1="50"
                      y1={36 + index * 23}
                      x2="286"
                      y2={36 + index * 23}
                      className="chart-grid-line"
                    />
                  ))}

                  {trendYAxisLabels.map((item) => (
                    <text
                      key={`trend-y-${item.y}-${item.value}`}
                      x="44"
                      y={item.y + 3}
                      textAnchor="end"
                      className="chart-axis-label"
                    >
                      {item.value}
                    </text>
                  ))}

                  {trendChartPoints.map((item) => (
                    <text
                      key={`trend-label-${item.periodId}`}
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
                    stroke="#982727"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d={trendSpendPath}
                  />
                  <path
                    fill="none"
                    stroke="#8d8450"
                    strokeWidth="2.2"
                    strokeDasharray="4 4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d={trendBenchmarkPath}
                  />

                  {trendChartPoints.map((item) => (
                    <g key={`trend-points-${item.periodId}`}>
                      <circle
                        cx={item.x}
                        cy={item.actualY}
                        r="3.2"
                        className="profile-line-point spend"
                        onClick={() =>
                          setActiveTrendPoint((current) =>
                            current?.label === item.label && current?.kind === "spend"
                              ? null
                              : {
                                  kind: "spend",
                                  label: item.label,
                                  x: item.x,
                                  y: item.actualY,
                                  actualSpend: item.actualSpend,
                                  benchmarkSpend: item.benchmarkSpend,
                                }
                          )
                        }
                      />
                      <circle
                        cx={item.x}
                        cy={item.benchmarkY}
                        r="3"
                        className="profile-line-point benchmark"
                        onClick={() =>
                          setActiveTrendPoint((current) =>
                            current?.label === item.label && current?.kind === "benchmark"
                              ? null
                              : {
                                  kind: "benchmark",
                                  label: item.label,
                                  x: item.x,
                                  y: item.benchmarkY,
                                  actualSpend: item.actualSpend,
                                  benchmarkSpend: item.benchmarkSpend,
                                }
                          )
                        }
                      />
                    </g>
                  ))}

                  {activeTrendPoint ? (
                    <g
                      className="profile-line-tooltip"
                      transform={`translate(${Math.min(Math.max(activeTrendPoint.x - 48, 56), 192)}, ${Math.max(
                        activeTrendPoint.y - 52,
                        8
                      )})`}
                    >
                      <rect width="112" height="42" rx="9" />
                      <text x="8" y="11" className="profile-line-tooltip-label">
                        {activeTrendPoint.label}
                      </text>
                      <text x="8" y="21" className="profile-line-tooltip-value">
                        {formatCompactCurrency(activeTrendPoint.actualSpend)}
                      </text>
                      <text x="8" y="29" className="profile-line-tooltip-detail">
                        Benchmark {formatCompactCurrency(activeTrendPoint.benchmarkSpend)}
                      </text>
                      <text x="8" y="37" className="profile-line-tooltip-detail">
                        Gap {activeTrendPoint.actualSpend - activeTrendPoint.benchmarkSpend > 0 ? "+" : activeTrendPoint.actualSpend - activeTrendPoint.benchmarkSpend < 0 ? "-" : ""}
                        {formatCompactCurrency(Math.abs(activeTrendPoint.actualSpend - activeTrendPoint.benchmarkSpend))}
                      </text>
                    </g>
                  ) : null}
                </svg>
                </div>

                <div className="chart-legend profile-chart-legend">
                  <span><i className="legend red" />Monthly spend</span>
                  <span><i className="legend grey dashed" />Benchmark total</span>
                </div>
              </>
            ) : (
              <div className="card status-card">No monthly history available yet.</div>
            )}
          </section>

          {isTrendInfoOpen ? (
            <div className="benchmark-info-backdrop" onClick={() => setIsTrendInfoOpen(false)}>
              <div
                className="benchmark-info-modal rank-info-modal"
                role="dialog"
                aria-modal="true"
                aria-label="Monthly spend over time details"
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  type="button"
                  className="benchmark-info-close"
                  onClick={() => setIsTrendInfoOpen(false)}
                  aria-label="Close monthly spend over time details"
                >
                  ×
                </button>
                <h3>Monthly Spend Over Time in {selectedTrendYear || "the selected year"}</h3>
                <p className="benchmark-info-formula">
                  This chart compares this MP&apos;s total reported monthly spend with the monthly benchmark total in {selectedTrendYear || "the selected year"}.
                </p>
                <div className="mp-info-highlight-row">
                  <div className="mp-info-highlight-card">
                    <span>{selectedTrendYear || "Year"} total</span>
                    <strong>{formatCompactCurrency(yearlySpendTotal)}</strong>
                  </div>
                  <div className="mp-info-highlight-card">
                    <span>Benchmark total</span>
                    <strong>{formatCompactCurrency(yearlyBenchmarkTotal)}</strong>
                  </div>
                </div>
                <div className="rank-info-grid">
                  <div className="rank-info-card">
                    <div className="rank-info-card-head">
                      <strong>How to read this chart</strong>
                    </div>
                    <div className="rank-info-kv rank-info-kv-copy">
                      <span>Red line</span>
                      <p className="rank-info-copy">
                        The MP&apos;s <strong>total monthly spend</strong>.
                      </p>
                    </div>
                    <div className="rank-info-kv rank-info-kv-copy">
                      <span>Dashed line</span>
                      <p className="rank-info-copy">
                        The <strong>monthly benchmark total</strong> for comparison.
                      </p>
                    </div>
                    <div className="rank-info-kv rank-info-kv-copy">
                      <span>What it helps show</span>
                      <p className="rank-info-copy">
                        Whether spending stayed <strong>steady, rose, fell, or sat above benchmark</strong> across {selectedTrendYear || "the selected year"}.
                      </p>
                    </div>
                  </div>
                  <div className="rank-info-card">
                    <div className="rank-info-card-head">
                      <strong>Key figures</strong>
                    </div>
                    <div className="mp-info-stat-list">
                      <div className="mp-info-stat-row">
                        <span>Highest month</span>
                        <strong>
                          {highestTrendMonth ? `${highestTrendMonth.monthLabel} ${formatCompactCurrency(highestTrendMonth.actualSpend)}` : "N/A"}
                        </strong>
                      </div>
                      <div className="mp-info-stat-row">
                        <span>Lowest month</span>
                        <strong>
                          {lowestTrendMonth ? `${lowestTrendMonth.monthLabel} ${formatCompactCurrency(lowestTrendMonth.actualSpend)}` : "N/A"}
                        </strong>
                      </div>
                      <div className="mp-info-stat-row">
                        <span>Latest month gap</span>
                        <strong>
                          {monthlyTrendData.length
                            ? `${monthlyTrendData[monthlyTrendData.length - 1].actualSpend - monthlyTrendData[monthlyTrendData.length - 1].benchmarkSpend > 0 ? "+" : monthlyTrendData[monthlyTrendData.length - 1].actualSpend - monthlyTrendData[monthlyTrendData.length - 1].benchmarkSpend < 0 ? "-" : ""}${formatCompactCurrency(Math.abs(monthlyTrendData[monthlyTrendData.length - 1].actualSpend - monthlyTrendData[monthlyTrendData.length - 1].benchmarkSpend))}`
                            : "N/A"}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <section className="profile-chart-section">
              <div className="profile-chart-header">
                <div>
                  <h2>Category Spending vs Benchmark</h2>
                  <p>Top 5 biggest differences in {latestPeriodLabel}. Tap a bar for exact figures.</p>
                </div>
                <div className="profile-chart-actions">
                  <div className="profile-period-pill profile-period-badge">
                    <CalendarDays size={14} />
                    {latestPeriodLabel}
                  </div>
                  <button
                    type="button"
                    className="rank-chart-info-button"
                    aria-label="Open category spending chart details"
                    onClick={() => setIsCategoryChartInfoOpen(true)}
                  >
                    <CircleHelp size={14} />
                  </button>
                </div>
              </div>

                <div className="profile-bar-list">
                  {topCategories.map((item) => {
                    const varianceValue = Number(item.variance_percent || 0);
                    const safeWidth = Math.min(
                      50,
                      (Math.abs(varianceValue) / categoryScaleMax) * 50
                    );
                    const displayVariance = Math.round(varianceValue);
                    const varianceDirection =
                      varianceValue < 0 ? "negative" : varianceValue > 0 ? "positive" : "neutral";
                    const varianceAmount = Number(item.variance_amount || 0);
                    const actualSpendAmount = Number(item.actual_spend || 0);
                    const benchmarkAmount =
                      Number(item.actual_spend || 0) - Number(item.variance_amount || 0);
                    const isLabelOpen = activeCategoryLabelId === item.allowance_record_id;
                    const isBarOpen = activeCategoryBarId === item.allowance_record_id;
                    const { Icon, iconLabel } = getMpCategoryIcon(item.category_name);

                    return (
                      <div
                        className={`profile-bar-row ${isBarOpen ? "active" : ""}`}
                        key={item.allowance_record_id}
                      >
                        <button
                          type="button"
                          className="profile-bar-icon-button"
                          aria-label={`Show category name for ${iconLabel}`}
                          onClick={() =>
                            setActiveCategoryLabelId((current) =>
                              current === item.allowance_record_id ? null : item.allowance_record_id
                            )
                          }
                        >
                          <Icon size={18} />
                        </button>
                        <button
                          type="button"
                          className="profile-bar-track-button"
                          aria-label={`Show spending difference for ${item.category_name}`}
                          onClick={() =>
                            setActiveCategoryBarId((current) =>
                              current === item.allowance_record_id ? null : item.allowance_record_id
                            )
                          }
                        >
                          <div className="profile-bar-track">
                            {varianceValue !== 0 ? (
                              <div
                                className={`profile-bar-fill ${varianceDirection}`}
                                style={{ width: `${safeWidth}%` }}
                              />
                            ) : (
                              <div className="profile-bar-zero-dot" />
                            )}
                          </div>
                        </button>
                        {isLabelOpen ? (
                          <div className="profile-bar-name-pill">{item.category_name}</div>
                        ) : null}
                        {isBarOpen ? (
                          <div className="profile-bar-detail-card">
                            <div className="profile-bar-detail-head">
                              <strong>{item.category_name}</strong>
                              <span className={`profile-bar-detail-pill ${varianceDirection}`}>
                                {displayVariance > 0 ? "+" : ""}
                                {displayVariance}%
                              </span>
                            </div>
                            <div className="profile-bar-detail-metrics">
                              <div className="profile-bar-detail-metric spent">
                                <span>Spent</span>
                                <strong>{formatCompactCurrency(actualSpendAmount)}</strong>
                              </div>
                              <div className="profile-bar-detail-metric benchmark">
                                <span>Benchmark</span>
                                <strong>{formatCompactCurrency(benchmarkAmount)}</strong>
                              </div>
                              <div className="profile-bar-detail-metric profile-bar-detail-metric-wide gap">
                                <span>Gap</span>
                                <strong>
                                  {varianceAmount > 0 ? "+" : varianceAmount < 0 ? "-" : ""}
                                  {formatCompactCurrency(Math.abs(varianceAmount))}
                                </strong>
                              </div>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
            </div>

            <div className="profile-axis-row">
              {categoryAxisTicks.map((tick) => (
                <span key={tick}>{formatSignedAxisTick(tick)}</span>
              ))}
            </div>
          </section>

          {isCategoryChartInfoOpen ? (
            <div
              className="benchmark-info-backdrop"
              onClick={() => setIsCategoryChartInfoOpen(false)}
            >
              <div
                className="benchmark-info-modal rank-info-modal"
                role="dialog"
                aria-modal="true"
                aria-label="Category spending chart details"
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  type="button"
                  className="benchmark-info-close"
                  onClick={() => setIsCategoryChartInfoOpen(false)}
                  aria-label="Close category spending chart details"
                >
                  ×
                </button>
                <h3>About This Chart</h3>
                <p className="benchmark-info-formula">Period: {latestPeriodLabel}</p>
                <div className="rank-info-grid">
                  <div className="rank-info-card">
                    <div className="rank-info-card-head">
                      <strong>What you are looking at</strong>
                    </div>
                    <div className="rank-info-kv rank-info-kv-copy">
                      <span>Top 5 categories</span>
                      <p className="rank-info-copy">
                        These are the <strong>five largest differences</strong> between spending and benchmark in {latestPeriodLabel}.
                      </p>
                    </div>
                    <div className="rank-info-kv rank-info-kv-copy">
                      <span>Bar length</span>
                      <p className="rank-info-copy">
                        Bars extend <strong>right of 0 when spending is above benchmark</strong> and <strong>left of 0 when it is below benchmark</strong>.
                      </p>
                    </div>
                  </div>
                  <div className="rank-info-card">
                    <div className="rank-info-card-head">
                      <strong>Tap to inspect</strong>
                    </div>
                    <div className="rank-info-kv rank-info-kv-copy">
                      <span>Icon</span>
                      <p className="rank-info-copy">
                        Tap the icon to show the <strong>category name</strong>.
                      </p>
                    </div>
                    <div className="rank-info-kv rank-info-kv-copy">
                      <span>Bar</span>
                      <p className="rank-info-copy">
                        Tap a bar to see the <strong>% difference</strong> and the <strong>Rp gap</strong>. Positive values are above benchmark.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <section className="profile-feedback-card">
            <div className="profile-feedback-title">
              <CircleHelp size={18} />
              <span>Overall, how reasonable is {mp?.display_name || mp?.mp_name || "this MP"}&apos;s allowance usage?</span>
            </div>

            <div className="profile-feedback-actions">
              <button
                type="button"
                className={`feedback-choice negative ${hasSubmittedFeedback ? "submitted" : ""}`}
                onClick={() => submitFeedback("not_reasonable")}
                disabled={submittingFeedback || hasSubmittedFeedback}
              >
                <Scale size={16} />
                Not Reasonable
              </button>
              <button
                type="button"
                className={`feedback-choice warning ${hasSubmittedFeedback ? "submitted" : ""}`}
                onClick={() => submitFeedback("somewhat_reasonable")}
                disabled={submittingFeedback || hasSubmittedFeedback}
              >
                <Scale size={16} />
                Somewhat Reasonable
              </button>
              <button
                type="button"
                className={`feedback-choice positive ${hasSubmittedFeedback ? "submitted" : ""}`}
                onClick={() => submitFeedback("very_reasonable")}
                disabled={submittingFeedback || hasSubmittedFeedback}
              >
                <Scale size={16} />
                Reasonable
              </button>
            </div>

            <p className="feedback-anonymous-note feedback-anonymous-note-light">
              One anonymous vote per browser per period.
            </p>

            {(submittingFeedback || hasSubmittedFeedback) && (
              <>
                <div className="profile-feedback-status profile-feedback-status-light">
                  <span>{submittingFeedback ? "Saving feedback..." : feedbackMessage}</span>
                  {!submittingFeedback && hasSubmittedFeedback && <CheckCircle2 size={18} />}
                </div>

                {hasSubmittedFeedback && (
                  <button
                    type="button"
                    className="summary-button summary-button-light"
                    onClick={() =>
                      navigate(
                        `/feedback?period=${encodeURIComponent(
                          selectedPeriodId || ""
                        )}&focus=mp&mp_id=${encodeURIComponent(
                          id || ""
                        )}&mp_name=${encodeURIComponent(
                          mp?.display_name || mp?.full_name || ""
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
        </div>
      )}
    </div>
  );
}

export default MpDetail;
