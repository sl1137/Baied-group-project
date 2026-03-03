export type ViewId = 'home' | 'loading' | 'learning' | 'archive';

export interface Source {
  type: 'url' | 'pdf';
  title: string;
}

export interface ContentCard {
  type: 'content';
  tag: string;
  tagCls: 'tagConcept';
  title: string;
  html: string;
}

export interface QuizOption {
  l: string;
  t: string;
}

export interface QuizCard {
  type: 'quiz';
  tag: string;
  tagCls: 'tagQuiz';
  title: string;
  question: string;
  options: QuizOption[];
  correct: string;
  explain: string;
}

/** Mid-point review card: shows 已学要点 summary line + a quiz question */
export interface ReviewCard {
  type: 'review';
  tag: string;
  tagCls: 'tagReview';
  title: string;
  keyPoints: string;
  question: string;
  options: QuizOption[];
  correct: string;
  explain: string;
}

/** Final output-closure card: shows a summary paragraph + a quiz question */
export interface OutputCard {
  type: 'output';
  tag: string;
  tagCls: 'tagOutput';
  title: string;
  summary: string;
  question: string;
  options: QuizOption[];
  correct: string;
  explain: string;
}

export interface CompleteCard {
  type: 'complete';
}

export type Card = ContentCard | QuizCard | ReviewCard | OutputCard | CompleteCard;

export interface Answer {
  sel: string;
  correct: boolean;
}

export type Answers = Record<number, Answer>;

export interface ArchiveEntry {
  id: string;
  title: string;
  sourceType: 'url' | 'pdf';
  date: string;
  score: string;
  perfect: boolean;
  cards?: Card[];
}

export type AnimDirection = 'forward' | 'backward';
