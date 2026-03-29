export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, articleText, lang } = req.body;
  if (!message) return res.status(400).json({ error: 'Missing message' });

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

  const systemPrompt = lang === 'zh'
    ? `你是一个简洁的学习助手。用户正在阅读以下文章：\n\n${articleText || '（文章内容未提供）'}\n\n规则：\n- 只基于文章内容回答\n- 回答必须在2-4句话以内，简洁直接\n- 如果问题与文章无关，礼貌地说明你只能回答文章相关问题`
    : `You are a concise learning assistant. The user is reading this article:\n\n${articleText || '(Article content not available)'}\n\nRules:\n- Only answer based on the article content\n- Keep answers to 2-4 sentences, be direct and clear\n- If the question is unrelated to the article, politely say you can only answer article-related questions`;

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'deepseek-chat',
        max_tokens: 300,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
      }),
    });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data.error?.message || 'AI error' });
    res.json({ reply: data.choices?.[0]?.message?.content ?? '' });
  } catch (err) {
    res.status(502).json({ error: err instanceof Error ? err.message : 'Request failed' });
  }
}
