import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xcvihsjlcwpumwasppyk.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhjdmloc2psY3dwdW13YXNwcHlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3MTA2MDQsImV4cCI6MjEwNDI4NjYwNH0.Gf7A_33RFsAZB7w8botUyhehMuhlLR4c-pCoFS8Ys1U';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
