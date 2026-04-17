import { Link, Routes, Route, useLocation, matchPath } from "react-router-dom";
import { ArrowLeft, Info } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Dashboard from "./pages/Dashboard";
import Mps from "./pages/Mps";
import MpDetail from "./pages/MpDetail";
import Allowances from "./pages/Allowances";
import CategoryDetail from "./pages/CategoryDetail";
import Categories from "./pages/Categories";
import Feedback from "./pages/Feedback";
import About from "./pages/About";
import BottomNav from "./components/BottomNav";
import { fetchJson } from "./lib/api";

function App() {
  const location = useLocation();
  const isDashboard = location.pathname === "/";
  const [dynamicHeaderTitle, setDynamicHeaderTitle] = useState("");
  const [pageInfoOpenPath, setPageInfoOpenPath] = useState("");
  const staticHeaderMap = {
    "/allowances": { title: "Allowances", showInfo: true },
    "/feedback": { title: "Feedback" },
    "/mps": { title: "MPs" },
    "/categories": { title: "Categories" },
    "/about": { title: "More" },
  };
  let standardHeader = staticHeaderMap[location.pathname];

  if (!standardHeader && matchPath("/mps/:id", location.pathname)) {
    standardHeader = {
      title: "MP Profile",
      backTo: `/allowances?view=member${
        location.search ? `&${location.search.replace(/^\?/, "")}` : ""
      }`,
      showInfo: true,
    };
  }

  if (!standardHeader && matchPath("/categories/:id", location.pathname)) {
    standardHeader = {
      title: dynamicHeaderTitle || "Allowance Category",
      backTo: "/allowances",
      showInfo: true,
    };
  }
  const isCategoryDetail = Boolean(matchPath("/categories/:id", location.pathname));
  const isMpDetail = Boolean(matchPath("/mps/:id", location.pathname));

  const pageInfoContent = useMemo(() => {
    if (location.pathname === "/allowances") {
      return {
        title: "About This Page",
        summary: "Quick guide to reading the allowance view.",
        points: [
          "This page compares MP allowance data in a simple, scannable way.",
          "Color guide: benchmark-colors",
          "By Category: See each category against the benchmark and rank range.",
          "By MP: See each MP's monthly spending and average benchmark difference.",
          "Benchmark: A reference market price for checking if spending is above or below typical levels.",
          "Source & method: See About page.",
        ],
      };
    }

    if (isCategoryDetail) {
      return {
        title: "Quick Guide",
        summary: "Use this view to compare one category against the market benchmark.",
        points: [
          "Tabs: Rank groups (Head, Vice, Member).",
          "Main value: Average monthly housing allowance for the active tab.",
          "% vs benchmark: Difference from market benchmark for the currently selected month in this view.",
          "Market benchmark: National median market price baseline.",
          "Source & method: See About page.",
        ],
      };
    }

    if (isMpDetail) {
      return {
        title: "Quick Guide",
        summary: "Use this view to understand one MP's monthly spending at a glance.",
        points: [
          "Total Monthly Spend: Sum across categories for this MP in the selected month.",
          "Overspend/Underspend (%): Average difference versus market benchmarks.",
          "Positive/Negative: + above benchmark, - below benchmark.",
          "Top categories: Largest variance categories.",
          "Source & method: See About page.",
        ],
      };
    }

    return null;
  }, [isCategoryDetail, isMpDetail, location.pathname]);

  const isPageInfoOpen = pageInfoOpenPath === location.pathname;

  useEffect(() => {
    let isMounted = true;
    const categoryMatch = matchPath("/categories/:id", location.pathname);

    if (!categoryMatch) {
      return () => {
        isMounted = false;
      };
    }

    async function loadCategoryTitle() {
      try {
        const categories = await fetchJson("/api/categories");
        const matched = categories.find(
          (item) => String(item.category_id) === String(categoryMatch.params.id)
        );

        if (isMounted) {
          setDynamicHeaderTitle(matched?.category_name || "Allowance Category");
        }
      } catch {
        if (isMounted) {
          setDynamicHeaderTitle("Allowance Category");
        }
      }
    }

    loadCategoryTitle();

    return () => {
      isMounted = false;
    };
  }, [location.pathname]);

  return (
    <div className="app-shell">
      {isDashboard && (
        <header className="top-header">
          <div className="brand-wrap">
            <img src="/examine-id-logo.png" alt="Examine.ID logo" className="brand-logo" />
            <div className="brand-text">
              <div className="brand-title">examine.id</div>
              <div className="brand-subtitle">See the Numbers, Know the Story</div>
            </div>
          </div>
        </header>
      )}
      {standardHeader && (
        <header className="standard-top-header">
          {standardHeader.backTo && (
            <Link
              to={standardHeader.backTo}
              className="standard-header-action left"
              aria-label="Go back"
            >
              <ArrowLeft size={18} />
            </Link>
          )}
          <h1>{standardHeader.title}</h1>
          {standardHeader.showInfo && (
            <button
              type="button"
              className="standard-header-action"
              aria-label="Page information"
              aria-haspopup="dialog"
              aria-expanded={isPageInfoOpen}
              aria-controls="page-info-dialog"
              onClick={() => setPageInfoOpenPath(location.pathname)}
            >
              <Info size={18} />
            </button>
          )}
        </header>
      )}
      <div
        className={`page-content ${
          isDashboard ? "page-content-dashboard" : "page-content-standard"
        } ${isCategoryDetail ? "page-content-category-detail" : ""} ${
          isMpDetail ? "page-content-mp-detail" : ""
        }`}
      >
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/allowances" element={<Allowances />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/mps" element={<Mps />} />
          <Route path="/mps/:id" element={<MpDetail />} />
          <Route path="/categories/:id" element={<CategoryDetail />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </div>
      {standardHeader?.showInfo && pageInfoContent && isPageInfoOpen ? (
        <div className="page-info-backdrop" onClick={() => setPageInfoOpenPath("")}>
          <div
            className="page-info-modal"
            role="dialog"
            aria-modal="true"
            id="page-info-dialog"
            aria-label={pageInfoContent.title}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="page-info-close"
              onClick={() => setPageInfoOpenPath("")}
              aria-label="Close page information"
            >
              ×
            </button>
            <div className="page-info-hero">
              <div className="page-info-badge">
                <Info size={15} />
                <span>Guide</span>
              </div>
              <h2>{pageInfoContent.title}</h2>
              {pageInfoContent.summary ? (
                <p className="page-info-summary">{pageInfoContent.summary}</p>
              ) : null}
            </div>
            <ul className="page-info-list">
              {pageInfoContent.points.map((point) => {
                if (point === "Source & method: See About page.") {
                  return (
                    <li key={point} className="page-info-item page-info-item-link">
                      <span className="page-info-label">Source & method</span>
                      <div className="page-info-copy">
                        <Link
                          to="/about"
                          className="page-info-link"
                          onClick={() => setPageInfoOpenPath("")}
                        >
                          See About page
                        </Link>
                      </div>
                    </li>
                  );
                }

                if (point === "Color guide: benchmark-colors") {
                  return (
                    <li key={point} className="page-info-item">
                      <span className="page-info-label">Color guide</span>
                      <div className="page-info-color-guide" aria-label="Benchmark color guide">
                        <span className="page-info-color-chip red">
                          <span className="page-info-color-dot red" aria-hidden="true" />
                          Red: &gt; +5% benchmark
                        </span>
                        <span className="page-info-color-chip yellow">
                          <span className="page-info-color-dot yellow" aria-hidden="true" />
                          Yellow: within +/-5%
                        </span>
                        <span className="page-info-color-chip olive">
                          <span className="page-info-color-dot olive" aria-hidden="true" />
                          Olive: &lt; -5% benchmark
                        </span>
                      </div>
                    </li>
                  );
                }

                const [label, ...rest] = point.split(":");
                const hasLabel = rest.length > 0;
                return (
                  <li
                    key={point}
                    className={`page-info-item ${hasLabel ? "" : "page-info-item-intro"}`}
                  >
                    {hasLabel ? (
                      <>
                        <span className="page-info-label">{label}</span>
                        <div className="page-info-copy">{rest.join(":").trim()}</div>
                      </>
                    ) : (
                      <div className="page-info-copy">{point}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      ) : null}

      <BottomNav />
    </div>
  );
}

export default App;

