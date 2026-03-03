import type { ReviewCard as ReviewCardType, Answer } from '../../types';
import styles from './cards.module.css';

interface Props {
  card: ReviewCardType;
  cardIndex: number;
  total: number;
  answer: Answer | undefined;
  onPick: (cardIndex: number, letter: string) => void;
}

export default function ReviewCard({ card, cardIndex, total, answer, onPick }: Props) {
  return (
    <>
      <div className={styles.cardHead}>
        <span className={`${styles.tag} ${styles[card.tagCls]}`}>{card.tag}</span>
        <span className={styles.cardNum}>{cardIndex + 1} / {total}</span>
      </div>
      <h2 className={styles.cardTitle}>{card.title}</h2>
      <div className={styles.cardBody} style={{ flex: 1 }}>
        <p className={styles.keyPoints}>
          <strong>已学要点：</strong>{card.keyPoints}
        </p>
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
            <span>
              {answer.correct ? '✓ 回答正确！' : '✗ 回答错误。'} {card.explain}
            </span>
          </div>
        )}
      </div>
    </>
  );
}
