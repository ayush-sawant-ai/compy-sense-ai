import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Competitor {
  id: string;
  name: string;
  logo: string;
  website: string;
  description: string;
  last_checked: string;
  created_at: string;
  updated_at: string;
}

export interface Insight {
  id: string;
  competitor_id: string;
  title: string;
  description: string;
  category: 'product' | 'funding' | 'partnership' | 'launch';
  is_read: boolean;
  source_url?: string;
  embedding?: number[];
  timestamp: string;
  created_at: string;
}

export interface ScrapingJob {
  id: string;
  competitor_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  apify_run_id?: string;
  result_data?: any;
  error_message?: string;
  created_at: string;
  completed_at?: string;
}
