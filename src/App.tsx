import { useCallback, useState } from 'react';
import type { ViewId, Source, Answers, ArchiveEntry, Card } from './types';
import { CARDS } from './data/cards';
import { extractTitleFromUrl } from './utils/urlTitle';
import { fetchArticleText } from './utils/fetchArticle';
import { generateCardsFromText } from './utils/generateCards';
import { parsePdfText } from './utils/parsePdf';
import { getArchive, setArchive } from './utils/archive';
import { useCardAnimation } from './hooks/useCardAnimation';
import Header from './components/Header/Header';
import HomeView from './components/views/HomeView/HomeView';
import LoadingView from './components/views/LoadingView/LoadingView';
import LearningView from './components/views/LearningView/LearningView';
import ArchiveView from './components/views/ArchiveView/ArchiveView';
import styles from './App.module.css';

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const API_KEY_STORAGE = 'mk-api-key';

function loadApiKey(): string {
  try { return localStorage.getItem(API_KEY_STORAGE) || ''; } catch { return ''; }
}
function saveApiKey(key: string): void {
  try { localStorage.setItem(API_KEY_STORAGE, key); } catch { /* ignore */ }
}

export default function App() {
  const [view, setView]           = useState<ViewId>('home');
  const [viewKey, setViewKey]     = useState(0);
  const [source, setSource]       = useState<Source>({ type: 'url', title: '' });
  const [idx, setIdx]             = useState(0);
  const [answers, setAnswers]     = useState<Answers>({});
  const [saved, setSaved]         = useState(false);
  const [archive, setArchiveState] = useState<ArchiveEntry[]>(() => getArchive());
  const [apiKey, setApiKeyState]  = useState<string>(loadApiKey);
  const [generatedCards, setGeneratedCards] = useState<Card[]>(CARDS);

  // Loading state
  const [loadingStep, setLoadingStep]   = useState(0);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  const { animClass, animateTo } = useCardAnimation();

  // ─── View helpers ────────────────────────────────────────────────────────────
  const goToView = useCallback((v: ViewId) => {
    setView(v);
    setViewKey((k) => k + 1);
  }, []);

  const goHome = useCallback(() => goToView('home'), [goToView]);

  const showArchive = useCallback(() => {
    setArchiveState(getArchive());
    goToView('archive');
  }, [goToView]);

  // ─── API Key ─────────────────────────────────────────────────────────────────
  const handleApiKeyChange = useCallback((key: string) => {
    setApiKeyState(key);
    saveApiKey(key);
  }, []);

  // ─── Shared helper: run real AI analysis ─────────────────────────────────────
  const runAnalysis = useCallback(
    async (getText: () => Promise<string>, fallbackTitle: string, sourceType: 'url' | 'pdf') => {
      try {
        setLoadingStep(1);
        const text = await getText();

        setLoadingStep(2);
        await sleep(300);

        const { cards, title } = await generateCardsFromText(text, apiKey, setLoadingStep);

        setLoadingStep(4);
        await sleep(250);

        setSource({ type: sourceType, title: title || fallbackTitle });
        setGeneratedCards(cards);
        setIdx(0);
        setAnswers({});
        goToView('learning');
      } catch (err) {
        const msg = err instanceof Error ? err.message : '发生未知错误，请重试';
        setLoadingError(msg);
      }
    },
    [apiKey, goToView]
  );

  // ─── Demo-only flow (no API key, always shows built-in ML cards) ─────────────
  const runDemoFlow = useCallback(
    async (source: Source) => {
      setSource(source);
      setSaved(false);
      setLoadingStep(0);
      setLoadingError(null);
      goToView('loading');

      await sleep(350); setLoadingStep(1);
      await sleep(450); setLoadingStep(2);
      await sleep(550); setLoadingStep(3);
      await sleep(450); setLoadingStep(4);
      await sleep(200);

      setGeneratedCards(CARDS);
      setIdx(0);
      setAnswers({});
      goToView('learning');
    },
    [goToView]
  );

  // ─── Start learning ───────────────────────────────────────────────────────────
  const handleStart = useCallback(
    async (url: string, file: File | null) => {
      const trimmedUrl = url.trim();

      // ── PDF flow ───────────────────────────────────────────────────────────
      if (file) {
        const pdfTitle = file.name.replace(/\.pdf$/i, '');
        if (!apiKey) {
          // No API key: fall back to demo content
          await runDemoFlow({ type: 'pdf', title: pdfTitle });
          return;
        }
        // Real PDF analysis
        setSource({ type: 'pdf', title: pdfTitle });
        setSaved(false);
        setLoadingStep(0);
        setLoadingError(null);
        goToView('loading');
        await runAnalysis(() => parsePdfText(file), pdfTitle, 'pdf');
        return;
      }

      // ── Demo URL or no API key: use built-in cards ─────────────────────────
      const isDemoUrl = !trimmedUrl || trimmedUrl.includes('machine-learning');
      if (isDemoUrl || !apiKey) {
        const demoTitle = isDemoUrl ? '机器学习基础' : extractTitleFromUrl(trimmedUrl);
        await runDemoFlow({ type: 'url', title: demoTitle });
        return;
      }

      // ── Real URL analysis ──────────────────────────────────────────────────
      const urlTitle = extractTitleFromUrl(trimmedUrl);
      setSource({ type: 'url', title: urlTitle });
      setSaved(false);
      setLoadingStep(0);
      setLoadingError(null);
      goToView('loading');
      await runAnalysis(() => fetchArticleText(trimmedUrl), urlTitle, 'url');
    },
    [apiKey, goToView, runDemoFlow, runAnalysis]
  );

  const handleLoadDemo = useCallback(async () => {
    await runDemoFlow({ type: 'url', title: '机器学习基础' });
  }, [runDemoFlow]);

  const handleLoadingBack = useCallback(() => {
    setLoadingError(null);
    setLoadingStep(0);
    goHome();
  }, [goHome]);

  // ─── Card navigation ──────────────────────────────────────────────────────────
  const handleNext = useCallback(() => {
    if (idx >= generatedCards.length - 1) return;
    animateTo('forward', () => setIdx((i) => i + 1));
  }, [idx, generatedCards.length, animateTo]);

  const handlePrev = useCallback(() => {
    if (idx <= 0) return;
    animateTo('backward', () => setIdx((i) => i - 1));
  }, [idx, animateTo]);

  // ─── Quiz ─────────────────────────────────────────────────────────────────────
  const handlePickOption = useCallback((cardIndex: number, letter: string) => {
    const card = generatedCards[cardIndex];
    if (card.type !== 'quiz' && card.type !== 'review' && card.type !== 'output') return;
    setAnswers((prev) => {
      if (prev[cardIndex]) return prev;
      return { ...prev, [cardIndex]: { sel: letter, correct: letter === card.correct } };
    });
  }, [generatedCards]);

  // ─── Save session ─────────────────────────────────────────────────────────────
  const handleSave = useCallback(() => {
    if (saved) return;
    const quizCards = generatedCards.filter(
      (c) => c.type === 'quiz' || c.type === 'review' || c.type === 'output'
    );
    const correct = quizCards.filter((c) => {
      const ci = generatedCards.indexOf(c);
      return answers[ci]?.correct;
    }).length;
    const entry: ArchiveEntry = {
      id: `mk-${Date.now()}`,
      title: source.title,
      sourceType: source.type,
      date: new Date().toISOString().slice(0, 10),
      score: `${correct}/${quizCards.length}`,
      perfect: correct === quizCards.length,
      cards: generatedCards,
    };
    const updated = [entry, ...archive];
    setArchiveState(updated);
    setArchive(updated);
    setSaved(true);
  }, [saved, answers, source, archive, generatedCards]);

  const handleRestart = useCallback(() => {
    setIdx(0);
    setAnswers({});
    setSaved(false);
  }, []);

  // ─── Archive review ───────────────────────────────────────────────────────────
  const handleReview = useCallback(
    async (entry: ArchiveEntry) => {
      setSource({ type: entry.sourceType, title: entry.title });
      setGeneratedCards(entry.cards ?? CARDS);
      setIdx(0);
      setAnswers({});
      setSaved(false);
      goToView('learning');
    },
    [goToView]
  );

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <>
      <Header onGoHome={goHome} onShowArchive={showArchive} />
      <main className={styles.main}>
        <div
          key={`home-${viewKey}`}
          className={`${styles.view} ${view === 'home' ? styles.active : ''}`}
        >
          <HomeView
            onStart={handleStart}
            onLoadDemo={handleLoadDemo}
            apiKey={apiKey}
            onApiKeyChange={handleApiKeyChange}
          />
        </div>

        <div
          key={`loading-${viewKey}`}
          className={`${styles.view} ${view === 'loading' ? styles.active : ''}`}
        >
          <LoadingView
            currentStep={loadingStep}
            error={loadingError}
            onBack={handleLoadingBack}
          />
        </div>

        <div
          key={`learning-${viewKey}`}
          className={`${styles.view} ${view === 'learning' ? styles.active : ''}`}
        >
          <LearningView
            cards={generatedCards}
            source={source}
            idx={idx}
            answers={answers}
            animClass={animClass}
            onPrev={handlePrev}
            onNext={handleNext}
            onPickOption={handlePickOption}
            onSave={handleSave}
            onRestart={handleRestart}
            onGoHome={goHome}
            saved={saved}
          />
        </div>

        <div
          key={`archive-${viewKey}`}
          className={`${styles.view} ${view === 'archive' ? styles.active : ''}`}
        >
          <ArchiveView entries={archive} onReview={handleReview} />
        </div>
      </main>
    </>
  );
}
