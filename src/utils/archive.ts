import { supabase } from './supabase';
import type { ArchiveEntry } from '../types';

export async function getArchive(): Promise<ArchiveEntry[]> {
  const { data, error } = await supabase
    .from('archive')
    .select('*')
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data.map((row) => ({
    id: row.id,
    title: row.title,
    sourceType: row.source_type as 'url' | 'pdf',
    date: row.date,
    score: row.score,
    perfect: row.perfect,
    cards: row.cards ?? undefined,
    summaryData: row.summary_data ?? undefined,
  }));
}

export async function addArchiveEntry(entry: ArchiveEntry): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from('archive').insert({
    id: entry.id,
    user_id: user.id,
    title: entry.title,
    source_type: entry.sourceType,
    date: entry.date,
    score: entry.score,
    perfect: entry.perfect,
    cards: entry.cards ?? null,
    summary_data: entry.summaryData ?? null,
  });
}

export async function deleteArchiveEntry(id: string): Promise<void> {
  await supabase.from('archive').delete().eq('id', id);
}
