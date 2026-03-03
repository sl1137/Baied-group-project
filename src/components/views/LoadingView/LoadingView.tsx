import styles from './LoadingView.module.css';

const STEPS = [
  '读取并解析内容结构…',
  '提取核心知识点…',
  '生成学习卡片与测验题…',
  '优化学习顺序…',
];

// currentStep: 0 = idle, 1-4 = steps in progress (matches STEPS index + 1)
// error: non-null string means something went wrong
interface Props {
  currentStep: number;
  error: string | null;
  onBack: () => void;
}

const stepToProgress: Record<number, number> = {
  0: 2,
  1: 20,
  2: 45,
  3: 75,
  4: 100,
};

export default function LoadingView({ currentStep, error, onBack }: Props) {
  const progress = stepToProgress[currentStep] ?? 2;

  if (error) {
    return (
      <div className={styles.scene}>
        <div className={styles.box}>
          <div className={styles.errorIcon}>⚠️</div>
          <div className={styles.errorTitle}>分析失败</div>
          <div className={styles.errorMsg}>{error}</div>
          <button className={styles.backBtn} onClick={onBack}>
            ← 返回重试
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
        <div className={styles.title}>正在分析内容</div>
        <div className={styles.sub}>生成学习卡片中，请稍候…</div>
        <div className={styles.steps}>
          {STEPS.map((text, i) => (
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
