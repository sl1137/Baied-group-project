import type { SummaryData, BookmarkEntry, RelatedResource } from '../../../types';
import { useLang } from '../../../context/LangContext';
import styles from './SummaryView.module.css';

interface Props {
  summaryData: SummaryData;
  bookmarks: BookmarkEntry[];
  onSaveBookmark: (resource: RelatedResource) => void;
  onRestart: () => void;
  onGoHome: () => void;
}

export default function SummaryView({ summaryData, bookmarks, onSaveBookmark, onRestart, onGoHome }: Props) {
  const { tr } = useLang();

  return (
    <div className={styles.container}>
      <div className={styles.topbar}>
        <button className={styles.backBtn} onClick={onGoHome}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          {tr.back}
        </button>
      </div>

      <div className={styles.header}>
        <h1 className={styles.title}>{tr.summaryTitle}</h1>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={`${styles.sectionIcon} ${styles.insightsIcon}`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </span>
          {tr.insightsTitle}
        </h2>
        {summaryData.insights.length > 0 ? (
          <ul className={styles.insightsList}>
            {summaryData.insights.map((insight, i) => (
              <li key={i} className={styles.insightItem}>
                <span className={styles.insightNum}>{i + 1}</span>
                <span className={styles.insightText}>{insight}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.emptyHint}>—</p>
        )}
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <span className={`${styles.sectionIcon} ${styles.readingIcon}`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2.5">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </span>
          {tr.relatedTitle}
        </h2>
        {summaryData.relatedReading.length > 0 ? (
          <div className={styles.resourceList}>
            {summaryData.relatedReading.map((resource, i) => {
              const isSaved = bookmarks.some((b) => b.url === resource.url);
              return (
                <div key={i} className={styles.resourceCard}>
                  <div className={styles.resourceInfo}>
                    <div className={styles.resourceTitle}>{resource.title}</div>
                    <div className={styles.resourceDesc}>{resource.desc}</div>
                  </div>
                  <div className={styles.resourceBtns}>
                    <button
                      className={isSaved ? styles.saveBtn + ' ' + styles.saveBtnSaved : styles.saveBtn}
                      onClick={() => onSaveBookmark(resource)}
                      disabled={isSaved}
                      title={isSaved ? tr.savedForLater : tr.saveForLater}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                      </svg>
                      {isSaved ? tr.savedForLater : tr.saveForLater}
                    </button>
                    <button
                      className={styles.openBtn}
                      onClick={() => window.open(resource.url, '_blank', 'noopener,noreferrer')}
                    >
                      {tr.openLinkBtn}
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className={styles.emptyHint}>—</p>
        )}
      </div>

      <div className={styles.actions}>
        <button className={styles.btnSecondary} onClick={onRestart}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 .49-3.36" />
          </svg>
          {tr.reviewCardsBtn}
        </button>
        <button className={styles.btnPrimary} onClick={onGoHome}>
          {tr.learnNewBtn}
        </button>
      </div>
    </div>
  );
}
