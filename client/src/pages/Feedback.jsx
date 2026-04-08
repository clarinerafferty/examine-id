import {
  CalendarDays,
  ChevronDown,
  Info,
  Search,
  ListFilter,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { fetchJson } from "../lib/api";

const categoryAccentMap = {
  Housing: "housing",
  Travel: "travel",
  Communication: "communication",
  "Travel and Accommodation": "travel",
  "Digital Communications": "communication",
};

function labelForResponse(value) {
  switch (value) {
    case "not_reasonable":
    case "far_too_high":
      return "not reasonable";
    case "somewhat_reasonable":
    case "slightly_high":
      return "somewhat";
    case "very_reasonable":
    case "about_right":
      return "very";
    default:
      return "other";
  }
}

function normaliseCategoryName(name) {
  if (name === "Travel and Accommodation") {
    return "Travel";
  }

  if (name === "Digital Communications") {
    return "Communication";
  }

  return name;
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

function monthNumberFromLabel(label) {
  const monthMap = {
    Jan: 1,
    Feb: 2,
    Mar: 3,
    Apr: 4,
    May: 5,
    Jun: 6,
    Jul: 7,
    Aug: 8,
    Sep: 9,
    Oct: 10,
    Nov: 11,
    Dec: 12,
  };

  return monthMap[String(label || "").slice(0, 3)] || 0;
}

function Feedback() {
  const [searchParams] = useSearchParams();
  const [feedback, setFeedback] = useState([]);
  const [mps, setMps] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [isPeriodMenuOpen, setIsPeriodMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortMode, setSortMode] = useState("concern");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const periodMenuRef = useRef(null);
  const categorySectionRef = useRef(null);
  const rankSectionRef = useRef(null);
  const highlightedCategoryRef = useRef(null);

  const loadFeedbackPage = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [feedbackData, mpData] = await Promise.all([
        fetchJson("/api/feedback"),
        fetchJson("/api/mps"),
      ]);

      setFeedback(feedbackData);
      setMps(mpData);
    } catch {
      setError("Unable to load feedback right now.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeedbackPage();
  }, [loadFeedbackPage]);

  useEffect(() => {
    function refreshOnFocus() {
      if (document.visibilityState === "hidden") {
        return;
      }

      loadFeedbackPage();
    }

    window.addEventListener("focus", refreshOnFocus);
    document.addEventListener("visibilitychange", refreshOnFocus);

    return () => {
      window.removeEventListener("focus", refreshOnFocus);
      document.removeEventListener("visibilitychange", refreshOnFocus);
    };
  }, [loadFeedbackPage]);

  const periods = useMemo(() => {
    const unique = new Map();

    feedback.forEach((item) => {
      unique.set(item.period_id, {
        period_id: item.period_id,
        label: item.reporting_label,
        year: Number(item.reporting_label?.slice(-4)),
        month: monthNumberFromLabel(item.reporting_label),
      });
    });

    return Array.from(unique.values())
      .filter(isCurrentOrPastPeriod)
      .sort((a, b) => Number(a.period_id) - Number(b.period_id));
  }, [feedback]);

  useEffect(() => {
    const requestedSearch = searchParams.get("search");
    setSearchTerm(requestedSearch || "");
  }, [searchParams]);

  useEffect(() => {
    function handlePointerDown(event) {
      if (!periodMenuRef.current?.contains(event.target)) {
        setIsPeriodMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  useEffect(() => {
    if (!periods.length) {
      return;
    }

    const requestedPeriod = searchParams.get("period");
    const matchingRequestedPeriod = periods.find(
      (item) => String(item.period_id) === String(requestedPeriod)
    );
    const fallbackPeriod = String(periods[periods.length - 1].period_id);

    if (matchingRequestedPeriod) {
      const requestedValue = String(matchingRequestedPeriod.period_id);
      if (String(selectedPeriod) !== requestedValue) {
        setSelectedPeriod(requestedValue);
      }
      return;
    }

    if (!selectedPeriod || !periods.some((item) => String(item.period_id) === String(selectedPeriod))) {
      setSelectedPeriod(fallbackPeriod);
    }
  }, [periods, searchParams, selectedPeriod]);

  const selectedFeedback = useMemo(() => {
    if (!selectedPeriod) {
      return feedback;
    }

    return feedback.filter((item) => String(item.period_id) === String(selectedPeriod));
  }, [feedback, selectedPeriod]);

  const focusType = searchParams.get("focus");
  const highlightedCategoryId = searchParams.get("category_id");
  const highlightedCategoryName = searchParams.get("category_name");
  const highlightedMpName = searchParams.get("mp_name");

  const overallResponses = selectedFeedback;

  const allResponsesPercent = useMemo(() => {
    if (!overallResponses.length) {
      return 0;
    }

    const concernedResponses = overallResponses.filter((item) =>
      ["not_reasonable", "far_too_high", "somewhat_reasonable", "slightly_high"].includes(
        item.response_value
      )
    ).length;

    return Math.round((concernedResponses / overallResponses.length) * 100);
  }, [overallResponses]);

  const categorySentiment = useMemo(() => {
    const grouped = new Map();

    selectedFeedback
      .filter((item) => item.category_id)
      .forEach((item) => {
        const categoryName = normaliseCategoryName(item.category_name);
        const key = `${item.category_id}-${categoryName}`;
        const existing = grouped.get(key) || {
          category_id: item.category_id,
          category_name: categoryName,
          notReasonable: 0,
          somewhat: 0,
          very: 0,
          total: 0,
        };

        const bucket = labelForResponse(item.response_value);
        if (bucket === "not reasonable") {
          existing.notReasonable += 1;
        } else if (bucket === "somewhat") {
          existing.somewhat += 1;
        } else if (bucket === "very") {
          existing.very += 1;
        }

        existing.total += 1;
        grouped.set(key, existing);
      });

    return Array.from(grouped.values())
      .map((item) => ({
        ...item,
        concernPercent: item.total ? Math.round((item.notReasonable / item.total) * 100) : 0,
        somewhatPercent: item.total ? Math.round((item.somewhat / item.total) * 100) : 0,
        veryPercent: item.total ? Math.round((item.very / item.total) * 100) : 0,
      }))
      .filter((item) =>
        item.category_name.toLowerCase().includes(searchTerm.trim().toLowerCase())
      )
      .sort((a, b) => {
        if (sortMode === "az") {
          return a.category_name.localeCompare(b.category_name);
        }

        if (sortMode === "reasonable") {
          return b.veryPercent - a.veryPercent;
        }

        return b.concernPercent - a.concernPercent;
      });
  }, [searchTerm, selectedFeedback, sortMode]);

  const highlights = useMemo(() => {
    if (!categorySentiment.length) {
      return [];
    }

    const concernLeader = [...categorySentiment].sort(
      (a, b) => b.concernPercent - a.concernPercent
    )[0];
    const somewhatLeader = [...categorySentiment].sort(
      (a, b) => b.somewhatPercent - a.somewhatPercent
    )[0];
    const veryLeader = [...categorySentiment].sort((a, b) => b.veryPercent - a.veryPercent)[0];

    return [
      concernLeader && {
        tone: "red",
        text: `${concernLeader.category_name} is the most contested category (${concernLeader.concernPercent}% not reasonable).`,
      },
      somewhatLeader && {
        tone: "yellow",
        text: `${somewhatLeader.category_name} allowances are rated slightly better this period.`,
      },
      veryLeader && {
        tone: "olive",
        text: `${veryLeader.category_name} is seen as the most reasonable (${veryLeader.veryPercent}% very reasonable).`,
      },
    ].filter(Boolean);
  }, [categorySentiment]);

  const rankSentiment = useMemo(() => {
    const mpMap = new Map(mps.map((item) => [item.mp_id, item]));
    const grouped = new Map();

    selectedFeedback
      .filter((item) => item.mp_id)
      .forEach((item) => {
        const rank = mpMap.get(item.mp_id)?.mp_rank || "Unknown";
        const existing = grouped.get(rank) || {
          rank,
          total: 0,
          notReasonable: 0,
        };

        existing.total += 1;
        if (["not_reasonable", "far_too_high"].includes(item.response_value)) {
          existing.notReasonable += 1;
        }

        grouped.set(rank, existing);
      });

    return ["Head", "Vice", "Member"].map((rank) => {
      const item = grouped.get(rank) || { total: 0, notReasonable: 0 };
      return {
        rank,
        total: item.total,
        notReasonable: item.notReasonable,
        percent: item.total ? Math.round((item.notReasonable / item.total) * 100) : 0,
      };
    });
  }, [mps, selectedFeedback]);

  const strongestRank = [...rankSentiment].sort((a, b) => {
    if (b.percent !== a.percent) {
      return b.percent - a.percent;
    }

    if (b.notReasonable !== a.notReasonable) {
      return b.notReasonable - a.notReasonable;
    }

    return b.total - a.total;
  })[0];
  const selectedPeriodLabel =
    periods.find((item) => String(item.period_id) === String(selectedPeriod))?.label || "Latest";

  useEffect(() => {
    if (loading || error) {
      return;
    }

    const target =
      focusType === "category"
        ? highlightedCategoryRef.current || categorySectionRef.current
        : focusType === "mp"
        ? rankSectionRef.current
        : null;

    if (!target) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);

    return () => window.clearTimeout(timeoutId);
  }, [error, focusType, highlightedCategoryId, loading, selectedPeriod]);

  return (
    <div className="feedback-screen">
      <div className="feedback-sheet">
        {loading && <div className="card status-card">Loading feedback...</div>}
        {error && <div className="card status-card error-card">{error}</div>}

        {!loading && !error && (
          <>
            <section className="feedback-intro-card">
              <div className="feedback-about-tag">
                <Info size={14} />
                <span>ABOUT THIS PAGE</span>
              </div>
              <h2>How Citizens Feel About MP Allowances</h2>
              <p>
                These charts summarise anonymous responses from the category and MP
                profile pages. They are indicative of public sentiment, not official polling.
              </p>
            </section>

            <div className="feedback-filter-row">
              <div className="feedback-period-pill">
                <CalendarDays size={14} />
                <span>Period</span>
              </div>
              <div
                className={`feedback-period-select-wrap ${isPeriodMenuOpen ? "open" : ""}`}
                ref={periodMenuRef}
              >
                <button
                  type="button"
                  className="feedback-current-period"
                  aria-haspopup="listbox"
                  aria-expanded={isPeriodMenuOpen}
                  onClick={() => setIsPeriodMenuOpen((current) => !current)}
                >
                  {periods.find((item) => String(item.period_id) === String(selectedPeriod))?.label ||
                    "Latest"}
                  <ChevronDown size={14} />
                </button>
                {isPeriodMenuOpen ? (
                  <div className="feedback-period-menu" role="listbox">
                    {periods.map((period) => (
                      <button
                        key={period.period_id}
                        type="button"
                        className={`feedback-period-option ${
                          String(period.period_id) === String(selectedPeriod) ? "active" : ""
                        }`}
                        role="option"
                        aria-selected={String(period.period_id) === String(selectedPeriod)}
                        onClick={() => {
                          setSelectedPeriod(String(period.period_id));
                          setIsPeriodMenuOpen(false);
                        }}
                      >
                        {period.label}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            {focusType && selectedPeriodLabel ? (
              <div className="feedback-period-hint">
                Showing <strong>{selectedPeriodLabel}</strong> results for your recorded vote.
              </div>
            ) : null}

            {focusType === "category" && highlightedCategoryName ? (
              <div className="feedback-focus-banner category">
                Latest recorded vote included in <strong>{highlightedCategoryName}</strong> for{" "}
                <strong>{selectedPeriodLabel}</strong>.
              </div>
            ) : null}

            {focusType === "mp" && highlightedMpName ? (
              <div className="feedback-focus-banner mp">
                Latest recorded vote from <strong>{highlightedMpName}</strong> is now included in
                the summary for <strong>{selectedPeriodLabel}</strong>.
              </div>
            ) : null}

            <section className="feedback-section">
              <h2>Overall Sentiment</h2>
              <div className="feedback-stat-grid">
                <article className="feedback-stat-card dark">
                  <div className="feedback-stat-label">ALL RESPONSES</div>
                  <div className="feedback-stat-value">{allResponsesPercent}%</div>
                  <p>consider allowances not reasonable or too high</p>
                </article>
                <article className="feedback-stat-card olive">
                  <div className="feedback-stat-label">RESPONSES</div>
                  <div className="feedback-stat-value">
                    {selectedFeedback.length.toLocaleString()}
                  </div>
                  <p>total votes recorded</p>
                </article>
                <article className="feedback-stat-card red">
                  <div className="feedback-stat-label">LATEST</div>
                  <div className="feedback-stat-value">{selectedPeriodLabel}</div>
                  <p>current period</p>
                </article>
              </div>
            </section>

            <section className="feedback-section">
              <h2>Highlights This Period</h2>
              <div className="feedback-highlights">
                {highlights.map((item) => (
                  <div className="highlight-item" key={item.text}>
                    <span className={`highlight-dot ${item.tone}`} />
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="feedback-section" ref={categorySectionRef}>
              <h2>Per-category Sentiment</h2>
              <div className="feedback-search">
                <input
                  type="text"
                  placeholder="search category (eg. Housing, Travel)"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
                <button type="button" aria-label="Search feedback categories">
                  <Search size={14} />
                </button>
              </div>

              <div className="feedback-sort-row">
                <div className="control-label">
                  <ListFilter size={14} />
                  <span>Sort By</span>
                </div>
                <div className="chip-row">
                  <button
                    type="button"
                    className={`sort-chip ${sortMode === "concern" ? "active" : ""}`}
                    onClick={() => setSortMode("concern")}
                  >
                    Most Concern
                  </button>
                  <button
                    type="button"
                    className={`sort-chip ghost ${sortMode === "az" ? "active" : ""}`}
                    onClick={() => setSortMode("az")}
                  >
                    A - Z
                  </button>
                  <button
                    type="button"
                    className={`sort-chip ghost ${sortMode === "reasonable" ? "active" : ""}`}
                    onClick={() => setSortMode("reasonable")}
                  >
                    Very Reasonable
                  </button>
                </div>
              </div>

              <div className="feedback-category-scroll-shell">
                <div className="feedback-category-list">
                {categorySentiment.map((item) => {
                  const accent = categoryAccentMap[item.category_name] || "housing";
                  const isHighlighted =
                    focusType === "category" &&
                    String(item.category_id) === String(highlightedCategoryId);
                  return (
                    <Link className="card-link" to={`/categories/${item.category_id}`} key={item.category_id}>
                      <article
                        ref={isHighlighted ? highlightedCategoryRef : null}
                        className={`feedback-category-card ${accent} ${
                          isHighlighted ? "highlighted" : ""
                        }`}
                      >
                        <div className="feedback-category-title">{item.category_name}</div>

                        <div className="feedback-stacked-bar">
                          <div
                            className="segment concern"
                            style={{ width: `${item.concernPercent}%` }}
                          >
                            {item.concernPercent}%
                          </div>
                          <div
                            className="segment somewhat"
                            style={{ width: `${item.somewhatPercent}%` }}
                          >
                            {item.somewhatPercent}%
                          </div>
                          <div className="segment very" style={{ width: `${item.veryPercent}%` }}>
                            {item.veryPercent}%
                          </div>
                        </div>

                        <div className="feedback-legend-row">
                          <span><i className="legend-dot concern" />not reasonable</span>
                          <span><i className="legend-dot somewhat" />somewhat</span>
                          <span><i className="legend-dot very" />very</span>
                        </div>

                        <div className="feedback-see-detail">see category detail</div>
                      </article>
                    </Link>
                  );
                })}
                </div>
              </div>
            </section>

            <section
              className={`feedback-section ${focusType === "mp" ? "feedback-section-highlighted" : ""}`}
              ref={rankSectionRef}
            >
              <h2>Public Ratings by MP Rank</h2>
              <p className="feedback-subtext">
                Share of recorded MP-profile votes marked &quot;Not reasonable&quot;
              </p>

              <div className="feedback-rank-chart">
                {rankSentiment.map((item) => (
                  <div className="feedback-rank-column" key={item.rank}>
                    <div className="feedback-rank-value">
                      <strong>{item.percent}%</strong>
                      <span>
                        ({item.notReasonable}/{item.total || 0})
                      </span>
                    </div>
                    <div
                      className={`feedback-rank-bar rank-${item.rank.toLowerCase()}`}
                      style={{ height: `${Math.max(24, item.percent)}px` }}
                    />
                    <div className="feedback-rank-label">{item.rank} MPs</div>
                  </div>
                ))}
              </div>

              <div className="feedback-rank-summary">
                {strongestRank?.rank || "Head"} MPs most often rated &quot;Not reasonable&quot; (
                {strongestRank?.percent || 0}% from {strongestRank?.notReasonable || 0}/
                {strongestRank?.total || 0} votes)
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

export default Feedback;
