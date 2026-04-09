import {
  CircleUserRound,
  HandCoins,
  ShoppingBasket,
  CalendarDays,
  CircleHelp,
  CheckCircle2,
  ChevronRight,
  Scale,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  fetchJson,
  formatCurrency,
  getBrowserSessionHash,
  postJson,
} from "../lib/api";

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

function MpDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mp, setMp] = useState(null);
  const [allowances, setAllowances] = useState([]);
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
                {mp.party_logo ? (
                  <img
                    src={mp.party_logo}
                    alt={`${mp.party_abbreviation} logo`}
                    className="party-logo-badge"
                  />
                ) : (
                  <span className="party-dot" />
                )}
                <span>{mp.party_name}</span>
                <span>&bull;</span>
                <span>2024 - 2029</span>
              </div>
            </div>
          </>
        )}
      </div>

      {!loading && !error && mp && (
        <div className="mp-profile-sheet">
          <section className="profile-metric-grid">
            <article className="profile-stat-card">
              <div className="profile-stat-label">
                <HandCoins size={16} />
                <span>Total Monthly Spend</span>
              </div>

              <div className="profile-stat-value-row">
                <div className="profile-stat-value">{formatCompactCurrency(monthlySpend)}</div>
                <div className="profile-chip gain">+10%</div>
              </div>

              <div className="profile-stat-update">Update: {formatDisplayDate(latestUpdate)}</div>
            </article>

            <article className="profile-stat-card">
              <div className="profile-stat-label">
                <ShoppingBasket size={16} />
                <span>Market Overspend/Underspend</span>
              </div>

              <div className="overspend-tag">
                {marketVariance >= 0 ? "OVERSPEND" : "UNDERSPEND"}
              </div>

              <div className="profile-stat-value-row">
                <div className="profile-stat-value accent">
                  {marketVariance > 0 ? "+" : ""}
                  {Math.round(marketVariance)}%
                </div>
                <div className="profile-chip muted">-7.2%</div>
              </div>

              <div className="profile-stat-update">Update: {formatDisplayDate(latestUpdate)}</div>
            </article>
          </section>

          <section className="profile-chart-section">
              <div className="profile-chart-header">
                <div>
                  <h2>Category Spending vs Benchmark</h2>
                  <p>Top 5 largest variance</p>
                </div>
                <div className="profile-period-pill profile-period-badge">
                  <CalendarDays size={14} />
                  {latestPeriodLabel}
                </div>
              </div>

                <div className="profile-bar-list">
                  {topCategories.map((item) => {
                    const varianceValue = Number(item.variance_percent || 0);
                    const safeWidth = Math.max(
                      8,
                      Math.min(98, (Math.abs(varianceValue) / 50) * 100)
                    );
                    const displayVariance = Math.round(varianceValue);
                    const varianceDirection =
                      varianceValue < 0 ? "negative" : varianceValue > 0 ? "positive" : "neutral";

                    return (
                      <div className="profile-bar-row" key={item.allowance_record_id}>
                        <div className="profile-bar-label">
                          <label>{item.category_name}</label>
                          <span>
                            {(Number(item.variance_amount || 0) >= 0 ? "+" : "-")}
                            {formatCompactCurrency(Math.abs(Number(item.variance_amount || 0)))}
                          </span>
                        </div>
                        <div className="profile-bar-track">
                          <div
                            className={`profile-bar-fill ${varianceDirection}`}
                            style={{ width: `${safeWidth}%` }}
                          />
                        </div>
                        <span className={`profile-bar-value ${varianceDirection}`}>
                          {displayVariance > 0 ? "+" : ""}
                          {displayVariance}%
                        </span>
                      </div>
                    );
                  })}
            </div>

            <div className="profile-axis-row">
              <span>0</span>
              <span>25</span>
              <span>50</span>
            </div>
          </section>

          <section className="profile-feedback-card">
            <div className="profile-feedback-title">
              <CircleHelp size={18} />
              <span>Overall, how reasonable do you consider this MP&apos;s allowance usage?</span>
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
                Very Reasonable
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


