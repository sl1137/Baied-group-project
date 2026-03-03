import { useRef, useState } from 'react';
import styles from './PdfDropZone.module.css';

interface Props {
  file: File | null;
  onFileSelect: (file: File) => void;
}

export default function PdfDropZone({ file, onFileSelect }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setOver(true);
  }

  function handleDragLeave() {
    setOver(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setOver(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type === 'application/pdf') onFileSelect(f);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) onFileSelect(f);
  }

  return (
    <div
      className={`${styles.zone} ${over ? styles.over : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        style={{ display: 'none' }}
        onChange={handleChange}
      />
      <div className={styles.icon}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="12" y1="18" x2="12" y2="12" />
          <line x1="9" y1="15" x2="15" y2="15" />
        </svg>
      </div>
      <div className={styles.label}>
        <strong>点击上传</strong>或拖拽 PDF
      </div>
      {file && <div className={styles.fname}>{file.name}</div>}
    </div>
  );
}
