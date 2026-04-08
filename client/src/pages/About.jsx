import {
  ArrowRight,
  BadgeInfo,
  BookMarked,
  CircleHelp,
  Database,
  MessageSquareMore,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const moreSections = [
  {
    title: "About",
    items: [
      {
        icon: Sparkles,
        accent: "gold",
        title: "About examine.id",
        description: "What the platform is for and who it helps.",
      },
      {
        icon: CircleHelp,
        accent: "gold",
        title: "How to use the app",
        description: "A quick guide to dashboards, profiles, and feedback pages.",
      },
    ],
  },
  {
    title: "Data",
    items: [
      {
        icon: Database,
        accent: "olive",
        title: "Data & methodology",
        description: "How allowance, benchmark, and sentiment data are organised.",
      },
      {
        icon: BookMarked,
        accent: "olive",
        title: "Glossary",
        description: "Plain-language definitions for allowance and variance terms.",
      },
    ],
  },
  {
    title: "Trust & Safety",
    items: [
      {
        icon: ShieldCheck,
        accent: "red",
        title: "Privacy & ethics",
        description: "How anonymous responses and prototype data are handled.",
      },
    ],
  },
  {
    title: "Support",
    items: [
      {
        icon: MessageSquareMore,
        accent: "neutral",
        title: "Send feedback on this app",
        description: "Report an issue or suggest an improvement for the prototype.",
      },
      {
        icon: BadgeInfo,
        accent: "neutral",
        title: "Version & credits",
        description: "Project scope, module context, and implementation notes.",
      },
    ],
  },
];

function About() {
  return (
    <div className="more-screen">
      <div className="more-sheet">
        <section className="prototype-disclaimer-card">
          <div className="prototype-disclaimer-tag">Prototype Notice</div>
          <p>
            MP identities, party names, and party affiliations in this sample are based on real
            public figures from DKI Jakarta. Benchmark references are linked to real BPS sources,
            while spending and feedback totals in this prototype remain demo data unless explicitly
            source-verified.
          </p>
        </section>

        {moreSections.map((section) => (
          <section className="more-section" key={section.title}>
            <h2>{section.title}</h2>

            <div className="more-card-group">
              {section.items.map((item) => {
                const Icon = item.icon;

                return (
                  <article className="more-item-row" key={item.title}>
                    <div className={`more-icon-wrap ${item.accent}`}>
                      <Icon size={16} />
                    </div>

                    <div className="more-item-copy">
                      <div className="more-item-title">{item.title}</div>
                      <p>{item.description}</p>
                    </div>

                    <ArrowRight size={16} className="more-arrow" />
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

export default About;
