/**
 * Fetches article text from a URL using a cascading proxy strategy:
 *   1. Local Vite dev-server proxy  – server-side fetch, proper UA, no CORS (dev only)
 *   2. allorigins.win               – returns JSON { contents, status }
 *   3. api.codetabs.com             – returns raw HTML
 *   4. thingproxy.freeboard.io      – returns raw HTML
 *
 * Each proxy gets its own timeout; the function moves to the next on any failure.
 */

const MIN_CHARS = 150;
const TEXT_LIMIT = 8000;
const PER_PROXY_TIMEOUT_MS = 14000;

// ─── Proxy definitions ───────────────────────────────────────────────────────

interface ProxyDef {
  name: string;
  buildUrl: (url: string) => string;
  /** true = response is JSON { contents: string, status: { http_code: number } }
   *  false = response is raw HTML */
  json: boolean;
}

const PROXIES: ProxyDef[] = [
  {
    name: '本地开发代理',
    buildUrl: (url) => `/api/fetch-article?url=${encodeURIComponent(url)}`,
    json: true,
  },
  {
    name: 'AllOrigins',
    buildUrl: (url) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
    json: true,
  },
  {
    name: 'CodeTabs',
    buildUrl: (url) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
    json: false,
  },
  {
    name: 'ThingProxy',
    buildUrl: (url) => `https://thingproxy.freeboard.io/fetch/${url}`,
    json: false,
  },
];

// ─── Single-proxy attempt ─────────────────────────────────────────────────────

async function attemptProxy(
  proxy: ProxyDef,
  url: string,
  parentSignal: AbortSignal
): Promise<string> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), PER_PROXY_TIMEOUT_MS);
  // Cancel if the parent operation is aborted
  const onParentAbort = () => ctrl.abort();
  parentSignal.addEventListener('abort', onParentAbort, { once: true });

  try {
    const res = await fetch(proxy.buildUrl(url), { signal: ctrl.signal });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    let html: string;
    if (proxy.json) {
      const data = (await res.json()) as {
        contents?: string;
        status?: { http_code: number };
        error?: string;
      };
      if (data.error) throw new Error(data.error);
      if (!data.contents) throw new Error('空响应');
      if ((data.status?.http_code ?? 200) >= 400) {
        throw new Error(`目标页面 HTTP ${data.status!.http_code}`);
      }
      html = data.contents;
    } else {
      html = await res.text();
      if (!html || html.length < 50) throw new Error('空响应');
    }

    return html;
  } finally {
    clearTimeout(timer);
    parentSignal.removeEventListener('abort', onParentAbort);
  }
}

// ─── HTML → clean text ────────────────────────────────────────────────────────

function extractText(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Remove noise elements
  const noise = [
    'script', 'style', 'nav', 'header', 'footer', 'aside',
    'iframe', 'noscript', 'figure', 'figcaption',
    '.ad', '.ads', '.advertisement', '.adsbygoogle',
    '.sidebar', '.side-bar', '.menu', '.navbar', '.navigation',
    '.cookie', '.cookie-banner', '.popup', '.modal', '.overlay',
    '.share', '.social', '.related', '.recommended', '.comment',
    '[role="banner"]', '[role="navigation"]', '[role="complementary"]',
    '[role="dialog"]', '[aria-hidden="true"]',
  ];
  noise.forEach((sel) => {
    doc.querySelectorAll(sel).forEach((el) => el.remove());
  });

  // Site-specific + generic content selectors (first match wins)
  const contentSelectors = [
    // Common article containers
    'article',
    '[itemprop="articleBody"]',
    '[itemprop="text"]',
    // Platform-specific
    '.article-body',          // many news sites
    '.article-content',
    '.article__body',
    '.article__content',
    '.post-content',
    '.post-body',
    '.post__content',
    '.entry-content',
    '.entry-body',
    '.story-body',
    '.story-content',
    '.content-body',
    '.content__body',
    // Medium / Substack / Ghost
    '.section-content',
    '.section-inner',
    '[data-testid="post-container"]',  // Substack
    // Wikipedia
    '#mw-content-text',
    '.mw-parser-output',
    // Zhihu / Chinese platforms
    '.Post-RichTextContainer',
    '.RichText',
    '.article-detail',
    '.content-detail',
    // Generic fallbacks
    'main',
    '[role="main"]',
    '#main-content',
    '#content',
    '.content',
    '#article',
    '.article',
  ];

  for (const sel of contentSelectors) {
    const el = doc.querySelector(sel);
    if (el) {
      const text = (el.textContent ?? '').replace(/\s+/g, ' ').trim();
      if (text.length >= MIN_CHARS) return text;
    }
  }

  // Last-resort density scoring: find the div with the most text
  let best = doc.body;
  let bestLen = 0;
  doc.querySelectorAll('div, section, p').forEach((el) => {
    const len = (el.textContent ?? '').replace(/\s+/g, ' ').trim().length;
    if (len > bestLen) {
      bestLen = len;
      best = el as HTMLElement;
    }
  });

  return ((best?.textContent ?? doc.body?.textContent ?? '').replace(/\s+/g, ' ').trim());
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function fetchArticleText(url: string): Promise<string> {
  const overallCtrl = new AbortController();
  // 60-second overall cap so the user isn't stuck forever
  const overallTimer = setTimeout(() => overallCtrl.abort(), 60000);

  const errors: string[] = [];

  try {
    for (const proxy of PROXIES) {
      if (overallCtrl.signal.aborted) break;
      try {
        const html = await attemptProxy(proxy, url, overallCtrl.signal);
        const text = extractText(html);

        if (text.length < MIN_CHARS) {
          errors.push(`${proxy.name}: 提取文字不足（${text.length} 字）`);
          continue;
        }

        return text.slice(0, TEXT_LIMIT);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        errors.push(`${proxy.name}: ${msg}`);
        // Continue to next proxy
      }
    }
  } finally {
    clearTimeout(overallTimer);
  }

  // All proxies failed
  const summary = errors.join('\n  • ');
  throw new Error(
    `无法获取文章内容，所有代理均失败。\n\n可能原因：\n` +
    `  • 该页面需要登录或付费订阅\n` +
    `  • 该页面拦截了爬取请求\n` +
    `  • 你的网络无法访问代理服务\n\n` +
    `建议：使用公开可访问的文章链接（Wikipedia、博客、新闻等），或改用 PDF 上传。\n\n` +
    `详细错误：\n  • ${summary}`
  );
}
