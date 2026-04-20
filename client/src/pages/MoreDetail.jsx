import { ExternalLink } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";
import { getMorePageMeta } from "./moreContent";

function SectionBadge({ badge }) {
  if (!badge) {
    return null;
  }

  const Icon = badge.icon;

  return (
    <div className={`about-section-badge ${badge.tone || ""}`.trim()}>
      <Icon size={14} />
      <span>{badge.label}</span>
    </div>
  );
}

function MoreDetail() {
  const { slug } = useParams();
  const page = getMorePageMeta(slug);

  if (!page) {
    return <Navigate to="/about" replace />;
  }

  return (
    <div className="more-screen">
      <div className="more-sheet about-sheet">
        <section className="about-hero-card">
          <div className="about-hero-kicker">{page.hero.kicker}</div>
          <h2>{page.hero.title}</h2>
          <p>{page.hero.description}</p>

          {page.hero.meta?.length ? (
            <div className="about-hero-meta">
              {page.hero.meta.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          ) : null}
        </section>

        {page.sections.map((section) => (
          <section className="about-section" key={section.title}>
            <div className="about-section-heading">
              <SectionBadge badge={section.badge} />
              <h3>{section.title}</h3>
              {section.copy ? <p className="about-section-copy">{section.copy}</p> : null}
            </div>

            {section.type === "cards" ? (
              <div className="about-card-stack">
                {section.items.map((item) => (
                  <article key={item.title} className="about-info-card">
                    <h4>{item.title}</h4>
                    <p>{item.body}</p>
                  </article>
                ))}
              </div>
            ) : null}

            {section.type === "steps" ? (
              <div className="about-step-list">
                {section.items.map((item, index) => (
                  <article key={item.title} className="about-step-card">
                    <div className="about-step-number">0{index + 1}</div>
                    <div>
                      <h4>{item.title}</h4>
                      <p>{item.body}</p>
                    </div>
                  </article>
                ))}
              </div>
            ) : null}

            {section.type === "sources" ? (
              <div className="about-source-list">
                {section.items.map((item) => (
                  <article key={item.category} className="about-source-card">
                    <div className="about-source-topline">
                      <h4>{item.category}</h4>
                      <span
                        className={`about-source-status ${
                          item.status === "Seeded reference" ? "seeded" : "verified"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <p className="about-source-title">{item.source}</p>
                    <p className="about-source-method">{item.method}</p>

                    {item.url ? (
                      <a
                        className="about-source-link"
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <span>View publication</span>
                        <ExternalLink size={14} />
                      </a>
                    ) : (
                      <div className="about-source-note">Awaiting a dedicated wage dataset</div>
                    )}
                  </article>
                ))}
              </div>
            ) : null}

            {section.type === "glossary" ? (
              <div className="about-glossary-list">
                {section.items.map((item) => (
                  <article key={item.term} className="about-glossary-card">
                    <h4>{item.term}</h4>
                    <p>{item.definition}</p>
                  </article>
                ))}
              </div>
            ) : null}

            {section.type === "note" ? (
              <article
                className={section.variant === "ethics" ? "about-ethics-card" : "about-callout-card"}
              >
                {section.label ? (
                  <div className="about-callout-header">
                    <section.icon size={15} />
                    <span>{section.label}</span>
                  </div>
                ) : null}
                <p>{section.body}</p>
              </article>
            ) : null}
          </section>
        ))}

        {page.cta ? (
          <section className="about-section">
            <article className="about-cta-card">
              <div className="about-cta-copy">
                <SectionBadge badge={page.cta.badge} />
                <h3>{page.cta.title}</h3>
                <p>{page.cta.body}</p>
              </div>

              <Link to={page.cta.to} className="about-cta-link">
                {page.cta.label}
              </Link>
            </article>
          </section>
        ) : null}
      </div>
    </div>
  );
}

export default MoreDetail;
