import type { ArchiveEntry } from '../types';
import { DEFAULTS } from '../data/cards';

const KEY = 'mk-archive';

export function getArchive(): ArchiveEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as ArchiveEntry[];
    // First visit: seed defaults
    setArchive([...DEFAULTS]);
    return [...DEFAULTS];
  } catch {
    return [...DEFAULTS];
  }
}

export function setArchive(arr: ArchiveEntry[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(arr));
  } catch {
    // Storage quota exceeded or private browsing — fail silently
  }
}
