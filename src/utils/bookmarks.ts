import { supabase } from './supabase';
import type { BookmarkEntry } from '../types';

export async function getBookmarks(): Promise<BookmarkEntry[]> {
  const { data, error } = await supabase
    .from('bookmarks')
    .select('*')
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data.map((row) => ({
    id: row.id,
    title: row.title,
    url: row.url,
    desc: row.desc,
    savedAt: row.saved_at,
  }));
}

export async function addBookmark(entry: BookmarkEntry): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from('bookmarks').insert({
    id: entry.id,
    user_id: user.id,
    title: entry.title,
    url: entry.url,
    desc: entry.desc,
    saved_at: entry.savedAt,
  });
}

export async function deleteBookmark(id: string): Promise<void> {
  await supabase.from('bookmarks').delete().eq('id', id);
}
