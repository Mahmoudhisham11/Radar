import styles from "./Badge.module.css";

export default function Badge({
  children,
  variant = "default",
  size = "md",
  dot = false,
  className = "",
}) {
  const badgeClass = [
    styles.badge,
    styles[variant] || styles.default,
    styles[size] || styles.md,
    className,
  ].filter(Boolean).join(" ");

  return (
    <span className={badgeClass}>
      {dot && <span className={styles.dot} />}
      {children}
    </span>
  );
}
