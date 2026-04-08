import {
  Search,
  Home,
  Plane,
  Megaphone,
  Smartphone,
  Users,
  Building2,
  CalendarDays,
  ArrowDownAZ,
  ListFilter,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  ShieldUser,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { fetchJson, formatCurrency } from "../lib/api";

const iconMap = {
  house: Home,
  plane: Plane,
  megaphone: Megaphone,
  smartphone: Smartphone,
  users: Users,
  "building-2": Building2,
};

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

function formatCompactCurrency(value) {
  const numericValue = Number(value || 0);

  if (numericValue >= 1000000) {
    const compactValue = numericValue / 1000000;
    const displayValue = Number.isInteger(compactValue)
      ? compactValue.toFixed(0)
      : compactValue.toFixed(1);

    return `Rp. ${displayValue}m`;
  }

  return formatCurrency(numericValue);
}

function formatVariance(value) {
  const numericValue = Number(value || 0);
  const sign = numericValue > 0 ? "+" : numericValue < 0 ? "-" : "";
  return `${sign} ${Math.abs(numericValue).toFixed(0)}%`;
}

function formatDate(value) {
  if (!value) {
    return "No recent update";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function getVarianceLabel(value) {
  const numericValue = Number(value || 0);
  if (numericValue > 5) {
    return "above Benchmark";
  }

  if (numericValue < -5) {
    return "below Benchmark";
  }

  return "around Benchmark";
}

function getCardTone(value) {
  const numericValue = Number(value || 0);

  if (numericValue > 5) {
    return "high";
  }

  if (numericValue < -5) {
    return "low";
  }

  return "mid";
}

function buildCategoryView(records) {
  const grouped = new Map();

  records.forEach((record) => {
    const existing = grouped.get(record.category_id) || {
      id: `category-${record.category_id}`,
      title: record.category_name,
      searchText: record.category_name,
      iconName: record.icon_name,
      benchmarkValue: Number(record.benchmark_value || 0),
      varianceTotal: 0,
      latestUpdated: record.last_updated,
      entries: 0,
    };

    if (!existing.benchmarkValue && Number(record.benchmark_value || 0)) {
      existing.benchmarkValue = Number(record.benchmark_value || 0);
    }
    existing.varianceTotal += Number(record.variance_percent || 0);
    existing.entries += 1;

    if (
      !existing.latestUpdated ||
      new Date(record.last_updated) > new Date(existing.latestUpdated)
    ) {
      existing.latestUpdated = record.last_updated;
    }

    grouped.set(record.category_id, existing);
  });

  return Array.from(grouped.values()).map((item) => ({
    ...item,
    varianceAverage: item.entries ? item.varianceTotal / item.entries : 0,
  }));
}

function buildMemberView(records) {
  const grouped = new Map();

  records.forEach((record) => {
    const existing = grouped.get(record.mp_id) || {
      id: `member-${record.mp_id}`,
      mp_id: record.mp_id,
      name: record.display_name || record.mp_name,
      party: record.party_abbreviation || "",
      partyName: record.party_name || "",
      partyLogo: record.party_logo || "",
      profileImage: record.profile_image || "",
      rank: record.mp_rank,
      searchText: `${record.display_name || ""} ${record.mp_name || ""} ${
        record.party_name || ""
      } ${record.party_abbreviation || ""}`.trim(),
      monthlySpend: 0,
      varianceTotal: 0,
      entries: 0,
    };

    existing.monthlySpend += Number(record.actual_spend || 0);
    existing.varianceTotal += Number(record.variance_percent || 0);
    existing.entries += 1;

    grouped.set(record.mp_id, existing);
  });

  return Array.from(grouped.values()).map((item) => ({
    ...item,
    varianceAverage: item.entries ? item.varianceTotal / item.entries : 0,
  }));
}

function Allowances() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState("category");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortMode, setSortMode] = useState("variance");
  const [selectedParty, setSelectedParty] = useState("all");
  const [selectedRankFilter, setSelectedRankFilter] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [isPeriodMenuOpen, setIsPeriodMenuOpen] = useState(false);
  const [isPartyMenuOpen, setIsPartyMenuOpen] = useState(false);
  const [isRankMenuOpen, setIsRankMenuOpen] = useState(false);
  const [varianceThreshold, setVarianceThreshold] = useState(0);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const periodMenuRef = useRef(null);
  const partyMenuRef = useRef(null);
  const rankMenuRef = useRef(null);

  useEffect(() => {
    const requestedView = searchParams.get("view");
    const requestedSearch = searchParams.get("search");
    const requestedSort = searchParams.get("sort");
    const requestedParty = searchParams.get("party");
    const requestedRank = searchParams.get("rank");
    const requestedPeriod = searchParams.get("period");
    const requestedThreshold = searchParams.get("threshold");

    if (requestedView === "category" || requestedView === "member") {
      setViewMode(requestedView);
    }

    if (requestedSearch !== null) {
      setSearchTerm(requestedSearch);
    }

    if (requestedSort === "variance" || requestedSort === "alphabetical") {
      setSortMode(requestedSort);
    }

    if (requestedParty !== null) {
      setSelectedParty(requestedParty || "all");
    }

    if (requestedRank !== null) {
      setSelectedRankFilter(requestedRank || "all");
    }

    if (requestedPeriod !== null) {
      setSelectedPeriod(requestedPeriod || "");
    }

    if (requestedThreshold !== null) {
      const parsedThreshold = Number(requestedThreshold);
      setVarianceThreshold(Number.isFinite(parsedThreshold) ? parsedThreshold : 0);
    } else {
      setVarianceThreshold(0);
    }
  }, [searchParams]);

  useEffect(() => {
    function handlePointerDown(event) {
      if (!periodMenuRef.current?.contains(event.target)) {
        setIsPeriodMenuOpen(false);
      }

      if (!partyMenuRef.current?.contains(event.target)) {
        setIsPartyMenuOpen(false);
      }

      if (!rankMenuRef.current?.contains(event.target)) {
        setIsRankMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadAllowances() {
      try {
        const [allowances, benchmarks, mps] = await Promise.all([
          fetchJson("/api/allowances"),
          fetchJson("/api/benchmarks"),
          fetchJson("/api/mps"),
        ]);

        const benchmarkMap = new Map(
          benchmarks.map((benchmark) => [
            `${benchmark.category_id}-${benchmark.period_id}`,
            benchmark,
          ])
        );

        const mpMap = new Map(mps.map((mp) => [mp.mp_id, mp]));

        const data = allowances.map((record) => ({
          ...record,
          party_name: mpMap.get(record.mp_id)?.party_name || "",
          party_abbreviation: mpMap.get(record.mp_id)?.party_abbreviation || "",
          party_logo: mpMap.get(record.mp_id)?.party_logo || "",
          profile_image: mpMap.get(record.mp_id)?.profile_image || "",
          benchmark_value:
            benchmarkMap.get(`${record.category_id}-${record.period_id}`)?.benchmark_value || 0,
        }));

        if (isMounted) {
          setRecords(data);
        }
      } catch {
        if (isMounted) {
          setError("Unable to load allowance data right now.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadAllowances();

    return () => {
      isMounted = false;
    };
  }, []);

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
          return b.year - a.year;
        }

        return b.month - a.month;
      });
  }, [records]);

  useEffect(() => {
    if (!periods.length) {
      return;
    }

    if (
      !selectedPeriod ||
      !periods.some((period) => String(period.period_id) === String(selectedPeriod))
    ) {
      setSelectedPeriod(String(periods[0].period_id));
    }
  }, [periods, selectedPeriod]);

  useEffect(() => {
    if (!selectedPeriod) {
      return;
    }

    setSearchParams((params) => {
      if (params.get("period") === String(selectedPeriod)) {
        return params;
      }

      const next = new URLSearchParams(params);
      next.set("period", String(selectedPeriod));
      return next;
    });
  }, [selectedPeriod, setSearchParams]);

  const filteredRecords = useMemo(() => {
    if (!selectedPeriod) {
      return records;
    }

    return records.filter((record) => String(record.period_id) === selectedPeriod);
  }, [records, selectedPeriod]);

  const categoryItems = useMemo(() => {
    return buildCategoryView(filteredRecords)
      .filter((item) =>
        item.searchText.toLowerCase().includes(searchTerm.trim().toLowerCase())
      )
      .sort((a, b) => Math.abs(b.varianceAverage) - Math.abs(a.varianceAverage));
  }, [filteredRecords, searchTerm]);

  const memberItems = useMemo(() => {
    const items = buildMemberView(filteredRecords).filter((item) => {
      const matchesSearch = item.searchText
        .toLowerCase()
        .includes(searchTerm.trim().toLowerCase());
      const matchesParty =
        selectedParty === "all" ||
        item.party === selectedParty ||
        item.partyName === selectedParty;
      const matchesRank =
        selectedRankFilter === "all" ||
        String(item.rank || "").toLowerCase() === String(selectedRankFilter).toLowerCase();
      const matchesThreshold =
        varianceThreshold <= 0 || Number(item.varianceAverage) > varianceThreshold;

      return matchesSearch && matchesParty && matchesRank && matchesThreshold;
    });

    if (sortMode === "alphabetical") {
      return items.sort((a, b) => a.name.localeCompare(b.name));
    }

    return items.sort((a, b) => Math.abs(b.varianceAverage) - Math.abs(a.varianceAverage));
  }, [filteredRecords, searchTerm, selectedParty, selectedRankFilter, sortMode, varianceThreshold]);

  const memberPartyOptions = useMemo(() => {
    const options = Array.from(
      new Set(
        buildMemberView(filteredRecords)
          .map((item) => item.party)
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b));

    return ["all", ...options];
  }, [filteredRecords]);

  const rankOptions = [
    { value: "all", label: "All Ranks" },
    { value: "Head", label: "Head" },
    { value: "Vice", label: "Vice" },
    { value: "Member", label: "Member" },
  ];

  return (
    <div className="allowances-page">
      <div className="allowances-sheet">
        <div className="allowances-toggle" role="tablist" aria-label="Allowance views">
          <button
            type="button"
            className={viewMode === "category" ? "active" : ""}
            onClick={() => {
              setViewMode("category");
              setSearchParams((params) => {
                const next = new URLSearchParams(params);
                next.set("view", "category");
                return next;
              });
            }}
          >
            By Category
          </button>
          <button
            type="button"
            className={viewMode === "member" ? "active" : ""}
            onClick={() => {
              setViewMode("member");
              setSearchParams((params) => {
                const next = new URLSearchParams(params);
                next.set("view", "member");
                return next;
              });
            }}
          >
            By MP
          </button>
        </div>

        <div className="allowance-search">
          <input
            type="text"
            placeholder={
              viewMode === "category"
                ? "search by category name..."
                : "search MP name or party..."
            }
            value={searchTerm}
            onChange={(event) => {
              const nextValue = event.target.value;
              setSearchTerm(nextValue);
              setSearchParams((params) => {
                const next = new URLSearchParams(params);
                if (nextValue) {
                  next.set("search", nextValue);
                } else {
                  next.delete("search");
                }
                return next;
              });
            }}
          />
          <button type="button" aria-label="Search allowances">
            <Search size={16} />
          </button>
        </div>

        {viewMode === "member" && (
          <div className="member-controls">
              <div className="control-group">
                <div className="control-label">
                  <CalendarDays size={15} />
                  <span>Filter Date</span>
                </div>
                <div className="chip-row">
                  <div
                    className={`filter-dropdown-wrap ${isPeriodMenuOpen ? "open" : ""}`}
                    ref={periodMenuRef}
                  >
                    <button
                      type="button"
                      className="olive-chip filter-dropdown-trigger"
                      aria-haspopup="listbox"
                      aria-expanded={isPeriodMenuOpen}
                      onClick={() => setIsPeriodMenuOpen((current) => !current)}
                    >
                      {periods.find((period) => String(period.period_id) === selectedPeriod)?.label ||
                        "Select period"}
                      <ChevronDown size={14} />
                    </button>
                    {isPeriodMenuOpen ? (
                      <div className="filter-dropdown-menu" role="listbox">
                        {periods.map((period) => (
                          <button
                            key={period.period_id}
                            type="button"
                            className={`filter-dropdown-option ${
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
              </div>

            <div className="control-group">
              <div className="control-label">
                <ListFilter size={15} />
                <span>Sort By</span>
              </div>
              <div className="chip-row">
                <button
                  type="button"
                  className={`sort-chip ${sortMode === "variance" ? "active" : ""}`}
                  onClick={() => {
                    setSortMode("variance");
                    setSearchParams((params) => {
                      const next = new URLSearchParams(params);
                      next.set("sort", "variance");
                      return next;
                    });
                  }}
                >
                  Highest Variance
                </button>
                <button
                  type="button"
                  className={`sort-chip ghost ${sortMode === "alphabetical" ? "active" : ""}`}
                  onClick={() => {
                    setSortMode("alphabetical");
                    setSearchParams((params) => {
                      const next = new URLSearchParams(params);
                      next.set("sort", "alphabetical");
                      return next;
                    });
                  }}
                >
                  <ArrowDownAZ size={14} />
                  A - Z
                </button>
              </div>
            </div>

              <div className="control-group">
                <div className="control-label">
                  <ShieldUser size={15} />
                  <span>Filter Rank</span>
                </div>
                <div className="chip-row">
                  <div
                    className={`filter-dropdown-wrap ${isRankMenuOpen ? "open" : ""}`}
                    ref={rankMenuRef}
                  >
                    <button
                      type="button"
                      className="olive-chip filter-dropdown-trigger"
                      aria-haspopup="listbox"
                      aria-expanded={isRankMenuOpen}
                      onClick={() => setIsRankMenuOpen((current) => !current)}
                    >
                      {rankOptions.find((option) => option.value === selectedRankFilter)?.label ||
                        "All Ranks"}
                      <ChevronDown size={14} />
                    </button>
                    {isRankMenuOpen ? (
                      <div className="filter-dropdown-menu" role="listbox">
                        {rankOptions.map((rankOption) => (
                          <button
                            key={rankOption.value}
                            type="button"
                            className={`filter-dropdown-option ${
                              selectedRankFilter === rankOption.value ? "active" : ""
                            }`}
                            role="option"
                            aria-selected={selectedRankFilter === rankOption.value}
                            onClick={() => {
                              const nextValue = rankOption.value;
                              setSelectedRankFilter(nextValue);
                              setIsRankMenuOpen(false);
                              setSearchParams((params) => {
                                const next = new URLSearchParams(params);
                                if (nextValue && nextValue !== "all") {
                                  next.set("rank", nextValue);
                                } else {
                                  next.delete("rank");
                                }
                                return next;
                              });
                            }}
                          >
                            {rankOption.label}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="control-group">
                <div className="control-label">
                  <Users size={15} />
                  <span>Filter Party</span>
                </div>
                <div className="chip-row">
                  <div
                    className={`filter-dropdown-wrap ${isPartyMenuOpen ? "open" : ""}`}
                    ref={partyMenuRef}
                  >
                    <button
                      type="button"
                      className="olive-chip filter-dropdown-trigger"
                      aria-haspopup="listbox"
                      aria-expanded={isPartyMenuOpen}
                      onClick={() => setIsPartyMenuOpen((current) => !current)}
                    >
                      {selectedParty === "all" ? "All Parties" : selectedParty}
                      <ChevronDown size={14} />
                    </button>
                    {isPartyMenuOpen ? (
                      <div className="filter-dropdown-menu" role="listbox">
                        {memberPartyOptions.map((partyOption) => (
                          <button
                            key={partyOption}
                            type="button"
                            className={`filter-dropdown-option ${
                              partyOption === selectedParty ? "active" : ""
                            }`}
                            role="option"
                            aria-selected={partyOption === selectedParty}
                            onClick={() => {
                              const nextValue = partyOption;
                              setSelectedParty(nextValue);
                              setIsPartyMenuOpen(false);
                              setSearchParams((params) => {
                                const next = new URLSearchParams(params);
                                if (nextValue && nextValue !== "all") {
                                  next.set("party", nextValue);
                                } else {
                                  next.delete("party");
                                }
                                return next;
                              });
                            }}
                          >
                            {partyOption === "all" ? "All Parties" : partyOption}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
          </div>
        )}

        {loading && <div className="card status-card">Loading allowances...</div>}
        {error && <div className="card status-card error-card">{error}</div>}

        {!loading && !error && viewMode === "category" && (
          <>
            {categoryItems.map((item) => {
              const Icon = iconMap[item.iconName] || Home;
              const toneClass = getCardTone(item.varianceAverage);

              return (
                <Link className="card-link" to={`/categories/${item.id.replace("category-", "")}`} key={item.id}>
                <article className={`allowance-summary-card ${toneClass}`}>
                  <div className="allowance-summary-card-inner">
                    <div className="allowance-card-title">
                      <Icon size={20} strokeWidth={2.5} />
                      <div>
                        <h2>{item.title}</h2>
                      </div>
                    </div>

                    <div className="allowance-metrics-row">
                      <div>
                        <div className="allowance-big-value">
                          {formatCompactCurrency(item.benchmarkValue)}
                        </div>
                        <div className="allowance-small-label">Benchmark Value</div>
                      </div>

                      <div className={`variance-highlight ${toneClass}`}>
                        <div className="allowance-big-value">
                          {formatVariance(item.varianceAverage)}
                        </div>
                        <div className="allowance-small-label">
                          {getVarianceLabel(item.varianceAverage)}
                        </div>
                      </div>
                    </div>

                    <div className="allowance-update">
                      Update: {formatDate(item.latestUpdated)}
                    </div>
                  </div>

                  <div className={`allowance-see-more ${toneClass}`}>see more...</div>
                </article>
                </Link>
              );
            })}
          </>
        )}

        {!loading && !error && viewMode === "member" && (
          <section className="member-list-section">
            {memberItems.map((item, index) => {
              const isPositive = Number(item.varianceAverage) > 0;
              const isNegative = Number(item.varianceAverage) < 0;

              return (
                <Link
                  className="member-row-link"
                  to={`/mps/${item.mp_id}?period=${encodeURIComponent(selectedPeriod)}`}
                  key={item.id}
                >
                  <article className="member-row-card">
                    <div className="member-card-header">
                      <div className="member-identity-wrap">
                        <div className="member-avatar-thumb">
                          {item.profileImage ? (
                            <img src={item.profileImage} alt={item.name} />
                          ) : (
                            <span>{(item.name || "M").charAt(0)}</span>
                          )}
                        </div>

                        <div className="member-identity-copy">
                          <div className="member-name">{item.name}</div>
                          <div className="member-party-compact">
                            {item.partyLogo ? (
                              <img
                                src={item.partyLogo}
                                alt={`${item.party} logo`}
                                className="member-party-logo"
                              />
                            ) : null}
                            <span>{item.party}</span>
                          </div>
                        </div>
                      </div>

                      <div className="member-card-badges">
                        <span className="member-index-badge">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="rank-badge">{item.rank}</span>
                      </div>
                    </div>

                    <div className="member-card-body">
                      <div className="member-inline-metric">
                        <span>Monthly Spend</span>
                        <strong className="member-spend">
                          {formatCompactCurrency(item.monthlySpend)}
                        </strong>
                      </div>

                      <div className="member-inline-metric">
                        <span>Variance</span>
                        <strong
                          className={`member-variance ${
                            isPositive ? "positive" : isNegative ? "negative" : ""
                          }`}
                        >
                          {formatVariance(item.varianceAverage)}
                          {isPositive && <ArrowUp size={14} />}
                          {isNegative && <ArrowDown size={14} />}
                        </strong>
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </section>
        )}
      </div>
    </div>
  );
}

export default Allowances;
