import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface ScrapeRequest {
  competitorId: string;
  website: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { competitorId, website }: ScrapeRequest = await req.json();

    if (!competitorId || !website) {
      return new Response(
        JSON.stringify({ error: 'competitorId and website are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const apifyApiKey = Deno.env.get('APIFY_API_KEY');
    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');

    let scrapedData: any = null;
    let method = 'firecrawl';

    try {
      const firecrawlResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${firecrawlApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: website,
          formats: ['markdown', 'html'],
        }),
      });

      if (firecrawlResponse.ok) {
        const result = await firecrawlResponse.json();
        scrapedData = {
          markdown: result.data?.markdown || '',
          html: result.data?.html || '',
          metadata: result.data?.metadata || {},
        };
      } else {
        throw new Error('Firecrawl failed');
      }
    } catch (firecrawlError) {
      console.log('Firecrawl failed, attempting with Apify:', firecrawlError);
      method = 'apify';

      const apifyResponse = await fetch('https://api.apify.com/v2/acts/apify~web-scraper/run-sync-get-dataset-items', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apifyApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startUrls: [{ url: website }],
          maxCrawlDepth: 0,
          maxRequestsPerCrawl: 1,
        }),
      });

      if (!apifyResponse.ok) {
        throw new Error('Both Firecrawl and Apify failed');
      }

      const apifyData = await apifyResponse.json();
      scrapedData = {
        text: apifyData[0]?.text || '',
        html: apifyData[0]?.html || '',
      };
    }

    return new Response(
      JSON.stringify({
        success: true,
        competitorId,
        website,
        method,
        data: scrapedData,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error scraping competitor:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to scrape competitor website',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});