import { useLang } from '../../../context/LangContext';
import styles from './ProgressBar.module.css';

interface Props {
  current: number;
  total: number;
}

export default function ProgressBar({ current, total }: Props) {
  const { tr } = useLang();
  const pct = (current / total) * 100;
  return (
    <div className={styles.wrap}>
      <div className={styles.row}>
        <span className={styles.label}>{tr.progressLabel}</span>
        <span className={styles.num}>{current} / {total}</span>
      </div>
      <div className={styles.track}>
        <div className={styles.fill} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
