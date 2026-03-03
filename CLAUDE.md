# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 常用命令

```bash
npm run dev       # 启动开发服务器，地址 http://localhost:5173
npm run build     # 类型检查（tsc -b）后用 Vite 打包
npm run lint      # ESLint 检查
npm run preview   # 本地预览生产构建
```

本项目未配置测试框架。

## 架构概览

单页 React 19 应用。所有共享状态集中在 `App.tsx`，组件均为纯展示层。

### 视图路由

项目没有路由库。四个视图（`home`、`loading`、`learning`、`archive`）同时挂载在 DOM 中，仅当前激活视图拥有 `styles.active`（触发 CSS `fadeUp` 动画）。每次切换视图时 `viewKey` 自增，使激活的 `<div key={...}>` 重新挂载以重新触发入场动画。

### 卡片系统

卡片类型定义在 `src/types/index.ts`，共五种：

| 类型 | 组件 | 说明 |
|------|------|------|
| `content` | `ContentCard` | 通过 `dangerouslySetInnerHTML` 渲染 `html` 字段 |
| `quiz` | `QuizCard` | 标准四选一题 |
| `review` | `ReviewCard` | 阶段复习卡：显示 `keyPoints` 已学要点行 + 测验题 |
| `output` | `OutputCard` | 输出闭环卡：显示 `summary` 总结段落 + 测验题 |
| `complete` | `CompleteCard` | 完成页：得分汇总 + 保存/重新开始 |

`LearningView` 根据 `card.type` 分发渲染。`needsAnswer` 会锁住 `quiz`、`review`、`output` 卡的「下一张」按钮，直到用户作答。卡片索引与 `Answers`（`Record<cardIndex, {sel, correct}>`）均由 `App.tsx` 管理。

**得分计数**：所有需要统计测验卡的地方必须同时包含三种交互类型 `quiz | review | output`，涉及 `App.tsx`（handlePickOption、handleSave）和 `CompleteCard.tsx`。

### 卡片切换动画

`src/hooks/useCardAnimation.ts` 中的 `useCardAnimation` hook：滑出（240 ms）→ 更新索引 → 滑入（340 ms）。`busyRef` 防止重复触发。动画 CSS 类（`out-left`、`in-left` 等）是定义在 `src/styles/global.css` 中的**全局类**，而非 CSS Modules，因此可以直接以字符串形式应用。

### CSS 策略

- `src/styles/global.css`：设计 token（`:root`）、全局 reset、`@keyframes`，以及 `dangerouslySetInnerHTML` 内部使用的全局类 `.kblock` / `.kblock-name` / `.kblock-desc`。所有新增全局动画类都应写在这里。
- 所有组件使用同目录的 `.module.css` 文件，采用 `camelCase` 命名（`vite.config.ts` 中配置了 `css.modules.localsConvention: 'camelCase'`）。
- 标签色彩类（`tagConcept`、`tagQuiz`、`tagReview`、`tagOutput`、`tagDone`）定义在 `cards.module.css` 中，必须与 `types/index.ts` 里 `tagCls` 的字面量联合类型保持一致。

### 真实 URL/PDF 分析数据流

1. `HomeView` 调用 `App.handleStart(url, file)`
2. App 跳转到 `loading` 视图，调用 `runAnalysis(getText, fallbackTitle, type)`
3. `getText` 为 `fetchArticleText(url)` 或 `parsePdfText(file)`
4. 结果传入 `generateCardsFromText(text, apiKey, onStep)` → Anthropic API → 解析 JSON → `Card[]`
5. 更新 `generatedCards` 状态，App 跳转到 `learning` 视图

**未设置 API Key 时**，URL 和 PDF 路径均回退到 `runDemoFlow`，加载 `src/data/cards.ts` 中的硬编码 `CARDS`。

### URL 抓取（CORS 代理瀑布）

`fetchArticle.ts` 按顺序尝试四个代理，每个代理独立超时 14 秒，整体上限 60 秒：

1. `/api/fetch-article` — 本地 Vite 开发中间件（配置在 `vite.config.ts`），服务端抓取，携带完整 UA 请求头；**仅在 `npm run dev` 下有效**
2. `api.allorigins.win` — 返回 JSON 包装的响应
3. `api.codetabs.com` — 返回原始 HTML
4. `thingproxy.freeboard.io` — 返回原始 HTML

### localStorage 键

| 键名 | 内容 |
|------|------|
| `mk-api-key` | Anthropic API Key 字符串 |
| `mk-archive` | `ArchiveEntry[]` JSON，含完整 `cards` 数组，用于档案复盘时还原原始卡片内容 |

### PDF 解析

`parsePdf.ts` 使用 `pdfjs-dist` v5。Worker 通过 Vite 的 `?url` 导入（`pdfjs-dist/build/pdf.worker.min.mjs?url`）加载，在模块加载时设置到 `GlobalWorkerOptions.workerSrc`。最多处理 40 页 / 8000 字符。

### AI 提示词约定（generateCards.ts）

提示词要求 AI 严格生成 10 张卡片，固定顺序为：3 内容 → 1 阶段复习 → 2 内容 → 1 测验 → 1 内容 → 1 测验 → 1 输出闭环。完成卡由 App 追加，不由 AI 生成。`max_tokens` 为 6000。卡片 HTML 内容的属性必须使用**单引号**（`class='kblock'`），避免 JSON 转义失败。
