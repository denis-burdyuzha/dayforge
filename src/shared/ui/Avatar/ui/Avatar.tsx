import styles from "./Avatar.module.scss";

type AvatarSize = "sm" | "md" | "lg" | "xl";

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: AvatarSize;
}

export function Avatar({ src, alt = "", size = "md" }: AvatarProps) {
  const classes = [styles.avatar, styles[size]].join(" ");

  if (src) {
    return <img className={classes} src={src} alt={alt} />;
  }

  return (
    <div className={classes} role="img" aria-label={alt || "Avatar placeholder"}>
      <svg
        viewBox="0 0 24 24"
        width="100%"
        height="100%"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ padding: "3px", opacity: 0.9 }}
      >
        <circle cx="12" cy="7" r="4" />
        <path d="M 5 21 C 5 15, 8 13, 12 13 C 16 13, 19 15, 19 21" />
      </svg>
    </div>
  );
}
