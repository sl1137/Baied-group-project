import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Dev-only plugin: exposes /api/fetch-article?url=X as a server-side proxy.
// The dev server fetches the target URL using Node's built-in fetch (no CORS
// restrictions, full User-Agent control), then returns the HTML as JSON in the
// same shape as allorigins.win so the client code is uniform.
function articleFetchPlugin() {
  return {
    name: 'article-fetch-proxy',
    configureServer(server: import('vite').ViteDevServer) {
      server.middlewares.use('/api/fetch-article', async (req, res) => {
        const qs = (req.url ?? '').slice(1);
        const targetUrl = new URLSearchParams(qs).get('url') ?? '';

        if (!targetUrl) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Missing url parameter' }));
          return;
        }

        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 18000);

        try {
          const upstream = await fetch(targetUrl, {
            signal: ctrl.signal,
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) ' +
                'AppleWebKit/537.36 (KHTML, like Gecko) ' +
                'Chrome/122.0.0.0 Safari/537.36',
              Accept:
                'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
              'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            },
          });
          clearTimeout(timer);

          const html = await upstream.text();
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(
            JSON.stringify({
              contents: html,
              status: { http_code: upstream.status },
            })
          );
        } catch (e) {
          clearTimeout(timer);
          res.statusCode = 502;
          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({ error: e instanceof Error ? e.message : 'Upstream fetch failed' })
          );
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), articleFetchPlugin()],
  css: {
    modules: {
      localsConvention: 'camelCase',
    },
  },
});
