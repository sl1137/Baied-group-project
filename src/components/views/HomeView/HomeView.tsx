import { useRef, useState } from 'react';
import { useLang } from '../../../context/LangContext';
import styles from './HomeView.module.css';

type InputTab = 'url' | 'text' | 'pdf';
type Depth = 'quick' | 'deep';

interface Props {
  onStart: (url: string, text: string, file: File | null, depth: Depth) => void;
}

export default function HomeView({ onStart }: Props) {
  const { tr } = useLang();
  const [tab, setTab] = useState<InputTab>('url');
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [depth, setDepth] = useState<Depth>('deep');
  const [shaking, setShaking] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  function handleSubmit() {
    const valid =
      (tab === 'url' && url.trim()) ||
      (tab === 'text' && text.trim()) ||
      (tab === 'pdf' && pdfFile);
    if (!valid) {
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
      return;
    }
    onStart(
      tab === 'url' ? url : '',
      tab === 'text' ? text : '',
      tab === 'pdf' ? pdfFile : null,
      depth,
    );
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type === 'application/pdf') setPdfFile(f);
  }

  return (
    <div>
      <div className={styles.hero}>
        <div className={styles.eyebrow}>
          <svg width="11" height="11" viewBox="0 0 16 20" fill="currentColor">
            <path d="M9 1L0 11H7L7 19L16 9H9L9 1Z" />
          </svg>
          {tr.eyebrow}
        </div>
        <h1><em>{tr.heroTitle}</em></h1>
        <p>{tr.heroDesc}</p>
      </div>

      <div className={`${styles.card} ${shaking ? styles.shake : ''}`}>
        {/* Tab bar */}
        <div className={styles.tabBar}>
          {(['url', 'text', 'pdf'] as InputTab[]).map((t) => (
            <button
              key={t}
              className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`}
              onClick={() => setTab(t)}
            >
              {t === 'url' && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
              )}
              {t === 'text' && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              )}
              {t === 'pdf' && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              )}
              {tr[`tab${t.charAt(0).toUpperCase() + t.slice(1)}` as 'tabUrl' | 'tabText' | 'tabPdf']}
            </button>
          ))}
        </div>

        {/* Input area */}
        <div className={styles.inputArea}>
          {tab === 'url' && (
            <input
              type="url"
              className={styles.urlInput}
              placeholder={tr.urlPlaceholder ?? 'Paste an article URL...'}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              autoFocus
            />
          )}
          {tab === 'text' && (
            <textarea
              className={styles.textArea}
              placeholder={tr.textPlaceholder}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          )}
          {tab === 'pdf' && (
            <div>
              <div
                className={`${styles.dropZone} ${dragOver ? styles.dropOver : ''} ${pdfFile ? styles.dropHasFile : ''}`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  style={{ display: 'none' }}
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) setPdfFile(f); }}
                />
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={styles.dropIcon}>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span className={styles.dropLabel}>
                  {pdfFile ? pdfFile.name : 'Choose a PDF file'}
                </span>
              </div>
              <p className={styles.pdfHint}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {tr.pdfHint}
              </p>
            </div>
          )}
        </div>

        {/* Depth selector */}
        <div className={styles.depthRow}>
          <button
            className={`${styles.depthCard} ${depth === 'quick' ? styles.depthActive : ''}`}
            onClick={() => setDepth('quick')}
          >
            <span className={styles.depthTitle}>{tr.quickRead}</span>
            <span className={styles.depthDesc}>{tr.quickReadDesc}</span>
          </button>
          <button
            className={`${styles.depthCard} ${depth === 'deep' ? styles.depthDark : ''}`}
            onClick={() => setDepth('deep')}
          >
            <span className={styles.depthTitle}>{tr.deepRead}</span>
            <span className={styles.depthDesc}>{tr.deepReadDesc}</span>
          </button>
        </div>

        {/* Generate button */}
        <button className={styles.generateBtn} onClick={handleSubmit}>
          {tr.generateBtn}
        </button>
      </div>
    </div>
  );
}
