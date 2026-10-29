import { appEnvLabel, appVersion } from '../config/buildMeta';
import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer} data-testid="app-footer">
      <span className={styles.version}>v{appVersion}</span>
      <span className={styles.separator} aria-hidden="true">
        ·
      </span>
      <span className={styles.env} data-env={appEnvLabel}>
        {appEnvLabel}
      </span>
    </footer>
  );
}
