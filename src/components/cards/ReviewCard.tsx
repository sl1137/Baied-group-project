import type { ReviewCard as ReviewCardType, Answer } from '../../types';
import { useLang } from '../../context/LangContext';
import styles from './cards.module.css';

interface Props {
  card: ReviewCardType;
  cardIndex: number;
  total: number;
  answer: Answer | undefined;
  onPick: (cardIndex: number, letter: string) => void;
}

export default function ReviewCard({ card, cardIndex, total, answer, onPick }: Props) {
  const { tr } = useLang();
  return (
    <>
      <div className={styles.cardHead}>
        <span className={`${styles.tag} ${styles[card.tagCls]}`}>{card.tag}</span>
        <span className={styles.cardNum}>{cardIndex + 1} / {total}</span>
      </div>
      <h2 className={styles.cardTitle}>{card.title}</h2>
      <div className={styles.cardBody} style={{ flex: 1 }}>
        <div className={styles.keyPointsBlock}>
          <div className={styles.keyPointsLabel}>{tr.keyPointsLabel}</div>
          <div className={styles.keyPointsChips}>
            {card.keyPoints.split(/[,，、]/).map((kp, i) => (
              kp.trim() ? <span key={i} className={styles.keyPointsChip}>{kp.trim()}</span> : null
            ))}
          </div>
        </div>
        <p className={styles.quizQ}>{card.question}</p>
        <div className={styles.options}>
          {card.options.map((opt) => {
            let cls = styles.opt;
            let check: React.ReactNode = null;

            if (answer) {
              cls += ` ${styles.locked}`;
              if (opt.l === card.correct) {
                cls += ` ${styles.correct}`;
                check = <span className={styles.optCheck}>✓</span>;
              } else if (opt.l === answer.sel) {
                cls += ` ${styles.wrong}`;
                check = <span className={styles.optCheck}>✗</span>;
              } else {
                cls += ` ${styles.faded}`;
              }
            }

            return (
              <button
                key={opt.l}
                className={cls}
                onClick={() => onPick(cardIndex, opt.l)}
                disabled={!!answer}
              >
                <span className={styles.optLetter}>{opt.l}</span>
                <span>{opt.t}</span>
                {check}
              </button>
            );
          })}
        </div>

        {answer && (
          <div className={`${styles.quizFb} ${answer.correct ? styles.fbCorrect : styles.fbWrong}`}>
            <div className={styles.fbHeader}>
              {answer.correct ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              )}
              <span className={styles.fbLabel}>{answer.correct ? tr.correct : tr.wrong}</span>
            </div>
            <p className={styles.fbExplain}>{card.explain}</p>
          </div>
        )}
      </div>
    </>
  );
}
