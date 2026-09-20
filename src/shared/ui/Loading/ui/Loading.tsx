import styles from "./Loading.module.scss";

interface LoadingProps {
  label?: string;
}

export function Loading({ label = "Загрузка..." }: LoadingProps) {
  return (
    <div className={styles.loading} role="status">
      <span className={styles.spinner} />
      <span>{label}</span>
    </div>
  );
}
