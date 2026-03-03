import type { ArchiveEntry } from '../../../types';
import styles from './ArchiveView.module.css';

interface Props {
  entries: ArchiveEntry[];
  onReview: (entry: ArchiveEntry) => void;
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

export default function ArchiveView({ entries, onReview }: Props) {
  return (
    <div>
      <div className={styles.head}>
        <div>
          <h2>学习档案</h2>
          <p>你的知识积累，随时回顾</p>
        </div>
        <div className={styles.countPill}>{entries.length} 个记录</div>
      </div>

      {entries.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>📚</div>
          <p>还没有学习记录，完成第一次学习后保存吧！</p>
        </div>
      ) : (
        <div className={styles.list}>
          {entries.map((entry, i) => (
            <div
              key={entry.id}
              className={styles.item}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className={`${styles.icon} ${entry.sourceType === 'pdf' ? styles.iconPdf : styles.iconUrl}`}>
                {entry.sourceType === 'pdf' ? <PdfIcon /> : <UrlIcon />}
              </div>
              <div className={styles.info}>
                <div className={styles.itemTitle}>{entry.title}</div>
                <div className={styles.meta}>
                  <span>{entry.date}</span>
                  <span className={`${styles.scoreTag} ${entry.perfect ? styles.scorePerfect : styles.scorePartial}`}>
                    {entry.perfect ? '✓' : '~'} 答题 {entry.score}
                  </span>
                </div>
              </div>
              <button className={styles.reviewBtn} onClick={() => onReview(entry)}>
                回顾学习
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
