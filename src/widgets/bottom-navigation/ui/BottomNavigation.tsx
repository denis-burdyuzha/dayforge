import { CalendarDays, House, ListTodo, NotebookPen } from "lucide-react";
import { NavLink } from "react-router-dom";

import styles from "./BottomNavigation.module.scss";

const navigationItems = [
  { label: "Главная", to: "/app", icon: House },
  { label: "План", to: "/app/plan", icon: ListTodo },
  { label: "Календарь", to: "/app/calendar", icon: CalendarDays },
  { label: "Отчёт", to: "/app/report", icon: NotebookPen },
];

export function BottomNavigation() {
  return (
    <nav className={styles.navigation}>
      {navigationItems.map(({ label, to, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/app"}
          className={({ isActive }) => (isActive ? styles.active : styles.link)}
        >
          <Icon size={20} aria-hidden="true" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
