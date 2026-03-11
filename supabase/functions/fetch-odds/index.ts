import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const API_KEY = Deno.env.get('THE_ODDS_API_KEY');
  if (!API_KEY) {
    return new Response(JSON.stringify({ error: 'THE_ODDS_API_KEY not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    // Fetch live & upcoming soccer odds
    const res = await fetch(
      `https://api.the-odds-api.com/v4/sports/soccer/odds/?apiKey=${API_KEY}&regions=eu,uk&markets=h2h,totals&oddsFormat=decimal`,
    );

    if (!res.ok) {
      throw new Error(`Odds API failed [${res.status}]: ${await res.text()}`);
    }

    const data = await res.json();

    // Map to simplified format
    const odds = data.map((event: any) => ({
      id: event.id,
      sport: event.sport_key,
      homeTeam: event.home_team,
      awayTeam: event.away_team,
      commenceTime: event.commence_time,
      bookmakers: event.bookmakers?.slice(0, 3).map((b: any) => ({
        key: b.key,
        title: b.title,
        markets: b.markets?.map((m: any) => ({
          key: m.key,
          outcomes: m.outcomes,
        })),
      })),
    }));

    return new Response(JSON.stringify({ odds, count: odds.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error fetching odds:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
