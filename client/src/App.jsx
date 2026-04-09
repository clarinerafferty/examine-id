import { Link, Routes, Route, useLocation, matchPath } from "react-router-dom";
import { ArrowLeft, Info, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
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
  const staticHeaderMap = {
    "/allowances": { title: "Allowances", showShare: true },
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
          {standardHeader.showShare && (
            <button type="button" className="standard-header-action" aria-label="Share page">
              <Share2 size={18} />
            </button>
          )}
          {standardHeader.showInfo && (
            <button type="button" className="standard-header-action" aria-label="Page information">
              <Info size={18} />
            </button>
          )}
        </header>
      )}
      <div
        className={`fixed-sheet-curve ${
          isDashboard ? "fixed-sheet-curve-dashboard" : "fixed-sheet-curve-standard"
        }`}
        aria-hidden="true"
      />
      <div
        className={`page-content ${
          isDashboard ? "page-content-dashboard" : "page-content-standard"
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

      <BottomNav />
    </div>
  );
}

export default App;
