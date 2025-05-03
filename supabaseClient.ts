import { createClient } from '@supabase/supabase-js';

// Placeholder values - Replace with your actual Supabase URL and Anon Key
// These should ideally be stored in environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

if (!supabaseUrl || supabaseUrl === 'YOUR_SUPABASE_URL') {
  console.warn('Supabase URL is not configured. Please provide REACT_APP_SUPABASE_URL environment variable.');
}

if (!supabaseAnonKey || supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY') {
  console.warn('Supabase Anon Key is not configured. Please provide REACT_APP_SUPABASE_ANON_KEY environment variable.');
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

