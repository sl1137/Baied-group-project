/**
 * Derives a human-readable title from any URL.
 * Strategy (in priority order):
 *  1. Known demo URLs → hardcoded Chinese title
 *  2. Last meaningful path segment, de-slugged & Title Cased
 *  3. Hostname brand name (strips www/m prefix)
 *  4. Fallback generic title
 *
 * Purely client-side — no network request made.
 */
export function extractTitleFromUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '文章学习';

  // 1. Known demo pattern
  if (trimmed.includes('machine-learning')) return '机器学习基础';

  let parsed: URL;
  try {
    const withProto = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    parsed = new URL(withProto);
  } catch {
    // Not a valid URL — use raw string as title (up to 40 chars)
    return trimmed.length <= 40 ? trimmed : trimmed.slice(0, 40) + '…';
  }

  // 2. Try last meaningful path segment
  const segments = parsed.pathname
    .split('/')
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !/^\d+$/.test(s));

  if (segments.length > 0) {
    const slug = segments[segments.length - 1]
      .replace(/\.[a-z]{2,4}$/i, '')       // strip extensions
      .replace(/[-_]+/g, ' ')               // hyphens/underscores → spaces
      .replace(/\b\w/g, (c) => c.toUpperCase()); // Title Case

    if (slug.length >= 3) return slug;
  }

  // 3. Fall back to hostname brand name
  const hostname = parsed.hostname.replace(/^(www|m|mobile)\./i, '');
  const brand = hostname.split('.')[0];
  if (brand && brand.length >= 2) {
    return brand.charAt(0).toUpperCase() + brand.slice(1) + ' 文章';
  }

  // 4. Absolute fallback
  return '文章学习';
}
