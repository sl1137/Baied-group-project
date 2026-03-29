import type { TrueFalseCard as TrueFalseCardType, Answer } from '../../types';
import { useLang } from '../../context/LangContext';
import styles from './cards.module.css';

interface Props {
  card: TrueFalseCardType;
  cardIndex: number;
  total: number;
  answer: Answer | undefined;
  onPick: (cardIndex: number, letter: string) => void;
}

export default function TrueFalseCard({ card, cardIndex, total, answer, onPick }: Props) {
  const { tr } = useLang();

  function getBtnCls(val: 'T' | 'F') {
    let cls = `${styles.tfBtn} ${val === 'T' ? styles.tfBtnTrue : styles.tfBtnFalse}`;
    if (answer) {
      cls += ` ${styles.locked}`;
      if (val === card.correct) {
        cls += ` ${styles.correct}`;
      } else if (val === answer.sel) {
        cls += ` ${styles.wrong}`;
      } else {
        cls += ` ${styles.tfBtnFaded}`;
      }
    }
    return cls;
  }

  return (
    <>
      <div className={styles.cardHead}>
        <span className={`${styles.tag} ${styles[card.tagCls]}`}>{card.tag}</span>
        <span className={styles.cardNum}>{cardIndex + 1} / {total}</span>
      </div>
      <div className={styles.tfStatement}>
        <p><em>"{card.title}"</em></p>
      </div>
      <div className={styles.cardBody} style={{ flex: 1 }}>
        <div className={styles.tfBtns}>
          <button
            className={getBtnCls('T')}
            onClick={() => onPick(cardIndex, 'T')}
            disabled={!!answer}
          >
            True
          </button>
          <button
            className={getBtnCls('F')}
            onClick={() => onPick(cardIndex, 'F')}
            disabled={!!answer}
          >
            False
          </button>
        </div>
        {answer && (
          <div className={`${styles.quizFb} ${answer.correct ? styles.fbCorrect : styles.fbWrong}`}>
            <div className={styles.fbHeader}>
              {answer.correct ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
              )}
              <span className={styles.fbLabel}>
                {answer.correct ? tr.correct : tr.wrong}
              </span>
            </div>
            <p className={styles.fbExplain}>{card.explain}</p>
          </div>
        )}
      </div>
    </>
  );
}
