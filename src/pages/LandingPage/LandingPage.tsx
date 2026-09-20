import { useNavigate } from "react-router-dom";

import { Button } from "@/shared/ui/Button/ui/Button";

import styles from "./LandingPage.module.css";

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className={styles.landing}>
      <div className={styles.container}>
        <div className={styles.hero}>
          <h1 className={styles.logo}>DAYFORGE</h1>
          <p className={styles.subtitle}>Твоя жизнь. Твоя RPG.</p>
          <p className={styles.description}>
            Превращай реальные действия в прокачку персонажа.
            <br />
            Выполняй ежедневные задачи, получай опыт и развивай своего героя.
          </p>
        </div>

        <div className={styles.actions}>
          <Button size="lg" fullWidth onClick={() => navigate("/onboarding")}>
            Начать приключение
          </Button>
          <Button variant="secondary" size="lg" fullWidth onClick={() => navigate("/login")}>
            У меня уже есть аккаунт
          </Button>
        </div>
      </div>
    </div>
  );
}
