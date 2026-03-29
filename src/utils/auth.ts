import { supabase } from './supabase';

// Username is converted to a pseudo-email for Supabase Auth.
// Users only ever see "username" in the UI.
function toEmail(username: string): string {
  return `${username.toLowerCase().trim()}@mk.app`;
}

export async function register(username: string, password: string): Promise<string | null> {
  const trimmed = username.trim();
  if (!trimmed || !password) return '用户名和密码不能为空';
  const { error } = await supabase.auth.signUp({ email: toEmail(trimmed), password });
  if (error) {
    if (error.message.toLowerCase().includes('already registered')) return '用户名已被占用';
    return error.message;
  }
  return null;
}

export async function login(username: string, password: string): Promise<string | null> {
  const trimmed = username.trim();
  const { error } = await supabase.auth.signInWithPassword({
    email: toEmail(trimmed),
    password,
  });
  if (error) {
    if (error.message.toLowerCase().includes('invalid login credentials')) return '用户名或密码错误';
    return error.message;
  }
  return null;
}

export async function logout(): Promise<void> {
  await supabase.auth.signOut();
}
