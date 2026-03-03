import type { Card } from '../types';

const SYSTEM_PROMPT = `你是一位专业的知识拆解与教学设计专家。根据用户提供的文章内容，生成一组结构化的学习卡片。

要求：
- 生成恰好 10 张卡片（不含最终完成卡），按以下顺序：
  - 卡片1：概念介绍（文章核心主题是什么）
  - 卡片2：核心要点（主要观点或分类）
  - 卡片3：【测验】概念理解——针对前两张核心概念出一道4选1题
  - 卡片4：【阶段复习】中间检测——列出已学要点（3-4个关键词，逗号分隔），再出一道综合题检测卡片1-3的掌握情况
  - 卡片5：深入理解（深入一个重要细节或机制）
  - 卡片6：应用场景（实际例子、数据、案例）
  - 卡片7：【测验】因果逻辑——考察原因、机制或影响的一道4选1题
  - 卡片8：关键概念（另一个重要概念或进阶知识点）
  - 卡片9：【测验】应用判断——给定一个具体场景，判断正确行动或结论
  - 卡片10：【输出闭环】总结卡——一段话精炼总结全文核心，再出一道综合应用判断题

- 内容卡的 html 字段只能包含以下 HTML（属性必须用单引号，避免 JSON 转义问题）：
  - <p>段落文字，可用<strong>加粗</strong></p>
  - <div class='kblock'><div class='kblock-name'>概念名称</div><div class='kblock-desc'>概念解释</div></div>

- 所有文字必须使用中文输出（专有名词可附英文）
- 内容要忠实于原文，不要编造原文没有的信息
- 测验题的正确答案必须来源于文章内容

请严格按照以下 JSON 格式输出，不要添加任何额外文字或 markdown 代码块：
{
  "articleTitle": "文章标题（简洁，不超过20字）",
  "cards": [
    {
      "type": "content",
      "tag": "概念介绍",
      "title": "卡片标题",
      "html": "<p>内容...</p><div class='kblock'><div class='kblock-name'>名称</div><div class='kblock-desc'>描述</div></div>"
    },
    {
      "type": "quiz",
      "tag": "知识测验",
      "title": "概念理解",
      "question": "问题？",
      "options": [
        {"l": "A", "t": "选项A"},
        {"l": "B", "t": "选项B"},
        {"l": "C", "t": "选项C"},
        {"l": "D", "t": "选项D"}
      ],
      "correct": "B",
      "explain": "正确答案是B，因为..."
    },
    {
      "type": "review",
      "tag": "阶段复习",
      "title": "阶段复习：核心概念检测",
      "keyPoints": "要点1、要点2、要点3",
      "question": "综合检测题？",
      "options": [
        {"l": "A", "t": "选项A"},
        {"l": "B", "t": "选项B"},
        {"l": "C", "t": "选项C"},
        {"l": "D", "t": "选项D"}
      ],
      "correct": "C",
      "explain": "正确答案是C，因为..."
    },
    {
      "type": "output",
      "tag": "输出闭环",
      "title": "输出闭环：...",
      "summary": "一段精炼的总结文字，概括文章的核心洞见。",
      "question": "综合应用判断题？",
      "options": [
        {"l": "A", "t": "选项A"},
        {"l": "B", "t": "选项B"},
        {"l": "C", "t": "选项C"},
        {"l": "D", "t": "选项D"}
      ],
      "correct": "D",
      "explain": "正确答案是D，因为..."
    }
  ]
}`;

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
}

/** Progressively tries to extract valid JSON from a model response. */
function parseJsonRobust(raw: string): { articleTitle: string; cards: RawCard[] } {
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
  apiKey: string,
  onStep: (step: number) => void
): Promise<GenerateResult> {
  onStep(3);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 6000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `请根据以下文章内容生成学习卡片：\n\n${text}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({})) as {
      error?: { message?: string; type?: string };
    };
    if (response.status === 401) throw new Error('API Key 无效，请检查并重新输入');
    if (response.status === 403) throw new Error('API Key 权限不足，请确认账号状态');
    if (response.status === 429) throw new Error('请求过于频繁，请稍后重试');
    throw new Error(errData.error?.message || `AI 服务错误 (${response.status})`);
  }

  const data = await response.json() as {
    content: Array<{ type: string; text: string }>;
  };

  const rawText = data.content.find(c => c.type === 'text')?.text || '';
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
    return {
      type: 'content' as const,
      tag: c.tag || '知识点',
      tagCls: 'tagConcept' as const,
      title: c.title || '',
      html: c.html || '<p>内容加载失败</p>',
    };
  });

  cards.push({ type: 'complete' });

  return {
    cards,
    title: parsed.articleTitle || '文章学习',
  };
}
