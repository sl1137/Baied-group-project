import type { Source, Answers, Card } from '../../../types';
import ContentCard from '../../cards/ContentCard';
import QuizCard from '../../cards/QuizCard';
import ReviewCard from '../../cards/ReviewCard';
import OutputCard from '../../cards/OutputCard';
import CompleteCard from '../../cards/CompleteCard';
import ProgressBar from '../../ui/ProgressBar/ProgressBar';
import cardStyles from '../../cards/cards.module.css';
import styles from './LearningView.module.css';

interface Props {
  cards: Card[];
  source: Source;
  idx: number;
  answers: Answers;
  animClass: string;
  onPrev: () => void;
  onNext: () => void;
  onPickOption: (cardIndex: number, letter: string) => void;
  onSave: () => void;
  onRestart: () => void;
  onGoHome: () => void;
  saved: boolean;
}

export default function LearningView({
  cards,
  source,
  idx,
  answers,
  animClass,
  onPrev,
  onNext,
  onPickOption,
  onSave,
  onRestart,
  onGoHome,
  saved,
}: Props) {
  const card = cards[idx];
  const total = cards.length;
  const isComplete = card.type === 'complete';
  const needsAnswer =
    (card.type === 'quiz' || card.type === 'review' || card.type === 'output') &&
    !answers[idx];
  const isLastContentCard = idx === cards.length - 2;

  return (
    <div>
      <div className={styles.topbar}>
        <button className={styles.backBtn} onClick={onGoHome}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          返回
        </button>
        <div className={styles.sourceTag}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
          <span>{source.title}</span>
        </div>
      </div>

      <ProgressBar current={idx + 1} total={total} />

      <div className={styles.cardStack}>
        <div className={`${cardStyles.learnCard} ${animClass}`}>
          {card.type === 'content' && (
            <ContentCard card={card} cardIndex={idx} total={total} />
          )}
          {card.type === 'quiz' && (
            <QuizCard
              card={card}
              cardIndex={idx}
              total={total}
              answer={answers[idx]}
              onPick={onPickOption}
            />
          )}
          {card.type === 'review' && (
            <ReviewCard
              card={card}
              cardIndex={idx}
              total={total}
              answer={answers[idx]}
              onPick={onPickOption}
            />
          )}
          {card.type === 'output' && (
            <OutputCard
              card={card}
              cardIndex={idx}
              total={total}
              answer={answers[idx]}
              onPick={onPickOption}
            />
          )}
          {card.type === 'complete' && (
            <CompleteCard
              cardIndex={idx}
              total={total}
              source={source}
              answers={answers}
              cards={cards}
              onSave={onSave}
              onRestart={onRestart}
              saved={saved}
            />
          )}
        </div>
      </div>

      <div className={styles.nav}>
        <button
          className={`${styles.navCard} ${styles.navPrev}`}
          onClick={onPrev}
          disabled={idx === 0}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          上一张
        </button>

        {!isComplete && (
          <button
            className={`${styles.navCard} ${styles.navNext}`}
            onClick={onNext}
            disabled={needsAnswer}
          >
            {isLastContentCard ? (
              <>
                完成学习
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </>
            ) : (
              <>
                下一张
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
