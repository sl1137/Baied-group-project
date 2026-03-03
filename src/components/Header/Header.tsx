import styles from './Header.module.css';

interface Props {
  onGoHome: () => void;
  onShowArchive: () => void;
}

export default function Header({ onGoHome, onShowArchive }: Props) {
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
            Mini<b>knowledge</b>
          </span>
        </div>
        <nav className={styles.nav}>
          <button className={`${styles.hbtn} ${styles.ghost}`} onClick={onGoHome}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            首页
          </button>
          <button className={`${styles.hbtn} ${styles.archive}`} onClick={onShowArchive}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="21 8 21 21 3 21 3 8" />
              <rect x="1" y="3" width="22" height="5" />
              <line x1="10" y1="12" x2="14" y2="12" />
            </svg>
            学习档案
          </button>
        </nav>
      </div>
    </header>
  );
}
