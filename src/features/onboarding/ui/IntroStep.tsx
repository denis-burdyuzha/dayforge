import { Button } from "@/shared/ui/Button/ui/Button";

import styles from "./IntroStep.module.css";

interface IntroStepProps {
  onStart: () => void;
}

export function IntroStep({ onStart }: IntroStepProps) {
  return (
    <div className={styles.intro}>
      <div className={styles.logoGroup}>
        <h1 className={styles.logo}>DAYFORGE</h1>
        <p className={styles.tagline}>YOUR LIFE AWAITS</p>
      </div>
      <Button size="lg" fullWidth onClick={onStart} className={styles.enterBtn}>
        ENTER
      </Button>
    </div>
  );
}
