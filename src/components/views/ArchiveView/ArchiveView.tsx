import { useState } from 'react';
import type { ArchiveEntry, BookmarkEntry } from '../../../types';
import { useLang } from '../../../context/LangContext';
import styles from './ArchiveView.module.css';

interface Props {
  entries: ArchiveEntry[];
  bookmarks: BookmarkEntry[];
  onReview: (entry: ArchiveEntry) => void;
  onDelete: (id: string) => void;
  onDeleteBookmark: (id: string) => void;
  onLearnBookmark: (bookmark: BookmarkEntry) => void;
  onGoHome: () => void;
}

const UrlIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

const PdfIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

export default function ArchiveView({ entries, bookmarks, onReview, onDelete, onDeleteBookmark, onLearnBookmark, onGoHome }: Props) {
  const { tr } = useLang();
  const [tab, setTab] = useState<'learned' | 'readLater'>('learned');
  const [selected, setSelected] = useState<ArchiveEntry | null>(null);

  // ── Detail view ─────────────────────────────────────────────────────────────
  if (selected) {
    const insights = selected.summaryData?.insights ?? [];
    return (
      <div className={styles.detail}>
        <button className={styles.backBtn} onClick={() => setSelected(null)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          {tr.back}
        </button>

        <h2 className={styles.detailTitle}>{selected.title}</h2>

        <div className={styles.detailMeta}>
          <span className={`${styles.sourceTag} ${selected.sourceType === 'pdf' ? styles.sourceTagPdf : styles.sourceTagUrl}`}>
            {selected.sourceType.toUpperCase()}
          </span>
          <span className={styles.detailDate}>{selected.date}</span>
        </div>

        {insights.length > 0 && (
          <div className={styles.takeawaysCard}>
            <div className={styles.takeawaysLabel}>{tr.keyTakeaways}</div>
            <ul className={styles.takeawaysList}>
              {insights.map((insight, i) => (
                <li key={i} className={styles.takeawaysItem}>{insight}</li>
              ))}
            </ul>
          </div>
        )}

        <button className={styles.reviewFullBtn} onClick={() => onReview(selected)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 .49-3.36" />
          </svg>
          {tr.reviewBtn}
        </button>
      </div>
    );
  }

  // ── List view ────────────────────────────────────────────────────────────────
  return (
    <div>
      <button className={styles.backBtn} onClick={onGoHome}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        {tr.back}
      </button>
      <div className={styles.head}>
        <div>
          <h2>{tr.archiveTitle}</h2>
          <p>{tr.archiveSub}</p>
        </div>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tabBtn} ${tab === 'learned' ? styles.tabActive : ''}`}
          onClick={() => setTab('learned')}
        >
          {tr.learnedTab}
          <span className={styles.tabCount}>{entries.length}</span>
        </button>
        <button
          className={`${styles.tabBtn} ${tab === 'readLater' ? styles.tabActive : ''}`}
          onClick={() => setTab('readLater')}
        >
          {tr.readLaterTab}
          {bookmarks.length > 0 && <span className={styles.tabCount}>{bookmarks.length}</span>}
        </button>
      </div>

      {tab === 'learned' && (
        entries.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>📚</div>
            <p>{tr.archiveEmpty}</p>
          </div>
        ) : (
          <div className={styles.list}>
            {entries.map((entry, i) => (
              <div
                key={entry.id}
                className={styles.item}
                style={{ animationDelay: `${i * 0.05}s` }}
                onClick={() => setSelected(entry)}
              >
                <div className={`${styles.icon} ${entry.sourceType === 'pdf' ? styles.iconPdf : styles.iconUrl}`}>
                  {entry.sourceType === 'pdf' ? <PdfIcon /> : <UrlIcon />}
                </div>
                <div className={styles.info}>
                  <div className={styles.itemTitle}>{entry.title}</div>
                  <div className={styles.meta}>
                    <span>{entry.date}</span>
                  </div>
                </div>
                <div className={styles.actions}>
                  <button
                    className={styles.deleteBtn}
                    onClick={(e) => { e.stopPropagation(); onDelete(entry.id); }}
                    title={tr.deleteBtn}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6M14 11v6" />
                      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {tab === 'readLater' && (
        bookmarks.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>🔖</div>
            <p>{tr.noBookmarks}</p>
          </div>
        ) : (
          <div className={styles.list}>
            {bookmarks.map((bm, i) => (
              <div
                key={bm.id}
                className={`${styles.item} ${styles.bookmarkItem}`}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className={`${styles.icon} ${styles.iconUrl}`}>
                  <UrlIcon />
                </div>
                <div className={styles.info}>
                  <div className={styles.itemTitle}>{bm.title}</div>
                  <div className={styles.meta}>
                    <span>{bm.savedAt}</span>
                    {bm.desc && <span className={styles.bmDesc}>{bm.desc}</span>}
                  </div>
                </div>
                <div className={styles.actions}>
                  <button
                    className={styles.learnNowBtn}
                    onClick={() => onLearnBookmark(bm)}
                    title={tr.learnNowBtn}
                  >
                    {tr.learnNowBtn}
                  </button>
                  <button
                    className={styles.openLinkBtn}
                    onClick={() => window.open(bm.url, '_blank', 'noopener,noreferrer')}
                    title={tr.openLinkBtn}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </button>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => onDeleteBookmark(bm.id)}
                    title={tr.deleteBtn}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6M14 11v6" />
                      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
