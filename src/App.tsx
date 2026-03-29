import { useCallback, useEffect, useState } from 'react';
import type { ViewId, Source, Answers, ArchiveEntry, BookmarkEntry, Card, SummaryData, RelatedResource } from './types';
import type { Lang } from './i18n';
import { LangContext } from './context/LangContext';
import { extractTitleFromUrl } from './utils/urlTitle';
import { fetchArticleText } from './utils/fetchArticle';
import { generateCardsFromText } from './utils/generateCards';
import { parsePdfText } from './utils/parsePdf';
import { getArchive, addArchiveEntry, deleteArchiveEntry } from './utils/archive';
import { getBookmarks, addBookmark, deleteBookmark } from './utils/bookmarks';
import { logout } from './utils/auth';
import { supabase } from './utils/supabase';
import { useCardAnimation } from './hooks/useCardAnimation';
import Header from './components/Header/Header';
import AuthView from './components/views/AuthView/AuthView';
import HomeView from './components/views/HomeView/HomeView';
import LoadingView from './components/views/LoadingView/LoadingView';
import LearningView from './components/views/LearningView/LearningView';
import ArchiveView from './components/views/ArchiveView/ArchiveView';
import SummaryView from './components/views/SummaryView/SummaryView';
import styles from './App.module.css';

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export default function App() {
  const [initializing, setInitializing] = useState(true);
  const [view, setView]           = useState<ViewId>('auth');
  const [viewKey, setViewKey]     = useState(0);
  const [source, setSource]       = useState<Source>({ type: 'url', title: '' });
  const [idx, setIdx]             = useState(0);
  const [answers, setAnswers]     = useState<Answers>({});
  const [saved, setSaved]         = useState(false);
  const [archive, setArchiveState] = useState<ArchiveEntry[]>([]);
  const [bookmarks, setBookmarksState] = useState<BookmarkEntry[]>([]);
  const [generatedCards, setGeneratedCards] = useState<Card[]>([]);
  const [articleText, setArticleText] = useState<string>('');
  const [summaryData, setSummaryData] = useState<SummaryData>({ insights: [], relatedReading: [] });
  const [lang, setLang] = useState<Lang>('en');

  // Loading state
  const [loadingStep, setLoadingStep]   = useState(0);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  const { animClass, animateTo } = useCardAnimation();

  // ─── Supabase auth init ───────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        setView('home');
        setViewKey((k) => k + 1);
        const [archiveData, bookmarkData] = await Promise.all([getArchive(), getBookmarks()]);
        setArchiveState(archiveData);
        setBookmarksState(bookmarkData);
      }
      setInitializing(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setView('auth');
        setViewKey((k) => k + 1);
        setArchiveState([]);
        setBookmarksState([]);
      }
    });

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── View helpers ────────────────────────────────────────────────────────────
  const goToView = useCallback((v: ViewId) => {
    setView(v);
    setViewKey((k) => k + 1);
  }, []);

  const goHome = useCallback(() => goToView('home'), [goToView]);

  const showArchive = useCallback(() => {
    goToView('archive');
  }, [goToView]);

  // ─── Auth ─────────────────────────────────────────────────────────────────────
  const handleAuth = useCallback(async () => {
    const [archiveData, bookmarkData] = await Promise.all([getArchive(), getBookmarks()]);
    setArchiveState(archiveData);
    setBookmarksState(bookmarkData);
    goToView('home');
  }, [goToView]);

  const handleLogout = useCallback(async () => {
    await logout();
    // onAuthStateChange(SIGNED_OUT) handles view + state reset
  }, []);

  // ─── Shared helper: run real AI analysis ─────────────────────────────────────
  const runAnalysis = useCallback(
    async (getText: () => Promise<string>, fallbackTitle: string, sourceType: 'url' | 'pdf', depth: 'quick' | 'deep') => {
      try {
        setLoadingStep(1);
        const text = await getText();
        setArticleText(text);

        setLoadingStep(2);
        await sleep(300);

        const { cards, title, summaryData: sd } = await generateCardsFromText(text, lang, depth, setLoadingStep);
        setSummaryData(sd);

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
    [goToView, lang]
  );

  // ─── Start learning ───────────────────────────────────────────────────────────
  const handleStart = useCallback(
    async (url: string, text: string, file: File | null, depth: 'quick' | 'deep') => {
      const trimmedUrl = url.trim();
      const trimmedText = text.trim();

      // ── PDF flow ───────────────────────────────────────────────────────────
      if (file) {
        const pdfTitle = file.name.replace(/\.pdf$/i, '');
        setSource({ type: 'pdf', title: pdfTitle });
        setSaved(false);
        setLoadingStep(0);
        setLoadingError(null);
        goToView('loading');
        await runAnalysis(() => parsePdfText(file), pdfTitle, 'pdf', depth);
        return;
      }

      // ── Text flow ──────────────────────────────────────────────────────────
      if (trimmedText) {
        const textTitle = trimmedText.slice(0, 40).replace(/\n/g, ' ') + '…';
        setSource({ type: 'url', title: textTitle });
        setSaved(false);
        setLoadingStep(0);
        setLoadingError(null);
        goToView('loading');
        await runAnalysis(() => Promise.resolve(trimmedText), textTitle, 'url', depth);
        return;
      }

      // ── Real URL analysis ──────────────────────────────────────────────────
      const urlTitle = extractTitleFromUrl(trimmedUrl);
      setSource({ type: 'url', title: urlTitle });
      setSaved(false);
      setLoadingStep(0);
      setLoadingError(null);
      goToView('loading');
      await runAnalysis(() => fetchArticleText(trimmedUrl), urlTitle, 'url', depth);
    },
    [goToView, runAnalysis]
  );

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
    if (card.type !== 'quiz' && card.type !== 'review' && card.type !== 'output' && card.type !== 'truefalse') return;
    setAnswers((prev) => {
      if (prev[cardIndex]) return prev;
      return { ...prev, [cardIndex]: { sel: letter, correct: letter === card.correct } };
    });
  }, [generatedCards]);

  const handleRestart = useCallback(() => {
    setIdx(0);
    setAnswers({});
    setSaved(false);
    goToView('learning');
  }, [goToView]);

  const handleViewSummary = useCallback(async () => {
    // Auto-save to archive when entering summary
    if (!saved) {
      const quizCards = generatedCards.filter(
        (c) => c.type === 'quiz' || c.type === 'review' || c.type === 'output' || c.type === 'truefalse'
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
        summaryData,
      };
      await addArchiveEntry(entry);
      setArchiveState((prev) => [entry, ...prev]);
      setSaved(true);
    }
    goToView('summary');
  }, [goToView, saved, generatedCards, answers, source, summaryData]);

  // ─── Bookmarks ────────────────────────────────────────────────────────────────
  const handleSaveBookmark = useCallback((resource: RelatedResource) => {
    setBookmarksState((prev) => {
      if (prev.some((b) => b.url === resource.url)) return prev;
      const entry: BookmarkEntry = {
        id: `bm-${Date.now()}`,
        title: resource.title,
        url: resource.url,
        desc: resource.desc,
        savedAt: new Date().toISOString().slice(0, 10),
      };
      addBookmark(entry); // optimistic update, fire-and-forget
      return [entry, ...prev];
    });
  }, []);

  const handleDeleteBookmark = useCallback((id: string) => {
    deleteBookmark(id); // fire-and-forget
    setBookmarksState((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const handleLearnBookmark = useCallback(
    async (bookmark: BookmarkEntry) => {
      setSaved(false);
      setLoadingStep(0);
      setLoadingError(null);
      goToView('loading');
      await runAnalysis(() => fetchArticleText(bookmark.url), bookmark.title, 'url', 'quick');
    },
    [goToView, runAnalysis]
  );

  // ─── Archive delete ───────────────────────────────────────────────────────────
  const handleDelete = useCallback(async (id: string) => {
    await deleteArchiveEntry(id);
    setArchiveState((prev) => prev.filter((e) => e.id !== id));
  }, []);

  // ─── Archive review ───────────────────────────────────────────────────────────
  const handleReview = useCallback(
    async (entry: ArchiveEntry) => {
      setSource({ type: entry.sourceType, title: entry.title });
      setGeneratedCards(entry.cards ?? []);
      setIdx(0);
      setAnswers({});
      setSaved(false);
      goToView('learning');
    },
    [goToView]
  );

  // ─── Render ───────────────────────────────────────────────────────────────────
  if (initializing) return null;

  if (view === 'auth') {
    return (
      <LangContext.Provider value={lang}>
        <AuthView onAuth={handleAuth} />
      </LangContext.Provider>
    );
  }

  return (
    <LangContext.Provider value={lang}>
      <Header onGoHome={goHome} onShowArchive={showArchive} lang={lang} onLangChange={setLang} onLogout={handleLogout} />
      <main className={styles.main}>
        <div
          key={`home-${viewKey}`}
          className={`${styles.view} ${view === 'home' ? styles.active : ''}`}
        >
          <HomeView onStart={handleStart} />
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
            articleText={articleText}
            onPrev={handlePrev}
            onNext={handleNext}
            onPickOption={handlePickOption}
            onGoHome={goHome}
            onViewSummary={handleViewSummary}
          />
        </div>

        <div
          key={`archive-${viewKey}`}
          className={`${styles.view} ${view === 'archive' ? styles.active : ''}`}
        >
          <ArchiveView
            entries={archive}
            bookmarks={bookmarks}
            onReview={handleReview}
            onDelete={handleDelete}
            onDeleteBookmark={handleDeleteBookmark}
            onLearnBookmark={handleLearnBookmark}
            onGoHome={goHome}
          />
        </div>

        <div
          key={`summary-${viewKey}`}
          className={`${styles.view} ${view === 'summary' ? styles.active : ''}`}
        >
          <SummaryView
            summaryData={summaryData}
            bookmarks={bookmarks}
            onSaveBookmark={handleSaveBookmark}
            onRestart={handleRestart}
            onGoHome={goHome}
          />
        </div>
      </main>
    </LangContext.Provider>
  );
}
