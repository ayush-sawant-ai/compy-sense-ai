import { supabase } from '@/lib/supabase';
import type { Competitor, Insight } from '@/lib/supabase';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export const competitorService = {
  async getCompetitors(): Promise<Competitor[]> {
    const { data, error } = await supabase
      .from('competitors')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async addCompetitor(competitor: {
    name: string;
    logo: string;
    website: string;
    description: string;
  }): Promise<Competitor> {
    const { data, error } = await supabase
      .from('competitors')
      .insert(competitor)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async scrapeAndAnalyze(competitorId: string, website: string, competitorName: string): Promise<void> {
    const scrapeResponse = await fetch(`${SUPABASE_URL}/functions/v1/scrape-competitor`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ competitorId, website }),
    });

    if (!scrapeResponse.ok) {
      throw new Error('Failed to scrape competitor website');
    }

    const scrapeData = await scrapeResponse.json();
    const scrapedContent = scrapeData.data?.markdown || scrapeData.data?.text || '';

    if (!scrapedContent) {
      throw new Error('No content scraped from website');
    }

    const analyzeResponse = await fetch(`${SUPABASE_URL}/functions/v1/analyze-insights`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        competitorId,
        scrapedContent,
        competitorName,
      }),
    });

    if (!analyzeResponse.ok) {
      throw new Error('Failed to analyze insights');
    }
  },

  async getInsights(): Promise<(Insight & { competitor: Competitor })[]> {
    const { data, error } = await supabase
      .from('insights')
      .select(`
        *,
        competitor:competitors(*)
      `)
      .order('timestamp', { ascending: false });

    if (error) throw error;

    return (data || []).map((item: any) => ({
      ...item,
      competitor: item.competitor,
    }));
  },

  async markInsightAsRead(insightId: string): Promise<void> {
    const { error } = await supabase
      .from('insights')
      .update({ is_read: true })
      .eq('id', insightId);

    if (error) throw error;
  },

  async refreshInsights(competitorId: string): Promise<void> {
    const { data: competitor, error } = await supabase
      .from('competitors')
      .select('*')
      .eq('id', competitorId)
      .single();

    if (error || !competitor) throw new Error('Competitor not found');

    await this.scrapeAndAnalyze(competitor.id, competitor.website, competitor.name);
  },
};
