import { createClient } from '@supabase/supabase-js';

// ============================================================================
// 1. SUPABASE URL
// Paste your Supabase Project URL below (e.g., https://xyz.supabase.co):
// ============================================================================
const SUPABASE_URL = "https://uyyboellmqcmfudcajlp.supabase.co";

// ============================================================================
// 2. SUPABASE PUBLIC / ANON KEY
// Paste your Supabase Public / Anon API Key below:
// ============================================================================
const SUPABASE_PUBLIC_KEY = "sb_publishable_YSGzuwDeNrk4XD8OrWIzYQ_lpW0fl9H";

// ============================================================================
// 3. SUPABASE CLIENT INSTANCE
// Use this 'supabase' client throughout your app to query tables and manage auth.
// ============================================================================
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);
