import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hcjgxuumdqaigtlejakp.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_EV61WYp14Bm6Ky_2sjeGCQ_ZaJ-Qd5Q';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
