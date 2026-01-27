import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fgnxnvfycbzyjgnprskc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnbnhudmZ5Y2J6eWpnbnByc2tjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MTQxMzUsImV4cCI6MjA4MjA5MDEzNX0.bxIPCswsLMSzYNPz3oXuW5iNCoouz9Qa-6ilkidZaHQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);