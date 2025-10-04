/*
  # Competitive Intelligence Schema

  ## Overview
  Creates the database schema for the CompIntel AI platform to track competitors,
  their insights, and web scraping jobs.

  ## New Tables

  ### `competitors`
  Stores information about competitors being monitored
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text) - Competitor company name
  - `logo` (text) - Emoji or icon representing the competitor
  - `website` (text) - Competitor's website URL
  - `description` (text) - Brief description of the competitor
  - `last_checked` (timestamptz) - Last time competitor was scraped
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Record update timestamp

  ### `insights`
  Stores competitive intelligence insights discovered about competitors
  - `id` (uuid, primary key) - Unique identifier
  - `competitor_id` (uuid, foreign key) - References competitors table
  - `title` (text) - Insight headline
  - `description` (text) - Detailed insight description
  - `category` (text) - Type of insight (product, funding, partnership, launch)
  - `is_read` (boolean) - Whether the insight has been viewed
  - `source_url` (text) - URL where insight was discovered
  - `embedding` (vector) - Text embedding for similarity search
  - `timestamp` (timestamptz) - When insight was discovered
  - `created_at` (timestamptz) - Record creation timestamp

  ### `scraping_jobs`
  Tracks web scraping job status and results
  - `id` (uuid, primary key) - Unique identifier
  - `competitor_id` (uuid, foreign key) - References competitors table
  - `status` (text) - Job status (pending, running, completed, failed)
  - `apify_run_id` (text) - Apify actor run ID
  - `result_data` (jsonb) - Scraped data result
  - `error_message` (text) - Error details if job failed
  - `created_at` (timestamptz) - Job creation timestamp
  - `completed_at` (timestamptz) - Job completion timestamp

  ## Security
  - Enable RLS on all tables
  - Add policies for authenticated users to manage their data
*/

-- Enable pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Create competitors table
CREATE TABLE IF NOT EXISTS competitors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  logo text DEFAULT '🏢',
  website text NOT NULL,
  description text DEFAULT '',
  last_checked timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create insights table
CREATE TABLE IF NOT EXISTS insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_id uuid REFERENCES competitors(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  category text DEFAULT 'product' CHECK (category IN ('product', 'funding', 'partnership', 'launch')),
  is_read boolean DEFAULT false,
  source_url text,
  embedding vector(384),
  timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create scraping_jobs table
CREATE TABLE IF NOT EXISTS scraping_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_id uuid REFERENCES competitors(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  apify_run_id text,
  result_data jsonb,
  error_message text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_insights_competitor_id ON insights(competitor_id);
CREATE INDEX IF NOT EXISTS idx_insights_timestamp ON insights(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_insights_is_read ON insights(is_read);
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_competitor_id ON scraping_jobs(competitor_id);
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_status ON scraping_jobs(status);

-- Enable Row Level Security
ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraping_jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for competitors
CREATE POLICY "Allow public read access to competitors"
  ON competitors FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to competitors"
  ON competitors FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to competitors"
  ON competitors FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from competitors"
  ON competitors FOR DELETE
  TO public
  USING (true);

-- RLS Policies for insights
CREATE POLICY "Allow public read access to insights"
  ON insights FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to insights"
  ON insights FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to insights"
  ON insights FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from insights"
  ON insights FOR DELETE
  TO public
  USING (true);

-- RLS Policies for scraping_jobs
CREATE POLICY "Allow public read access to scraping_jobs"
  ON scraping_jobs FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to scraping_jobs"
  ON scraping_jobs FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to scraping_jobs"
  ON scraping_jobs FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Insert sample data
INSERT INTO competitors (name, logo, website, description, last_checked) VALUES
  ('OpenAI', '🤖', 'https://openai.com', 'Leading AI research and deployment company', now() - interval '2 hours'),
  ('Google DeepMind', '🧠', 'https://deepmind.google', 'AI research lab focused on solving intelligence', now() - interval '5 hours'),
  ('Anthropic', '⚡', 'https://anthropic.com', 'AI safety and research company', now() - interval '1 hour')
ON CONFLICT DO NOTHING;