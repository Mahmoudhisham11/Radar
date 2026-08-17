"use client";

import styles from "./Button.module.css";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  icon,
  onClick,
  disabled = false,
  type = "button",
  className = "",
}) {
  const buttonClass = [
    styles.button,
    styles[variant] || styles.primary,
    styles[size] || styles.md,
    className,
  ].filter(Boolean).join(" ");

  return (
    <button
      type={type}
      className={buttonClass}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      <span>{children}</span>
    </button>
  );
}
