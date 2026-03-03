import type { Card, ContentCard, Source, Answers } from '../../types';
import styles from './cards.module.css';

interface Props {
  cardIndex: number;
  total: number;
  source: Source;
  answers: Answers;
  cards: Card[];
  onSave: () => void;
  onRestart: () => void;
  saved: boolean;
}

export default function CompleteCard({
  cardIndex,
  total,
  source,
  answers,
  cards,
  onSave,
  onRestart,
  saved,
}: Props) {
  const quizCards = cards.filter(
    (c) => c.type === 'quiz' || c.type === 'review' || c.type === 'output'
  );
  const correctCount = quizCards.filter((c) => {
    const ci = cards.indexOf(c);
    return answers[ci]?.correct;
  }).length;
  const contentCards = cards.filter((c): c is ContentCard => c.type === 'content');

  return (
    <>
      <div className={styles.cardHead}>
        <span className={`${styles.tag} ${styles.tagDone}`}>学习完成</span>
        <span className={styles.cardNum}>{cardIndex + 1} / {total}</span>
      </div>
      <div className={styles.doneInner}>
        <div className={styles.doneEmoji}>🎉</div>
        <h2 className={styles.doneTitle}>学习完成！</h2>
        <p className={styles.doneSub}>你已完成《{source.title}》的全部学习内容</p>
        <div className={styles.scorePill}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          答对 {correctCount} / {quizCards.length} 道测验题
        </div>
        <div className={styles.topics}>
          {contentCards.map((c, i) => (
            <span key={i} className={styles.chip}>{c.title}</span>
          ))}
        </div>
        <div className={styles.doneBtns}>
          <button
            className={`${styles.btnSave}${saved ? ` ${styles.saved}` : ''}`}
            onClick={onSave}
          >
            {saved ? (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                已保存！
              </>
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="21 8 21 21 3 21 3 8" />
                  <rect x="1" y="3" width="22" height="5" />
                  <line x1="10" y1="12" x2="14" y2="12" />
                </svg>
                保存到学习档案
              </>
            )}
          </button>
          <button className={styles.btnRestart} onClick={onRestart}>
            重新开始
          </button>
        </div>
      </div>
    </>
  );
}
