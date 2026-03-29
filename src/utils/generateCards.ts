import type { Card, SummaryData } from '../types';
import type { Lang } from '../i18n';

interface RawCard {
  type: string;
  tag?: string;
  title?: string;
  html?: string;
  keyPoints?: string;
  summary?: string;
  question?: string;
  options?: Array<{ l: string; t: string }>;
  correct?: string;
  explain?: string;
}

interface GenerateResult {
  cards: Card[];
  title: string;
  summaryData: SummaryData;
}

/** Progressively tries to extract valid JSON from a model response. */
function parseJsonRobust(raw: string): { articleTitle: string; cards: RawCard[]; insights?: string[]; relatedReading?: Array<{ title: string; url: string; desc: string }> } {
  const stripped = raw
    .replace(/^[\s\S]*?```(?:json)?[ \t]*/i, '')
    .replace(/\s*```[\s\S]*$/i, '')
    .trim();

  for (const candidate of [stripped, raw]) {
    try { return JSON.parse(candidate); } catch { /* continue */ }

    const start = candidate.indexOf('{');
    const end = candidate.lastIndexOf('}');
    if (start !== -1 && end > start) {
      const extracted = candidate.slice(start, end + 1);
      try { return JSON.parse(extracted); } catch { /* continue */ }

      const sanitized = extracted.replace(/[\x00-\x1F\x7F]/g, (c) => {
        if (c === '\n') return '\\n';
        if (c === '\r') return '\\r';
        if (c === '\t') return '\\t';
        return '';
      });
      try { return JSON.parse(sanitized); } catch { /* continue */ }
    }
  }

  throw new Error(
    'AI 返回的 JSON 无法解析，请重试。\n（提示：尝试使用内容更清晰的文章链接，或更换一篇）'
  );
}

export async function generateCardsFromText(
  text: string,
  lang: Lang,
  depth: 'quick' | 'deep',
  onStep: (step: number) => void
): Promise<GenerateResult> {
  onStep(3);

  const response = await fetch('/api/ai/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, lang, depth }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({})) as { error?: string };
    if (response.status === 401) throw new Error('DeepSeek API Key 无效，请检查 server/.env 配置');
    if (response.status === 429) throw new Error('请求过于频繁，请稍后重试');
    throw new Error(errData.error || `AI 服务错误 (${response.status})`);
  }

  const data = await response.json() as { content: string };
  const rawText = data.content || '';
  const parsed = parseJsonRobust(rawText);

  if (!Array.isArray(parsed.cards) || parsed.cards.length === 0) {
    throw new Error('AI 未能生成有效的学习卡片，请重试');
  }

  const cards: Card[] = parsed.cards.map((c: RawCard) => {
    if (c.type === 'review') {
      return {
        type: 'review' as const,
        tag: c.tag || '阶段复习',
        tagCls: 'tagReview' as const,
        title: c.title || '阶段复习',
        keyPoints: c.keyPoints || '',
        question: c.question || '',
        options: c.options || [],
        correct: c.correct || 'A',
        explain: c.explain || '',
      };
    }
    if (c.type === 'output') {
      return {
        type: 'output' as const,
        tag: c.tag || '输出闭环',
        tagCls: 'tagOutput' as const,
        title: c.title || '输出闭环',
        summary: c.summary || '',
        question: c.question || '',
        options: c.options || [],
        correct: c.correct || 'A',
        explain: c.explain || '',
      };
    }
    if (c.type === 'quiz') {
      return {
        type: 'quiz' as const,
        tag: c.tag || '知识测验',
        tagCls: 'tagQuiz' as const,
        title: c.title || '小测验',
        question: c.question || '',
        options: c.options || [],
        correct: c.correct || 'A',
        explain: c.explain || '',
      };
    }
    if (c.type === 'truefalse') {
      return {
        type: 'truefalse' as const,
        tag: c.tag || '判断题',
        tagCls: 'tagTf' as const,
        title: c.title || '',
        correct: (c.correct as 'T' | 'F') || 'F',
        explain: c.explain || '',
      };
    }
    return {
      type: 'content' as const,
      tag: c.tag || '知识点',
      tagCls: 'tagConcept' as const,
      title: c.title || '',
      html: c.html || '<p>内容加载失败</p>',
    };
  });

  return {
    cards,
    title: parsed.articleTitle || '文章学习',
    summaryData: {
      insights: parsed.insights || [],
      relatedReading: parsed.relatedReading || [],
    },
  };
}
