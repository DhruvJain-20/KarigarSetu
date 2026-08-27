import { createClient } from '@supabase/supabase-js';

// ============================================================================
// 1. SUPABASE URL & KEY SANITIZATION
// Ensures clean base origin without trailing slashes or subpaths (prevents 
// "Invalid path specified in request URL" errors from Supabase API Gateway).
// ============================================================================
function sanitizeSupabaseUrl(rawUrl) {
  const fallback = "https://uyyboellmqcmfudcajlp.supabase.co";
  if (!rawUrl || typeof rawUrl !== 'string') return fallback;
  let url = rawUrl.trim().replace(/^["']|["']$/g, '');
  if (!url) return fallback;

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }

  try {
    const parsed = new URL(url);
    // Return purely the origin (protocol + host), e.g. "https://uyyboellmqcmfudcajlp.supabase.co"
    return parsed.origin;
  } catch {
    return url.replace(/\/+$/, '').replace(/\/rest\/v1\/?$/i, '').replace(/\/auth\/v1\/?$/i, '');
  }
}

function sanitizeSupabaseKey(rawKey) {
  const fallback = "sb_publishable_YSGzuwDeNrk4XD8OrWIzYQ_lpW0fl9H";
  if (!rawKey || typeof rawKey !== 'string') return fallback;
  const key = rawKey.trim().replace(/^["']|["']$/g, '');
  return key || fallback;
}

const rawEnvUrl = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_SUPABASE_URL : undefined;
const rawEnvKey = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_SUPABASE_ANON_KEY : undefined;

export const SUPABASE_URL = sanitizeSupabaseUrl(rawEnvUrl);
export const SUPABASE_PUBLIC_KEY = sanitizeSupabaseKey(rawEnvKey);

// ============================================================================
// 2. SUPABASE CLIENT INSTANCE
// ============================================================================
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

