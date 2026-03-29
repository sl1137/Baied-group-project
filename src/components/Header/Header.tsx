import type { Lang } from '../../i18n';
import { translations } from '../../i18n';
import styles from './Header.module.css';

interface Props {
  onGoHome: () => void;
  onShowArchive: () => void;
  lang: Lang;
  onLangChange: (lang: Lang) => void;
  onLogout: () => void;
}

export default function Header({ onGoHome, onShowArchive, lang, onLangChange, onLogout }: Props) {
  const tr = translations[lang];
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.logo} onClick={onGoHome}>
          <div className={styles.logoMark}>
            <svg width="16" height="18" viewBox="0 0 16 20" fill="none">
              <path d="M9 1L0 11H7L7 19L16 9H9L9 1Z" fill="white" />
            </svg>
          </div>
          <span className={styles.logoText}>
            Mini<b>Knowledge</b>
          </span>
        </div>
        <nav className={styles.nav}>
          <button className={`${styles.hbtn} ${styles.ghost}`} onClick={onShowArchive}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="21 8 21 21 3 21 3 8" />
              <rect x="1" y="3" width="22" height="5" />
              <line x1="10" y1="12" x2="14" y2="12" />
            </svg>
            {tr.archive}
          </button>

          <div className={styles.langToggle}>
            <button
              className={`${styles.langBtn} ${lang === 'en' ? styles.langActive : ''}`}
              onClick={() => onLangChange('en')}
            >
              EN
            </button>
            <button
              className={`${styles.langBtn} ${lang === 'zh' ? styles.langActive : ''}`}
              onClick={() => onLangChange('zh')}
            >
              中文
            </button>
          </div>

          <button className={styles.exitBtn} onClick={onLogout} title="Sign out">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </nav>
      </div>
    </header>
  );
}
