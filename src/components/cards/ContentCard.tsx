import type { ContentCard as ContentCardType } from '../../types';
import styles from './cards.module.css';

interface Props {
  card: ContentCardType;
  cardIndex: number;
  total: number;
}

export default function ContentCard({ card, cardIndex, total }: Props) {
  return (
    <>
      <div className={styles.cardHead}>
        <span className={`${styles.tag} ${styles[card.tagCls]}`}>{card.tag}</span>
        <span className={styles.cardNum}>{cardIndex + 1} / {total}</span>
      </div>
      <h2 className={styles.cardTitle}>{card.title}</h2>
      <div
        className={styles.cardBody}
        dangerouslySetInnerHTML={{ __html: card.html }}
      />
    </>
  );
}
