import { useRef, useState } from 'react';
import PdfDropZone from '../../ui/PdfDropZone/PdfDropZone';
import styles from './HomeView.module.css';

interface Props {
  onStart: (url: string, file: File | null) => void;
  onLoadDemo: () => void;
  apiKey: string;
  onApiKeyChange: (key: string) => void;
}

export default function HomeView({ onStart, onLoadDemo, apiKey, onApiKeyChange }: Props) {
  const [url, setUrl] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [shaking, setShaking] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [keyInput, setKeyInput] = useState(apiKey);
  const cardRef = useRef<HTMLDivElement>(null);

  function handleSubmit() {
    if (!url.trim() && !pdfFile) {
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
      return;
    }
    // Save API key if user typed one
    if (keyInput !== apiKey) onApiKeyChange(keyInput.trim());
    onStart(url, pdfFile);
  }

  function handleSaveKey() {
    onApiKeyChange(keyInput.trim());
  }

  const savedKey = apiKey ? `${apiKey.slice(0, 14)}…` : '';

  return (
    <div>
      <div className={styles.hero}>
        <div className={styles.eyebrow}>
          <svg width="11" height="11" viewBox="0 0 16 20" fill="currentColor">
            <path d="M9 1L0 11H7L7 19L16 9H9L9 1Z" />
          </svg>
          碎片化学习工具
        </div>
        <h1>
          把任何内容变成<br />
          <em>8 张精华卡片</em>
        </h1>
        <p>粘贴文章链接或上传 PDF，AI 自动拆解核心知识，逐步引导你完成高效学习。</p>
      </div>

      <div ref={cardRef} className={`${styles.inputCard} ${shaking ? styles.shake : ''}`}>
        <div className={styles.grid}>
          {/* URL input */}
          <div>
            <label className={styles.inputLabel}>文章链接</label>
            <div className={styles.urlWrap}>
              <svg
                className={styles.urlIcon}
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              <input
                type="url"
                className={styles.urlInput}
                placeholder="粘贴任意文章链接…"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
            </div>
          </div>

          <div className={styles.orDivider}>
            <span className={styles.orText}>或</span>
          </div>

          {/* PDF upload */}
          <div>
            <label className={styles.inputLabel}>上传 PDF</label>
            <PdfDropZone file={pdfFile} onFileSelect={setPdfFile} />
          </div>
        </div>

        {/* API Key section */}
        <div className={styles.apiSection}>
          <button
            className={styles.apiToggle}
            onClick={() => setShowApiKey(v => !v)}
            type="button"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            {apiKey ? (
              <span>API Key 已设置 <em className={styles.keyMask}>{savedKey}</em></span>
            ) : (
              <span>设置 Anthropic API Key（分析真实文章必填）</span>
            )}
            <svg
              className={`${styles.chevron} ${showApiKey ? styles.chevronOpen : ''}`}
              width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {showApiKey && (
            <div className={styles.apiExpanded}>
              <p className={styles.apiHint}>
                API Key 仅保存在本地浏览器，不会上传。
                前往 <a href="https://console.anthropic.com/keys" target="_blank" rel="noreferrer">console.anthropic.com</a> 获取。
              </p>
              <div className={styles.apiInputRow}>
                <input
                  type="password"
                  className={styles.apiInput}
                  placeholder="sk-ant-api03-…"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveKey()}
                  autoComplete="off"
                />
                <button className={styles.apiSaveBtn} onClick={handleSaveKey}>
                  保存
                </button>
              </div>
              {!apiKey && (
                <p className={styles.apiWarning}>
                  ⚠ 未设置 API Key 时只能使用内置示例内容
                </p>
              )}
            </div>
          )}
        </div>

        <button className={styles.cta} onClick={handleSubmit}>
          开始碎片化学习
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      <div className={styles.demoHint}>
        <a onClick={onLoadDemo}>
          没有内容？<u>试试内置示例：机器学习基础</u> ✨
        </a>
      </div>
    </div>
  );
}
