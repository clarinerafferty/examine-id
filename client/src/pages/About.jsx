import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { moreSections } from "./moreContent";

function About() {
  return (
    <div className="more-screen">
      <div className="more-sheet">
        {moreSections.map((section) => (
          <section className="more-section" key={section.title}>
            <h2>{section.title}</h2>

            <div className="more-card-group">
              {section.items.map((item) => {
                const Icon = item.icon;

                return (
                  <Link className="more-item-row" to={item.to} key={item.title}>
                    <div className={`more-icon-wrap ${item.accent}`}>
                      <Icon size={16} />
                    </div>

                    <div className="more-item-copy">
                      <div className="more-item-title">{item.title}</div>
                      <p>{item.description}</p>
                    </div>

                    <ArrowRight size={16} className="more-arrow" />
                  </Link>
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
