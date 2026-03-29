import { useLang } from '../../../context/LangContext';
import styles from './LoadingView.module.css';

const stepToProgress: Record<number, number> = {
  0: 2,
  1: 20,
  2: 45,
  3: 75,
  4: 100,
};

interface Props {
  currentStep: number;
  error: string | null;
  onBack: () => void;
}

export default function LoadingView({ currentStep, error, onBack }: Props) {
  const { tr } = useLang();
  const progress = stepToProgress[currentStep] ?? 2;

  if (error) {
    return (
      <div className={styles.scene}>
        <div className={styles.box}>
          <div className={styles.errorIcon}>⚠️</div>
          <div className={styles.errorTitle}>{tr.loadingFailed}</div>
          <div className={styles.errorMsg}>{error}</div>
          <button className={styles.backBtn} onClick={onBack}>
            {tr.backRetry}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.scene}>
      <div className={styles.box}>
        <div className={styles.dots}>
          <div className={styles.dot} />
          <div className={styles.dot} />
          <div className={styles.dot} />
          <div className={styles.dot} />
        </div>
        <div className={styles.track}>
          <div className={styles.fill} style={{ width: `${progress}%` }} />
        </div>
        <div className={styles.title}>{tr.loadingTitle}</div>
        <div className={styles.sub}>{tr.loadingSub}</div>
        <div className={styles.steps}>
          {tr.loadingSteps.map((text, i) => (
            <div
              key={i}
              className={`${styles.step} ${currentStep > i ? styles.show : ''}`}
            >
              <div className={`${styles.stepDot} ${currentStep > i + 1 ? styles.stepDone : ''}`} />
              <span className={currentStep === i + 1 ? styles.activeStep : ''}>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
