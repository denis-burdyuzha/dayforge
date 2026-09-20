import { Outlet } from "react-router-dom";

import { BottomNavigation } from "@/widgets/bottom-navigation/ui/BottomNavigation";
import { Header } from "@/widgets/header/ui/Header";

import styles from "./AppShell.module.scss";

export const AppShell = () => {
  return (
    <div className={styles.shell}>
      <Header />

      <main className={styles.main}>
        <div className={styles.container}>
          <Outlet />
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
};
