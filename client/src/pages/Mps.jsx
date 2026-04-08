import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchJson } from "../lib/api";

function Mps() {
  const [mps, setMps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadMps() {
      try {
        const data = await fetchJson("/api/mps");
        if (isMounted) {
          setMps(data);
        }
      } catch {
        if (isMounted) {
          setError("Unable to load MP data right now.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadMps();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="simple-screen">
      <div className="simple-sheet">
        <p className="subtitle">Browse MP spending profiles</p>

        {loading && <div className="card status-card">Loading MPs...</div>}
        {error && <div className="card status-card error-card">{error}</div>}

        {!loading &&
          !error &&
          mps.map((mp) => (
            <Link className="card-link" to={`/mps/${mp.mp_id}`} key={mp.mp_id}>
              <article className="card mp-card elevated-card">
                <div className="mp-card-top">
                  <div className="mp-card-top-left">
                    <div className="mp-avatar-thumb">
                      {mp.profile_image ? (
                        <img src={mp.profile_image} alt={mp.display_name || mp.full_name} />
                      ) : (
                        <span>{(mp.display_name || mp.full_name || "M").charAt(0)}</span>
                      )}
                    </div>
                    <div>
                      <h2>{mp.display_name || mp.full_name}</h2>
                      <div className="mp-meta-row">
                        {mp.party_logo ? (
                          <img
                            src={mp.party_logo}
                            alt={`${mp.party_abbreviation} logo`}
                            className="party-logo-inline"
                          />
                        ) : null}
                        <p className="mp-meta">{mp.party_abbreviation}</p>
                      </div>
                    </div>
                  </div>
                  <span className="rank-badge">{mp.mp_rank}</span>
                </div>

                <p className="mp-full-name">{mp.full_name}</p>

                <div className="mp-detail-row">
                  <span>Party</span>
                  <strong>{mp.party_name}</strong>
                </div>

                <div className="mp-detail-row">
                  <span>Status</span>
                  <strong>{mp.status}</strong>
                </div>
              </article>
            </Link>
          ))}
      </div>
    </div>
  );
}

export default Mps;
