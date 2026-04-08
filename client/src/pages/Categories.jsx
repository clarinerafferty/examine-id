import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchJson, formatCurrency } from "../lib/api";

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadCategories() {
      try {
        const data = await fetchJson("/api/categories");
        if (isMounted) {
          setCategories(data);
        }
      } catch {
        if (isMounted) {
          setError("Unable to load category data right now.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="simple-screen">
      <div className="simple-sheet">
        <p className="subtitle">Allowance benchmark categories</p>

        {loading && <div className="card status-card">Loading categories...</div>}
        {error && <div className="card status-card error-card">{error}</div>}

        {!loading &&
          !error &&
          categories.map((category) => (
            <Link className="card-link" to={`/categories/${category.category_id}`} key={category.category_id}>
              <article className="card category-card elevated-card">
                <div className="category-card-top">
                  <div>
                    <h2>{category.category_name}</h2>
                    <p className="category-subtitle">{category.icon_name || "category"}</p>
                  </div>
                  <span className="record-pill">{category.allowance_record_count} records</span>
                </div>

                <p className="category-description">{category.description}</p>

                <div className="mp-detail-row">
                  <span>Total spend</span>
                  <strong>{formatCurrency(category.total_actual_spend)}</strong>
                </div>

                <div className="mp-detail-row">
                  <span>Total cap</span>
                  <strong>{formatCurrency(category.total_allowance_cap)}</strong>
                </div>
              </article>
            </Link>
          ))}
      </div>
    </div>
  );
}

export default Categories;
