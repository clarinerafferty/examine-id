import { NavLink } from "react-router-dom";

const navItems = [
  {
    to: "/",
    end: true,
    label: "Dashboard",
    icon: "/nav-icons/dashboard.png",
    activeIcon: "/nav-icons/dashboard-active.png",
  },
  {
    to: "/allowances",
    label: "Allowances",
    icon: "/nav-icons/allowances.png",
    activeIcon: "/nav-icons/allowances-active.png",
  },
  {
    to: "/feedback",
    label: "Feedback",
    icon: "/nav-icons/feedback.png",
    activeIcon: "/nav-icons/feedback-active.png",
  },
  {
    to: "/about",
    label: "More",
    icon: "/nav-icons/more.png",
    activeIcon: "/nav-icons/more-active.png",
  },
];

function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Primary">
      {navItems.map((item) => (
        <NavLink key={item.to} to={item.to} end={item.end} className="nav-icon-item">
          {({ isActive }) => (
            <>
              <img
                src={isActive ? item.activeIcon : item.icon}
                alt=""
                className={`nav-icon-image ${isActive ? "active" : ""}`}
                aria-hidden="true"
              />
              <span className="sr-only">{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

export default BottomNav;
