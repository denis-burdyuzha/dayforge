import { NavLink } from "react-router-dom";

import styles from "./BottomNavigation.module.scss";

const navigationItems = [
  { label: "Главная", to: "/app" },
  { label: "План", to: "/app/plan" },
  { label: "Отчёт", to: "/app/report" },
];

export function BottomNavigation() {
  return (
    <nav className={styles.navigation}>
      {navigationItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === "/app"}
          className={({ isActive }) => (isActive ? styles.active : styles.link)}
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
