import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';
import type { TextItem } from 'pdfjs-dist/types/src/display/api';
// Use Vite's ?url import to get the bundled worker file URL
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Set the worker source once at module load time
GlobalWorkerOptions.workerSrc = workerUrl;

/**
 * Extracts plain text from a PDF File object using PDF.js.
 * Works entirely in the browser — no server needed.
 */
export async function parsePdfText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();

  const pdf = await getDocument({ data: arrayBuffer }).promise;

  const pageTexts: string[] = [];
  // Cap at 40 pages to keep the text within Claude's context limits
  const pageLimit = Math.min(pdf.numPages, 40);

  for (let i = 1; i <= pageLimit; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .filter((item): item is TextItem => 'str' in item)
      .map((item) => (item as TextItem).str)
      .join(' ');
    pageTexts.push(pageText);
  }

  const text = pageTexts.join('\n').replace(/\s+/g, ' ').trim();

  if (text.length < 100) {
    throw new Error(
      'PDF 文字提取失败（少于100字）。\n该文件可能是扫描版图片 PDF，目前暂不支持图片识别，请使用含有可选中文字的 PDF。'
    );
  }

  // Trim to 8000 chars to keep Claude API cost reasonable
  return text.slice(0, 8000);
}
