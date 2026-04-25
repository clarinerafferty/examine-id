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
const LOW_DATA_THRESHOLD = 5;
const CATEGORY_RESPONSE_OPTIONS = [
  { key: "farTooHigh", value: "far_too_high", label: "Far too high", tone: "far-high" },
  { key: "slightlyHigh", value: "slightly_high", label: "Slightly high", tone: "slightly-high" },
  { key: "aboutRight", value: "about_right", label: "About right", tone: "about-right" },
  { key: "tooLow", value: "too_low", label: "Too low", tone: "too-low" },
];
const MP_RESPONSE_VALUES = ["not_reasonable", "somewhat_reasonable", "very_reasonable"];

function labelForResponse(value) {
  switch (value) {
    case "not_reasonable":
    case "far_too_high":
    case "too_low":
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

function categoryVoteRankFromType(feedbackType) {
  switch (String(feedbackType || "").toLowerCase()) {
    case "sentiment_head":
      return "Head";
    case "sentiment_vice":
      return "Vice";
    case "sentiment_member":
      return "Member";
    case "sentiment":
      return "Legacy";
    default:
      return null;
  }
}

function formatVoteCountLabel(total, label) {
  return `${total} ${label}${total === 1 ? "" : "s"}`;
}

function Feedback() {
  const [searchParams] = useSearchParams();
  const [feedback, setFeedback] = useState([]);
  const [mps, setMps] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [isPeriodMenuOpen, setIsPeriodMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortMode, setSortMode] = useState("votes");
  const [selectedCategoryVoteRank, setSelectedCategoryVoteRank] = useState("all");
  const [expandedCategoryIds, setExpandedCategoryIds] = useState([]);
  const [expandedMpIds, setExpandedMpIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const periodMenuRef = useRef(null);

  function toggleCategoryBreakdown(categoryId) {
    setExpandedCategoryIds((current) => {
      if (current.includes(categoryId)) {
        return current.filter((id) => id !== categoryId);
      }

      return [...current, categoryId];
    });
  }

  function toggleMpBreakdown(mpId) {
    setExpandedMpIds((current) => {
      if (current.includes(mpId)) {
        return current.filter((id) => id !== mpId);
      }

      return [...current, mpId];
    });
  }

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
      ["not_reasonable", "far_too_high", "too_low", "somewhat_reasonable", "slightly_high"].includes(
        item.response_value
      )
    ).length;

    return Math.round((concernedResponses / overallResponses.length) * 100);
  }, [overallResponses]);

  const categorySentiment = useMemo(() => {
    const grouped = new Map();

    selectedFeedback
      .filter((item) => item.category_id)
      .filter((item) => {
        if (selectedCategoryVoteRank === "all") {
          return ["sentiment", "sentiment_head", "sentiment_vice", "sentiment_member"].includes(
            String(item.feedback_type || "").toLowerCase()
          );
        }

        return categoryVoteRankFromType(item.feedback_type) === selectedCategoryVoteRank;
      })
      .forEach((item) => {
        const categoryName = normaliseCategoryName(item.category_name);
        const key = `${item.category_id}-${categoryName}`;
        const existing = grouped.get(key) || {
          category_id: item.category_id,
          category_name: categoryName,
          farTooHigh: 0,
          slightlyHigh: 0,
          aboutRight: 0,
          tooLow: 0,
          notReasonable: 0,
          somewhat: 0,
          very: 0,
          total: 0,
        };

        switch (String(item.response_value || "").toLowerCase()) {
          case "far_too_high":
            existing.farTooHigh += 1;
            break;
          case "slightly_high":
            existing.slightlyHigh += 1;
            break;
          case "about_right":
            existing.aboutRight += 1;
            break;
          case "too_low":
            existing.tooLow += 1;
            break;
          default:
            break;
        }

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
      .map((item) => {
        const responseBreakdown = CATEGORY_RESPONSE_OPTIONS.map((option) => ({
          ...option,
          count: item[option.key],
          percent: item.total ? Math.round((item[option.key] / item.total) * 100) : 0,
        }));
        const topResponse = [...responseBreakdown].sort((a, b) => {
          if (b.count !== a.count) {
            return b.count - a.count;
          }

          return CATEGORY_RESPONSE_OPTIONS.findIndex((option) => option.key === a.key) -
            CATEGORY_RESPONSE_OPTIONS.findIndex((option) => option.key === b.key);
        })[0];

        return {
          ...item,
          concernPercent: item.total ? Math.round((item.notReasonable / item.total) * 100) : 0,
          somewhatPercent: item.total ? Math.round((item.somewhat / item.total) * 100) : 0,
          veryPercent: item.total ? Math.round((item.very / item.total) * 100) : 0,
          farTooHighPercent: item.total ? Math.round((item.farTooHigh / item.total) * 100) : 0,
          slightlyHighPercent: item.total ? Math.round((item.slightlyHigh / item.total) * 100) : 0,
          aboutRightPercent: item.total ? Math.round((item.aboutRight / item.total) * 100) : 0,
          tooLowPercent: item.total ? Math.round((item.tooLow / item.total) * 100) : 0,
          responseBreakdown,
          topResponseLabel: topResponse?.label || "No response",
          topResponsePercent: topResponse?.percent || 0,
          hasLimitedData: item.total < LOW_DATA_THRESHOLD,
        };
      })
      .filter((item) =>
        item.category_name.toLowerCase().includes(searchTerm.trim().toLowerCase())
      )
      .sort((a, b) => {
        if (sortMode === "az") {
          return a.category_name.localeCompare(b.category_name);
        }

        if (sortMode === "votes") {
          if (b.total !== a.total) {
            return b.total - a.total;
          }

          const aConcernPercent =
            a.farTooHighPercent + a.slightlyHighPercent + a.tooLowPercent;
          const bConcernPercent =
            b.farTooHighPercent + b.slightlyHighPercent + b.tooLowPercent;

          if (bConcernPercent !== aConcernPercent) {
            return bConcernPercent - aConcernPercent;
          }

          return a.category_name.localeCompare(b.category_name);
        }

        const aConcernPercent =
          a.farTooHighPercent + a.slightlyHighPercent + a.tooLowPercent;
        const bConcernPercent =
          b.farTooHighPercent + b.slightlyHighPercent + b.tooLowPercent;

        if (bConcernPercent !== aConcernPercent) {
          return bConcernPercent - aConcernPercent;
        }

        const aStrongConcernPercent = a.farTooHighPercent + a.tooLowPercent;
        const bStrongConcernPercent = b.farTooHighPercent + b.tooLowPercent;

        if (bStrongConcernPercent !== aStrongConcernPercent) {
          return bStrongConcernPercent - aStrongConcernPercent;
        }

        if (b.total !== a.total) {
          return b.total - a.total;
        }

        return a.category_name.localeCompare(b.category_name);
      });
  }, [searchTerm, selectedCategoryVoteRank, selectedFeedback, sortMode]);

  const selectedPeriodLabel =
    periods.find((item) => String(item.period_id) === String(selectedPeriod))?.label || "Latest";

  const highlights = useMemo(() => {
    if (!categorySentiment.length) {
      return [];
    }

    const categoriesWithEnoughData = categorySentiment.filter(
      (item) => item.total >= LOW_DATA_THRESHOLD
    );

    if (!categoriesWithEnoughData.length) {
      return [
        {
          tone: "yellow",
          text: `Limited response volume: category results for ${selectedPeriodLabel} are based on a smaller set of responses so far.`,
        },
      ];
    }

    const concernLeader = [...categoriesWithEnoughData].sort(
      (a, b) => b.concernPercent - a.concernPercent
    )[0];
    const somewhatLeader = [...categoriesWithEnoughData].sort(
      (a, b) => b.somewhatPercent - a.somewhatPercent
    )[0];
    const veryLeader = [...categoriesWithEnoughData].sort((a, b) => b.veryPercent - a.veryPercent)[0];

    return [
      concernLeader && {
        tone: "red",
        text: `${concernLeader.category_name} currently shows the strongest concern (${concernLeader.concernPercent}% not reasonable, ${concernLeader.total} votes).`,
      },
      somewhatLeader && {
        tone: "yellow",
        text: `${somewhatLeader.category_name} is drawing a more mixed response this period (${somewhatLeader.total} votes).`,
      },
      veryLeader && {
        tone: "olive",
        text: `${veryLeader.category_name} is seen as the most reasonable so far (${veryLeader.veryPercent}% reasonable, ${veryLeader.total} votes).`,
      },
    ].filter(Boolean);
  }, [categorySentiment, selectedPeriodLabel]);

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
  const selectedCategoryVoteRankLabel =
    selectedCategoryVoteRank === "all"
      ? "all ranks"
      : `${selectedCategoryVoteRank.toLowerCase()} rank`;
  const rankSentimentHasLimitedData = rankSentiment.every((item) => item.total < LOW_DATA_THRESHOLD);
  const mpReasonableness = useMemo(() => {
    const mpMap = new Map(mps.map((item) => [String(item.mp_id), item]));
    const grouped = new Map();

    selectedFeedback
      .filter(
        (item) =>
          item.mp_id && MP_RESPONSE_VALUES.includes(String(item.response_value || "").toLowerCase())
      )
      .forEach((item) => {
        const mpRecord = mpMap.get(String(item.mp_id));
        const key = String(item.mp_id);
        const existing = grouped.get(key) || {
          mp_id: item.mp_id,
          mp_name:
            mpRecord?.display_name ||
            mpRecord?.full_name ||
            item.mp_name ||
            `MP ${item.mp_id}`,
          mp_rank: mpRecord?.mp_rank || "Unknown",
          total: 0,
          notReasonable: 0,
          somewhat: 0,
          reasonable: 0,
        };

        existing.total += 1;

        if (String(item.response_value) === "not_reasonable") {
          existing.notReasonable += 1;
        } else if (String(item.response_value) === "somewhat_reasonable") {
          existing.somewhat += 1;
        } else if (String(item.response_value) === "very_reasonable") {
          existing.reasonable += 1;
        }

        grouped.set(key, existing);
      });

    return Array.from(grouped.values())
      .map((item) => ({
        ...item,
        reasonablePercent: item.total ? Math.round((item.reasonable / item.total) * 100) : 0,
        somewhatPercent: item.total ? Math.round((item.somewhat / item.total) * 100) : 0,
        concernPercent: item.total ? Math.round((item.notReasonable / item.total) * 100) : 0,
        hasLimitedData: item.total < LOW_DATA_THRESHOLD,
      }))
      .sort((a, b) => {
        if (b.reasonablePercent !== a.reasonablePercent) {
          return b.reasonablePercent - a.reasonablePercent;
        }

        if (a.concernPercent !== b.concernPercent) {
          return a.concernPercent - b.concernPercent;
        }

        if (b.reasonable !== a.reasonable) {
          return b.reasonable - a.reasonable;
        }

        if (b.total !== a.total) {
          return b.total - a.total;
        }

        return a.mp_name.localeCompare(b.mp_name);
      });
  }, [mps, selectedFeedback]);
  const mostReasonableMp = mpReasonableness[0] || null;

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
              <h2>Public Sentiment on MP Allowances</h2>
              <p>
                These charts summarise anonymous responses submitted from the category and MP
                profile pages. They reflect in-app sentiment signals, not official polling.
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
                Showing <strong>{selectedPeriodLabel}</strong> results including your latest response.
              </div>
            ) : null}

            {focusType === "category" && highlightedCategoryName ? (
              <div className="feedback-focus-banner category">
                Your latest response is included in <strong>{highlightedCategoryName}</strong> for{" "}
                <strong>{selectedPeriodLabel}</strong>.
              </div>
            ) : null}

            {focusType === "mp" && highlightedMpName ? (
              <div className="feedback-focus-banner mp">
                Your latest response for <strong>{highlightedMpName}</strong> is now included in
                the summary for <strong>{selectedPeriodLabel}</strong>.
              </div>
            ) : null}

            <section className="feedback-section">
              <h2>Overall Sentiment</h2>
              <div className="feedback-stat-grid">
                <article className="feedback-stat-card dark">
                  <div className="feedback-stat-label">ALL RESPONSES</div>
                  <div className="feedback-stat-value">{allResponsesPercent}%</div>
                  <p>consider allowances not reasonable, too high, or too low</p>
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

            <section className="feedback-section">
              <h2>Per-category Sentiment</h2>
              <p className="feedback-subtext">
                Filters category votes by the MP rank view they were submitted from and shows
                whether each allowance felt far too high, slightly high, about right, or too low.
              </p>
              <div className="feedback-search">
                <input
                  type="text"
                  placeholder="Search categories, e.g. Housing or Travel"
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
                  <span>Votes from</span>
                </div>
                <div className="chip-row">
                  <button
                    type="button"
                    className={`sort-chip ${selectedCategoryVoteRank === "all" ? "active" : "ghost"}`}
                    onClick={() => setSelectedCategoryVoteRank("all")}
                  >
                    All ranks
                  </button>
                  <button
                    type="button"
                    className={`sort-chip ${selectedCategoryVoteRank === "Head" ? "active" : "ghost"}`}
                    onClick={() => setSelectedCategoryVoteRank("Head")}
                  >
                    Head
                  </button>
                  <button
                    type="button"
                    className={`sort-chip ${selectedCategoryVoteRank === "Vice" ? "active" : "ghost"}`}
                    onClick={() => setSelectedCategoryVoteRank("Vice")}
                  >
                    Vice
                  </button>
                  <button
                    type="button"
                    className={`sort-chip ${selectedCategoryVoteRank === "Member" ? "active" : "ghost"}`}
                    onClick={() => setSelectedCategoryVoteRank("Member")}
                  >
                    Member
                  </button>
                </div>
              </div>

              <div className="feedback-sort-row">
                <div className="control-label">
                  <ListFilter size={14} />
                  <span>Sort By</span>
                </div>
                <div className="chip-row">
                  <button
                    type="button"
                    className={`sort-chip ${sortMode === "votes" ? "active" : ""}`}
                    onClick={() => setSortMode("votes")}
                  >
                    Most Votes
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
                    className={`sort-chip ghost ${sortMode === "concerned" ? "active" : ""}`}
                    onClick={() => setSortMode("concerned")}
                  >
                    Most Concerned
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
                  const isExpanded = expandedCategoryIds.includes(item.category_id);
                  return (
                    <Link className="card-link" to={`/categories/${item.category_id}`} key={item.category_id}>
                      <article
                        className={`feedback-category-card ${accent} ${
                          isHighlighted ? "highlighted" : ""
                        }`}
                      >
                        <div className="feedback-category-title">{item.category_name}</div>
                        <div className="feedback-category-headline">
                          <strong>{item.topResponsePercent}%</strong>
                          <span>{item.topResponseLabel}</span>
                          <small>
                            {selectedCategoryVoteRank === "all"
                              ? formatVoteCountLabel(item.total, "vote")
                              : formatVoteCountLabel(item.total, `${selectedCategoryVoteRank} rank vote`)}
                          </small>
                        </div>
                        {item.hasLimitedData ? (
                          <div className="feedback-low-data-flag">Limited responses</div>
                        ) : null}

                        <button
                          type="button"
                          className="feedback-breakdown-toggle"
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            toggleCategoryBreakdown(item.category_id);
                          }}
                          aria-expanded={isExpanded}
                        >
                          {isExpanded ? "Hide breakdown" : "View full breakdown"}
                        </button>

                        {isExpanded ? (
                          <>
                            <div className="feedback-stacked-bar">
                              {item.responseBreakdown.map((response) => (
                                <div
                                  key={response.key}
                                  className={`segment ${response.tone}`}
                                  style={{ width: `${response.percent}%` }}
                                >
                                  {response.percent >= 15 ? `${response.percent}%` : ""}
                                </div>
                              ))}
                            </div>

                            <div className="feedback-response-grid">
                              {item.responseBreakdown.map((response) => (
                                <div className="feedback-response-chip" key={response.key}>
                                  <div className="feedback-response-chip-top">
                                    <span>
                                      <i className={`legend-dot ${response.tone}`} />
                                      {response.label}
                                    </span>
                                    <strong>{response.percent}%</strong>
                                  </div>
                                  <small>{formatVoteCountLabel(response.count, "vote")}</small>
                                </div>
                              ))}
                            </div>
                          </>
                        ) : null}

                        <div className="feedback-see-detail">see category detail</div>
                      </article>
                    </Link>
                  );
                })}
                {!categorySentiment.length ? (
                  <div className="feedback-subtext">
                    No category votes from {selectedCategoryVoteRankLabel} in {selectedPeriodLabel}.
                  </div>
                ) : null}
                </div>
              </div>
            </section>

            <section
              className={`feedback-section ${focusType === "mp" ? "feedback-section-highlighted" : ""}`}
            >
              <h2>Public Ratings by MP Rank</h2>
              <p className="feedback-subtext">
                Share of recorded MP-profile votes marked &quot;Not reasonable&quot;
              </p>
              {rankSentimentHasLimitedData ? (
                <div className="feedback-low-data-note">
                  Limited response volume: MP-rank sentiment for {selectedPeriodLabel} is still based on a small number of votes.
                </div>
              ) : null}

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
                {strongestRank?.rank || "Head"} MPs currently have the highest share of &quot;Not reasonable&quot; votes (
                {strongestRank?.percent || 0}% from {strongestRank?.notReasonable || 0}/
                {strongestRank?.total || 0} votes)
              </div>
            </section>

            <section className="feedback-section">
              <h2>Most Reasonable MPs</h2>
              <p className="feedback-subtext">
                Based on MP-profile votes marked &quot;Reasonable&quot; in {selectedPeriodLabel}.
              </p>

              {!mpReasonableness.length ? (
                <div className="feedback-low-data-note">
                  No MP-profile reasonableness votes have been recorded for {selectedPeriodLabel} yet.
                </div>
              ) : (
                <>
                  <article className="feedback-mp-highlight-card">
                    <div className="feedback-mp-highlight-label">Most reasonable this period</div>
                    <div className="feedback-mp-highlight-name">{mostReasonableMp?.mp_name}</div>
                    <div className="feedback-mp-highlight-meta">
                      <span>{mostReasonableMp?.mp_rank} MP</span>
                      <span>{mostReasonableMp?.reasonablePercent || 0}% reasonable</span>
                      <span>{formatVoteCountLabel(mostReasonableMp?.total || 0, "vote")}</span>
                    </div>
                    {mostReasonableMp?.hasLimitedData ? (
                      <div className="feedback-low-data-flag">Limited responses</div>
                    ) : null}
                  </article>

                  <div className="feedback-mp-list">
                    {mpReasonableness.slice(0, 5).map((item, index) => {
                      const isExpanded = expandedMpIds.includes(item.mp_id);

                      return (
                        <article
                          className={`feedback-mp-card ${isExpanded ? "expanded" : ""}`}
                          key={item.mp_id}
                        >
                          <div className="feedback-mp-card-top">
                            <div className="feedback-mp-rank-badge">#{index + 1}</div>
                            <div className="feedback-mp-copy">
                              <div className="feedback-mp-name">{item.mp_name}</div>
                              <div className="feedback-mp-meta">
                                {item.mp_rank} MP • {item.reasonablePercent}% reasonable
                              </div>
                            </div>
                            <div className="feedback-mp-actions">
                              <div className="feedback-mp-trend">{item.concernPercent}% concern</div>
                              <button
                                type="button"
                                className="feedback-breakdown-toggle feedback-mp-toggle"
                                onClick={() => toggleMpBreakdown(item.mp_id)}
                                aria-expanded={isExpanded}
                              >
                                {isExpanded ? "Hide details" : "Show details"}
                              </button>
                            </div>
                          </div>

                          {isExpanded ? (
                            <div className="feedback-mp-details">
                              <div className="feedback-mp-detail-grid">
                                <div className="feedback-mp-detail-item">
                                  <span>Reasonable</span>
                                  <strong>{item.reasonable}</strong>
                                  <small>{item.reasonablePercent}% of all votes</small>
                                </div>
                                <div className="feedback-mp-detail-item">
                                  <span>Somewhat reasonable</span>
                                  <strong>{item.somewhat}</strong>
                                  <small>{item.somewhatPercent}% of all votes</small>
                                </div>
                                <div className="feedback-mp-detail-item">
                                  <span>Not reasonable</span>
                                  <strong>{item.notReasonable}</strong>
                                  <small>{item.concernPercent}% concern</small>
                                </div>
                                <div className="feedback-mp-detail-item">
                                  <span>Total votes</span>
                                  <strong>{item.total}</strong>
                                  <small>{formatVoteCountLabel(item.total, "vote")}</small>
                                </div>
                              </div>

                              <Link
                                className="feedback-mp-link"
                                to={`/mps/${item.mp_id}${
                                  selectedPeriod
                                    ? `?period=${encodeURIComponent(selectedPeriod)}`
                                    : ""
                                }`}
                              >
                                see MP detail
                              </Link>
                            </div>
                          ) : null}
                        </article>
                      );
                    })}
                  </div>
                </>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}

export default Feedback;

