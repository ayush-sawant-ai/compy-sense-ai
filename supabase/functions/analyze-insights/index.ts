import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface AnalyzeRequest {
  competitorId: string;
  scrapedContent: string;
  competitorName: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { competitorId, scrapedContent, competitorName }: AnalyzeRequest = await req.json();

    if (!competitorId || !scrapedContent || !competitorName) {
      return new Response(
        JSON.stringify({ error: 'competitorId, scrapedContent, and competitorName are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    const supabase = createClient(supabaseUrl!, supabaseKey!);

    const prompt = `Analyze the following content from ${competitorName}'s website and extract key competitive insights.

Content:
${scrapedContent.substring(0, 8000)}

Please identify and extract:
1. New product launches or features
2. Funding announcements
3. Strategic partnerships
4. Major company updates

For each insight found, provide:
- Title (brief, catchy headline)
- Description (2-3 sentences)
- Category (product, funding, partnership, or launch)

Format your response as a JSON array of insights. If no significant insights are found, return an empty array.

Example format:
[
  {
    "title": "New AI Feature Launch",
    "description": "Company announced revolutionary AI feature that transforms user experience.",
    "category": "launch"
  }
]`;

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        }),
      }
    );

    if (!geminiResponse.ok) {
      throw new Error('Gemini API request failed');
    }

    const geminiData = await geminiResponse.json();
    const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
    
    const jsonMatch = responseText.match(/\[([\s\S]*)\]/);
    const insights = jsonMatch ? JSON.parse('[' + jsonMatch[1] + ']') : [];

    const insertedInsights = [];
    for (const insight of insights) {
      const { data, error } = await supabase
        .from('insights')
        .insert({
          competitor_id: competitorId,
          title: insight.title,
          description: insight.description,
          category: insight.category,
          is_read: false,
          timestamp: new Date().toISOString(),
        })
        .select()
        .single();

      if (!error && data) {
        insertedInsights.push(data);
      }
    }

    await supabase
      .from('competitors')
      .update({ last_checked: new Date().toISOString() })
      .eq('id', competitorId);

    return new Response(
      JSON.stringify({
        success: true,
        insightsCount: insertedInsights.length,
        insights: insertedInsights,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error analyzing insights:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to analyze insights',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});