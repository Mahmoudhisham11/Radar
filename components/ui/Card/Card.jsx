import styles from "./Card.module.css";

export default function Card({
  children,
  title,
  subtitle,
  action,
  headerBorder = true,
  glow = false,
  className = "",
  bodyClassName = "",
}) {
  const cardClasses = [
    styles.card,
    glow && styles.glow,
    className,
  ].filter(Boolean).join(" ");

  return (
    <div className={cardClasses}>
      {(title || action) && (
        <div className={`${styles.header} ${headerBorder ? styles.borderBottom : ""}`}>
          <div>
            {title && <h3 className={styles.title}>{title}</h3>}
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
          {action && <div className={styles.action}>{action}</div>}
        </div>
      )}
      <div className={`${styles.body} ${bodyClassName}`}>
        {children}
      </div>
    </div>
  );
}
