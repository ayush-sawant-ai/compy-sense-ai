import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface EmbeddingRequest {
  insightId: string;
  text: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { insightId, text }: EmbeddingRequest = await req.json();

    if (!insightId || !text) {
      return new Response(
        JSON.stringify({ error: 'insightId and text are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const hfApiKey = Deno.env.get('HUGGINGFACE_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    const supabase = createClient(supabaseUrl!, supabaseKey!);

    const hfResponse = await fetch(
      'https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${hfApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: text.substring(0, 1000),
        }),
      }
    );

    if (!hfResponse.ok) {
      const errorText = await hfResponse.text();
      throw new Error(`HuggingFace API error: ${errorText}`);
    }

    const embedding = await hfResponse.json();

    const { data, error } = await supabase
      .from('insights')
      .update({ embedding: embedding })
      .eq('id', insightId)
      .select()
      .single();

    if (error) {
      throw new Error(`Database update failed: ${error.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        insightId,
        embeddingDimension: Array.isArray(embedding) ? embedding.length : 0,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error generating embedding:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to generate embedding',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});